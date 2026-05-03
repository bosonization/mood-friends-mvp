-- Mood Friends MVP schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- ---------- helpers ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_member_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  loop
    code := lpad(floor(random() * 10000000000)::bigint::text, 10, '0');
    exit when not exists (
      select 1 from public.profiles p where p.member_code = code
    );
  end loop;

  return code;
end;
$$;


create or replace function public.prevent_profile_immutable_changes()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id then
    raise exception 'profile id cannot be changed';
  end if;

  new.member_code := old.member_code;
  return new;
end;
$$;

create or replace function public.prevent_friendship_participant_changes()
returns trigger
language plpgsql
as $$
begin
  if new.requester_id <> old.requester_id or new.addressee_id <> old.addressee_id then
    raise exception 'friendship participants cannot be changed';
  end if;

  if old.status <> 'pending' and new.status <> old.status then
    raise exception 'friendship status cannot be changed after it is no longer pending';
  end if;

  return new;
end;
$$;

-- ---------- tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  member_code text not null unique default public.generate_member_code(),
  handle_name text not null,
  tagline text not null default '',
  avatar_url text,
  is_adult boolean not null default false,
  terms_agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_member_code_length check (member_code ~ '^[0-9]{10}$'),
  constraint profiles_handle_name_length check (char_length(handle_name) between 1 and 30),
  constraint profiles_tagline_length check (char_length(tagline) <= 15)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_no_self check (requester_id <> addressee_id),
  constraint friendships_status_check check (status in ('pending', 'accepted', 'rejected'))
);

create unique index if not exists friendships_unique_pair_idx
on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);

create or replace function public.are_friends(left_user uuid, right_user uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = left_user and f.addressee_id = right_user)
        or
        (f.requester_id = right_user and f.addressee_id = left_user)
      )
  );
$$;

create table if not exists public.mood_statuses (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  mood_key text not null,
  last_login_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mood_statuses_mood_key_check check (
    mood_key in ('food', 'drink', 'travel', 'game', 'cafe', 'walk', 'movie', 'work')
  )
);

create table if not exists public.terms_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  terms_version text not null default '2026-05-03',
  consented_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_no_self check (blocker_id <> blocked_id)
);

create unique index if not exists blocks_unique_pair_idx
on public.blocks (blocker_id, blocked_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  detail text,
  created_at timestamptz not null default now(),
  constraint reports_reason_length check (char_length(reason) between 1 and 80),
  constraint reports_detail_length check (detail is null or char_length(detail) <= 1000)
);

-- ---------- triggers ----------

drop trigger if exists profiles_prevent_immutable_changes on public.profiles;
create trigger profiles_prevent_immutable_changes
before update on public.profiles
for each row execute function public.prevent_profile_immutable_changes();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists friendships_prevent_participant_changes on public.friendships;
create trigger friendships_prevent_participant_changes
before update on public.friendships
for each row execute function public.prevent_friendship_participant_changes();

drop trigger if exists friendships_set_updated_at on public.friendships;
create trigger friendships_set_updated_at
before update on public.friendships
for each row execute function public.set_updated_at();

drop trigger if exists mood_statuses_set_updated_at on public.mood_statuses;
create trigger mood_statuses_set_updated_at
before update on public.mood_statuses
for each row execute function public.set_updated_at();

-- ---------- RPC: request friend by 10-digit member code ----------

create or replace function public.request_friend_by_code(target_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  existing_status text;
begin
  if auth.uid() is null then
    return 'not_authenticated';
  end if;

  if target_code !~ '^[0-9]{10}$' then
    return 'invalid_code';
  end if;

  select p.id
  into target_id
  from public.profiles p
  where p.member_code = target_code
    and p.deleted_at is null;

  if target_id is null then
    return 'not_found';
  end if;

  if target_id = auth.uid() then
    return 'self_request';
  end if;

  select f.status
  into existing_status
  from public.friendships f
  where
    (f.requester_id = auth.uid() and f.addressee_id = target_id)
    or
    (f.requester_id = target_id and f.addressee_id = auth.uid())
  limit 1;

  if existing_status is not null then
    return existing_status;
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (auth.uid(), target_id, 'pending');

  return 'requested';
end;
$$;

grant execute on function public.request_friend_by_code(text) to authenticated;

-- ---------- RLS ----------

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.mood_statuses enable row level security;
alter table public.terms_consents enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- profiles
drop policy if exists "profiles_select_self_or_connected" on public.profiles;
create policy "profiles_select_self_or_connected"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.friendships f
    where f.status in ('pending', 'accepted')
      and (
        (f.requester_id = auth.uid() and f.addressee_id = profiles.id)
        or
        (f.addressee_id = auth.uid() and f.requester_id = profiles.id)
      )
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- friendships
drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved"
on public.friendships
for select
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "friendships_insert_self_request" on public.friendships;
create policy "friendships_insert_self_request"
on public.friendships
for insert
to authenticated
with check (requester_id = auth.uid());

drop policy if exists "friendships_update_addressee" on public.friendships;
create policy "friendships_update_addressee"
on public.friendships
for update
to authenticated
using (addressee_id = auth.uid())
with check (addressee_id = auth.uid());

drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved"
on public.friendships
for delete
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

-- mood_statuses
drop policy if exists "mood_statuses_select_self_or_friend" on public.mood_statuses;
create policy "mood_statuses_select_self_or_friend"
on public.mood_statuses
for select
to authenticated
using (
  user_id = auth.uid()
  or public.are_friends(auth.uid(), user_id)
);

drop policy if exists "mood_statuses_insert_own" on public.mood_statuses;
create policy "mood_statuses_insert_own"
on public.mood_statuses
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "mood_statuses_update_own" on public.mood_statuses;
create policy "mood_statuses_update_own"
on public.mood_statuses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- terms_consents
drop policy if exists "terms_consents_select_own" on public.terms_consents;
create policy "terms_consents_select_own"
on public.terms_consents
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "terms_consents_insert_own" on public.terms_consents;
create policy "terms_consents_insert_own"
on public.terms_consents
for insert
to authenticated
with check (user_id = auth.uid());

-- blocks
drop policy if exists "blocks_select_own" on public.blocks;
create policy "blocks_select_own"
on public.blocks
for select
to authenticated
using (blocker_id = auth.uid());

drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own"
on public.blocks
for insert
to authenticated
with check (blocker_id = auth.uid());

drop policy if exists "blocks_delete_own" on public.blocks;
create policy "blocks_delete_own"
on public.blocks
for delete
to authenticated
using (blocker_id = auth.uid());

-- reports
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
on public.reports
for insert
to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
on public.reports
for select
to authenticated
using (reporter_id = auth.uid());
