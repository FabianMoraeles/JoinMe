-- Core schema per plan_app_parejas.md §6. Written generically around couple_id/profile_id
-- membership (not hardcoded names) so it works unchanged once public registration ships (§7).
create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  avatar_url text,
  personal_color text,
  pronouns text,
  preferences jsonb not null default '{}'::jsonb,
  notification_settings jsonb not null default '{}'::jsonb,
  fixed_profile_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table couples (
  id uuid primary key default gen_random_uuid(),
  name text,
  photo_url text,
  relationship_started_on date,
  base_city text,
  theme jsonb not null default '{}'::jsonb,
  invite_code text,
  invite_status text,
  created_by_profile_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table couple_members (
  couple_id uuid not null references couples (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  role text,
  joined_at timestamptz not null default now(),
  primary key (couple_id, profile_id),
  unique (profile_id)
);

create table device_bindings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  auth_user_id uuid not null,
  device_id text not null,
  platform text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  name text not null,
  icon text,
  color text,
  is_system boolean not null default false
);

create table places (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  city text,
  country text,
  location_type text check (location_type in ('exact', 'approximate', 'home', 'remote', 'none')),
  created_by_profile_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  place_id uuid references places (id),
  created_by_profile_id uuid references profiles (id),
  title text not null,
  description text,
  status text not null default 'idea' check (status in ('idea', 'planned', 'completed', 'discarded')),
  category_id uuid references categories (id),
  planned_at timestamptz,
  completed_at timestamptz,
  budget_level smallint,
  cover_photo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table experience_photos (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  uploaded_by_profile_id uuid references profiles (id),
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table experiences
  add constraint experiences_cover_photo_id_fkey
  foreign key (cover_photo_id) references experience_photos (id) on delete set null;

create table ratings (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  score numeric(2, 1) not null check (score >= 1 and score <= 5),
  revealed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experience_id, profile_id)
);

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  device_binding_id uuid not null references device_bindings (id) on delete cascade,
  push_token text not null,
  platform text,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  actor_profile_id uuid references profiles (id),
  entity_type text,
  entity_id uuid,
  action text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table couples enable row level security;
alter table couple_members enable row level security;
alter table device_bindings enable row level security;
alter table categories enable row level security;
alter table places enable row level security;
alter table experiences enable row level security;
alter table experience_photos enable row level security;
alter table ratings enable row level security;
alter table push_tokens enable row level security;
alter table activity_log enable row level security;
