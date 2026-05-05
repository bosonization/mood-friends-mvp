-- NoriDrop Level + Referral + Spotlight migration
-- Run once in Supabase SQL Editor before applying the Level/Spotlight app patch.

alter table public.profiles
  add column if not exists max_level integer not null default 1;

update public.profiles
set max_level = 1
where max_level is null or max_level < 1 or max_level > 5;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_max_level_check'
  ) then
    alter table public.profiles
      add constraint profiles_max_level_check check (max_level between 1 and 5);
  end if;
end $$;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invited_user_id uuid not null unique references public.profiles(id) on delete cascade,
  invite_code text not null,
  created_at timestamptz not null default now(),
  constraint referrals_no_self check (inviter_id <> invited_user_id),
  constraint referrals_invite_code_check check (invite_code ~ '^[0-9]{10}$')
);

create index if not exists referrals_inviter_id_idx on public.referrals(inviter_id);

create table if not exists public.mood_spotlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  spotlight_date date not null default current_date,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint mood_spotlights_expiry_check check (expires_at > started_at)
);

create unique index if not exists mood_spotlights_one_per_day_idx
on public.mood_spotlights(user_id, spotlight_date);

create index if not exists mood_spotlights_active_idx
on public.mood_spotlights(user_id, expires_at);

alter table public.referrals enable row level security;
alter table public.mood_spotlights enable row level security;

-- referrals policies

drop policy if exists "referrals_select_involved" on public.referrals;
create policy "referrals_select_involved"
on public.referrals
for select
to authenticated
using (inviter_id = auth.uid() or invited_user_id = auth.uid());

drop policy if exists "referrals_insert_invited_self" on public.referrals;
create policy "referrals_insert_invited_self"
on public.referrals
for insert
to authenticated
with check (invited_user_id = auth.uid() and inviter_id <> auth.uid());

-- mood spotlight policies

drop policy if exists "mood_spotlights_select_self_or_friend" on public.mood_spotlights;
create policy "mood_spotlights_select_self_or_friend"
on public.mood_spotlights
for select
to authenticated
using (
  user_id = auth.uid()
  or public.are_friends(auth.uid(), user_id)
);

drop policy if exists "mood_spotlights_insert_own" on public.mood_spotlights;
create policy "mood_spotlights_insert_own"
on public.mood_spotlights
for insert
to authenticated
with check (user_id = auth.uid());

create or replace function public.record_referral_by_code(target_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  inviter uuid;
  invited uuid;
begin
  invited := auth.uid();

  if invited is null then
    return 'not_authenticated';
  end if;

  if target_code !~ '^[0-9]{10}$' then
    return 'invalid_code';
  end if;

  select p.id
  into inviter
  from public.profiles p
  where p.member_code = target_code
    and p.deleted_at is null;

  if inviter is null then
    return 'not_found';
  end if;

  if inviter = invited then
    return 'self_referral';
  end if;

  insert into public.referrals (inviter_id, invited_user_id, invite_code)
  values (inviter, invited, target_code)
  on conflict (invited_user_id) do nothing;

  return 'recorded';
end;
$$;

grant execute on function public.record_referral_by_code(text) to authenticated;
