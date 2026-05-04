# First Link / Nori Card / QR Invite Patch

## Added

- Nori card sharing component
- QR invite component inside the nori card
- First Link celebration modal
- First Link challenge card for users with 0 friends

## Integration

This patch includes reusable components. The supplied `home/page.tsx` replacement wires them into the top page.

## Requires

The previous 24h invite auto-friend patch should already be applied because `NoriCardShare` uses:

- `POST /api/invites/create`
- `/invite/{token}`

No new Supabase SQL is required for this patch.
