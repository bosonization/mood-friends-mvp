-- NoriDrop tutorial onboarding state

alter table public.profiles
  add column if not exists tutorial_version integer not null default 0,
  add column if not exists tutorial_seen_at timestamptz;

-- Safe own-profile update policy for tutorial completion.
-- If an equivalent broad own-profile update policy already exists, this is harmlessly additive.
drop policy if exists "profiles_update_own_tutorial" on public.profiles;
create policy "profiles_update_own_tutorial"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
