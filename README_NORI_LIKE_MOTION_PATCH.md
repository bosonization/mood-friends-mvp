# Nori Like motion patch

## Changes

- Makes the Nori Like button optimistic: it visually updates immediately.
- Shows a floating toast: `Nori Likeしました` / `Nori Likeを取り消しました`.
- Refreshes the home screen after the server action succeeds.
- Adds a heart-pop micro interaction and small heart particles.

## Apply

After unzipping over the project, run:

```powershell
node .\scripts\add-nori-like-motion-css.mjs
npm run typecheck
npm run build
npm run dev
```

Then commit:

```powershell
git add .
git commit -m "Add Nori Like motion feedback"
git push
```

No Supabase SQL required.
