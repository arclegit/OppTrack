import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
   const result = await pool.query(
  `
  SELECT
    id,
    title,
    organization,
    category,
    description,
    eligibility,
    location,
    TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline,
    skills,
    source,
    url,
    verification_status AS "verificationStatus",
    scope,
    TO_CHAR(date_added, 'YYYY-MM-DD') AS "dateAdded",
    TO_CHAR(last_verified, 'YYYY-MM-DD') AS "lastVerified"
  FROM opportunities
  ORDER BY id
  `
);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);

    res.status(500).json({
      message: "Failed to fetch opportunities"
    });
  }
});

export default router;