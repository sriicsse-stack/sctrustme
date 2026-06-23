-- Supabase schema for application user auth and project persistence

-- Profiles table holds core user metadata for auth users.
create table if not exists profiles (
  id uuid primary key,
  email text unique,
  full_name text,
  avatar_url text,
  provider text,
  updated_at timestamptz default now()
);

-- Projects table stores generated project metadata and preview HTML.
create table if not exists projects (
  id text primary key,
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  prompt text,
  created_at timestamptz default now(),
  preview_html text,
  deployments jsonb,
  files jsonb
);

-- Enable row-level security and policies for production safety.
alter table profiles enable row level security;
alter table projects enable row level security;

create policy "Allow authenticated users to manage their own profile" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Allow authenticated users to read their own projects" on projects
  for select
  using (owner_id = auth.uid());

create policy "Allow authenticated users to insert their own projects" on projects
  for insert
  with check (owner_id = auth.uid());

create policy "Allow authenticated users to update their own projects" on projects
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Allow authenticated users to delete their own projects" on projects
  for delete
  using (owner_id = auth.uid());
