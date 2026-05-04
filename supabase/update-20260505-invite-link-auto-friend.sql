-- eMoodition 24h invite link + automatic friend registration
-- Run once in Supabase SQL Editor.
-- This keeps invite links valid for 24 hours and auto-accepts friendship when a new user registers through a valid invite link.

create table if not exists public.invite_links (
  token text primary key default replace(gen_random_uuid()::text, '-', ''),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  inviter_member_code text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint invite_links_token_check check (token ~ '^[0-9a-f]{32}$'),
  constraint invite_links_member_code_check check (inviter_member_code ~ '^[0-9]{10}$'),
  constraint invite_links_expiry_check check (expires_at > created_at)
);

create index if not exists invite_links_inviter_id_idx on public.invite_links(inviter_id);
create index if not exists invite_links_expires_at_idx on public.invite_links(expires_at);

alter table public.invite_links enable row level security;

drop policy if exists "invite_links_select_own" on public.invite_links;
create policy "invite_links_select_own"
on public.invite_links
for select
to authenticated
using (inviter_id = auth.uid());

-- Create a fresh invite link for the current user.
-- It returns a 32-char token. The app turns it into /invite/{token}.
create or replace function public.create_invite_link()
returns table(token text, expires_at timestamptz, inviter_member_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid;
  my_code text;
begin
  me := auth.uid();

  if me is null then
    return;
  end if;

  select p.member_code
  into my_code
  from public.profiles p
  where p.id = me
    and p.deleted_at is null;

  if my_code is null then
    return;
  end if;

  return query
  insert into public.invite_links (inviter_id, inviter_member_code, expires_at)
  values (me, my_code, now() + interval '24 hours')
  returning invite_links.token, invite_links.expires_at, invite_links.inviter_member_code;
end;
$$;

grant execute on function public.create_invite_link() to authenticated;

-- Public preview for invite page. Does not expose email or private data.
create or replace function public.get_invite_preview(invite_token text)
returns table(
  status text,
  inviter_handle_name text,
  inviter_member_code text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record record;
begin
  if invite_token !~ '^[0-9a-f]{32}$' then
    return query select 'invalid'::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  select il.*, p.handle_name
  into invite_record
  from public.invite_links il
  join public.profiles p on p.id = il.inviter_id
  where il.token = invite_token
    and p.deleted_at is null;

  if invite_record.token is null then
    return query select 'invalid'::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  if invite_record.expires_at <= now() then
    return query select 'expired'::text, invite_record.handle_name::text, invite_record.inviter_member_code::text, invite_record.expires_at;
    return;
  end if;

  return query select 'valid'::text, invite_record.handle_name::text, invite_record.inviter_member_code::text, invite_record.expires_at;
end;
$$;

grant execute on function public.get_invite_preview(text) to anon, authenticated;

-- Accept an invite after registration/onboarding.
-- If valid within 24h, it records referral and auto-accepts the friendship.
-- If expired/invalid, it does nothing and returns that status, so normal registration continues.
create or replace function public.accept_invite_link(invite_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  invited uuid;
  invite_record record;
  existing_friendship_id uuid;
begin
  invited := auth.uid();

  if invited is null then
    return 'not_authenticated';
  end if;

  if invite_token !~ '^[0-9a-f]{32}$' then
    return 'invalid';
  end if;

  select il.*
  into invite_record
  from public.invite_links il
  join public.profiles p on p.id = il.inviter_id
  where il.token = invite_token
    and p.deleted_at is null;

  if invite_record.token is null then
    return 'invalid';
  end if;

  if invite_record.expires_at <= now() then
    return 'expired';
  end if;

  if invite_record.inviter_id = invited then
    return 'self_invite';
  end if;

  -- Keep existing referral uniqueness. This table is created by the Level + Spotlight migration.
  insert into public.referrals (inviter_id, invited_user_id, invite_code)
  values (invite_record.inviter_id, invited, invite_record.inviter_member_code)
  on conflict (invited_user_id) do nothing;

  -- Auto-friend: if any relationship already exists, make it accepted.
  select f.id
  into existing_friendship_id
  from public.friendships f
  where (f.requester_id = invite_record.inviter_id and f.addressee_id = invited)
     or (f.requester_id = invited and f.addressee_id = invite_record.inviter_id)
  limit 1;

  if existing_friendship_id is not null then
    update public.friendships
    set status = 'accepted', updated_at = now()
    where id = existing_friendship_id;
  else
    insert into public.friendships (requester_id, addressee_id, status)
    values (invite_record.inviter_id, invited, 'accepted');
  end if;

  return 'accepted';
end;
$$;

grant execute on function public.accept_invite_link(text) to authenticated;
