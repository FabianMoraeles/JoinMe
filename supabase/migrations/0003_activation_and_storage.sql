-- Real device activation (plan §5.1) + private photo storage (plan §7's "rutas separadas por
-- pareja") + Realtime for the hidden-rating waiting screen (plan §5.10/§5.12).

-- Bootstraps a device_bindings row server-side. A client can't look up profiles.id by
-- fixed_profile_key on its own before this row exists (profiles_select_couple requires a couple
-- membership that itself depends on a device_bindings row for auth.uid()) — SECURITY DEFINER
-- resolves that chicken-and-egg problem the same way submit_rating() resolves rating identity.
create or replace function public.activate_device(
  p_fixed_profile_key text,
  p_device_id text,
  p_platform text
)
returns table (device_binding_id uuid, profile_id uuid, couple_id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_couple_id uuid;
  v_display_name text;
  v_binding_id uuid;
begin
  select id, display_name into v_profile_id, v_display_name
  from profiles
  where fixed_profile_key = p_fixed_profile_key;

  if v_profile_id is null then
    raise exception 'Unknown fixed_profile_key: %', p_fixed_profile_key;
  end if;

  select cm.couple_id into v_couple_id
  from couple_members cm
  where cm.profile_id = v_profile_id
  limit 1;

  insert into device_bindings (profile_id, auth_user_id, device_id, platform, status, last_seen_at)
  values (v_profile_id, auth.uid(), p_device_id, p_platform, 'active', now())
  returning id into v_binding_id;

  return query select v_binding_id, v_profile_id, v_couple_id, v_display_name;
end;
$$;

grant execute on function public.activate_device(text, text, text) to authenticated;

-- Private bucket for experience photos, scoped per couple via the folder path
-- (experience-photos/{couple_id}/{experience_id}/{file}.jpg).
insert into storage.buckets (id, name, public)
values ('experience-photos', 'experience-photos', false)
on conflict (id) do nothing;

create policy "experience_photos_storage_select" on storage.objects
  for select using (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1]::uuid in (select public.current_couple_ids())
  );

create policy "experience_photos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1]::uuid in (select public.current_couple_ids())
  );

create policy "experience_photos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'experience-photos'
    and (storage.foldername(name))[1]::uuid in (select public.current_couple_ids())
  );

-- Let the waiting screen subscribe to Realtime on ratings (respects the table's existing RLS
-- per-subscriber, so a partner's row is only broadcast once the viewer has rated too).
alter publication supabase_realtime add table ratings;
