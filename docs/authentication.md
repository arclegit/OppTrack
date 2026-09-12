# Authentication

OppTrack uses **session-based authentication**, not JWT. The session token itself never leaves the server in a form JavaScript can read — it lives in an HTTP-only cookie, and only its hash is stored in PostgreSQL.

## Why sessions instead of JWT

JWTs are self-contained and stateless, which is convenient, but that also means they can't be revoked before they expire without extra machinery (blocklists, short-lived tokens + refresh tokens). A server-side session can be deleted instantly — on logout, or if access needs to be revoked — and the client only ever holds an opaque token, never the user's data. For a single-backend app like OppTrack, that simplicity was worth more than JWT's statelessness.

## Registration

1. User submits name, email, and password.
2. The password is hashed before it touches the database — OppTrack never stores plaintext passwords. No bcrypt/argon2 dependency exists in `package.json`, so this runs through Node's built-in `crypto` module directly.
3. The new row goes into `users` (`id`, `name`, `email`, `password_hash`).

## Login

1. User submits credentials.
2. The server looks up the user by email and compares the submitted password against `password_hash`.
3. On success, the server generates a **random session token**.
4. The token is **SHA-256 hashed**, and that hash is what's stored — in `sessions.token_hash`, alongside `user_id`, `created_at`, and `expires_at`. The raw token never touches the database.
5. The raw token is sent to the browser as an HTTP-only cookie (`opptrack_session`).

```
login request
   → verify password against users.password_hash
   → generate random session token
   → INSERT sessions (token_hash = SHA-256(token), user_id, expires_at, created_at)
   → Set-Cookie: opptrack_session=<raw token>; HttpOnly; ...
```

## Authenticated requests

1. The browser automatically attaches the `opptrack_session` cookie (the frontend calls the API with `credentials: "include"`).
2. Authentication middleware reads the cookie, hashes it, and looks up that hash in `sessions.token_hash`.
3. If found and `expires_at` hasn't passed, the matching user (via `sessions.user_id`) is attached to `req.user` for the rest of the request.
4. If missing/invalid/expired, the middleware responds `401 { "error": "Authentication required" }` — this is what you see hitting `/api/auth/me` directly with no active session.

## Logout

The server clears the cookie by re-sending it with an immediate expiry:

```
Set-Cookie: opptrack_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0
```

The corresponding row in `sessions` is also deleted server-side, so the old token can't be reused even if a copy of the cookie leaked.

## Cookie attributes

| Attribute | Purpose |
|---|---|
| `HttpOnly` | JavaScript in the browser can't read the cookie — blocks token theft via XSS |
| `SameSite` | Controls whether the cookie is sent on cross-site requests — `Lax` works same-site; cross-site (Netlify → Render) needs `None` |
| `Secure` | Cookie only sent over HTTPS — required in production, and required if `SameSite=None` |
| `Path=/` | Cookie applies to the whole API, not one route |

(AI-assisted documentation)