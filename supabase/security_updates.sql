-- 1. Helper Function: is_admin
-- Checks if the current user has 'admin' or 'super_admin' role in public.profiles.
-- Ensure we handle potential role types (text or enum) safely by checking for text existence.
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


-- 2. Update Profiles Table Schema (Safe Columns Add)
-- We assume public.profiles MUST exist for the app to work, but we'll wrap it just in case or use standard IF NOT EXISTS.
-- Note: 'profiles' usually exists from the start in Supabase starters.
-- Adding columns if they don't exist.
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked_at timestamptz DEFAULT NULL;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT NULL;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT NULL;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table profiles does not exist, skipping column addition.';
END $$;


-- 3. RLS and Policies Application (Conditional Safe Block)
DO $$
DECLARE
    t_name text;
BEGIN
    -- PROFILES
    IF to_regclass('public.profiles') IS NOT NULL THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Safe Drop
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

        -- Create
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
        CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));
    END IF;

    -- PRODUCTS
    IF to_regclass('public.products') IS NOT NULL THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public active products" ON public.products;
        DROP POLICY IF EXISTS "Admins all products" ON public.products;

        CREATE POLICY "Public active products" ON public.products FOR SELECT USING (is_active = true);
        CREATE POLICY "Admins all products" ON public.products FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- PRODUCT IMAGES
    IF to_regclass('public.product_images') IS NOT NULL THEN
        ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public product images" ON public.product_images;
        DROP POLICY IF EXISTS "Admins all product images" ON public.product_images;

        CREATE POLICY "Public product images" ON public.product_images FOR SELECT USING (true);
        CREATE POLICY "Admins all product images" ON public.product_images FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- CATEGORIES
    IF to_regclass('public.categories') IS NOT NULL THEN
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public view categories" ON public.categories;
        DROP POLICY IF EXISTS "Admins all categories" ON public.categories;

        CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
        CREATE POLICY "Admins all categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- ORDERS
    IF to_regclass('public.orders') IS NOT NULL THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
        DROP POLICY IF EXISTS "Admins all orders" ON public.orders;

        CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Admins all orders" ON public.orders FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- ORDER ITEMS
    IF to_regclass('public.order_items') IS NOT NULL THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
        DROP POLICY IF EXISTS "Users create own order items" ON public.order_items;
        DROP POLICY IF EXISTS "Admins all order items" ON public.order_items;

        -- Note: We rely on existence of 'orders' table for this check logic. 
        -- If orders exists, this is safe. If orders doesn't exist, order_items probably doesn't effectively work either.
        -- Assuming standard dependency order or existence.
        IF to_regclass('public.orders') IS NOT NULL THEN
             CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
                EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
             );
             CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT WITH CHECK (
                EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
             );
        END IF;

        CREATE POLICY "Admins all order items" ON public.order_items FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- APPOINTMENTS
    IF to_regclass('public.appointments') IS NOT NULL THEN
        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users view own appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Users create own appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Admins all appointments" ON public.appointments;

        CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Admins all appointments" ON public.appointments FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- PROMOTIONS (Optional)
    IF to_regclass('public.promotions') IS NOT NULL THEN
        ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public view active promotions" ON public.promotions;
        DROP POLICY IF EXISTS "Admins all promotions" ON public.promotions;

        CREATE POLICY "Public view active promotions" ON public.promotions FOR SELECT USING (is_active = true AND now() BETWEEN start_at AND end_at);
        CREATE POLICY "Admins all promotions" ON public.promotions FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- PROMOTION PRODUCTS (Optional)
    IF to_regclass('public.promotion_products') IS NOT NULL THEN
        ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public view promotion products" ON public.promotion_products;
        DROP POLICY IF EXISTS "Admins all promotion products" ON public.promotion_products;

        CREATE POLICY "Public view promotion products" ON public.promotion_products FOR SELECT USING (true);
        CREATE POLICY "Admins all promotion products" ON public.promotion_products FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- COUPONS (Optional)
    IF to_regclass('public.coupons') IS NOT NULL THEN
        ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins all coupons" ON public.coupons;

        CREATE POLICY "Admins all coupons" ON public.coupons FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

    -- SITE SETTINGS (Optional)
    IF to_regclass('public.site_settings') IS NOT NULL THEN
        ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public view site settings" ON public.site_settings;
        DROP POLICY IF EXISTS "Admins all site settings" ON public.site_settings;

        CREATE POLICY "Public view site settings" ON public.site_settings FOR SELECT USING (true);
        CREATE POLICY "Admins all site settings" ON public.site_settings FOR ALL USING (public.is_admin(auth.uid()));
    END IF;

END $$;
