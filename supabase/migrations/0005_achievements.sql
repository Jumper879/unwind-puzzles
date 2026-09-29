create table public.achievements (
  id text primary key,
  game_id text references public.games (id),
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null default '{}'::jsonb
);

create table public.profile_achievements (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id),
  unlocked_at timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

alter table public.achievements enable row level security;
alter table public.profile_achievements enable row level security;

create policy "achievements: public read" on public.achievements
  for select using (true);

create policy "profile_achievements: read own" on public.profile_achievements
  for select using (auth.uid() = profile_id);

-- Unlocks are granted by the submit_result RPC (or a future check_achievements
-- RPC) evaluating `criteria` server-side — no client insert policy.
