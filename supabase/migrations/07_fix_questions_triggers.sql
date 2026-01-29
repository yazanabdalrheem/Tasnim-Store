-- =========================================
-- FIX: Questions Table Trigger Conflict
-- =========================================
-- This migration removes any legacy triggers on the questions table
-- that may be causing null value errors in notification_queue

-- 1. Drop any existing triggers on questions table
DROP TRIGGER IF EXISTS on_new_question ON public.questions;
DROP TRIGGER IF EXISTS tr_enqueue_question ON public.questions;
DROP TRIGGER IF EXISTS tr_push_question ON public.questions;
DROP TRIGGER IF EXISTS notify_on_question ON public.questions;

-- 2. Drop any legacy notification functions that might reference questions
DROP FUNCTION IF EXISTS public.handle_new_question() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_question() CASCADE;

-- 3. Verify notification_queue schema is correct
-- Add notification_id if missing (for compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='notification_queue' AND column_name='notification_id'
    ) THEN
        ALTER TABLE public.notification_queue 
        ADD COLUMN notification_id uuid REFERENCES public.notifications(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Ensure the questions table has proper structure
-- (No changes needed currently, just documenting)

-- 5. Note: Questions do NOT trigger push notifications by design
-- They should be reviewed manually in the admin panel
-- If you want to add question notifications later, add 'question_new' to the type enum first:
-- ALTER TABLE notification_queue DROP CONSTRAINT IF EXISTS notification_queue_type_check;
-- ALTER TABLE notification_queue ADD CONSTRAINT notification_queue_type_check 
--   CHECK (type IN ('booking_new', 'order_new', 'booking_status', 'order_status', 'question_new', 'test'));

NOTIFY pgrst, 'reload schema';
