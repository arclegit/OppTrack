import opportunityRoutes from "./routes/opportunityRoutes.js";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import savedOpportunityRoutes from "./routes/savedOpportunityRoutes.js";

const app = express();

app.use(cors());

const PORT = 5000;

app.get("/api/health", (req, res) => {
  res.json({
    message: "OppTrack API is running",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use(express.json());

app.use("/api/opportunities", opportunityRoutes);

app.use("/api/applications", applicationRoutes);

app.use(
  "/api/saved-opportunities",
  savedOpportunityRoutes
);

app.listen(PORT, () => {
  console.log(
    `OppTrack API running on http://localhost:${PORT}`
  );
});