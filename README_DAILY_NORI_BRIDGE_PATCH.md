# Daily Nori + Nori Bridge patch

## Changes

### Daily Nori

- Adds daily drop logging through `daily_nori_logs`.
- When a user drops a normal Nori, today's Daily Nori is completed.
- Quiet pass does not count as Daily Nori.
- Home page shows a compact Daily Nori card with current streak.

### Nori Bridge

- Adds friend-of-friend discovery on the Friends page.
- Only candidates with at least one mutual accepted friend are shown.
- Candidates are shown only if they allow bridge visibility.
- Friend request still requires normal approval.
- Friends' Nori/mood is not shown before approval.

### Settings

- Adds `友達の友達に表示する` toggle.
- Default is ON through the database default.

## Required Supabase SQL

Run this in Supabase SQL Editor before using the app after applying the code:

```txt
supabase/update-20260510-daily-nori-bridge.sql
```

## Files

- `supabase/update-20260510-daily-nori-bridge.sql`
- `src/components/DailyNoriCard.tsx`
- `src/app/home/page.tsx`
- `src/app/mood/actions.ts`
- `src/app/friends/page.tsx`
- `src/app/friends/actions.ts`
- `src/app/settings/page.tsx`
- `src/app/settings/actions.ts`
- `src/lib/types.ts`

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
