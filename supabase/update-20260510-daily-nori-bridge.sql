-- NoriDrop Daily Nori + Nori Bridge
-- Adds a daily drop log and friend-of-friend discovery with privacy setting.

alter table public.profiles
  add column if not exists show_on_friend_bridge boolean not null default true;

create table if not exists public.daily_nori_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  mood_key text not null,
  created_at timestamptz not null default now(),
  constraint daily_nori_logs_mood_key_check check (
    mood_key in ('food', 'drink', 'travel', 'game', 'cafe', 'walk', 'movie', 'work')
  ),
  constraint daily_nori_logs_unique_user_date unique (user_id, log_date)
);

create index if not exists daily_nori_logs_user_date_idx
on public.daily_nori_logs (user_id, log_date desc);

alter table public.daily_nori_logs enable row level security;

drop policy if exists "daily_nori_logs_select_own" on public.daily_nori_logs;
create policy "daily_nori_logs_select_own"
on public.daily_nori_logs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "daily_nori_logs_insert_own" on public.daily_nori_logs;
create policy "daily_nori_logs_insert_own"
on public.daily_nori_logs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "daily_nori_logs_update_own" on public.daily_nori_logs;
create policy "daily_nori_logs_update_own"
on public.daily_nori_logs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.request_friend_by_profile_id(target_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_status text;
begin
  if auth.uid() is null then
    return 'not_authenticated';
  end if;

  if target_id is null then
    return 'not_found';
  end if;

  if target_id = auth.uid() then
    return 'self_request';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = target_id and p.deleted_at is null
  ) then
    return 'not_found';
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

grant execute on function public.request_friend_by_profile_id(uuid) to authenticated;

create or replace function public.get_nori_bridge_candidates(max_count integer default 12)
returns table (
  id uuid,
  handle_name text,
  tagline text,
  avatar_url text,
  mutual_count integer
)
language sql
security definer
set search_path = public
stable
as $$
  with my_friends as (
    select case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end as friend_id
    from public.friendships f
    where f.status = 'accepted'
      and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  ),
  second_degree as (
    select
      case when f.requester_id = mf.friend_id then f.addressee_id else f.requester_id end as candidate_id,
      mf.friend_id as via_friend_id
    from my_friends mf
    join public.friendships f
      on f.status = 'accepted'
     and (f.requester_id = mf.friend_id or f.addressee_id = mf.friend_id)
  ),
  grouped as (
    select sd.candidate_id, count(distinct sd.via_friend_id)::integer as mutual_count
    from second_degree sd
    where sd.candidate_id <> auth.uid()
      and sd.candidate_id not in (select friend_id from my_friends)
      and not exists (
        select 1 from public.friendships existing
        where (existing.requester_id = auth.uid() and existing.addressee_id = sd.candidate_id)
           or (existing.addressee_id = auth.uid() and existing.requester_id = sd.candidate_id)
      )
    group by sd.candidate_id
  )
  select p.id, p.handle_name, p.tagline, p.avatar_url, g.mutual_count
  from grouped g
  join public.profiles p on p.id = g.candidate_id
  where p.deleted_at is null
    and p.show_on_friend_bridge is true
  order by g.mutual_count desc, p.updated_at desc
  limit greatest(0, least(coalesce(max_count, 12), 24));
$$;

grant execute on function public.get_nori_bridge_candidates(integer) to authenticated;

create or replace function public.get_daily_nori_status()
returns table (
  today_done boolean,
  streak integer,
  last_drop_date date
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  d date;
  current_streak integer := 0;
  expected date := current_date;
begin
  if auth.uid() is null then
    return query select false, 0, null::date;
    return;
  end if;

  for d in
    select l.log_date
    from public.daily_nori_logs l
    where l.user_id = auth.uid()
    order by l.log_date desc
  loop
    if d = expected then
      current_streak := current_streak + 1;
      expected := expected - 1;
    elsif d < expected then
      exit;
    end if;
  end loop;

  return query
    select
      exists (
        select 1 from public.daily_nori_logs l
        where l.user_id = auth.uid()
          and l.log_date = current_date
      ),
      current_streak,
      (
        select max(l.log_date)
        from public.daily_nori_logs l
        where l.user_id = auth.uid()
      );
end;
$$;

grant execute on function public.get_daily_nori_status() to authenticated;
