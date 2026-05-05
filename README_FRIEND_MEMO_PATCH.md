# Friend private memo patch

## Changes

- Adds private friend memos.
- Memo can be edited on the Friends page.
- Memo is visible only to the owner.
- Memo is shown as supporting context when selecting a friend on the Home page / Mood Orbit.
- No chat, reply, DM, ID exchange, or public profile field is added.

## Required SQL

Run this in Supabase SQL Editor:

```txt
supabase/update-20260509-friend-memos.sql
```

## Files

- `supabase/update-20260509-friend-memos.sql`
- `src/app/friends/actions.ts`
- `src/app/friends/page.tsx`
- `src/app/home/page.tsx`
- `src/components/FriendsMoodDisplay.tsx`
- `src/lib/types.ts`

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
