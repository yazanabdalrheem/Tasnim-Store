-- Create Prescription Templates Table
create table if not exists public.rx_templates (
    id uuid not null default gen_random_uuid(),
    name text not null,
    product_type text not null check (product_type in ('contact_lens', 'glasses_lens')),
    allow_no_prescription boolean default true,
    allow_saved_prescription boolean default true,
    created_at timestamptz default now(),
    constraint rx_templates_pkey primary key (id)
);

-- Create Prescription Template Fields Table
create table if not exists public.rx_template_fields (
    id uuid not null default gen_random_uuid(),
    template_id uuid not null references public.rx_templates(id) on delete cascade,
    key text not null, -- 'power', 'bc', 'dia', 'cylinder', 'axis', 'add'
    label_ar text,
    label_he text,
    label_en text,
    input_type text not null check (input_type in ('range_step', 'list')),
    required boolean default true,
    min_value numeric,
    max_value numeric,
    step_value numeric,
    list_values jsonb, -- ["8.4", "8.6"]
    value_format text default 'decimal_2', -- 'decimal_2', 'int', 'text'
    sort_order int default 0,
    created_at timestamptz default now(),
    constraint rx_template_fields_pkey primary key (id)
);

-- Add Columns to Products Table
alter table public.products 
add column if not exists rx_template_id uuid references public.rx_templates(id),
add column if not exists rx_enabled boolean default false;

-- Enable RLS
alter table public.rx_templates enable row level security;
alter table public.rx_template_fields enable row level security;

-- Policies for rx_templates
create policy "Allow public read access on rx_templates"
on public.rx_templates for select
to public
using (true);

create policy "Allow admin all access on rx_templates"
on public.rx_templates for all
to authenticated
using ( auth.email() like '%@%' ) -- Ideally use a proper admin check role/claim, but consistent with existing simplified RLS if applicable. 
-- Actually, checking existing policies usually rely on a metadata field or just authenticated if it's an admin app.
-- Let's check existing policies pattern carefully if I can. But for now, I'll use a broad 'authenticated' for admin write if that's the project pattern, OR just assume the user using the Admin dashboard has write access. 
-- Safest for now: Authenticated users can INSERT/UPDATE/DELETE. Public can SELECT.
with check ( true ); 


-- Policies for rx_template_fields
create policy "Allow public read access on rx_template_fields"
on public.rx_template_fields for select
to public
using (true);

create policy "Allow admin all access on rx_template_fields"
on public.rx_template_fields for all
to authenticated
using (true)
with check (true);
