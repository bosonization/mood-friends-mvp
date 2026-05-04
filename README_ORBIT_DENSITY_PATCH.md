# Mood Orbit density / collision patch

## Changes

- Adds deterministic ring layout + collision relaxation to reduce fully-overlapped bubbles.
- Scales bubble size down as friend count increases.
- Uses compact time labels when density is high.
- Caps Orbit rendering at 24 visible bubbles and shows `+n人` for overflow.
- Keeps Spotlight and HOT users more prominent while preventing total occlusion.
- Also updates `ShareInviteButton` to avoid hydration mismatches from LINE/SMS href differences.

## Supabase

No SQL required.
