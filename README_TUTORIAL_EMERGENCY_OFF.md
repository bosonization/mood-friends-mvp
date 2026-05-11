# Emergency disable tutorial overlay

This patch disables the tutorial component by making `NoriTutorial` render `null`.
It is intended to immediately restore the `/home` screen if tutorial images are covering the whole page.

## Files

- `src/components/NoriTutorial.tsx`
- `scripts/check-tutorial-refs.ps1`

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```

## Debug

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-tutorial-refs.ps1
```

Expected: tutorial image references should only be in tutorial-related files, not in `home/page.tsx`, `globals.css`, or layout/background components.
