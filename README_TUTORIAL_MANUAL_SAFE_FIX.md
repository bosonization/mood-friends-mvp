# Tutorial manual safe fix

This patch fixes the issue where `chu01` covers the `/home` screen.

## What changed

- `NoriTutorial` no longer auto-opens on `/home`.
- The tutorial image is never rendered unless the user taps `? 使い方`.
- The modal is contained, centered, and closed by default.
- `forceOpen` is kept only for compatibility but intentionally ignored.

## Files

- `src/components/NoriTutorial.tsx`
- `scripts/check-tutorial-danger.ps1`

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```

If the home screen still shows `chu01`, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-tutorial-danger.ps1
```

Then remove any direct `chu01`/`backgroundImage` usage from `home/page.tsx`, `globals.css`, `AppShell`, or `layout`.
