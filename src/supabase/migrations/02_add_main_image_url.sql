-- Add main_image_url to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS main_image_url text;

-- (Optional) Backfill logic can be run manually if needed, 
-- but since we are relying on Admin save to populate it, we can leave it null for now or set default.
-- user requested robust solution, so let's allow Update policy to cover this column
-- (RLS policies for 'update' usually cover all columns unless restricted, verifying 'Admin Products' policy)

-- Ensure Admin policy allows updating this column (usually true if 'using (true) with check (true)')
-- No specific RLS change needed if the existing one is "ALL".
