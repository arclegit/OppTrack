# Ingestion

Added in v1.1.0. A minimal collector pipeline that pulls raw postings from external sources into a staging table. Plain HTTP + parsing — no AI, and no automatic promotion into the curated `opportunities` table.

## How it works

```
npm run ingest
    │
    ▼
runIngestion.js
    ├── collectors/remotive.js    → https://remotive.com/api/remote-jobs
    └── collectors/arbeitnow.js   → https://www.arbeitnow.com/api/job-board-api
                │  each collector returns normalized postings
                ▼
        staging.js → stagePosting()
                │
                ▼
     staged_opportunities (PostgreSQL)
```

- Both sources are free public APIs that need no API key.
- Each collector maps the source's JSON into a common shape: `source`, `externalId`, `title`, `organization`, `location`, `url`, `description`, `deadline`, plus the untouched `raw` payload.
- `staged_opportunities` is created automatically on first run (`CREATE TABLE IF NOT EXISTS`).
- `(source, external_id)` is unique, so re-running ingestion skips postings already staged — the pipeline is idempotent.
- A failing collector logs an error and doesn't stop the others.

## Staging table

| Column | Type | Notes |
|---|---|---|
| id | integer (identity) | primary key |
| source | text | collector name, e.g. `remotive` |
| external_id | text | the source's own ID; unique with `source` |
| title | text | required |
| organization | text | company / provider |
| location | text | as reported by the source |
| url | text | link to the original posting |
| description | text | raw description (may contain HTML) |
| deadline | date | null when the source doesn't provide one |
| raw_payload | jsonb | the untouched source record |
| fetched_at | timestamptz | set at insert time |

## What ingestion deliberately does not do

- **No writes to `opportunities`.** Promotion from staging to the curated table is a separate, reviewable step — that's where deduplication against existing rows, category mapping, and verification status belong.
- **No AI / LLM calls.** Parsing is plain JSON field mapping.

## Running it

```bash
# uses the same DB_* environment variables as the API server
npm run ingest
```

(AI-assisted documentation)
