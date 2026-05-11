# Tutorial TypeScript fix

Fixes:

```txt
Property 'title' does not exist on type 'TutorialStep'.
```

The tutorial step type uses `alt`, not `title`.

Changed:

```tsx
alt={step.title}
```

to:

```tsx
alt={step.alt}
```

No SQL required.

Test:

```powershell
npm run typecheck
npm run build
npm run dev
```
