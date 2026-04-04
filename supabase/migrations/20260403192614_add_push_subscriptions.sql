create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null,
  auth_key text not null,
  p256dh_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (profile_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = profile_id);

-- Add updated_at trigger
create trigger set_push_subscriptions_updated_at
  before update on push_subscriptions
  for each row
  execute function handle_updated_at();

-- Provide access to service_role (used by Edge Functions)
create policy "Service role has full access to push_subscriptions"
  on push_subscriptions for all
  using (auth.role() = 'service_role');
