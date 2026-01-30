-- Add requires_lenses column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS requires_lenses BOOLEAN NOT NULL DEFAULT false;

-- Update the view if it exists (products_view usually selects *, so it might auto-update, but good to be safe if it's explicit)
-- Ideally views relying on specific columns might need refreshing, but typically * handles it.
-- We'll just add the column comment for documentation.
COMMENT ON COLUMN public.products.requires_lenses IS 'Flag to indicate if this product requires prescription lenses configuration.';
