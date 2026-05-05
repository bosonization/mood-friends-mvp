-- NoriDrop like polish + stealth nori migration
-- Adds a once-per-day stealth entry that lets a user enter home without updating mood/login.

create table if not exists public.nori_stealth_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  use_date date not null default current_date,
  created_at timestamptz not null default now()
);

create unique index if not exists nori_stealth_uses_one_per_day_idx
on public.nori_stealth_uses(user_id, use_date);

create index if not exists nori_stealth_uses_user_created_idx
on public.nori_stealth_uses(user_id, created_at desc);

alter table public.nori_stealth_uses enable row level security;

drop policy if exists "nori_stealth_uses_select_own" on public.nori_stealth_uses;
create policy "nori_stealth_uses_select_own"
on public.nori_stealth_uses
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "nori_stealth_uses_insert_own" on public.nori_stealth_uses;
create policy "nori_stealth_uses_insert_own"
on public.nori_stealth_uses
for insert
to authenticated
with check (user_id = auth.uid());
