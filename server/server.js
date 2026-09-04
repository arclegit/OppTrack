import "dotenv/config";

import express from "express";
import cors from "cors";

import pool from "./db.js";

import opportunityRoutes from "./routes/opportunityRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import savedOpportunityRoutes from "./routes/savedOpportunityRoutes.js";
import authRoutes from "./routes/authRoutes.js";


const app = express();


// Hosting platforms provide PORT automatically.
// 5000 is used when running locally.
const PORT = process.env.PORT || 5000;


// Frontend URL for CORS
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";


app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);


// Parse JSON request bodies
app.use(express.json());


// ==================================================
// Health check
// ==================================================

app.get("/api/health", (req, res) => {
  res.json({
    message: "OppTrack API is running"
  });
});


// ==================================================
// Database connection test
// ==================================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      message:
        "Database connected successfully",
      databaseTime: result.rows[0].now
    });

  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );

    res.status(500).json({
      message:
        "Database connection failed"
    });
  }
});


// ==================================================
// API routes
// ==================================================

app.use(
  "/api/opportunities",
  opportunityRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/saved-opportunities",
  savedOpportunityRoutes
);


// ==================================================
// Start server
// ==================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `OppTrack API running on port ${PORT}`
  );
});