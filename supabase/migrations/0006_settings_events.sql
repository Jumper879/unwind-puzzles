create table public.settings (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  sound boolean not null default true,
  music boolean not null default true,
  haptics boolean not null default true,
  relax_mode boolean not null default false,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  language text not null default 'en'
);

-- No third-party trackers (per PLAN.md/SECURITY.md) — this is purely
-- first-party, in-house counters (e.g. "level completed", "hint used").
create table public.events (
  id bigint generated always as identity primary key,
  profile_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_profile_id_idx on public.events (profile_id);

alter table public.settings enable row level security;
alter table public.events enable row level security;

-- Settings are pure client preference, not score/anti-cheat relevant, so
-- (unlike progress/results) a direct client write is fine here.
create policy "settings: read own" on public.settings
  for select using (auth.uid() = profile_id);

create policy "settings: upsert own" on public.settings
  for insert with check (auth.uid() = profile_id);

create policy "settings: update own" on public.settings
  for update using (auth.uid() = profile_id);

create policy "events: insert own" on public.events
  for insert with check (auth.uid() = profile_id);

create policy "events: read own" on public.events
  for select using (auth.uid() = profile_id);
