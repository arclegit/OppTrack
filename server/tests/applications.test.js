import test from "node:test";
import assert from "node:assert/strict";

import express from "express";

import pool from "../db.js";
import applicationRoutes from
  "../routes/applicationRoutes.js";


// CRUD route tests for /api/applications.
// The database pool is stubbed so the tests
// run without a live PostgreSQL connection.

const TEST_USER = {
  id: 1,
  name: "Test User",
  email: "test@example.com"
};

const APPLICATION_ROW = {
  id: 10,
  userId: 1,
  opportunityId: 5,
  status: "Applied",
  appliedDate: "2026-09-01",
  notes: "Sent resume",
  followUpDate: "2026-09-15"
};


// Replace pool.query with a stub that answers
// the queries made by authMiddleware and
// applicationRoutes.
function stubPool(behavior = {}) {
  pool.query = async (sql, params) => {

    if (sql.includes("FROM sessions")) {
      return { rows: [TEST_USER] };
    }

    if (
      sql.includes("FROM opportunities")
    ) {
      return behavior.opportunityMissing
        ? { rows: [] }
        : { rows: [{ id: params[0] }] };
    }

    if (
      sql.includes("SELECT") &&
      sql.includes("FROM applications") &&
      sql.includes("opportunity_id = $2")
    ) {
      return behavior.alreadyTracked
        ? { rows: [{ id: 10 }] }
        : { rows: [] };
    }

    if (
      sql.includes(
        "DELETE FROM applications"
      )
    ) {
      return behavior.applicationMissing
        ? { rows: [] }
        : {
            rows: [APPLICATION_ROW]
          };
    }

    if (
      sql.includes("FROM applications")
    ) {
      return behavior.applicationMissing
        ? { rows: [] }
        : { rows: [{ id: 10 }] };
    }

    if (
      sql.startsWith(
        "INSERT INTO applications"
      ) ||
      sql.includes(
        "INSERT INTO applications"
      )
    ) {
      return {
        rows: [APPLICATION_ROW]
      };
    }

    if (
      sql.includes(
        "UPDATE applications"
      )
    ) {
      return {
        rows: [
          {
            ...APPLICATION_ROW,
            status: params[0]
          }
        ]
      };
    }

    return { rows: [] };
  };
}


// Start the router on an ephemeral port
async function startServer(behavior) {
  stubPool(behavior);

  const app = express();
  app.use(express.json());
  app.use(
    "/api/applications",
    applicationRoutes
  );

  const server = await new Promise(
    (resolve) => {
      const s = app.listen(0, () =>
        resolve(s)
      );
    }
  );

  const baseUrl =
    `http://127.0.0.1:` +
    `${server.address().port}` +
    `/api/applications`;

  return { server, baseUrl };
}


const AUTH_HEADERS = {
  "Content-Type": "application/json",
  Cookie: "opptrack_session=test-token"
};


test(
  "GET /api/applications requires authentication",
  async (t) => {
    stubPool();

    const { server, baseUrl } =
      await startServer();

    t.after(() => server.close());

    const res = await fetch(baseUrl);

    assert.equal(res.status, 401);
  }
);


test(
  "POST /api/applications creates an application",
  async (t) => {
    const { server, baseUrl } =
      await startServer();

    t.after(() => server.close());

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        opportunityId: 5,
        status: "Applied",
        appliedDate: "2026-09-01",
        notes: "Sent resume",
        followUpDate: "2026-09-15"
      })
    });

    assert.equal(res.status, 201);

    const body = await res.json();
    assert.equal(
      body.opportunityId, 5
    );
    assert.equal(
      body.status, "Applied"
    );
  }
);


test(
  "POST /api/applications rejects an invalid status",
  async (t) => {
    const { server, baseUrl } =
      await startServer();

    t.after(() => server.close());

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        opportunityId: 5,
        status: "NotAStatus"
      })
    });

    assert.equal(res.status, 400);
  }
);


test(
  "POST /api/applications rejects duplicates",
  async (t) => {
    const { server, baseUrl } =
      await startServer({
        alreadyTracked: true
      });

    t.after(() => server.close());

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        opportunityId: 5,
        status: "Applied"
      })
    });

    assert.equal(res.status, 409);
  }
);


test(
  "PATCH /api/applications/:id updates the status",
  async (t) => {
    const { server, baseUrl } =
      await startServer();

    t.after(() => server.close());

    const res = await fetch(
      `${baseUrl}/10`,
      {
        method: "PATCH",
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          status: "Interview"
        })
      }
    );

    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(
      body.status, "Interview"
    );
  }
);


test(
  "PATCH /api/applications/:id returns 404 for a missing application",
  async (t) => {
    const { server, baseUrl } =
      await startServer({
        applicationMissing: true
      });

    t.after(() => server.close());

    const res = await fetch(
      `${baseUrl}/999`,
      {
        method: "PATCH",
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          status: "Interview"
        })
      }
    );

    assert.equal(res.status, 404);
  }
);


test(
  "DELETE /api/applications/:id removes the application",
  async (t) => {
    const { server, baseUrl } =
      await startServer();

    t.after(() => server.close());

    const res = await fetch(
      `${baseUrl}/10`,
      {
        method: "DELETE",
        headers: AUTH_HEADERS
      }
    );

    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(
      body.message,
      "Application deleted successfully"
    );
  }
);
