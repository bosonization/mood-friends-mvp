# NoriDrop tutorial safe patch

This patch adds the 4-image tutorial again, but fixes the previous failure mode.

## Safety design

- Tutorial images are never used as a page background.
- When closed, the tutorial image DOM is not rendered.
- When opened, it is rendered only inside a fixed modal portal attached to `document.body`.
- The modal uses `z-[9999]` and a dark translucent backdrop.
- Initial forced tutorial has no close button; it ends only by pressing `はじめる` on the last page.
- Manual tutorial from `? 使い方` can be closed with `×`.

## Files

- `public/tutorial/chu01.png`
- `public/tutorial/chu02.png`
- `public/tutorial/chu03.png`
- `public/tutorial/chu04.png`
- `src/components/NoriTutorial.tsx`
- `src/app/home/tutorial-actions.ts`
- `src/app/home/page.tsx`
- `src/lib/tutorial.ts`
- `src/lib/types.ts`
- `supabase/update-20260511-tutorial.sql`
- `scripts/check-tutorial-refs.ps1`

## Supabase SQL

Run this first in Supabase SQL Editor:

```sql
alter table public.profiles
  add column if not exists tutorial_version integer not null default 0,
  add column if not exists tutorial_seen_at timestamptz;
```

Or run the SQL file:

```txt
supabase/update-20260511-tutorial.sql
```

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```

Then check:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-tutorial-refs.ps1
```

Expected references should be `src\lib\tutorial.ts` and `src\components\NoriTutorial.tsx`. If `/tutorial/chu01.png` appears in `globals.css`, `AppShell.tsx`, or as a background image in `home/page.tsx`, remove it.

## Behavior

- First `/home` visit after SQL: tutorial opens automatically if `profiles.tutorial_version < 1`.
- Images appear in this order: `chu01 -> chu02 -> chu03 -> chu04`.
- Pressing `はじめる` saves completion to Supabase.
- Level 3+ users see a small `? 使い方` button at the top of home.
