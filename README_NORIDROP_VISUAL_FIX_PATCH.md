# NoriDrop visual fix patch

## Changes

- Restores the original landing hero image (`nori-hero.png`).
- Updates the `はじめる` button gradient to a more readable green gradient.
- Adds Lv1-Lv5 separate Nori character images:
  - `public/nori-level-01.png`
  - `public/nori-level-02.png`
  - `public/nori-level-03.png`
  - `public/nori-level-04.png`
  - `public/nori-level-05.png`
- Updates `LevelCard.tsx` to use the new separate level images instead of the old sprite/crop.
- Adds a visual tune script to replace harsh green-to-coral gradients with a clearer NoriDrop green gradient.

## Apply

```powershell
node .\scripts\apply-noridrop-visual-tune.mjs
npm run typecheck
npm run build
npm run dev
```

No Supabase SQL required.
