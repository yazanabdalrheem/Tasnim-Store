-- Clean up all conflicting triggers to resolve "null value" and schema errors

-- 1. Drop WhatsApp triggers (conflicting with V2 PWA)
DROP TRIGGER IF EXISTS tr_enqueue_appointment ON public.appointments;
DROP TRIGGER IF EXISTS tr_enqueue_order ON public.orders;
DROP FUNCTION IF EXISTS public.enqueue_notification();

-- 2. Drop Legacy System triggers (already tried, but making sure)
DROP TRIGGER IF EXISTS on_new_appointment ON public.appointments;
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP TRIGGER IF EXISTS on_new_question ON public.questions;
DROP FUNCTION IF EXISTS public.handle_new_notification();

-- 3. Ensure Notification Queue is V2 compatible
-- Use DO block to check for columns and add if missing (tolerant)
DO $$
BEGIN
    -- Add recipient_phone if missing (for legacy compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_queue' AND column_name='recipient_phone') THEN
        ALTER TABLE public.notification_queue ADD COLUMN recipient_phone text;
    END IF;

    -- Add recipient_user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_queue' AND column_name='recipient_user_id') THEN
        ALTER TABLE public.notification_queue ADD COLUMN recipient_user_id uuid REFERENCES auth.users(id);
    END IF;

    -- Add notification_id if missing
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_queue' AND column_name='notification_id') THEN
        ALTER TABLE public.notification_queue ADD COLUMN notification_id uuid REFERENCES public.notifications(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Re-Apply V2 PWA Triggers (Force Update)
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
                'items_count', (SELECT count(*) FROM order_items WHERE order_id = NEW.id),
                'customer', NEW.customer_details
            );
        ELSE
            RETURN NEW;
        END IF;
    ELSE 
        RETURN NEW;
    END IF;

    -- Check Deduplication
    IF EXISTS (
        SELECT 1 FROM public.notification_queue 
        WHERE type = notif_type AND payload->>'ref_id' = ref_id
    ) THEN
        RETURN NEW;
    END IF;

    -- Insert
    INSERT INTO public.notification_queue (type, recipient_user_id, payload, status)
    VALUES (notif_type, NULL, payload_data, 'pending')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach triggers
DROP TRIGGER IF EXISTS tr_push_appointment ON public.appointments;
CREATE TRIGGER tr_push_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();

DROP TRIGGER IF EXISTS tr_push_order ON public.orders;
CREATE TRIGGER tr_push_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();
