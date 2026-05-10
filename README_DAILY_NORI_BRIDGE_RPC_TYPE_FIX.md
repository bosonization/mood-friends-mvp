# Daily Nori + Nori Bridge RPC type fix

## Fixes

Vercel/TypeScript build failed because Supabase RPC return types were inferred as a union that can include a generated type-mismatch object, so `.map()` was not allowed on `bridgeCandidates`.

This patch normalizes RPC results before use:

- `get_nori_bridge_candidates` is converted to an array only when `Array.isArray(data)` is true.
- `get_daily_nori_status` is normalized from the first row of the returned table.

## Files

- `src/app/friends/page.tsx`
- `src/app/home/page.tsx`

## Supabase

No SQL required.

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```
