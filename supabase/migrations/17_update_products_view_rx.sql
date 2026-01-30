-- Recreate products_view to include rx_config column
-- DROP view first if exists (or create or replace)
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
    p.rx_config, -- ADDED THIS
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

    -- Calculate final price logic (simplified for view, usually DB function is better but this is common pattern)
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

    -- Calculate discount percent for display
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
