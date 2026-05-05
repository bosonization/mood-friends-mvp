-- NoriDrop Nori Like migration
-- Adds mood history entries and one-way like reactions.
-- Run once in Supabase SQL Editor before applying the app patch.

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood_key text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint mood_entries_mood_key_check check (mood_key in ('food','drink','movie','game','cafe','walk','work','travel')),
  constraint mood_entries_expiry_check check (expires_at > started_at)
);

create index if not exists mood_entries_user_started_idx on public.mood_entries(user_id, started_at desc);
create index if not exists mood_entries_user_created_idx on public.mood_entries(user_id, created_at desc);

alter table public.mood_statuses
  add column if not exists current_entry_id uuid references public.mood_entries(id) on delete set null;

create index if not exists mood_statuses_current_entry_idx on public.mood_statuses(current_entry_id);

create table if not exists public.mood_reactions (
  id uuid primary key default gen_random_uuid(),
  mood_entry_id uuid not null references public.mood_entries(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null default 'like',
  created_at timestamptz not null default now(),
  constraint mood_reactions_no_self check (actor_id <> target_user_id),
  constraint mood_reactions_type_check check (reaction_type in ('like'))
);

create unique index if not exists mood_reactions_unique_like_idx
on public.mood_reactions(mood_entry_id, actor_id, reaction_type);

create index if not exists mood_reactions_target_created_idx on public.mood_reactions(target_user_id, created_at desc);
create index if not exists mood_reactions_actor_created_idx on public.mood_reactions(actor_id, created_at desc);
create index if not exists mood_reactions_entry_idx on public.mood_reactions(mood_entry_id);

alter table public.mood_entries enable row level security;
alter table public.mood_reactions enable row level security;

-- Backfill current mood entries for users who already have a mood_status.
do $$
declare
  status_record record;
  new_entry_id uuid;
begin
  for status_record in
    select * from public.mood_statuses ms
    where ms.current_entry_id is null
  loop
    insert into public.mood_entries (user_id, mood_key, started_at, expires_at, created_at)
    values (
      status_record.user_id,
      status_record.mood_key,
      coalesce(status_record.session_started_at, status_record.last_login_at, now()),
      coalesce(status_record.session_expires_at, now() + interval '10 minutes'),
      coalesce(status_record.created_at, now())
    )
    returning id into new_entry_id;

    update public.mood_statuses
    set current_entry_id = new_entry_id
    where user_id = status_record.user_id;
  end loop;
end $$;

-- mood_entries policies

drop policy if exists "mood_entries_select_self_or_friend" on public.mood_entries;
create policy "mood_entries_select_self_or_friend"
on public.mood_entries
for select
to authenticated
using (
  user_id = auth.uid()
  or public.are_friends(auth.uid(), user_id)
);

drop policy if exists "mood_entries_insert_own" on public.mood_entries;
create policy "mood_entries_insert_own"
on public.mood_entries
for insert
to authenticated
with check (user_id = auth.uid());

-- mood_reactions policies

drop policy if exists "mood_reactions_select_involved" on public.mood_reactions;
create policy "mood_reactions_select_involved"
on public.mood_reactions
for select
to authenticated
using (
  actor_id = auth.uid()
  or target_user_id = auth.uid()
);

drop policy if exists "mood_reactions_insert_friend_like" on public.mood_reactions;
create policy "mood_reactions_insert_friend_like"
on public.mood_reactions
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and actor_id <> target_user_id
  and reaction_type = 'like'
  and public.are_friends(auth.uid(), target_user_id)
  and exists (
    select 1
    from public.mood_entries me
    where me.id = mood_entry_id
      and me.user_id = target_user_id
  )
);

drop policy if exists "mood_reactions_delete_own" on public.mood_reactions;
create policy "mood_reactions_delete_own"
on public.mood_reactions
for delete
to authenticated
using (actor_id = auth.uid());
