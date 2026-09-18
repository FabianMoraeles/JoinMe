-- Implements plan_app_parejas.md §5.10: submitting a rating must never let the client read
-- the partner's hidden score early. SECURITY DEFINER so it can upsert past the ratings RLS
-- policies safely, while still resolving the caller's own profile server-side (never trusting
-- a client-supplied profile_id).
create or replace function public.submit_rating(p_experience_id uuid, p_score numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_couple_id uuid;
  v_rating_count integer;
begin
  select profile_id into v_profile_id
  from device_bindings
  where auth_user_id = auth.uid() and status = 'active'
  limit 1;

  if v_profile_id is null then
    raise exception 'No active profile bound to this device';
  end if;

  if p_score < 1 or p_score > 5 then
    raise exception 'Score must be between 1 and 5';
  end if;

  select couple_id into v_couple_id from experiences where id = p_experience_id;

  if v_couple_id is null
     or v_couple_id not in (select couple_id from couple_members where profile_id = v_profile_id) then
    raise exception 'Experience does not belong to your couple';
  end if;

  insert into ratings (experience_id, profile_id, score)
  values (p_experience_id, v_profile_id, p_score)
  on conflict (experience_id, profile_id)
  do update set score = excluded.score, updated_at = now();

  select count(*) into v_rating_count from ratings where experience_id = p_experience_id;

  if v_rating_count = 2 then
    update ratings
    set revealed_at = now()
    where experience_id = p_experience_id and revealed_at is null;
  end if;
end;
$$;

grant execute on function public.submit_rating(uuid, numeric) to authenticated;
