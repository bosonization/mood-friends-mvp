-- DB-only migration. Use if Storage policy SQL returns ERROR 42501.

alter table public.mood_statuses
  add column if not exists session_started_at timestamptz,
  add column if not exists session_expires_at timestamptz;

update public.mood_statuses
set
  session_started_at = coalesce(session_started_at, last_login_at, now()),
  session_expires_at = coalesce(session_expires_at, coalesce(last_login_at, now()) + interval '10 minutes')
where session_started_at is null
   or session_expires_at is null;

alter table public.mood_statuses
  alter column session_started_at set default now(),
  alter column session_started_at set not null,
  alter column session_expires_at set default (now() + interval '10 minutes'),
  alter column session_expires_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mood_statuses_session_check'
  ) then
    alter table public.mood_statuses
      add constraint mood_statuses_session_check check (session_expires_at > session_started_at);
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
