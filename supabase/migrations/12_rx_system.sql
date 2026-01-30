-- Create Rx Templates table
create table if not exists public.rx_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  product_type text not null check (product_type in ('contact_lens', 'glasses_lens')),
  allow_no_prescription boolean default true,
  allow_saved_prescription boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.rx_templates enable row level security;

-- Policies for rx_templates
-- Policies for rx_templates
drop policy if exists "Public read access for rx_templates" on public.rx_templates;
create policy "Public read access for rx_templates" on public.rx_templates
  for select using (true);

drop policy if exists "Admin full access for rx_templates" on public.rx_templates;
create policy "Admin full access for rx_templates" on public.rx_templates
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role::text in ('admin', 'employee')
    )
  );

-- Create Rx Template Fields table
create table if not exists public.rx_template_fields (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.rx_templates(id) on delete cascade not null,
  key text not null, -- e.g. 'power', 'bc', 'dia', 'cylinder', 'axis', 'add'
  label_ar text,
  label_he text,
  label_en text,
  input_type text not null check (input_type in ('range_step', 'list')),
  required boolean default true,
  min_value numeric,
  max_value numeric,
  step_value numeric,
  list_values jsonb, -- array of strings/numbers
  value_format text check (value_format in ('decimal_2', 'int', 'text')),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.rx_template_fields enable row level security;

-- Policies for rx_template_fields
drop policy if exists "Public read access for rx_template_fields" on public.rx_template_fields;
create policy "Public read access for rx_template_fields" on public.rx_template_fields
  for select using (true);

drop policy if exists "Admin full access for rx_template_fields" on public.rx_template_fields;
create policy "Admin full access for rx_template_fields" on public.rx_template_fields
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role::text in ('admin', 'employee')
    )
  );

-- Add columns to products table
alter table public.products 
  add column if not exists rx_enabled boolean default false,
  add column if not exists rx_template_id uuid references public.rx_templates(id) on delete set null;

-- Optional: Saved Prescriptions per user
create table if not exists public.rx_saved_prescriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.rx_saved_prescriptions enable row level security;

-- Policies for rx_saved_prescriptions
create policy "Users can manage their own prescriptions" on public.rx_saved_prescriptions
  for all using (auth.uid() = user_id);

-- Create index for performance
create index if not exists idx_rx_template_fields_template_id on public.rx_template_fields(template_id);
create index if not exists idx_products_rx_template_id on public.products(rx_template_id);
