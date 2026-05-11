-- NoriDrop tutorial onboarding state
alter table public.profiles
  add column if not exists tutorial_version integer not null default 0,
  add column if not exists tutorial_seen_at timestamptz;
