# Database

OppTrack uses PostgreSQL — a local instance (managed via pgAdmin 4) in development, Neon in production. The schema below is taken directly from `\dt` and pgAdmin's Object Explorer.

## Tables

### `users`

| Column | Type |
|---|---|
| id | integer (PK) |
| name | character varying(100) |
| email | character varying(255) |
| password_hash | character varying(255) |

### `sessions`

| Column | Type |
|---|---|
| token_hash | character varying(255) |
| user_id | integer → `users.id` |
| expires_at | timestamp with time zone |
| created_at | timestamp with time zone |

Stores only the **hash** of each session token — never the raw token the browser holds in its cookie. See `authentication.md`.

### `opportunities`

| Column | Type |
|---|---|
| id | character varying(50) (PK) |
| title | character varying(255) |
| organization | character varying(255) |
| category | character varying(50) |
| description | text |
| eligibility | text |
| location | character varying(255) |
| deadline | date |
| skills | text[] |
| source | character varying(255) |
| url | text |
| verification_status | character varying(50) |
| scope | character varying(50) |
| date_added | date |
| last_verified | date |

`id` is a string rather than an auto-incrementing integer — opportunities are loaded through `server/seed.js` (`npm run seed`) rather than created via the API. `source`/`url` record where an opportunity came from; `verification_status`/`last_verified` support marking one as checked or stale over time.

### `saved_opportunities`

| Column | Type |
|---|---|
| user_id | integer → `users.id` |
| opportunity_id | character varying(50) → `opportunities.id` |
| saved_at | timestamp without time zone |

A join table linking a user to an opportunity they've saved. Primary key is the `(user_id, opportunity_id)` pair.

### `applications`

| Column | Type |
|---|---|
| id | integer (PK) |
| user_id | integer → `users.id` |
| opportunity_id | character varying(50) → `opportunities.id` |
| status | character varying(50) |
| applied_date | date |
| notes | text |
| follow_up_date | date |

Tracks a user's progress on one opportunity they've decided to apply to — `status` (e.g. applied / interviewing / rejected / accepted), plus `notes` and `follow_up_date` for the Notes/Dates/Follow-up features.

## Relationships

```
users (1) ──< sessions
users (1) ──< saved_opportunities >── (1) opportunities
users (1) ──< applications        >── (1) opportunities
```

One user can have many sessions, saved opportunities, and applications. One opportunity can be saved or applied to by many users — `saved_opportunities` and `applications` are the join tables that make that many-to-many relationship possible.

## User isolation

Every read/write on `sessions`, `saved_opportunities`, and `applications` is filtered by `user_id = req.user.id` in the route handlers, so a user can never read or modify another user's rows by changing an ID in the request.
(AI-assisted documentation)