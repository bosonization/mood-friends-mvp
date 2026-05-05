# NoriDrop full-bleed icon patch

## Changes

- Rebuilds the app icon so the artwork fills the square canvas.
- Removes the inner rounded-card look from the icon artwork.
- Replaces:
  - `public/noridrop-icon.png`
  - `public/app-icon.png`
  - `src/app/icon.png`
  - `src/app/apple-icon.png`
- Removes the extra ring/shadow/background wrapper around the small top header icon.

## Notes

Installed smartphone home-screen icons may be cached by the OS. After deploying, remove the old home-screen shortcut and add it again if the icon does not change immediately.

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
