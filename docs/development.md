# Development

## Prerequisites

- Node.js
- Local PostgreSQL (managed via pgAdmin 4)

## Project layout

```
OppTrack/
├── src/                          # React + Vite frontend
│   └── config/
│       └── api.js                # resolves API_URL for local vs. production
├── server/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── savedOpportunityRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js     # session cookie → req.user
│   ├── ingestion/
│   │   ├── collectors/           # one file per external source
│   │   ├── staging.js            # staged_opportunities table
│   │   └── runIngestion.js       # npm run ingest
│   ├── tests/                    # node:test suite (npm test)
│   ├── app.js                    # Express app (no listener, for tests)
│   ├── seed.js                   # populates the opportunities table
│   └── server.js                 # entry point, starts the listener
├── public/
├── .env                          # local environment variables (not committed; .env* is git-ignored)
└── package.json
```

## Dependencies

| Package | Role |
|---|---|
| express | HTTP server / routing |
| pg | PostgreSQL client |
| cors | Allows the Netlify frontend to call the Render API cross-origin |
| dotenv | Loads `.env` locally |
| react / react-dom | Frontend |

No password-hashing library (bcrypt/argon2) is listed as a dependency — password hashing runs on Node's built-in `crypto` module. See `authentication.md` for which function it uses.

## Scripts (`package.json`)

| Command | Runs |
|---|---|
| `npm run dev` | Vite dev server — frontend at `http://localhost:5173` |
| `npm start` | `node server/server.js` — the Express backend, `http://localhost:5000` |
| `npm run seed` | `node server/seed.js` — populates the `opportunities` table |
| `npm test` | `node --test` — auth hashing + applications CRUD route tests |
| `npm run ingest` | `node server/ingestion/runIngestion.js` — fetch external postings into `staged_opportunities` |
| `npm run build` | Production frontend build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |

## Running locally

```
# Terminal 1 — backend
npm start

# Terminal 2 — frontend
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`
API: `http://localhost:5000/api`

## Database setup locally

1. Create a local PostgreSQL database named `opptrack` (matches the `\dt` output) via pgAdmin 4.
2. Run `npm run seed` to populate `opportunities`.
3. Point the backend's database connection variable at that local database.

## Git workflow

```
git status
git add <files>
git commit -m "<message>"
git push origin main
```
(AI-assisted documentation)