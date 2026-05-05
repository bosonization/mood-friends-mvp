-- NoriDrop friend private memos
-- Private notes that only the owner can see/edit.

create table if not exists public.friend_memos (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, friend_id),
  constraint friend_memos_not_self check (owner_id <> friend_id),
  constraint friend_memos_note_length check (char_length(note) <= 80)
);

create index if not exists friend_memos_owner_id_idx on public.friend_memos(owner_id);
create index if not exists friend_memos_friend_id_idx on public.friend_memos(friend_id);

alter table public.friend_memos enable row level security;

drop policy if exists "friend_memos_select_own" on public.friend_memos;
create policy "friend_memos_select_own"
on public.friend_memos
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "friend_memos_insert_own_friend" on public.friend_memos;
create policy "friend_memos_insert_own_friend"
on public.friend_memos
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = friend_id)
        or
        (f.addressee_id = auth.uid() and f.requester_id = friend_id)
      )
  )
);

drop policy if exists "friend_memos_update_own" on public.friend_memos;
create policy "friend_memos_update_own"
on public.friend_memos
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "friend_memos_delete_own" on public.friend_memos;
create policy "friend_memos_delete_own"
on public.friend_memos
for delete
to authenticated
using (owner_id = auth.uid());
