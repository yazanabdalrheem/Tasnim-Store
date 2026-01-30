-- =========================================
-- Refactor: Add Category to Questions
-- =========================================
-- User requested to stop including [Category: ...] in question text.

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';

-- Optional: Migrate existing data?
-- Updating existing data is complex via regex in SQL, 
-- we will just allow new data to use the column.

NOTIFY pgrst, 'reload schema';
