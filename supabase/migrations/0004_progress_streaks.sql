create table public.progress (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id),
  highest_level integer not null default 0,
  stars_total integer not null default 0,
  completed_count integer not null default 0,
  last_played_at timestamptz,
  -- Resume state for an unfinished puzzle (current board, undo stack, etc).
  -- Shape is game-specific and owned entirely by that game's engine.
  saved_state jsonb,
  primary key (profile_id, game_id)
);

-- Per-level best result, kept so progress.stars_total/completed_count can
-- be recomputed by aggregation (SUM/COUNT) instead of incremented in place
-- — replaying a level to improve your star count can't accidentally
-- double-count stars that way.
create table public.level_progress (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  level_id uuid not null references public.levels (id) on delete cascade,
  best_stars smallint not null default 0 check (best_stars between 0 and 3),
  times_completed integer not null default 0,
  last_played_at timestamptz not null default now(),
  primary key (profile_id, level_id)
);

create table public.streaks (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  current integer not null default 0,
  longest integer not null default 0,
  last_active_date date,
  timezone text not null default 'UTC'
);

alter table public.progress enable row level security;
alter table public.streaks enable row level security;
alter table public.level_progress enable row level security;

create policy "progress: read own" on public.progress
  for select using (auth.uid() = profile_id);

create policy "streaks: read own" on public.streaks
  for select using (auth.uid() = profile_id);

create policy "level_progress: read own" on public.level_progress
  for select using (auth.uid() = profile_id);

-- No direct insert/update policies: highest_level/stars_total/completed_count
-- and streak counters are only ever touched by the submit_result RPC
-- (0008_session_rpcs.sql) so a client can't just set its own star count.
-- The resume-state autosave (low-stakes, not score-relevant) goes through
-- the separate save_resume_state RPC in the same file, not a raw UPDATE.
