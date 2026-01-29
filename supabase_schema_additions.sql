-- Create FAQ table
create table if not exists faq (
  id uuid default uuid_generate_v4() primary key,
  question_he text,
  question_ar text,
  question_en text,
  answer_he text,
  answer_ar text,
  answer_en text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Questions table
create table if not exists questions (
  id uuid default uuid_generate_v4() primary key,
  user_name text,
  user_phone text,
  question text,
  answer text,
  is_public boolean default false,
  status text default 'pending', -- pending, answered
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table faq enable row level security;
create policy "Public can view faq" on faq for select using (true);
create policy "Admin can manage faq" on faq for all using ( auth.role() = 'authenticated' ); -- Simplified for now

alter table questions enable row level security;
create policy "Public can view public questions" on questions for select using ( is_public = true );
create policy "Anyone can insert questions" on questions for insert with check (true);
create policy "Admin can manage questions" on questions for all using ( auth.role() = 'authenticated' );
