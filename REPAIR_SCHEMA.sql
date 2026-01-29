-- =========================================
-- TASNIM OPTIC: REPAIR QUESTIONS TABLE
-- Run this in Supabase SQL Editor to fix the "missing user_name column" error
-- =========================================

-- 1. Forcefully add the missing columns if they don't exist
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS user_phone text;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question text;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS answer text;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_public boolean default false;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS status text default 'pending';

-- 2. Fix permissions just in case (allow anyone to insert)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Drop old policies to be safe
DROP POLICY IF EXISTS "Anyone can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Public can view public questions" ON public.questions;

-- Re-create policies
CREATE POLICY "Anyone can insert questions" 
ON public.questions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can view public questions" 
ON public.questions FOR SELECT 
USING (is_public = true);

-- 3. KEY STEP: Refresh the API Cache so it sees the new columns
NOTIFY pgrst, 'reload config';
