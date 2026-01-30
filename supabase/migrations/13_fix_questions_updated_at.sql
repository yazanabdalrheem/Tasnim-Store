-- =========================================
-- FIX: Add updated_at to Questions Table
-- =========================================
-- User reported: record "new" has no field "updated_at"
-- This implies a trigger is trying to set updated_at but the column is missing.

-- 1. Add updated_at column
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Ensure the generic handle_updated_at function exists (standard Supabase pattern)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Ensure the trigger exists on questions
DROP TRIGGER IF EXISTS set_updated_at ON public.questions;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Notify schema reload
NOTIFY pgrst, 'reload schema';
