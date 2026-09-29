-- Privacy-law-friendly (GDPR/NDPR) self-service data export and deletion,
-- per PLAN.md section 7. Both operate only on the caller's own data.

create function public.export_my_data()
returns jsonb
language sql security definer set search_path = public
as $$
  select jsonb_build_object(
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'identities', (select coalesce(jsonb_agg(to_jsonb(i)), '[]'::jsonb) from public.identities i where i.profile_id = auth.uid()),
    'progress', (select coalesce(jsonb_agg(to_jsonb(pr)), '[]'::jsonb) from public.progress pr where pr.profile_id = auth.uid()),
    'level_progress', (select coalesce(jsonb_agg(to_jsonb(lp)), '[]'::jsonb) from public.level_progress lp where lp.profile_id = auth.uid()),
    'personal_bests', (select coalesce(jsonb_agg(to_jsonb(pb)), '[]'::jsonb) from public.personal_bests pb where pb.profile_id = auth.uid()),
    'results', (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) from public.results r where r.profile_id = auth.uid()),
    'streaks', (select to_jsonb(s) from public.streaks s where s.profile_id = auth.uid()),
    'achievements', (select coalesce(jsonb_agg(to_jsonb(pa)), '[]'::jsonb) from public.profile_achievements pa where pa.profile_id = auth.uid()),
    'settings', (select to_jsonb(st) from public.settings st where st.profile_id = auth.uid()),
    'events', (select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb) from public.events e where e.profile_id = auth.uid())
  );
$$;

-- Deletes the auth.users row, which cascades through every `references
-- profiles(id) on delete cascade` foreign key in 0001-0008 — no per-table
-- cleanup needed here. Requires the service role (auth.admin.deleteUser),
-- so this RPC just marks intent; the actual deletion is finished by the
-- delete-account Edge Function (not yet written — Phase 7 checkpoint).
create function public.request_account_deletion()
returns void
language sql security definer set search_path = public
as $$
  insert into public.events (profile_id, name, props)
  values (auth.uid(), 'account_deletion_requested', '{}'::jsonb);
$$;

grant execute on function public.export_my_data() to authenticated;
grant execute on function public.request_account_deletion() to authenticated;
