-- =========================================
-- Minimal Prescription System
-- =========================================

-- 1. Add rx_config to products (JSONB)
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

-- 2. Create User Prescriptions Table
CREATE TABLE IF NOT EXISTS public.user_prescriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL DEFAULT 'My Prescription',
  rx_data JSONB NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_prescriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own prescriptions" ON public.user_prescriptions
  FOR ALL USING (auth.uid() = user_id);

-- 3. Note: cart and order items typically carry metadata. 
-- Assuming 'metadata' or 'rx_payload' column exists or handled via JSONB in app code.
-- If orders/cart logic uses a specific column, add it here if needed.
-- For now we assume app will store in existing metadata column or we add rx_payload if dedicated.

NOTIFY pgrst, 'reload schema';
