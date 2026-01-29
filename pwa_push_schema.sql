-- =========================================
-- TASNIM OPTIC: PWA PUSH NOTIFICATIONS
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

CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 2. Recreate Notification Queue (Drop old if exists to match new schema)
DROP TABLE IF EXISTS public.notification_queue CASCADE;

CREATE TABLE public.notification_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('booking_new', 'order_new', 'booking_status', 'order_status')),
    recipient_user_id uuid REFERENCES auth.users(id), -- If null, send to all admins
    payload jsonb NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempts int DEFAULT 0,
    last_error text,
    next_retry_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
    -- Constraint to prevent duplicates
    -- CONSTRAINT unique_notification UNIQUE (type, (payload->>'ref_id')) 
    -- Note: complex constraints on jsonb keys can be tricky in some PG versions without immutable functions, 
    -- but we'll rely on the trigger logic or basic unique index if possible. 
    -- For now, we will handle deduplication in the trigger.
);

-- RLS for Queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view queue" ON public.notification_queue
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- 3. FUNCTION: Enqueue Notification
CREATE OR REPLACE FUNCTION public.enqueue_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    payload_data jsonb;
    notif_type text;
    ref_id text;
BEGIN
    
    -- Determine Type & Payload
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
    ELSIF TG_TABLE_NAME = 'orders' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'order_new';
            ref_id := NEW.id::text;
            payload_data := jsonb_build_object(
                'ref_id', ref_id,
                'total', NEW.total_amount,
                'customer', NEW.customer_details
            );
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Avoid Duplicates (Simple check)
    IF EXISTS (
        SELECT 1 FROM public.notification_queue 
        WHERE type = notif_type AND payload->>'ref_id' = ref_id
    ) THEN
        RETURN NEW;
    END IF;

    -- Insert into Queue (Recipient NULL = All Admins)
    INSERT INTO public.notification_queue (type, recipient_user_id, payload)
    VALUES (notif_type, NULL, payload_data);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGERS

-- Appointments
DROP TRIGGER IF EXISTS tr_push_appointment ON public.appointments;
CREATE TRIGGER tr_push_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();

-- Orders
DROP TRIGGER IF EXISTS tr_push_order ON public.orders;
CREATE TRIGGER tr_push_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();

-- 5. Refresh Cache
NOTIFY pgrst, 'reload config';
