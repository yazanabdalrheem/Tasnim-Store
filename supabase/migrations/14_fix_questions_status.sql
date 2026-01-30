-- =========================================
-- FIX: Standardize Question Status
-- =========================================
-- Previous versions used 'answered' status, but the new logic uses 'approved'.
-- This migration updates all 'answered' questions to 'approved' so they appear correctly in all views.

UPDATE public.questions
SET status = 'approved'
WHERE status = 'answered';

-- Ensure status check constraint allows 'approved' (and 'answered' just in case, though we migrating away)
-- Actually the check constraint in 10_questions_soft_delete was:
-- CHECK (status IN ('pending', 'approved', 'rejected'))
-- So 'answered' might have been failing silently or causing issues if it wasn't allowed? 
-- If the constraint existed, 'answered' inserts would fail. 
-- But if users had 'answered' data, maybe the constraint wasn't applied or was different.
-- We'll just run the update.

NOTIFY pgrst, 'reload schema';
