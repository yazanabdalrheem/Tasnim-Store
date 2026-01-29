-- Fix for "column notification_id does not exist" error

-- 1. Drop the old conflicting triggers from notifications_system.sql
-- These triggers were calling public.handle_new_notification() which tries to access the old schema
DROP TRIGGER IF EXISTS on_new_appointment ON public.appointments;
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP TRIGGER IF EXISTS on_new_question ON public.questions;

-- 2. Drop the old function to ensure it doesn't accidentally get reused without fixing
DROP FUNCTION IF EXISTS public.handle_new_notification();

-- 3. Ensure the active triggers are the V2 ones (from pwa_push_schema_v2.sql)
-- If pwa_push_schema_v2.sql was already run, these should be active:
-- tr_push_appointment calling public.enqueue_push_notification()
-- tr_push_order calling public.enqueue_push_notification()

-- 4. Just in case pwa_push_schema_v2.sql wasn't fully successful, let's re-verify the table
-- We add notification_id just in case some other legacy code depends on it, but nullable
ALTER TABLE public.notification_queue ADD COLUMN IF NOT EXISTS notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE;
