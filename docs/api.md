# API Reference

Base URL:

- Local: `http://localhost:5000/api`
- Production: `https://opptrack-backend.onrender.com/api`

All authenticated routes expect the `opptrack_session` cookie. The authentication middleware validates the session and populates `req.user`.

## System

| Method | Route | Purpose | Auth required |
|---|---|---|---|
| GET | `/api/health` | Confirms the API process is up | No |
| GET | `/api/db-test` | Confirms the API can reach PostgreSQL | No |

## Auth (`server/routes/authRoutes.js`)

| Method | Route | Purpose | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new user | No |
| POST | `/api/auth/login` | Verify credentials and create a session | No |
| POST | `/api/auth/logout` | End the current session | Yes |
| GET | `/api/auth/me` | Return the current authenticated user | Yes |

## Opportunities

| Method | Route | Purpose | Auth required |
|---|---|---|---|
| GET | `/api/opportunities` | List all opportunities | No |

Search and filtering are handled on the frontend after the opportunity data is loaded.

## Saved opportunities

| Method | Route | Purpose | Auth required |
|---|---|---|---|
| GET | `/api/saved-opportunities` | List the current user's saved opportunities | Yes |
| POST | `/api/saved-opportunities` | Save an opportunity | Yes |
| DELETE | `/api/saved-opportunities/:opportunityId` | Unsave an opportunity | Yes |

## Applications / tracking

| Method | Route | Purpose | Auth required |
|---|---|---|---|
| GET | `/api/applications` | List the current user's tracked applications | Yes |
| POST | `/api/applications` | Start tracking an opportunity | Yes |
| PATCH | `/api/applications/:id` | Update status, notes, or dates | Yes |
| DELETE | `/api/applications/:id` | Stop tracking an application | Yes |

## Error format

Errors are returned as JSON, for example:

```json
{ "error": "Authentication required" }

(AI-assisted documentation)