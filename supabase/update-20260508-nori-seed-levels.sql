-- NoriDrop Nori Seed level redesign
-- Run after the previous Level + Spotlight migrations.
-- New growth rule:
-- Lv1 initial
-- + profile avatar registration => Lv2
-- + nori update 1 => Lv3
-- + nori update 2 => Lv4
-- + nori update 3 => Lv5
-- Spotlight remains separate: Lv5 + at least one referral.

alter table public.profiles
  add column if not exists nori_update_count integer not null default 0;

update public.profiles
set nori_update_count = 0
where nori_update_count is null or nori_update_count < 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_nori_update_count_check'
  ) then
    alter table public.profiles
      add constraint profiles_nori_update_count_check check (nori_update_count >= 0);
  end if;
end $$;

-- Keep existing max levels; this avoids dropping existing users.
-- For users who have no max_level yet, infer the new level from avatar + update count.
update public.profiles p
set max_level = greatest(
  coalesce(p.max_level, 1),
  least(5, 1 + case when p.avatar_url is not null then 1 else 0 end + least(coalesce(p.nori_update_count, 0), 3))
)
where p.deleted_at is null;
