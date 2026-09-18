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

-- Default categories (couple-scoped, plan §6 `categories`) — matches the icon/color set the app
-- used while it was running on the in-memory mock, so the seeded DB looks the same.
insert into categories (id, couple_id, name, icon, color, is_system)
values
  ('66666666-6666-4666-8666-666666666666', '33333333-3333-4333-8333-333333333333', 'Comida', 'restaurant', '#e50066', true),
  ('77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333333', 'Aventura', 'hiking', '#aa2d32', true),
  ('88888888-8888-4888-8888-888888888888', '33333333-3333-4333-8333-333333333333', 'Cultura', 'theater-comedy', '#910030', true),
  ('99999999-9999-4999-8999-999999999999', '33333333-3333-4333-8333-333333333333', 'Relax', 'spa', '#cc4548', true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 'Sorpresa', 'auto-awesome', '#b90040', true)
on conflict (id) do nothing;

-- Demo place + completed experience, so the seeded DB has something to open right away.
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
  id, couple_id, place_id, category_id, created_by_profile_id, title, status, completed_at
)
values (
  '55555555-5555-4555-8555-555555555555',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '66666666-6666-4666-8666-666666666666',
  '11111111-1111-4111-8111-111111111111',
  'Cena de Aniversario',
  'completed',
  '2024-11-18T22:00:00Z'
)
on conflict (id) do nothing;
