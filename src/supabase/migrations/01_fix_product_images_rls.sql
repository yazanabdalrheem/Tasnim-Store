-- Fix RLS Policies for product_images public access

-- Enable RLS (idempotent)
alter table public.product_images enable row level security;

-- Drop existing public read policy if it exists to replace it
drop policy if exists "Public Read Images" on public.product_images;
drop policy if exists "public_read_product_images" on public.product_images;

-- Create Public Read Policy
-- Allows public access to all product images. 
-- Refine to (exists (select 1 from products where id = product_images.product_id and is_active = true)) if strictness needed.
-- For now, using the robust check requested.

create policy "public_read_product_images"
on public.product_images
for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.is_active = true
  )
);

-- Ensure storage allows public read
drop policy if exists "Public Access Storage" on storage.objects;

create policy "Public Access Storage"
  on storage.objects for select
  using ( bucket_id = 'product-images' );
