# Tutorial background emergency fix

## What this fixes

The tutorial image must never be used as the `/home` page background. It should only be displayed inside the tutorial modal.

This patch replaces `src/components/NoriTutorial.tsx` with a safer portal-based modal implementation that renders above the page with `z-[9999]`.

## Also check

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-tutorial-background.ps1
```

Expected references to `chu01`:

- `src/lib/tutorial.ts`
- `src/components/NoriTutorial.tsx`

Bad references:

- `src/app/globals.css`
- `src/components/AppShell.tsx`
- `src/app/home/page.tsx` as a background image

If you see `/tutorial/chu01.png` in those files as a background or full-screen image, remove it.

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
