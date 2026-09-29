-- Sessions are server-issued (via the start_session RPC, see 0008) so a
-- result can always be checked against a session the server itself started
-- — a client can never submit a result for a session it invented.

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id),
  level_id uuid not null references public.levels (id),
  seed text not null,
  started_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  client_platform text not null check (client_platform in ('browser', 'pwa', 'telegram'))
);

create index game_sessions_profile_id_idx on public.game_sessions (profile_id);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.game_sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id),
  level_id uuid not null references public.levels (id),
  score integer not null default 0,
  time_ms integer not null,
  moves integer,
  hints_used integer not null default 0,
  mistakes integer not null default 0,
  stars smallint not null default 0 check (stars between 0 and 3),
  -- Flagged rather than rejected outright when a plausibility check fails,
  -- so we keep the row for review instead of silently losing the player's
  -- attempt (per PLAN.md's anti-cheat approach).
  is_valid boolean not null default true,
  submitted_at timestamptz not null default now()
);

create index results_profile_id_idx on public.results (profile_id);
create index results_leaderboard_idx on public.results (game_id, level_id, is_valid, score desc, time_ms asc);

create table public.personal_bests (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  game_id text not null references public.games (id),
  mode text not null,
  difficulty text not null,
  best_score integer not null,
  best_time_ms integer not null,
  achieved_at timestamptz not null default now(),
  result_id uuid not null references public.results (id),
  primary key (profile_id, game_id, mode, difficulty)
);

alter table public.game_sessions enable row level security;
alter table public.results enable row level security;
alter table public.personal_bests enable row level security;

create policy "game_sessions: read own" on public.game_sessions
  for select using (auth.uid() = profile_id);

create policy "results: read own" on public.results
  for select using (auth.uid() = profile_id);

create policy "personal_bests: read own" on public.personal_bests
  for select using (auth.uid() = profile_id);

-- Deliberately no insert/update policies for game_sessions, results or
-- personal_bests: every write goes through the SECURITY DEFINER RPCs in
-- 0008_session_rpcs.sql, which run as the table owner and apply the
-- plausibility checks a client-side INSERT could just skip.

-- Keep personal_bests in sync whenever a valid result beats the current
-- best (or is the first result for that game/mode/difficulty).
create function public.upsert_personal_best()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mode text;
  v_difficulty text;
begin
  if not new.is_valid then
    return new;
  end if;

  select mode, difficulty into v_mode, v_difficulty
  from public.levels where id = new.level_id;

  insert into public.personal_bests (profile_id, game_id, mode, difficulty, best_score, best_time_ms, achieved_at, result_id)
  values (new.profile_id, new.game_id, v_mode, v_difficulty, new.score, new.time_ms, new.submitted_at, new.id)
  on conflict (profile_id, game_id, mode, difficulty) do update
    set best_score = greatest(public.personal_bests.best_score, excluded.best_score),
        best_time_ms = case
          when excluded.best_score > public.personal_bests.best_score then excluded.best_time_ms
          when excluded.best_score = public.personal_bests.best_score
               and excluded.best_time_ms < public.personal_bests.best_time_ms then excluded.best_time_ms
          else public.personal_bests.best_time_ms
        end,
        achieved_at = case
          when excluded.best_score > public.personal_bests.best_score
               or (excluded.best_score = public.personal_bests.best_score
                   and excluded.best_time_ms < public.personal_bests.best_time_ms)
          then excluded.achieved_at
          else public.personal_bests.achieved_at
        end,
        result_id = case
          when excluded.best_score > public.personal_bests.best_score
               or (excluded.best_score = public.personal_bests.best_score
                   and excluded.best_time_ms < public.personal_bests.best_time_ms)
          then excluded.result_id
          else public.personal_bests.result_id
        end;

  return new;
end;
$$;

create trigger results_upsert_personal_best
  after insert on public.results
  for each row execute function public.upsert_personal_best();
