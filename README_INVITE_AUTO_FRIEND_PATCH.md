# Invite auto-friend patch

## Changes

- New invites are 24-hour links backed by Supabase.
- Shared invite URLs use `/invite/{32-char-token}` instead of permanent member-code URLs.
- If a new user registers through a valid invite link, the inviter and invited user become friends automatically.
- The referral is also recorded for the Lv5 requirement.
- If the invite link is expired, registration continues normally and no auto-friend/referral is recorded.

## Required SQL

Run this in Supabase SQL Editor:

```txt
supabase/update-20260505-invite-link-auto-friend.sql
```

This patch expects the Level + Spotlight migration to already exist because it writes to `referrals`.

## Changed files

- `supabase/update-20260505-invite-link-auto-friend.sql`
- `src/app/api/invites/create/route.ts`
- `src/components/ShareInviteButton.tsx`
- `src/app/invite/[code]/page.tsx`
- `src/app/login/actions.ts`
- `src/app/login/page.tsx`
- `src/app/onboarding/actions.ts`
- `src/app/onboarding/page.tsx`
