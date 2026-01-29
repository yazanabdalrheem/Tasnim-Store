-- =========================================
-- Add Soft Delete Fields to Questions Table
-- =========================================
-- This migration adds fields for soft delete functionality
-- to allow users to remove questions from their view

-- 1. Add deleted_by_user and deleted_at columns
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS deleted_by_user boolean DEFAULT false;

ALTER TABLE public.questions 
ADD COLUMN IF NOT  EXISTS deleted_at timestamptz;

-- 2. Add status column if it doesn't exist (for approved/pending/rejected)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- 3. Add answer column if it doesn't exist
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS answer text;

-- 4. Add user_id column if it doesn't exist (to track who submitted)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 5. Update RLS Policies
-- Allow users to view their own questions
DROP POLICY IF EXISTS "Users can view own questions" ON public.questions;
CREATE POLICY "Users can view own questions" 
ON public.questions 
FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR is_public = true
);

-- Allow users to soft delete their own questions
DROP POLICY IF EXISTS "Users can soft delete own questions" ON public.questions;
CREATE POLICY "Users can soft delete own questions" 
ON public.questions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_deleted_by_user ON public.questions(deleted_by_user);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);

NOTIFY pgrst, 'reload schema';
