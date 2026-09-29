-- The only two ways a round's lifecycle touches the database. Clients call
-- these RPCs; they never INSERT into game_sessions/results/progress/streaks
-- directly (those tables have no client-facing write policies at all).

create function public.start_session(
  p_game_id text, p_level_id uuid, p_client_platform text
)
returns public.game_sessions
language plpgsql security definer set search_path = public
as $$
declare
  v_session public.game_sessions;
begin
  if not exists (
    select 1 from public.levels where id = p_level_id and game_id = p_game_id
  ) then
    raise exception 'level % does not belong to game %', p_level_id, p_game_id;
  end if;

  insert into public.game_sessions (profile_id, game_id, level_id, seed, client_platform)
  select auth.uid(), p_game_id, p_level_id, seed, p_client_platform
  from public.levels where id = p_level_id
  returning * into v_session;

  return v_session;
end;
$$;

create function public.submit_result(
  p_session_id uuid, p_score integer, p_time_ms integer,
  p_moves integer default null, p_hints_used integer default 0, p_mistakes integer default 0
)
returns public.results
language plpgsql security definer set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_level public.levels;
  v_elapsed_ms integer;
  v_is_valid boolean := true;
  v_stars smallint := 0;
  v_thresholds jsonb;
  v_result public.results;
  v_timezone text;
  v_today date;
  v_last_active date;
  v_current integer;
  v_longest integer;
begin
  select * into v_session from public.game_sessions
  where id = p_session_id and profile_id = auth.uid()
  for update;

  if not found then
    raise exception 'session % not found for current user', p_session_id;
  end if;
  if v_session.status <> 'active' then
    raise exception 'session % is not active', p_session_id;
  end if;

  select * into v_level from public.levels where id = v_session.level_id;

  -- Plausibility checks (flagged, not rejected — see 0003's comment on
  -- is_valid). A result can't be faster than the server's own clock says
  -- the session has been open, and a handful of milliseconds is not a
  -- believable solve time for anything in this game collection.
  v_elapsed_ms := extract(epoch from (now() - v_session.started_at)) * 1000;
  if p_time_ms < 300 or p_time_ms > v_elapsed_ms + 2000 then
    v_is_valid := false;
  end if;

  -- Star thresholds are stored as {"1": minScore, "2": minScore, "3": minScore}.
  v_thresholds := coalesce(v_level.star_thresholds, '{}'::jsonb);
  if v_thresholds ? '3' and p_score >= (v_thresholds ->> '3')::integer then
    v_stars := 3;
  elsif v_thresholds ? '2' and p_score >= (v_thresholds ->> '2')::integer then
    v_stars := 2;
  elsif v_thresholds ? '1' and p_score >= (v_thresholds ->> '1')::integer then
    v_stars := 1;
  end if;

  insert into public.results (
    session_id, profile_id, game_id, level_id, score, time_ms, moves, hints_used, mistakes, stars, is_valid
  ) values (
    p_session_id, auth.uid(), v_session.game_id, v_session.level_id,
    p_score, p_time_ms, p_moves, p_hints_used, p_mistakes, v_stars, v_is_valid
  )
  returning * into v_result;

  update public.game_sessions set status = 'completed' where id = p_session_id;

  if v_is_valid then
    -- Per-level best (see 0004's comment: aggregated, not incremented, so
    -- replays can't double-count).
    insert into public.level_progress (profile_id, level_id, best_stars, times_completed, last_played_at)
    values (auth.uid(), v_session.level_id, v_stars, 1, now())
    on conflict (profile_id, level_id) do update
      set best_stars = greatest(public.level_progress.best_stars, excluded.best_stars),
          times_completed = public.level_progress.times_completed + 1,
          last_played_at = now();

    insert into public.progress (profile_id, game_id, highest_level, stars_total, completed_count, last_played_at)
    select
      auth.uid(), v_session.game_id,
      greatest(coalesce((select highest_level from public.progress where profile_id = auth.uid() and game_id = v_session.game_id), 0), v_level.level_number),
      (select coalesce(sum(lp.best_stars), 0) from public.level_progress lp
         join public.levels l on l.id = lp.level_id
         where lp.profile_id = auth.uid() and l.game_id = v_session.game_id),
      (select coalesce(sum(lp.times_completed), 0) from public.level_progress lp
         join public.levels l on l.id = lp.level_id
         where lp.profile_id = auth.uid() and l.game_id = v_session.game_id),
      now()
    on conflict (profile_id, game_id) do update
      set highest_level = excluded.highest_level,
          stars_total = excluded.stars_total,
          completed_count = excluded.completed_count,
          last_played_at = excluded.last_played_at;

    -- Timezone-safe streak update (freeze-once-per-week is a Phase 7 feature).
    select coalesce(timezone, 'UTC'), last_active_date, current, longest
      into v_timezone, v_last_active, v_current, v_longest
    from public.streaks where profile_id = auth.uid();

    v_today := (now() at time zone coalesce(v_timezone, 'UTC'))::date;

    if v_last_active is null then
      v_current := 1;
    elsif v_last_active = v_today then
      v_current := coalesce(v_current, 1);
    elsif v_last_active = v_today - 1 then
      v_current := coalesce(v_current, 0) + 1;
    else
      v_current := 1;
    end if;
    v_longest := greatest(coalesce(v_longest, 0), v_current);

    insert into public.streaks (profile_id, current, longest, last_active_date, timezone)
    values (auth.uid(), v_current, v_longest, v_today, coalesce(v_timezone, 'UTC'))
    on conflict (profile_id) do update
      set current = excluded.current, longest = excluded.longest, last_active_date = excluded.last_active_date;
  end if;

  return v_result;
end;
$$;

-- Low-stakes autosave for resuming an unfinished puzzle — deliberately
-- separate from the scoring path above, so it can be a plain upsert with
-- no plausibility checks (there's nothing to cheat by saving your own
-- in-progress board state).
create function public.save_resume_state(p_game_id text, p_state jsonb)
returns void
language sql security definer set search_path = public
as $$
  insert into public.progress (profile_id, game_id, saved_state, last_played_at)
  values (auth.uid(), p_game_id, p_state, now())
  on conflict (profile_id, game_id) do update
    set saved_state = excluded.saved_state, last_played_at = excluded.last_played_at;
$$;

grant execute on function public.start_session(text, uuid, text) to authenticated;
grant execute on function public.submit_result(uuid, integer, integer, integer, integer, integer) to authenticated;
grant execute on function public.save_resume_state(text, jsonb) to authenticated;
