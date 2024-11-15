create type account_deletion_status as enum ('pending', 'cancelled', 'completed');

create table public.account_deletions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  feedback text,
  requested_at timestamp with time zone not null,
  scheduled_deletion_date timestamp with time zone not null,
  cancelled_at timestamp with time zone,
  completed_at timestamp with time zone,
  status account_deletion_status not null default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table public.account_deletions enable row level security;

create policy "Users can view their own deletion requests"
  on public.account_deletions for select
  using (auth.uid() = user_id);

create policy "Service role can manage all deletion requests"
  on public.account_deletions for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Add triggers
create trigger set_updated_at
  before update on public.account_deletions
  for each row
  execute function public.set_updated_at();

-- Create function to process account deletions
create or replace function process_account_deletions()
returns void as $$
begin
  -- Find accounts ready for deletion
  update public.account_deletions
  set 
    status = 'completed',
    completed_at = now()
  where 
    status = 'pending'
    and scheduled_deletion_date <= now();
end;
$$ language plpgsql security definer;

-- Create cron job to process deletions
select cron.schedule(
  'process-account-deletions',
  '0 0 * * *', -- Run daily at midnight
  $$select process_account_deletions()$$
); 