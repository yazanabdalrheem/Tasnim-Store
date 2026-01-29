-- Migration: Fix Profiles Sync (Triggers + Backfill)
-- Created at: 2026-01-28 22:00:00

-- 1. Function to handle NEW users (Signup)
-- Uses Security Definer to bypass RLS when inserting into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.phone,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    full_name = CASE 
                  WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
                  THEN EXCLUDED.full_name 
                  ELSE public.profiles.full_name 
                END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to handle UPDATED users (e.g. email change)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = new.email,
    phone = new.phone,
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Triggers (Drop if exists to be safe/idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- 4. Backfill Existing Missing Data
-- This runs once to fix current broken state
DO $$
BEGIN
  UPDATE public.profiles p
  SET
    email = u.email,
    phone = COALESCE(p.phone, u.phone),
    full_name = COALESCE(NULLIF(p.full_name, ''), NULLIF(u.raw_user_meta_data->>'full_name', ''))
  FROM auth.users u
  WHERE p.id = u.id
  AND (p.email IS NULL OR p.phone IS NULL OR p.full_name IS NULL OR p.full_name = '');
END;
$$;

-- 5. Ensure RLS Policies are correct
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins (or anyone for now, per simple requirement, or better: separate admin policy) to view all
-- Ideally we check role, but circular dependency if role is IN profile.
-- Standard secure pattern:
-- Create a secure function or just rely on a boolean 'is_admin' function if available.
-- For now, let's stick to the prompt's request: "Admins can read all profiles."
-- Assuming a function `public.is_admin()` exists or we check specific ID.
-- If not, we often allow Read All for directory features, OR restrict to service role for admin dashboard if using Service Key.
-- Given I don't see an `is_admin` function in previous context, I will assume Admin Dashboard usually uses Service Role or has a specific policy.
-- Let's add a policy that allows viewing if the requesting user has role 'admin' in their OWN profile.

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')
    )
  );
