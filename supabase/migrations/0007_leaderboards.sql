-- Public leaderboards. These are SECURITY DEFINER functions (not a plain
-- view over profiles) so they can read personal_bests/results/profiles
-- despite those tables' owner-only RLS, while only ever projecting out the
-- safe columns (display_name, avatar_mood, score, time) — never raw
-- profile rows. Tie-break order throughout: higher score, then lower
-- time, then earlier achieved_at.

create function public.alltime_leaderboard(
  p_game_id text, p_mode text, p_difficulty text, p_limit int default 100
)
returns table (
  rank bigint, profile_id uuid, display_name text, avatar_mood text,
  best_score integer, best_time_ms integer, achieved_at timestamptz
)
language sql security definer set search_path = public stable
as $$
  select rank() over (
           order by pb.best_score desc, pb.best_time_ms asc, pb.achieved_at asc
         ) as rank,
         pb.profile_id, p.display_name, p.avatar_mood,
         pb.best_score, pb.best_time_ms, pb.achieved_at
  from public.personal_bests pb
  join public.profiles p on p.id = pb.profile_id
  where pb.game_id = p_game_id and pb.mode = p_mode and pb.difficulty = p_difficulty
  order by rank
  limit p_limit;
$$;

create function public.my_alltime_rank(p_game_id text, p_mode text, p_difficulty text)
returns table (rank bigint, best_score integer, best_time_ms integer)
language sql security definer set search_path = public stable
as $$
  with ranked as (
    select profile_id, best_score, best_time_ms,
           rank() over (order by best_score desc, best_time_ms asc, achieved_at asc) as rank
    from public.personal_bests
    where game_id = p_game_id and mode = p_mode and difficulty = p_difficulty
  )
  select rank, best_score, best_time_ms from ranked where profile_id = auth.uid();
$$;

-- Weekly is a rolling window over `results` (best valid result per player
-- since the start of the current week), not a materialization of
-- personal_bests, since personal_bests is deliberately all-time.
create function public.weekly_leaderboard(
  p_game_id text, p_mode text, p_difficulty text, p_limit int default 100
)
returns table (
  rank bigint, profile_id uuid, display_name text, avatar_mood text,
  score integer, time_ms integer, achieved_at timestamptz
)
language sql security definer set search_path = public stable
as $$
  with best_this_week as (
    select distinct on (r.profile_id)
           r.profile_id, r.score, r.time_ms, r.submitted_at
    from public.results r
    join public.levels l on l.id = r.level_id
    where r.game_id = p_game_id and l.mode = p_mode and l.difficulty = p_difficulty
      and r.is_valid
      and r.submitted_at >= date_trunc('week', now())
    order by r.profile_id, r.score desc, r.time_ms asc, r.submitted_at asc
  )
  select rank() over (order by b.score desc, b.time_ms asc, b.submitted_at asc) as rank,
         b.profile_id, p.display_name, p.avatar_mood, b.score, b.time_ms, b.submitted_at as achieved_at
  from best_this_week b
  join public.profiles p on p.id = b.profile_id
  order by rank
  limit p_limit;
$$;

create function public.my_weekly_rank(p_game_id text, p_mode text, p_difficulty text)
returns table (rank bigint, score integer, time_ms integer)
language sql security definer set search_path = public stable
as $$
  with best_this_week as (
    select distinct on (r.profile_id)
           r.profile_id, r.score, r.time_ms, r.submitted_at
    from public.results r
    join public.levels l on l.id = r.level_id
    where r.game_id = p_game_id and l.mode = p_mode and l.difficulty = p_difficulty
      and r.is_valid
      and r.submitted_at >= date_trunc('week', now())
    order by r.profile_id, r.score desc, r.time_ms asc, r.submitted_at asc
  ),
  ranked as (
    select profile_id, score, time_ms,
           rank() over (order by score desc, time_ms asc, submitted_at asc) as rank
    from best_this_week
  )
  select rank, score, time_ms from ranked where profile_id = auth.uid();
$$;

grant execute on function public.alltime_leaderboard(text, text, text, int) to anon, authenticated;
grant execute on function public.weekly_leaderboard(text, text, text, int) to anon, authenticated;
grant execute on function public.my_alltime_rank(text, text, text) to authenticated;
grant execute on function public.my_weekly_rank(text, text, text) to authenticated;
