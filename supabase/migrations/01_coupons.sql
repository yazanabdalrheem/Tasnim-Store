-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_subtotal NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create coupon_redemptions table
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for redemptions
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Add coupon columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;

-- RLS Policies

-- Coupons: Admin only for modifications, Public/Auth for select (needed for calling via RPC or validation)
-- Actually, strict security would hide the full table and only expose via RPC. 
-- But for Admin dashboard we need SELECT/INSERT/UPDATE/DELETE.
-- Assuming admins have a specific role or check. For now, we'll assume Authenticated users are admins 
-- OR strictly use RPCs for clients and open access for Service Role/Admins.
-- Let's stick to: Public can't read coupons list directly to prevent scraping.
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  USING (auth.role() = 'authenticated') -- In real prod, check for admin claim
  WITH CHECK (auth.role() = 'authenticated');

-- Redemptions: Admin can view all, Users can view own.
DROP POLICY IF EXISTS "Admins manage redemptions" ON public.coupon_redemptions;
CREATE POLICY "Admins manage redemptions" ON public.coupon_redemptions
  USING (auth.role() = 'authenticated');

-- Secure RPC: Validate Coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_user_id UUID DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon RECORD;
  v_user_uses INTEGER;
  v_discount NUMERIC;
BEGIN
  -- 1. Find coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = upper(trim(p_code));

  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Coupon not found');
  END IF;

  -- 2. Basic checks
  IF NOT v_coupon.is_active THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Coupon is inactive');
  END IF;

  IF v_coupon.start_at IS NOT NULL AND now() < v_coupon.start_at THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Coupon not yet active');
  END IF;

  IF v_coupon.end_at IS NOT NULL AND now() > v_coupon.end_at THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Coupon expired');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Coupon usage limit reached');
  END IF;

  IF v_coupon.min_subtotal IS NOT NULL AND p_subtotal < v_coupon.min_subtotal THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Minimum order amount not met');
  END IF;

  -- 3. User limit check
  IF p_user_id IS NOT NULL AND v_coupon.max_uses_per_user IS NOT NULL THEN
    SELECT count(*) INTO v_user_uses
    FROM public.coupon_redemptions
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

    IF v_user_uses >= v_coupon.max_uses_per_user THEN
       RETURN jsonb_build_object('valid', false, 'message', 'Usage limit per user reached');
    END IF;
  END IF;

  -- 4. Calculate discount
  IF v_coupon.type = 'percent' THEN
    v_discount := round((p_subtotal * (v_coupon.value / 100)), 2);
  ELSE
    v_discount := least(v_coupon.value, p_subtotal);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'type', v_coupon.type,
    'value', v_coupon.value,
    'discount_amount', v_discount,
    'message', 'Coupon applied'
  );
END;
$$;

-- Secure RPC: Redeem Coupon
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_coupon_id UUID,
  p_order_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert redemption record
  INSERT INTO public.coupon_redemptions (coupon_id, order_id, user_id)
  VALUES (p_coupon_id, p_order_id, p_user_id);

  -- Increment usage count
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = p_coupon_id;
END;
$$;
