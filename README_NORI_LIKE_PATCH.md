# Nori Like patch

## Added

- 「カフェ」 label changed to 「チル」 while keeping the DB key `cafe` for compatibility.
- `mood_entries` table for per-nori history.
- `mood_reactions` table for one-way `like` reactions.
- `mood_statuses.current_entry_id` to point to the current nori entry.
- Friends can like a friend's latest nori.
- The receiver can see like counts/names for current nori and one previous nori.

## Required Supabase SQL

Run this once in Supabase SQL Editor:

```txt
supabase/update-20260506-nori-likes.sql
```

## Important behavior

- Like is not chat.
- No comments.
- No reply.
- No push notification.
- One friend can like the same nori entry only once.
- The sender can only like accepted friends.
- The receiver can see likes on the current nori and one previous nori.

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
