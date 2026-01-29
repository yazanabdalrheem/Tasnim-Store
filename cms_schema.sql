-- 0. Cleanup (Safe Refactor)
DROP TABLE IF EXISTS public.site_content;
-- Warning: This clears settings. Ensure you have a backup if needed.
DROP TABLE IF EXISTS public.site_settings;

-- 1. Create site_content table (for text blocks)
CREATE TABLE public.site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value_he text,
  value_ar text,
  value_en text,
  updated_at timestamptz DEFAULT now()
);

-- 2. Create site_settings table (for global config)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name_he text,
  store_name_ar text,
  store_name_en text,
  whatsapp_phone text,
  support_email text,
  address_he text,
  address_ar text,
  address_en text,
  working_hours_he text,
  working_hours_ar text,
  working_hours_en text,
  instagram_url text,
  facebook_url text,
  logo_url text,
  hero_image_url text,
  primary_color text DEFAULT '#0F172A',
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for site_content

-- Public Read
CREATE POLICY "Public read site_content"
ON public.site_content
FOR SELECT
USING (true);

-- Admin CRUD
CREATE POLICY "Admins full control site_content"
ON public.site_content
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 5. Create Policies for site_settings

-- Public Read
CREATE POLICY "Public read site_settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Admin CRUD
CREATE POLICY "Admins full control site_settings"
ON public.site_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 6. Insert Default Data (Safe upsert)
-- Ensure at least one row exists for settings
INSERT INTO public.site_settings (id, store_name_en)
VALUES (gen_random_uuid(), 'Tasnim Optic')
ON CONFLICT DO NOTHING;

-- Initial Content Keys (Optional, just to start)
-- Users can add more via Admin Panel
INSERT INTO public.site_content (key, value_en, value_he, value_ar)
VALUES 
('home.hero.title', 'See the World Clearly', 'ראה את העולם בבירור', 'رؤية العالم بوضوح'),
('home.hero.subtitle', 'Premium eye exams and eyewear.', 'בדיקות עיניים ומשקפיים פרימיום.', 'فحوصات و نظارات طبية مميزة.'),
('home.about.title', 'About Us', 'עלינו', 'من نحن'),
('home.about.text', 'We provide professional eye care.', 'אנו מספקים טיפול מקצועי בעיניים.', 'نحن نقدم رعاية مهنية للعيون.')
ON CONFLICT (key) DO NOTHING;
