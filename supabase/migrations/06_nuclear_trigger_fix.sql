-- NUCLEAR OPTION: Purge all possible legacy notification triggers and functions
-- This fixes the "null value in column type" error by removing zombie triggers.

-- 1. DROP ALL POSSIBLE TRIGGER NAMES ON ORDERS
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP TRIGGER IF EXISTS tr_enqueue_order ON public.orders;
DROP TRIGGER IF EXISTS on_order_created ON public.orders;
DROP TRIGGER IF EXISTS notify_admin_new_order ON public.orders;
DROP TRIGGER IF EXISTS send_order_notification ON public.orders;
DROP TRIGGER IF EXISTS handle_new_order ON public.orders;
DROP TRIGGER IF EXISTS tr_push_order ON public.orders; -- We will re-create this one

-- 2. DROP ALL POSSIBLE TRIGGER NAMES ON APPOINTMENTS
DROP TRIGGER IF EXISTS on_new_appointment ON public.appointments;
DROP TRIGGER IF EXISTS tr_enqueue_appointment ON public.appointments;
DROP TRIGGER IF EXISTS on_appointment_created ON public.appointments;
DROP TRIGGER IF EXISTS notify_admin_new_appointment ON public.appointments;
DROP TRIGGER IF EXISTS tr_push_appointment ON public.appointments; -- We will re-create this one

-- 3. DROP ALL POSSIBLE LEGACY FUNCTIONS
DROP FUNCTION IF EXISTS public.handle_new_notification();
DROP FUNCTION IF EXISTS public.enqueue_notification();
DROP FUNCTION IF EXISTS public.notify_admins();
DROP FUNCTION IF EXISTS public.send_notification();

-- 4. Re-Define the V2 Enqueue Function (Defensive Version)
CREATE OR REPLACE FUNCTION public.enqueue_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    payload_data jsonb;
    notif_type text;
    ref_id text;
BEGIN
    -- INIT (Important: Ensure variables are null)
    notif_type := NULL;
    
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
        END IF;

    -- Order Logic
    ELSIF TG_TABLE_NAME = 'orders' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'order_new';
            ref_id := NEW.id::text;
            payload_data := jsonb_build_object(
                'ref_id', ref_id,
                'total', NEW.total_amount,
                -- Safe count query
                'items_count', (SELECT count(*) FROM order_items WHERE order_id = NEW.id),
                'customer', NEW.customer_details
            );
        END IF;
    END IF;

    -- CRITICAL SAFETY CHECK: If type is still default/null, DO NOT INSERT
    IF notif_type IS NULL THEN
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

-- 5. Re-Attach Triggers (The only ones that should exist)
CREATE TRIGGER tr_push_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();

CREATE TRIGGER tr_push_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enqueue_push_notification();
