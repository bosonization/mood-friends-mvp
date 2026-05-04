# Age wording v2

This patch fixes old age-category wording that no longer matches the current behavior.

## Correct wording

Under 20:

```txt
20歳未満の場合、「飲み」は選べません
```

20 or older:

```txt
20歳以上の場合は「飲み」が選べます
```

## Run

```powershell
node .\scripts\fix-age-wording.mjs
npm run typecheck
npm run build
npm run dev
```

## Notes

- No Supabase SQL required.
- The script also removes obsolete temporary PowerShell scripts if they still exist:
  - `scripts/fix-age-comment.ps1`
  - `scripts/fix-age-comment-safe.ps1`
