# Pre-beta auth and invite fix

## Changes

- Hardens `src/proxy.ts` against stale Supabase refresh-token cookies.
- If `Invalid Refresh Token: Refresh Token Not Found` occurs, Supabase auth cookies are cleared.
- Protected pages redirect to `/login` instead of repeatedly logging the invalid refresh token error.
- Includes the current hydration-safe `ShareInviteButton.tsx` implementation, where LINE/SMS links are generated only after button click.

## Files

- `src/proxy.ts`
- `src/components/ShareInviteButton.tsx`

## Supabase

No SQL required.

## Test

```powershell
npm run typecheck
npm run build
npm run dev
```

If the browser still has stale auth cookies, clear site data once or log out/login again.
