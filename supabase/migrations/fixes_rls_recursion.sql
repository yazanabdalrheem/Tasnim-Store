-- Migration: Fix RLS Infinite Recursion & Switch to JWT Roles
-- Type: Security / Fix
-- Goal: Stop recursion in 'profiles' by using auth.jwt() instead of table queries.

-- 1. Create Helper Function to check Admin Role via JWT (No DB query)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Read from app_metadata (secure, not editable by user)
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Sync Logic: Function to sync profiles.role -> auth.users.app_metadata
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if role changed or is new
  IF (TG_OP = 'INSERT') OR (OLD.role IS DISTINCT FROM NEW.role) THEN
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Trigger to Auto-Sync Roles
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_role_to_auth();

-- 4. One-time Backfill: Sync existing admin profiles to app_metadata
DO $$
DECLARE
  r RECORD;
BEGIN
  -- We specifically target admins to ensure they get the permission immediately
  FOR r IN SELECT id, role FROM public.profiles WHERE role IN ('admin', 'super_admin')
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', r.role)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 5. REFIT PROFILES POLICIES (The Core Fix)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all suspect recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create Non-Recursive Policies

-- A. SELECT: Users see themselves OR Admins see all (via JWT)
CREATE POLICY "View_Profiles_Policy" ON public.profiles
  FOR SELECT
  USING (
    (auth.uid() = id)  -- User sees own
    OR
    (public.is_admin()) -- Admin sees all (JWT check, no recursion)
  );

-- B. UPDATE: Users update themselves OR Admins update any
CREATE POLICY "Update_Profiles_Policy" ON public.profiles
  FOR UPDATE
  USING (
    (auth.uid() = id) 
    OR
    (public.is_admin())
  );

-- C. INSERT: Usually handled by trigger, but allow service_role or admin if needed
CREATE POLICY "Insert_Profiles_Policy" ON public.profiles
  FOR INSERT
  WITH CHECK (
    (auth.uid() = id)
    OR
    (public.is_admin())
  );

-- 6. Update Other Tables to use is_admin() (Optimization)

-- Products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- Orders (Admins view all)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin());

-- Appointments
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Admins can view all appointments" ON public.appointments FOR SELECT USING (public.is_admin());
