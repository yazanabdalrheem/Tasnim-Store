-- Create product_images table if it doesn't exist
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  storage_path text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.product_images enable row level security;

-- Indexes
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_combined_sort on public.product_images(product_id, sort_order);

-- Unique constraint
alter table public.product_images 
  add constraint unique_product_image_path unique (product_id, storage_path);

-- RLS Policies

-- Public Read (Allow reading if product is active - assuming simplistic check or just true as requested "Public can read")
-- Ideally: using ( exists ( select 1 from products where id = product_images.product_id and is_active = true ) )
-- For performance/simplicity and as requested: "Public can read (only if product is visible)"
create policy "Public Read Images"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
      and products.is_active = true
    )
  );

-- Admin Write (Authenticated users for now, following project pattern)
create policy "Admin Manage Images"
  on public.product_images for all
  to authenticated
  using (true)
  with check (true);

-- Storage Bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Storage Policies
-- Remove existing if any to avoid conflicts or just create if not exists (using weird syntax or just 'create policy')
-- Dropping to be safe in this script if re-run manually is common, but 'create policy if not exists' isn't standard pgsql.
-- I'll use separate statements and user can ignore "already exists" errors, or use DO block.
-- Simple creation:

create policy "Public Access Storage"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Admin Insert Storage"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'product-images' );

create policy "Admin Update Storage"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'product-images' );

create policy "Admin Delete Storage"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'product-images' );
