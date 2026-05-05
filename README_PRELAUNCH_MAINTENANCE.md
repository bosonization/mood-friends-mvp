# NoriDrop pre-launch maintenance

This patch adds:

- `.gitattributes` to reduce LF/CRLF warning noise on Windows.
- `scripts/prelaunch-maintenance.ps1` to migrate `src/middleware.ts` to `src/proxy.ts` for Next.js 16.
- A small cleanup for `tsconfig.tsbuildinfo`.

## How to apply

Unzip this patch into the project root.

Then run:

```powershell
cd C:\Users\maabo\Documents\mood-friends-mvp
powershell -ExecutionPolicy Bypass -File .\scripts\prelaunch-maintenance.ps1
npm run typecheck
npm run build
npm run dev
```

If the warning about middleware disappears, commit the changes:

```powershell
git status
git add .
git commit -m "Prelaunch maintenance"
git push
```

If `tsconfig.tsbuildinfo` was already tracked by Git, remove it from the index:

```powershell
git rm --cached tsconfig.tsbuildinfo
```

Then commit again.
