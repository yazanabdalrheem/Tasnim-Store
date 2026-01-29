-- Enable RLS
alter table public.users enable row level security;

-- 1. Create Notifications Table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    type text not null, -- 'order', 'booking', 'question', 'status_change', 'system'
    title text not null,
    body text,
    url text,
    ref_table text, -- 'orders', 'appointments', 'questions'
    ref_id text,
    is_read boolean default false,
    created_at timestamp with time zone default now(),
    meta jsonb default '{}'::jsonb
);

-- RLS for Notifications
create policy "Admins can view notifications"
  on public.notifications for select
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "Admins can update notifications"
  on public.notifications for update
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- 2. Create Notification Queue (for Push)
create table if not exists public.notification_queue (
    id uuid default gen_random_uuid() primary key,
    notification_id uuid references public.notifications(id) on delete cascade,
    type text not null, -- 'push'
    recipient_user_id uuid references auth.users(id),
    status text default 'pending', -- 'pending', 'sent', 'failed'
    attempts int default 0,
    last_error text,
    next_retry_at timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    payload jsonb
);

-- RLS for Queue
create policy "Admins can view queue"
  on public.notification_queue for select
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- 3. Create Push Subscriptions Table
create table if not exists public.push_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id),
    endpoint text not null unique,
    p256dh text not null,
    auth text not null,
    user_agent text,
    created_at timestamp with time zone default now()
);

-- RLS for Push Subscriptions
create policy "Users can manage their own subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id);

-- 4. Enable Realtime
-- Make sure the table is in the publication
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- 5. Triggers Function
create or replace function public.handle_new_notification()
returns trigger as $$
declare
    notif_id uuid;
    notif_title text;
    notif_body text;
    notif_url text;
    notif_type text;
begin
    -- Default values
    notif_type := 'system';
    
    -- Logic based on table
    if TG_TABLE_NAME = 'orders' then
        if TG_OP = 'INSERT' then
            notif_type := 'order';
            notif_title := 'New Order #' || NEW.order_number; -- Assuming order_number column
            notif_body := 'New order received from ' || (NEW.shipping_address->>'full_name');
            notif_url := '/admin/orders/' || NEW.id;
        elsif TG_OP = 'UPDATE' and OLD.status <> NEW.status then
            notif_type := 'status_change';
            notif_title := 'Order Status Changed';
            notif_body := 'Order #' || NEW.order_number || ' is now ' || NEW.status;
            notif_url := '/admin/orders/' || NEW.id;
        else
            return NEW;
        end if;
    
    elsif TG_TABLE_NAME = 'appointments' then
        if TG_OP = 'INSERT' then
            notif_type := 'booking';
            notif_title := 'New Appointment';
            notif_body := 'Booking confirmed for ' || NEW.customer_name;
            notif_url := '/admin/appointments';
        elsif TG_OP = 'UPDATE' and OLD.status <> NEW.status then
            notif_type := 'status_change';
            notif_title := 'Appointment Updated';
            notif_body := 'Appointment for ' || NEW.customer_name || ' is now ' || NEW.status;
            notif_url := '/admin/appointments';
        else
            return NEW;
        end if;

    elsif TG_TABLE_NAME = 'questions' then
        if TG_OP = 'INSERT' then
             notif_type := 'question';
             notif_title := 'New Question';
             notif_body := 'New question from ' || NEW.name;
             notif_url := '/admin/faq';
        else
             return NEW;
        end if;
    end if;

    -- Insert into notifications
    insert into public.notifications (type, title, body, url, ref_table, ref_id)
    values (notif_type, notif_title, notif_body, notif_url, TG_TABLE_NAME, NEW.id::text)
    returning id into notif_id;

    -- Insert into queue for Push (All Admins)
    -- This assumes we want to notify all admins. Ideally, we loop through admin users or a cloud function handles the broadcast.
    -- For now, inserting one 'broadcast' item or queueing items is simplified logic.
    insert into public.notification_queue (notification_id, type, status, payload)
    values (notif_id, 'push', 'pending', jsonb_build_object('title', notif_title, 'body', notif_body, 'url', notif_url));

    return NEW;
end;
$$ language plpgsql security definer;

-- 6. Apply Triggers
drop trigger if exists on_new_order on public.orders;
create trigger on_new_order
    after insert or update on public.orders
    for each row execute function public.handle_new_notification();

drop trigger if exists on_new_appointment on public.appointments;
create trigger on_new_appointment
    after insert or update on public.appointments
    for each row execute function public.handle_new_notification();

drop trigger if exists on_new_question on public.questions;
-- create trigger on_new_question
--    after insert on public.questions
--    for each row execute function public.handle_new_notification();
