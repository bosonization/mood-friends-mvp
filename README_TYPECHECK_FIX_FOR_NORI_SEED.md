# Typecheck fix for Nori Seed + Nori Likes

This patch fixes the TypeScript errors after applying Nori Likes / Nori Seed patches.

## Fixes

- Adds missing `MoodEntry` type.
- Adds missing `MoodReaction` type.
- Adds `MoodStatus.current_entry_id`.
- Keeps `Profile.nori_update_count`.
- Fixes `src/lib/level.ts` generic call on an untyped Supabase-like object.

## Run

```powershell
npm run typecheck
npm run build
npm run dev
```

No Supabase SQL required for this patch itself.
