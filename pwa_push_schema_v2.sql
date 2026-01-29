-- =========================================
-- TASNIM OPTIC: PWA PUSH NOTIFICATIONS (V2)
-- =========================================

-- 1. Create Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    role text DEFAULT 'admin',
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz DEFAULT now(),
    last_seen timestamptz DEFAULT now()
);

-- RLS for Subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 2. Notification Queue
DROP TABLE IF EXISTS public.notification_queue CASCADE;

CREATE TABLE public.notification_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('booking_new', 'order_new', 'booking_status', 'order_status', 'test')),
    recipient_user_id uuid REFERENCES auth.users(id), -- If null, send to all admins
    payload jsonb NOT NULL, -- Must contain ref_id
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempts int DEFAULT 0,
    last_error text,
    next_retry_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Unique Constraint (Idempotency)
-- Ensure we don't queue the same event twice
CREATE UNIQUE INDEX idx_queue_dedup ON public.notification_queue (type, (payload->>'ref_id'));

-- RLS for Queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view and manage queue" ON public.notification_queue
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- 3. Trigger Function
CREATE OR REPLACE FUNCTION public.enqueue_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    payload_data jsonb;
    notif_type text;
    ref_id text;
BEGIN
    
    -- Appointment Logic
    IF TG_TABLE_NAME = 'appointments' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'booking_new';
            ref_id := NEW.id::text;
            payload_data := jsonb_build_object(
                'ref_id', ref_id,
                'name', NEW.customer_name,
                'phone', NEW.customer_phone,
                'date', NEW.start_time
            );
        ELSE
            RETURN NEW;
        END IF;
    -- Order Logic
    ELSIF TG_TABLE_NAME = 'orders' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'order_new';
            ref_id := NEW.id::text;
            payload_data := jsonb_build_object(
                'ref_id', ref_id,
                'total', NEW.total_amount,
                'items_count', (SELECT count(*) FROM order_items WHERE order_id = NEW.id), -- might be 0 immediately on trigger, but safer to assume basics
                'customer', NEW.customer_details
            );
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Insert safely (UNIQUE IGNORE via ON CONFLICT DO NOTHING is not directly available for triggers easily without procedure, 
    -- but we rely on the UNIQUE INDEX causing an exception if we don't handle it, OR we check first).
    -- Checking first is safer for triggers to avoid aborting the main transaction.
    
    IF EXISTS (
        SELECT 1 FROM public.notification_queue 
        WHERE type = notif_type AND payload->>'ref_id' = ref_id
    ) THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.notification_queue (type, recipient_user_id, payload)
    VALUES (notif_type, NULL, payload_data)
    ON CONFLICT DO NOTHING; 

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply Triggers
DROP TRIGGER IF EXISTS tr_push_appointment ON public.appointments;
CREATE TRIGGER tr_push_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();

DROP TRIGGER IF EXISTS tr_push_order ON public.orders;
CREATE TRIGGER tr_push_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();

-- 5. Helper Function to Clean Old Sents
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notification_queue 
    WHERE status = 'sent' AND created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload config';
