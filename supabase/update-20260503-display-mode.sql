-- eMoodition display mode setting.
-- Run once in Supabase SQL Editor before using the Settings display mode form.

alter table public.profiles
  add column if not exists display_mode text not null default 'orbit';

update public.profiles
set display_mode = 'orbit'
where display_mode is null
   or display_mode not in ('orbit', 'list');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_display_mode_check'
  ) then
    alter table public.profiles
      add constraint profiles_display_mode_check check (display_mode in ('orbit', 'list'));
  end if;
end $$;
