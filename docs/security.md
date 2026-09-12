# Security

What's actually in place today, and what a next iteration should add. Being upfront about the second list is itself good practice for a portfolio project — it shows the difference between "working" and "production-hardened" is understood, not missed.

## In place today

- **Session tokens are random and SHA-256 hashed before storage** — the `sessions.token_hash` column holds only the hash; the raw token exists only in the browser's HTTP-only cookie.
- **Passwords are hashed before storage** in `users.password_hash`, via Node's built-in `crypto` module (no bcrypt/argon2 dependency is present in `package.json`).
- **Cookies are HTTP-only** — client-side JavaScript can't read the session cookie, blocking the most common way of stealing it (XSS).
- **User isolation** — every query against `sessions`, `saved_opportunities`, and `applications` is scoped to `req.user.id`; one user's data isn't reachable by another user regardless of the ID in the request.
- **Secrets stay server-side** — `.env`, the database connection string, and any session secret are never committed to Git and never placed in `VITE_*` variables (anything in a `VITE_*` variable ships inside the public frontend bundle).
- **CORS is origin-locked** — the API allows the specific Netlify origin rather than a wildcard `*`, which is required anyway once `credentials: true` is set.

## Worth hardening next

- **Confirm the password-hashing function.** Password hashes need to be slow and salted — `scrypt` or `pbkdf2` from Node's `crypto` module are appropriate, as is a dedicated library like bcrypt/argon2. A bare, unsalted SHA-256 hash — fine for session tokens, which are already random and unguessable — is not appropriate for passwords, since real passwords are guessable and SHA-256 is fast enough to brute-force at scale. This is the single highest-value thing to verify in `authRoutes.js`.
- **Rate limiting** on login/registration, to slow down brute-force or credential-stuffing attempts.
- **Session expiration enforcement** — confirm `sessions.expires_at` is actually checked on every request, not just set at login.
- **Input validation** on all POST/PATCH bodies (e.g. with `zod` or `express-validator`), so malformed payloads are rejected before touching the database.
- **HTTPS enforcement** — Render and Netlify serve HTTPS by default; confirm the API doesn't also silently accept plain HTTP.
- **CSRF consideration** — cookie-based auth is more CSRF-exposed than header-based auth. `SameSite` cookies plus checking the `Origin` header on state-changing routes is the usual mitigation.
- **Dependency updates** — periodically run `npm audit`.

(AI-assisted documentation)