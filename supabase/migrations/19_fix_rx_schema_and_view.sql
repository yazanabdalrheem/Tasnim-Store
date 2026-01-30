-- Comprehensive fix to ensure Rx configuration exists and View is updated

-- 1. Ensure rx_config exists on products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS rx_config JSONB DEFAULT '{
    "enabled": false,
    "requirement": "optional",
    "allow_saved": true,
    "allow_manual": true,
    "allow_upload": true,
    "ranges": {
      "sphMin": -12, "sphMax": 8, "step": 0.25,
      "cylMin": -6, "cylMax": 0,
      "axisMax": 180,
      "pdMin": 50, "pdMax": 75
    }
}'::jsonb;

-- 1b. Ensure sort_order exists on products (Fix for 42703)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Ensure rx_config exists on site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS rx_config jsonb default '{"enabled": true, "allow_saved": true, "allow_manual": true, "allow_upload": true}'::jsonb;

-- 3. Ensure user_prescriptions exists
CREATE TABLE IF NOT EXISTS public.user_prescriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL DEFAULT 'My Prescription',
  rx_data JSONB NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for user_prescriptions if table was just created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'user_prescriptions'
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.user_prescriptions ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Create policy if not exists
DROP POLICY IF EXISTS "Users can manage their own prescriptions" ON public.user_prescriptions;
CREATE POLICY "Users can manage their own prescriptions" ON public.user_prescriptions
  FOR ALL USING (auth.uid() = user_id);


-- 4. Recreate products_view (Critical for 500 Fix)
DROP VIEW IF EXISTS public.products_view CASCADE;
CREATE OR REPLACE VIEW public.products_view AS
SELECT
    p.id,
    p.created_at,
    p.name_he,
    p.name_ar,
    p.name_en,
    p.description_he,
    p.description_ar,
    p.description_en,
    p.price,
    p.discount_price,
    p.stock_quantity,
    p.images,
    p.main_image_url,
    p.category_id,
    p.is_active,
    p.sort_order,
    p.rx_config, -- UPDATED
    p.rx_enabled,
    p.rx_template_id,

    -- Promotion Logic
    prom.id as promotion_id,
    prom.title_en as promotion_title_en,
    prom.title_he as promotion_title_he,
    prom.title_ar as promotion_title_ar,
    prom.badge_text_en,
    prom.badge_text_he,
    prom.badge_text_ar,
    prom.type as promotion_type,
    prom.value as promotion_value,

    -- Final Price
    CASE
        WHEN prom.is_active = true AND prom.start_at <= now() AND prom.end_at >= now() THEN
            CASE
                WHEN prom.type = 'percent' THEN
                    ROUND(p.price * (1 - prom.value / 100))
                WHEN prom.type = 'fixed' THEN
                    p.price - prom.value
                ELSE p.price
            END
        ELSE
            COALESCE(p.discount_price, p.price)
    END as final_price,

    -- Discount Percent
    CASE
        WHEN prom.is_active = true AND prom.start_at <= now() AND prom.end_at >= now() THEN
            CASE
                WHEN prom.type = 'percent' THEN prom.value
                WHEN prom.type = 'fixed' THEN ROUND((prom.value / p.price) * 100)
                ELSE 0
            END
        ELSE
            CASE
                WHEN p.discount_price IS NOT NULL AND p.price > 0 THEN
                     ROUND(((p.price - p.discount_price) / p.price) * 100)
                ELSE 0
            END
    END as calculated_discount_percent

FROM public.products p
LEFT JOIN public.promotion_products pp ON p.id = pp.product_id
LEFT JOIN public.promotions prom ON pp.promotion_id = prom.id AND prom.is_active = true AND prom.start_at <= now() AND prom.end_at >= now();
