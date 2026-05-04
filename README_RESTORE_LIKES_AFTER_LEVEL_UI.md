# Restore Nori Likes after level UI patch

## Why

The Nori Life / level redesign patch overwrote `FriendsMoodDisplay.tsx` and `mood/actions.ts` from before the like feature. As a result, the like button could disappear and new mood updates might stop creating `mood_entries.current_entry_id`.

## Fix

- Restore the polished Nori Like UI in `FriendsMoodDisplay.tsx`.
- Merge mood update logic so it does both:
  - create `mood_entries` / update `mood_statuses.current_entry_id` for likes
  - increment `profiles.nori_update_count` for the new Nori Life level system
- Keep Quiet pass behavior.

## Note

Nori Like is not level-gated. It is available from Lv1 as long as the users are accepted friends.

No Supabase SQL is required if the earlier Nori Like and Quiet pass SQL files were already run.
