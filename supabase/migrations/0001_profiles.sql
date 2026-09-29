-- Profiles (one row per auth.users row) and the identities that can link
-- to a profile (anonymous, telegram, email, google). A profile can end up
-- with several identities as a guest upgrades or links Telegram, so
-- identities is its own table rather than columns on profiles.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_mood text not null default 'relaxed',
  country text,
  xp integer not null default 0,
  player_level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.identities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('anonymous', 'telegram', 'email', 'google')),
  provider_user_id text not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create index identities_profile_id_idx on public.identities (profile_id);

alter table public.profiles enable row level security;
alter table public.identities enable row level security;

-- Profiles: a user can read/update only their own row. No public read —
-- anything a leaderboard needs to show publicly goes through the
-- leaderboard views (0007), never this table directly.
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Row creation happens via the handle_new_user trigger below, not a
-- client INSERT — no insert policy needed for anon/authenticated.

create policy "identities: read own" on public.identities
  for select using (auth.uid() = profile_id);

-- Auto-create a profile (and its first identity) whenever a new
-- auth.users row appears, whatever the provider.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', null));

  insert into public.identities (profile_id, provider, provider_user_id)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'provider', 'anonymous'),
    new.id::text
  )
  on conflict (provider, provider_user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
