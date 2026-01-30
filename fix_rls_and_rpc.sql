-- 1. Enable RLS on Orders and Items (Best Practice)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies to avoid conflicts
-- Orders
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable select for own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full control on orders" ON public.orders;
DROP POLICY IF EXISTS "Admins full access" ON public.orders;

-- Order Items
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for all users items" ON public.order_items;
DROP POLICY IF EXISTS "Enable select for own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full control on order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins full access items" ON public.order_items;


-- 3. Essential RLS Policies (For viewing orders)

-- A. Allow anyone to INSERT (Standard RLS fallback)
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- B. Allow Users to View THEIR OWN Orders
CREATE POLICY "Users can view own orders" ON public.orders 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON public.order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- C. Allow Admins Full Access
CREATE POLICY "Admins full access orders" ON public.orders
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

CREATE POLICY "Admins full access items" ON public.order_items
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);


-- 4. Secure RPC Function for Checkout guarantees Guest support
-- This functions bypasses RLS for the exact transaction of creating an order
CREATE OR REPLACE FUNCTION public.create_new_order(
    p_order_details jsonb,
    p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to strict insert
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_item jsonb;
    v_result jsonb;
BEGIN
    -- 1. Insert Order
    INSERT INTO public.orders (
        user_id,
        total_amount,
        discount_amount,
        coupon_id,
        status,
        customer_details,
        shipping_address
    ) VALUES (
        (p_order_details->>'user_id')::uuid,
        (p_order_details->>'total_amount')::numeric,
        (p_order_details->>'discount_amount')::numeric,
        (p_order_details->>'coupon_id')::uuid,
        p_order_details->>'status',
        p_order_details->'customer_details',
        p_order_details->'shipping_address'
    )
    RETURNING id INTO v_order_id;

    -- 2. Insert Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            price_at_purchase,
            metadata
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::uuid,
            (v_item->>'quantity')::integer,
            (v_item->>'price_at_purchase')::numeric,
            v_item->'metadata'
        );
    END LOOP;

    -- 3. Return Result
    SELECT jsonb_build_object(
        'id', v_order_id,
        'status', 'success'
    ) INTO v_result;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
END;
$$;

-- Grant execute to everyone (public)
GRANT EXECUTE ON FUNCTION public.create_new_order TO public;
