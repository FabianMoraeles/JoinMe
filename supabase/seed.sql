-- Reproducible initial data for personal mode (plan §6): Yesica, Fabián, and their couple.
-- Fixed ids so re-seeding a fresh dev/staging project is idempotent-ish and predictable.
insert into profiles (id, display_name, fixed_profile_key)
values
  ('11111111-1111-4111-8111-111111111111', 'Yesica', 'yesica'),
  ('22222222-2222-4222-8222-222222222222', 'Fabián', 'fabian')
on conflict (id) do nothing;

insert into couples (id, name, created_by_profile_id)
values ('33333333-3333-4333-8333-333333333333', 'Yesica & Fabián', '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into couple_members (couple_id, profile_id, role)
values
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'member'),
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'member')
on conflict do nothing;

-- Demo place + completed experience matching src/features/ratings/mock-data.ts, so the app
-- behaves the same once a real Supabase project replaces the mock data source.
insert into places (id, couple_id, name, location_type, created_by_profile_id)
values (
  '44444444-4444-4444-8444-444444444444',
  '33333333-3333-4333-8333-333333333333',
  'Casa Escobar',
  'exact',
  '11111111-1111-4111-8111-111111111111'
)
on conflict (id) do nothing;

insert into experiences (
  id, couple_id, place_id, created_by_profile_id, title, status, completed_at
)
values (
  '55555555-5555-4555-8555-555555555555',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  'Cena de Aniversario',
  'completed',
  '2024-11-18T22:00:00Z'
)
on conflict (id) do nothing;
