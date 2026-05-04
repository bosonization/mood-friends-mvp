# Age comment fix

This patch updates outdated copy such as:

- `20歳未満の場合はカフェ表示になります`
- `カフェ表示になります`

into copy consistent with the current behavior:

- `20歳未満の場合は「飲み」は選べません`
- `「飲み」は選べません`

## Run

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\fix-age-comment.ps1
npm run typecheck
npm run build
npm run dev
```

## Supabase

No SQL required.
