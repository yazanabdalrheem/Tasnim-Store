-- =========================================
-- TASNIM OPTIC: WHATSAPP NOTIFICATION SYSTEM
-- =========================================

-- 1. Create Queue Table
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('booking_new', 'order_new', 'booking_status', 'order_status')),
    recipient_phone text, -- Can be null for Admin notifications (fetched at runtime)
    payload jsonb NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    attempts int DEFAULT 0,
    last_error text,
    next_retry_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- 2. Create Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_id uuid REFERENCES public.notification_queue(id),
    type text,
    recipient_phone text,
    status text,
    response_data jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. Update Site Settings (Add WhatsApp Config)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_admin_phone text;

-- 4. Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow Admin to manage queue
CREATE POLICY "Admins can manage queue" ON public.notification_queue
    FOR ALL USING (auth.role() = 'authenticated'); -- ideally restrict to admin role

-- 5. FUNCTION: Enqueue Notification
CREATE OR REPLACE FUNCTION public.enqueue_notification()
RETURNS TRIGGER AS $$
DECLARE
    is_enabled boolean;
    payload_data jsonb;
    notif_type text;
    target_phone text;
BEGIN
    -- Check if WhatsApp is enabled globally
    SELECT whatsapp_enabled INTO is_enabled FROM public.site_settings LIMIT 1;
    IF is_enabled IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    payload_data := row_to_json(NEW);
    
    -- Determine Type
    IF TG_TABLE_NAME = 'appointments' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'booking_new';
            target_phone := NULL; -- Admin
        ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
            notif_type := 'booking_status';
            target_phone := NEW.customer_phone;
        ELSE
            RETURN NEW;
        END IF;
    ELSIF TG_TABLE_NAME = 'orders' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'order_new';
            target_phone := NULL; -- Admin
        ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
            notif_type := 'order_status';
            -- Extract phone from customer_details (jsonb)
            target_phone := NEW.customer_details->>'phone'; 
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Insert into Queue
    INSERT INTO public.notification_queue (type, recipient_phone, payload)
    VALUES (notif_type, target_phone, payload_data);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGERS

-- Appointments
DROP TRIGGER IF EXISTS tr_enqueue_appointment ON public.appointments;
CREATE TRIGGER tr_enqueue_appointment
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enqueue_notification();

-- Orders
DROP TRIGGER IF EXISTS tr_enqueue_order ON public.orders;
CREATE TRIGGER tr_enqueue_order
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_notification();

-- 7. NOTIFY for Edge Function Realtime (Optional)
NOTIFY pgrst, 'reload config';
