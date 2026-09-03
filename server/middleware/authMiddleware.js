import { createHash } from "node:crypto";
import pool from "../db.js";


// Get the session token from the request cookie
function getSessionToken(req) {
  const cookieHeader =
    req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies =
    cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] =
      cookie.trim().split("=");

    if (name === "opptrack_session") {
      return valueParts.join("=");
    }
  }

  return null;
}


// Require an authenticated user
export async function requireAuth(
  req,
  res,
  next
) {
  try {
    // Get session token from cookie
    const sessionToken =
      getSessionToken(req);

    if (!sessionToken) {
      return res.status(401).json({
        error: "Authentication required"
      });
    }


    // Hash the session token
    // The raw token is never stored in PostgreSQL.
    const tokenHash =
      createHash("sha256")
        .update(sessionToken)
        .digest("hex");


    // Find a valid session and its user
    const result =
      await pool.query(
        `
        SELECT
          users.id,
          users.name,
          users.email
        FROM sessions
        JOIN users
          ON sessions.user_id = users.id
        WHERE sessions.token_hash = $1
          AND sessions.expires_at > CURRENT_TIMESTAMP
        `,
        [tokenHash]
      );


    // Session does not exist or has expired
    if (result.rows.length === 0) {
      return res.status(401).json({
        error:
          "Invalid or expired session"
      });
    }


    // Attach the authenticated user
    // to the current request.
    req.user = result.rows[0];


    // Continue to the protected route
    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res.status(500).json({
      error:
        "Authentication check failed"
    });
  }
}