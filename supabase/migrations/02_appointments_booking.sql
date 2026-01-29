-- Create appointment_requests table for public booking
CREATE TABLE IF NOT EXISTS public.appointment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    appointment_date DATE, -- YYYY-MM-DD
    appointment_time TEXT, -- HH:mm
    start_time TIMESTAMP WITH TIME ZONE, -- ISO timestamp
    notes TEXT,
    page TEXT,
    lang TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'pending'
);

-- RLS for appointment_requests
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
DROP POLICY IF EXISTS "Allow public insert requests" ON public.appointment_requests;
CREATE POLICY "Allow public insert requests"
    ON public.appointment_requests
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create secure view for checking availability
CREATE OR REPLACE VIEW public.appointments_public AS
SELECT
    start_time,
    end_time,
    type,
    status
FROM
    public.appointments
WHERE
    status != 'cancelled';

-- Grant access to view
GRANT SELECT ON public.appointments_public TO public;
GRANT SELECT ON public.appointments_public TO anon;
GRANT SELECT ON public.appointments_public TO authenticated;
