# NoriDrop rebrand patch

## Changes

- App name changes from `NoriDrop` to `NoriDrop`.
- Adds new assets:
  - `public/noridrop-logo.png`
  - `public/noridrop-icon.png`
  - `public/nori-characters.png`
  - `public/app-icon.png`
  - `src/app/icon.png`
  - `src/app/apple-icon.png`
- Header logo is replaced with the NoriDrop logo.
- Landing page is updated to NoriDrop branding.
- App metadata and footer are updated.
- Terms / Privacy / Disclosure text is updated by script.
- Share / invite text is updated to NoriDrop.
- Nori Card sharing now explicitly creates and shares the same `/invite/[token]` invite link as the Friends invite flow.
- Nori Card QR uses the invite link.
- Nori character growth UI uses the provided `Noriキャラ.png` image.
- Main color direction shifts to dark green + coral.

## Apply

After unzipping over the project, run:

```powershell
node .\scripts\apply-noridrop-brand.mjs
npm run typecheck
npm run build
npm run dev
```

Then commit:

```powershell
git add .
git commit -m "Rebrand to NoriDrop"
git push
```

## Supabase

No SQL required.
