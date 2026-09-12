# Architecture

## Overview

OppTrack is a three-tier application: a React frontend, an Express API, and a PostgreSQL database. Each tier only talks to the one directly below it — the frontend never queries the database directly, and the database is never reachable from the browser.

```
Browser (React + Vite)
      │  HTTPS
      ▼
Express API (Node.js)
      │  SQL
      ▼
PostgreSQL (Neon in production)
```

In production this maps to real hosting:

```
User → Netlify (frontend) → HTTPS → Render (backend) → Neon (database)
```

## Why this separation

- **Security** — database credentials and session secrets live only on the server. Nothing that ships to the browser (the Vite build) ever contains them.
- **A single source of truth for rules** — the API is the only place that decides what's valid (who owns what, what a saved opportunity looks like, etc.), so the frontend can't be tricked into bypassing those rules.
- **Independent deployment** — the frontend (Netlify) and backend (Render) are deployed separately and can be redeployed or scaled without touching each other.

## Core workflow OppTrack models

```
Discover → Search/Filter → Review → Save → Decide → Apply → Track → Follow up → Complete/Rejected
```

Opportunity types: Internship, Scholarship, Hackathon, Competition, Job, Workshop, Event.

## Request lifecycle — example: loading "Saved Opportunities"

1. User opens the Saved page in the React app.
2. The frontend calls the API through `src/config/api.js`'s `API_URL`, e.g. `fetch(`${API_URL}/saved`, { credentials: "include" })`. `credentials: "include"` is what makes the browser attach the session cookie.
3. Express authentication middleware reads the cookie, hashes the token, looks up the session in PostgreSQL, and attaches the matching user to `req.user`.
4. The route handler queries PostgreSQL for **that user's** saved opportunities only.
5. The API returns JSON; React renders it.

## Scope

OppTrack is an opportunity **organization and tracking** tool — not an application portal, a recruiter, an AI matching engine, or a scraper. It doesn't submit applications or source opportunities automatically; it helps a student keep track of ones they've already found.
(AI-assisted documentation) 