-- Fix for questions table schema
-- 1. Ensure table exists
create table if not exists public.questions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add columns if they are missing (idempotent)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'user_name') then
        alter table public.questions add column user_name text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'user_phone') then
        alter table public.questions add column user_phone text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'question') then
        alter table public.questions add column question text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'answer') then
        alter table public.questions add column answer text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'is_public') then
        alter table public.questions add column is_public boolean default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'status') then
        alter table public.questions add column status text default 'pending';
    end if;
end $$;

-- 3. Ensure RLS is enabled and policies exist
alter table public.questions enable row level security;

-- Drop existing policies to avoid conflicts if creating new ones
drop policy if exists "Public can view public questions" on public.questions;
drop policy if exists "Anyone can insert questions" on public.questions;
drop policy if exists "Admin can manage questions" on public.questions;

-- Create correct policies
create policy "Public can view public questions" 
on public.questions for select 
using ( is_public = true );

create policy "Anyone can insert questions" 
on public.questions for insert 
with check ( true );

-- Assuming authenticated users with role 'admin' (or basic auth check for now)
create policy "Admin can manage questions" 
on public.questions for all 
using ( auth.role() = 'authenticated' );

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload config';
