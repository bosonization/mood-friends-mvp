# Like polish + Quiet pass patch

## Changes

### 1. Stylish Nori Like UI

- Friend detail like button is redesigned as a larger modern gradient/action button.
- Friend orbit like badge uses a gradient heart badge.
- Nori Card like summary is redesigned as a compact modern chip.
- Like details use card-style friend-name pills.

### 2. Hidden Quiet pass

Hidden behavior:

1. On the nori selection screen, tap `🫧 チル` 5 times.
2. Press the update button.
3. If not already used today, the user enters `/home` without updating latest login time or nori.
4. The feature is limited to once per day per user.

This requires `nori_stealth_uses` table.

## Required SQL

Run in Supabase SQL Editor:

```txt
supabase/update-20260507-like-polish-stealth.sql
```

This patch assumes the Nori Like patch has already been applied.

## Changed files

- `supabase/update-20260507-like-polish-stealth.sql`
- `src/components/FriendsMoodDisplay.tsx`
- `src/components/NoriCardShare.tsx`
- `src/components/MoodSelectionForm.tsx`
- `src/app/mood/actions.ts`
- `src/app/home/page.tsx`
