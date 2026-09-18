-- Fixes 0002_policies.sql's "ratings_select_after_self_rated" policy: it queried `ratings`
-- from inside its own USING clause, which makes Postgres re-apply the same policy to that
-- subquery — infinite recursion (error 42P17 "infinite recursion detected in policy for
-- relation ratings"), caught by real end-to-end testing against a live project.
create or replace function public.has_rated(p_experience_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from ratings
    where ratings.experience_id = p_experience_id
      and ratings.profile_id in (select public.current_profile_ids())
  );
$$;

drop policy if exists "ratings_select_after_self_rated" on ratings;

create policy "ratings_select_after_self_rated" on ratings
  for select using (
    experience_id in (select id from experiences where couple_id in (select public.current_couple_ids()))
    and (
      profile_id in (select public.current_profile_ids())
      or public.has_rated(experience_id)
    )
  );
