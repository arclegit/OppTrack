# OppTrack

**Current release: v1.1.0** — see the GitHub [Releases](../../releases) page for version history.

A full-stack Student Opportunity Tracker built to help students discover, save, and track internships, scholarships, hackathons, competitions, jobs, workshops, and other opportunities.

OppTrack was built as a practical portfolio project using React, Node.js, Express, and PostgreSQL.

## Features

- Browse and search opportunities
- Filter by category, scope, location, and deadline urgency
- View detailed opportunity information
- Save and unsave opportunities
- Track applications with different statuses
- Record applied dates, notes, and follow-up dates
- Dashboard for tracking application progress
- User registration and login
- Session-based authentication
- User-specific saved opportunities and applications
- Responsive interface for desktop and smaller screens

## Screenshots

### Discover

![Discover](docs/screenshots/Screenshot_discover.png)

### Opportunity Details

![Opportunity Details](docs/screenshots/Screenshot_opportunity-details.png)

### Saved Opportunities

![Saved Opportunities](docs/screenshots/Screenshot_saved.png)

### Dashboard

![Dashboard](docs/screenshots/Screenshot_dashboard.png)

### Login

![Login](docs/screenshots/Screenshot_login.png)

### Register

![Register](docs/screenshots/Screenshot_register.png)

## Tech Stack

**Frontend**
- React
- JavaScript
- Vite
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- PostgreSQL
- Neon PostgreSQL

**Deployment**
- Netlify
- Render

**Development**
- Git
- GitHub
- pgAdmin 4

## Architecture


User
  ↓
Netlify
React + Vite Frontend
  ↓ HTTPS API Requests
Render
Node.js + Express Backend
  ↓ SQL
Neon PostgreSQL

The frontend communicates with the backend through REST API endpoints. The backend handles authentication, authorization, application tracking, saved opportunities, and database operations.

Authentication
OppTrack uses session-based authentication.
Passwords are hashed with Node.js scrypt (memory-hard KDF, per-password random salt, timing-safe comparison) — verified by the test suite
Random session tokens are generated after login
Only a SHA-256 hash of the session token is stored in the database
The session token is sent through an HTTP-only cookie
Protected routes verify the session (including expiry) before accessing user data
User-specific database queries use the authenticated user's ID

## Testing

A minimal test suite runs on Node's built-in test runner (no extra dependencies):

```bash
npm test
```

It covers password hashing/verification (`server/tests/auth.test.js`) and the applications CRUD routes, including auth enforcement and validation (`server/tests/applications.test.js`).

## Opportunity Ingestion (v1.1.0)

Collectors fetch raw postings from free public APIs (Remotive, Arbeitnow) and land them in a `staged_opportunities` table for review — plain HTTP + parsing, no AI:

```bash
npm run ingest
```

Details: [docs/ingestion.md](docs/ingestion.md)

Live Application
Frontend:

https://nimble-mermaid-650643.netlify.app⁠�

Backend API:

https://opptrack-backend.onrender.com/api⁠�

Local Development

1. Clone the repository
git clone https://github.com/arclegit/OppTrack.git
cd OppTrack

2. Install dependencies
npm install

3. Configure environment variables
Create the required environment files for the frontend and backend.

The backend requires the PostgreSQL connection configuration and authentication-related environment variables.

The frontend uses:

VITE_API_URL=http://localhost:5000/api


Documentation

Detailed project documentation is available in the docs directory.

Architecture
Authentication
Database
API Reference
Deployment
Development
Security
Project Scope

OppTrack is designed as an opportunity discovery and tracking system.
It does not act as an application portal, recruitment company, authenticity guarantee, or replacement for opportunity providers. Users are directed to the original provider URLs when applying.

Project Status

OppTrack v1.1.0 is deployed and functional, with real opportunity data, production authentication, a verified password-hashing implementation, a test suite, and a source-ingestion pipeline feeding a staging table.
Further improvements can include promotion of staged postings into the curated catalog, additional opportunity sources, richer filtering, notifications, and other features as the project evolves.
Built as a BCA portfolio project.


