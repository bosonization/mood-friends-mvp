# NoriDrop wordmark crop patch

## Changes

- Adds a cropped transparent wordmark asset: `public/noridrop-wordmark.png`.
- Adds `src/components/NoriDropWordmark.tsx`.
- Replaces header usage of `public/noridrop-logo.png` with the cropped wordmark component.
- Applies the same wordmark to both the logged-out landing header and logged-in app header.

## Supabase

No SQL required.

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
