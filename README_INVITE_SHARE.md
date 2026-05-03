# Invite / Share update

## Changes

- Added `ShareInviteButton`.
- Added native Web Share support for LINE / Instagram / SMS / other installed apps.
- Added direct LINE share and SMS buttons.
- Added `/invite/[code]` invite landing page.
- Added friendless starter preview for users with zero friends.
- Added invite card to settings and compact share button near member code.

## Supabase

No SQL required.

## Notes

Instagram does not provide a reliable web URL that pre-fills DM/share text from a normal website. The implementation uses the native mobile share sheet where available, and copy fallback for Instagram.
