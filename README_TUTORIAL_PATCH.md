# NoriDrop tutorial onboarding patch

## What this adds

- Adds 4 tutorial images under `public/tutorial/`.
- Shows the tutorial automatically the first time a user reaches `/home`.
- Saves completion to `profiles.tutorial_version` and `profiles.tutorial_seen_at`.
- Shows a small `? 使い方` button on the home page for Lv3+ users.
- The tutorial uses images in this order:
  - `chu01.png`
  - `chu02.png`
  - `chu03.png`
  - `chu04.png`

## Required Supabase SQL

Run this file in Supabase SQL Editor before deploying or before opening `/home` after applying the code:

```txt
supabase/update-20260511-tutorial.sql
```

## Files included

```txt
public/tutorial/chu01.png
public/tutorial/chu02.png
public/tutorial/chu03.png
public/tutorial/chu04.png
src/components/NoriTutorial.tsx
src/app/home/tutorial-actions.ts
src/app/home/page.tsx
src/lib/tutorial.ts
src/lib/types.ts
supabase/update-20260511-tutorial.sql
README_TUTORIAL_PATCH.md
```

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```

`npm run typecheck` was checked successfully when this patch was created. Build compiled successfully locally, but the container build process timed out while collecting page data, so please verify the full `npm run build` in your local/Vercel environment.
