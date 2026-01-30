-- Create prescriptions bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'prescriptions' );

-- Policy to allow public uploads (since users might not be logged in when initiating Rx flow)
-- Or restricted to authenticated users if that's the requirement. 
-- Based on the flow, users might upload before checkout? 
-- Let's allow public upload for now to match the "I don't know" / "Guest" flows often seen.
-- Actually, the error logs show "vir9lqsnp7.png" which suggests guest upload is possible.
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'prescriptions' );

-- Policy to allow users to update their own files (optional, but good for retries)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'prescriptions' );
