# Deployment

## Environments

| | Frontend | Backend | Database |
|---|---|---|---|
| Local | `http://localhost:5173` (Vite) | `http://localhost:5000` | Local PostgreSQL (pgAdmin 4) |
| Production | Netlify — `https://nimble-mermaid-650643.netlify.app` | Render — `https://opptrack-backend.onrender.com` | Neon PostgreSQL |

Production API base URL: `https://opptrack-backend.onrender.com/api`
Health check: `/api/health` · DB connectivity check: `/api/db-test`

## How the frontend finds the right API

`src/config/api.js`:

```js
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default API_URL;
```

- Locally, `.env` doesn't set `VITE_API_URL`, so it falls back to `http://localhost:5000/api`.
- In production, `.env.production` sets:
  ```
  VITE_API_URL=https://opptrack-backend.onrender.com/api
  ```
  and Vite bakes that value into the build at build time — Netlify serves a build that already points at Render.

The localhost fallback is intentional and should stay — it's what lets local development work with zero configuration.

## Deploying each piece

- **Neon (database)** — production PostgreSQL. Connection string is a server-only secret (used by Render), never sent to the frontend.
- **Render (backend)** — auto-deploys the Express app from GitHub on push to `main`. Environment variables (DB connection string, session secret, allowed CORS origin) are set in Render's dashboard, not committed to the repo.
- **Netlify (frontend)** — builds and deploys the React/Vite app from GitHub on push to `main`, using `.env.production` for the API URL.

## Cross-origin pieces that have to agree

Because the frontend (Netlify) and backend (Render) are on different domains, three things have to line up for session cookies to work at all:

1. **CORS** on the Express server must allow the exact Netlify origin (not `*`) and set `credentials: true`.
2. **Fetch calls** on the frontend must use `credentials: "include"` so the browser sends/accepts the cookie cross-origin.
3. **Cookie attributes** must permit cross-site use in production — typically `SameSite=None; Secure` when frontend and backend are on different domains (as opposed to `SameSite=Lax`, which is fine for same-site/local use).

Getting any one of these wrong is what causes "login works, but a refresh sends me back to the login page" — the classic symptom of a cookie that was set but isn't being sent back.

## Keeping local development working

Local dev deliberately mirrors production's shape but with different values, so a production fix doesn't require also breaking `localhost:5173` → `localhost:5000`. When changing CORS/cookie config, both origins should be checked afterward.

(AI-assisted documentation)