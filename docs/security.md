# Security

What's actually in place today, and what a next iteration should add. Being upfront about the second list is itself good practice for a portfolio project — it shows the difference between "working" and "production-hardened" is understood, not missed.

## In place today

- **Session tokens are random and SHA-256 hashed before storage** — the `sessions.token_hash` column holds only the hash; the raw token exists only in the browser's HTTP-only cookie.
- **Passwords are hashed before storage** in `users.password_hash`, via Node's built-in `crypto` module (no bcrypt/argon2 dependency is present in `package.json`).
- **The password-hashing function is verified (v1.1.0).** `server/auth.js` uses `crypto.scrypt` — a memory-hard KDF — with a 16-byte random salt per password and a 64-byte derived key, and compares keys with `crypto.timingSafeEqual`. This is a sound alternative to bcrypt, and switching to bcrypt would invalidate every existing password hash in the production database. The behavior is covered by `server/tests/auth.test.js` (format, salting, correct/wrong password, malformed hash).
- **Session expiration is enforced** — `requireAuth` checks `sessions.expires_at > CURRENT_TIMESTAMP` on every authenticated request, not just at login.
- **Input validation** — registration validates name/email/password shape and length; application and saved-opportunity routes validate IDs and restrict `status` to a fixed allow-list before any query runs.
- **Cookies are HTTP-only** — client-side JavaScript can't read the session cookie, blocking the most common way of stealing it (XSS).
- **User isolation** — every query against `sessions`, `saved_opportunities`, and `applications` is scoped to `req.user.id`; one user's data isn't reachable by another user regardless of the ID in the request.
- **Secrets stay server-side** — `.env`, the database connection string, and any session secret are never committed to Git and never placed in `VITE_*` variables (anything in a `VITE_*` variable ships inside the public frontend bundle).
- **CORS is origin-locked** — the API allows the specific Netlify origin rather than a wildcard `*`, which is required anyway once `credentials: true` is set.

## Worth hardening next

- **Rate limiting** on login/registration, to slow down brute-force or credential-stuffing attempts.
- **Schema-level validation library** (e.g. `zod`) to replace the hand-written checks as the API surface grows.
- **HTTPS enforcement** — Render and Netlify serve HTTPS by default; confirm the API doesn't also silently accept plain HTTP.
- **CSRF consideration** — cookie-based auth is more CSRF-exposed than header-based auth. `SameSite` cookies plus checking the `Origin` header on state-changing routes is the usual mitigation.
- **Dependency updates** — periodically run `npm audit`.

(AI-assisted documentation)