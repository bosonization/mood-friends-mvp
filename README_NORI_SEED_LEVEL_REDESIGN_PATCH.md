# Nori Seed level redesign patch

## Changes

- Level rules are redesigned around self-progress, not friend count.
- Lv1 starts with 4 nori options: ごはん / 話す / チル / 飲み.
- `cafe` key remains in DB for compatibility, but display changes to 🫧 チル.
- Lv2 unlocks ゲーム by registering a profile image.
- Lv3 unlocks 外出 after 1 nori update.
- Lv4 unlocks もくもく after 2 nori updates.
- Lv5 unlocks 何かしたい after 3 nori updates.
- 20歳未満 still cannot select 飲み even though it is a Lv1 nori.
- Spotlight is now separate: Lv5 + one successful invite/referral.
- Growth UI is redesigned as 「ノリのたね」 with Lv1-Lv5 growth stages.

## Required SQL

Run this in Supabase SQL Editor:

```txt
supabase/update-20260508-nori-seed-levels.sql
```

## Verify

```powershell
npm run typecheck
npm run build
npm run dev
```
