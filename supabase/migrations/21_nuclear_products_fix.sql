-- Nuclear fix to ensure all columns exist and View is valid

-- 1. Ensure ALL related columns exist on products with correct types
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rx_config JSONB DEFAULT '{
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

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rx_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rx_template_id UUID; -- Foreign key logic skipped for now to avoid complexity, but usually refs rx_templates
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Ensure supporting tables exist (just in case)
CREATE TABLE IF NOT EXISTS public.rx_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null
);
-- re-add column constraint if valid ref
DO $$
BEGIN
    -- Check if rx_template_id is linked, if not, try to link it if rx_templates exists (optional safety)
END
$$;

-- 3. DROP VIEW explicitly
DROP VIEW IF EXISTS public.products_view;

-- 4. Recreate products_view with SAFE references
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
    p.rx_config,
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
                WHEN prom.type = 'fixed' THEN 
                    CASE WHEN p.price > 0 THEN ROUND((prom.value / p.price) * 100) ELSE 0 END
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

-- 5. Force Schema Reload
NOTIFY pgrst, 'reload schema';
