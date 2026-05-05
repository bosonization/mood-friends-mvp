# NoriDrop Level + Spotlight Patch

## What changed

- Added Lv1-Lv5 growth system.
- Lv1-Lv3 limit selectable moods.
- Lv4 unlocks all 8 moods including お酒 and ウキウキ.
- Lv5 unlocks Spotlight.
- Lv5 condition: 3 accepted friends + at least 1 registered user via your invite code.
- Level never goes down. `profiles.max_level` stores the highest achieved level.
- Spotlight can be used once per day, lasts 30 minutes, and highlights your bubble in friends' Mood Orbit.

## Required Supabase SQL

Run this before testing the app:

```txt
supabase/update-20260504-level-spotlight.sql
```

## Notes

- No app-internal chat, DM, or notification is added.
- Spotlight only changes how your bubble appears in friends' Orbit.
- Referral recording uses a security definer RPC so the app does not expose all profiles publicly.
