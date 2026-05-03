# Hydration mismatch fix

This patch fixes the React hydration mismatch in `ShareInviteButton`.

Cause:
- Server render used `/invite/{code}`.
- Client render immediately used `http://localhost:3000/invite/{code}`.
- React detected different `href` attributes.

Fix:
- Initial render uses the same relative URL on server/client.
- After hydration, `useEffect` upgrades it to the absolute URL.

No SQL is required.
