# Age comment fix safe

The previous PowerShell script could be garbled on Windows PowerShell because of Japanese text encoding.

Run this ASCII-only safe script instead:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\fix-age-comment-safe.ps1
npm run typecheck
npm run build
npm run dev
```

No SQL required.
