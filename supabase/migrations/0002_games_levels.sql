-- Static content: the 8 games, their levels, and daily challenge picks.
-- Publicly readable (no RLS write path for clients — content is managed
-- via seed/migrations or an admin tool, never written by players).

create table public.games (
  id text primary key,
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references public.games (id) on delete cascade,
  -- e.g. tic-tac-toe: 'classic' | 'connect4'; chess: 'full-game' | 'puzzle'.
  -- Defaults to 'classic' for games with only one mode.
  mode text not null default 'classic',
  difficulty text not null,
  level_number integer not null,
  seed text not null,
  payload jsonb not null default '{}'::jsonb,
  par_time_ms integer,
  star_thresholds jsonb not null default '{}'::jsonb,
  is_daily boolean not null default false,
  created_at timestamptz not null default now(),
  unique (game_id, mode, difficulty, level_number)
);

create index levels_game_id_idx on public.levels (game_id);
create index levels_is_daily_idx on public.levels (is_daily) where is_daily;

create table public.daily_challenges (
  date date not null,
  game_id text not null references public.games (id),
  level_id uuid not null references public.levels (id),
  primary key (date, game_id)
);

alter table public.games enable row level security;
alter table public.levels enable row level security;
alter table public.daily_challenges enable row level security;

create policy "games: public read" on public.games
  for select using (true);

create policy "levels: public read" on public.levels
  for select using (true);

create policy "daily_challenges: public read" on public.daily_challenges
  for select using (true);
