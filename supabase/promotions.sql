-- 0. Helper Function: is_admin (Dependency)
-- We include this here to ensure the migration is self-contained and robust.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND (role::text = 'admin' OR role::text = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Promotions Table
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title_en text NOT NULL,
    title_he text NOT NULL,
    title_ar text NOT NULL,
    type text NOT NULL CHECK (type IN ('percent', 'fixed')),
    value numeric NOT NULL CHECK (value > 0),
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    badge_text_en text,
    badge_text_he text,
    badge_text_ar text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_dates CHECK (start_at < end_at),
    CONSTRAINT valid_percent CHECK (type != 'percent' OR (value >= 1 AND value <= 90))
);

-- Indexes for promotions
CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON public.promotions(is_active, start_at, end_at);

-- 2. Promotion Products Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.promotion_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    promotion_id uuid REFERENCES public.promotions(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(promotion_id, product_id)
);

-- Indexes for promotion_products
CREATE INDEX IF NOT EXISTS idx_promotion_products_promo ON public.promotion_products(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_prod ON public.promotion_products(product_id);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

-- Promotions Policies
-- Drop to avoid conflict if re-running
DROP POLICY IF EXISTS "Public read active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins full access promotions" ON public.promotions;

CREATE POLICY "Public read active promotions" ON public.promotions
FOR SELECT USING (
    is_active = true 
    AND now() BETWEEN start_at AND end_at
);

CREATE POLICY "Admins full access promotions" ON public.promotions
FOR ALL USING (public.is_admin(auth.uid()));

-- Promotion Products Policies
DROP POLICY IF EXISTS "Public read promotion products" ON public.promotion_products;
DROP POLICY IF EXISTS "Admins full access promotion products" ON public.promotion_products;

CREATE POLICY "Public read promotion products" ON public.promotion_products
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.promotions p
        WHERE p.id = promotion_products.promotion_id
        AND p.is_active = true
        AND now() BETWEEN p.start_at AND p.end_at
    )
);

CREATE POLICY "Admins full access promotion products" ON public.promotion_products
FOR ALL USING (public.is_admin(auth.uid()));

-- 4. Unified Pricing View
-- This view calculates the BEST price for each product.
DROP VIEW IF EXISTS public.products_view;

CREATE OR REPLACE VIEW public.products_view AS
SELECT 
    p.*,
    -- Calculate Final Price
    COALESCE(promo.final_price, p.discount_price, p.price) as final_price,
    p.price as original_price,
    
    -- Promotion Metadata
    (promo.id IS NOT NULL) as has_promotion,
    promo.id as promotion_id,
    promo.title_en as promotion_title_en,
    promo.title_he as promotion_title_he,
    promo.title_ar as promotion_title_ar,
    promo.badge_text_en,
    promo.badge_text_he,
    promo.badge_text_ar,
    promo.type as promotion_type,
    promo.value as promotion_value,
    
    -- Calculate Discount Percentage
    CASE 
        WHEN promo.id IS NOT NULL THEN
            ROUND(((p.price - promo.final_price) / p.price) * 100)
        WHEN p.discount_price IS NOT NULL AND p.discount_price < p.price THEN
             ROUND(((p.price - p.discount_price) / p.price) * 100)
        ELSE 0
    END as calculated_discount_percent

FROM public.products p
LEFT JOIN LATERAL (
    SELECT 
        pr.id, pr.title_en, pr.title_he, pr.title_ar, pr.type, pr.value,
        pr.badge_text_en, pr.badge_text_he, pr.badge_text_ar,
        CASE 
            WHEN pr.type = 'percent' THEN p.price * (1 - pr.value / 100)
            WHEN pr.type = 'fixed' THEN GREATEST(0, p.price - pr.value)
            ELSE p.price
        END as final_price
    FROM public.promotions pr
    JOIN public.promotion_products pp ON pp.promotion_id = pr.id
    WHERE pp.product_id = p.id
    AND pr.is_active = true
    AND now() BETWEEN pr.start_at AND pr.end_at
    ORDER BY final_price ASC -- Best price (lowest) wins
    LIMIT 1
) promo ON true;

-- Permissions
GRANT SELECT ON public.products_view TO anon, authenticated, service_role;
