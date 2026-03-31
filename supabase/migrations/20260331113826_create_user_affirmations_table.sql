create table if not exists public.user_affirmations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    affirmation text not null,
    brick_id integer,
    is_favorite boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- enable row level security
alter table public.user_affirmations enable row level security;

-- create policies
create policy "users can view their own affirmations"
    on public.user_affirmations
    for select
    using (auth.uid() = user_id);

create policy "users can insert their own affirmations"
    on public.user_affirmations
    for insert
    with check (auth.uid() = user_id);

create policy "users can update their own affirmations"
    on public.user_affirmations
    for update
    using (auth.uid() = user_id);

create policy "users can delete their own affirmations"
    on public.user_affirmations
    for delete
    using (auth.uid() = user_id);
