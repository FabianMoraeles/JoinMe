-- RLS policies scoped by couple membership (plan §7): "una identidad técnica solo podrá
-- consultar datos pertenecientes a la pareja" — expressed via device_bindings -> profiles ->
-- couple_members, never via hardcoded profile names, so a second couple is isolated for free.

create or replace function public.current_profile_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select profile_id from device_bindings
  where auth_user_id = auth.uid() and status = 'active';
$$;

create or replace function public.current_couple_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from couple_members
  where profile_id in (select public.current_profile_ids());
$$;

-- profiles: read any profile in your couple, edit only your own
create policy "profiles_select_couple" on profiles
  for select using (
    id in (select profile_id from couple_members where couple_id in (select public.current_couple_ids()))
  );

create policy "profiles_update_self" on profiles
  for update using (id in (select public.current_profile_ids()));

-- couples / couple_members: read-only to members (creation happens via seed/admin, not client)
create policy "couples_select_member" on couples
  for select using (id in (select public.current_couple_ids()));

create policy "couple_members_select_member" on couple_members
  for select using (couple_id in (select public.current_couple_ids()));

-- device_bindings: a couple can see and revoke each other's devices, but only self-registers one
create policy "device_bindings_select_couple" on device_bindings
  for select using (
    profile_id in (select profile_id from couple_members where couple_id in (select public.current_couple_ids()))
  );

create policy "device_bindings_insert_self" on device_bindings
  for insert with check (auth_user_id = auth.uid());

create policy "device_bindings_update_couple" on device_bindings
  for update using (
    profile_id in (select profile_id from couple_members where couple_id in (select public.current_couple_ids()))
  );

-- categories / places / experiences / experience_photos: standard couple-scoped CRUD
create policy "categories_all_couple" on categories
  for all using (couple_id in (select public.current_couple_ids()))
  with check (couple_id in (select public.current_couple_ids()));

create policy "places_all_couple" on places
  for all using (couple_id in (select public.current_couple_ids()))
  with check (couple_id in (select public.current_couple_ids()));

create policy "experiences_all_couple" on experiences
  for all using (couple_id in (select public.current_couple_ids()))
  with check (couple_id in (select public.current_couple_ids()));

create policy "experience_photos_all_couple" on experience_photos
  for all using (
    experience_id in (select id from experiences where couple_id in (select public.current_couple_ids()))
  )
  with check (
    experience_id in (select id from experiences where couple_id in (select public.current_couple_ids()))
  );

-- ratings: the hidden-score rule (§5.10), enforced at the DB layer, not just in the client.
-- You can always see your own row. You can see your partner's row for an experience only
-- once you have submitted your own rating for that same experience.
create policy "ratings_select_after_self_rated" on ratings
  for select using (
    experience_id in (select id from experiences where couple_id in (select public.current_couple_ids()))
    and (
      profile_id in (select public.current_profile_ids())
      or exists (
        select 1 from ratings self_rating
        where self_rating.experience_id = ratings.experience_id
          and self_rating.profile_id in (select public.current_profile_ids())
      )
    )
  );

create policy "ratings_insert_self" on ratings
  for insert with check (
    profile_id in (select public.current_profile_ids())
    and experience_id in (select id from experiences where couple_id in (select public.current_couple_ids()))
  );

create policy "ratings_update_self" on ratings
  for update using (profile_id in (select public.current_profile_ids()));

-- push_tokens / activity_log: couple-scoped
create policy "push_tokens_all_couple" on push_tokens
  for all using (
    device_binding_id in (
      select id from device_bindings
      where profile_id in (select profile_id from couple_members where couple_id in (select public.current_couple_ids()))
    )
  )
  with check (
    device_binding_id in (
      select id from device_bindings
      where profile_id in (select profile_id from couple_members where couple_id in (select public.current_couple_ids()))
    )
  );

create policy "activity_log_select_couple" on activity_log
  for select using (couple_id in (select public.current_couple_ids()));

create policy "activity_log_insert_couple" on activity_log
  for insert with check (couple_id in (select public.current_couple_ids()));
