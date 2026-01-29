-- =========================================
-- FIX: Remove ALL Notification Triggers from Questions
-- =========================================
-- This migration completely removes notification system from questions table

-- 1. Drop ALL triggers on questions (comprehensive cleanup)
DROP TRIGGER IF EXISTS on_new_question ON public.questions CASCADE;
DROP TRIGGER IF EXISTS tr_enqueue_question ON public.questions CASCADE;
DROP TRIGGER IF EXISTS tr_push_question ON public.questions CASCADE;
DROP TRIGGER IF EXISTS notify_on_question ON public.questions CASCADE;
DROP TRIGGER IF EXISTS questions_notification ON public.questions CASCADE;

-- 2. Drop or update the handle_new_notification function to exclude questions
-- Replace the function to explicitly ignore questions table
CREATE OR REPLACE FUNCTION public.handle_new_notification()
RETURNS TRIGGER AS $$
DECLARE
    notif_id uuid;
    notif_title text;
    notif_body text;
    notif_url text;
    notif_type text;
BEGIN
    -- IMPORTANT: Skip questions table completely
    IF TG_TABLE_NAME = 'questions' THEN
        RETURN NEW;
    END IF;

    -- Default values
    notif_type := 'system';
    
    -- Logic based on table (ONLY orders and appointments)
    IF TG_TABLE_NAME = 'orders' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'order';
            notif_title := 'New Order #' || COALESCE(NEW.order_number, NEW.id::text);
            notif_body := 'New order received from ' || COALESCE(NEW.shipping_address->>'full_name', 'Customer');
            notif_url := '/admin/orders/' || NEW.id;
        ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
            notif_type := 'status_change';
            notif_title := 'Order Status Changed';
            notif_body := 'Order is now ' || NEW.status;
            notif_url := '/admin/orders/' || NEW.id;
        ELSE
            RETURN NEW;
        END IF;
    
    ELSIF TG_TABLE_NAME = 'appointments' THEN
        IF TG_OP = 'INSERT' THEN
            notif_type := 'booking';
            notif_title := 'New Appointment';
            notif_body := 'Booking confirmed for ' || NEW.customer_name;
            notif_url := '/admin/appointments';
        ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
            notif_type := 'status_change';
            notif_title := 'Appointment Updated';
            notif_body := 'Appointment for ' || NEW.customer_name || ' is now ' || NEW.status;
            notif_url := '/admin/appointments';
        ELSE
            RETURN NEW;
        END IF;
    ELSE
        -- Unknown table, skip
        RETURN NEW;
    END IF;

    -- Check if notifications table exists and has correct schema
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        -- Insert into notifications
        INSERT INTO public.notifications (type, title, body, url, ref_table, ref_id)
        VALUES (notif_type, notif_title, notif_body, notif_url, TG_TABLE_NAME, NEW.id::text)
        RETURNING id INTO notif_id;

        -- Check if notification_queue exists and has notification_id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notification_queue' 
            AND column_name = 'notification_id'
            AND table_schema = 'public'
        ) THEN
            -- Insert into queue for Push
            INSERT INTO public.notification_queue (notification_id, type, status, payload)
            VALUES (notif_id, 'push', 'pending', jsonb_build_object('title', notif_title, 'body', notif_body, 'url', notif_url))
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Make absolutely sure no trigger exists on questions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'public.questions'::regclass 
        AND tgname NOT LIKE 'RI_%'  -- Keep foreign key triggers
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.questions CASCADE', r.tgname);
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- 4. Verify and log
DO $$
DECLARE
    trigger_count int;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger 
    WHERE tgrelid = 'public.questions'::regclass 
    AND tgname NOT LIKE 'RI_%';
    
    RAISE NOTICE 'Remaining non-FK triggers on questions table: %', trigger_count;
END $$;

NOTIFY pgrst, 'reload schema';
