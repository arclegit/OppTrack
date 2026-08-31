import express from "express";
import pool from "../db.js";

const router = express.Router();

// Temporary user ID
// Authentication will replace this later.
const USER_ID = 1;


// GET /api/saved-opportunities
// Get all saved opportunities for the current user
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        opportunities.id,
        opportunities.title,
        opportunities.organization,
        opportunities.category,
        opportunities.description,
        opportunities.eligibility,
        opportunities.location,
        TO_CHAR(
          opportunities.deadline,
          'YYYY-MM-DD'
        ) AS deadline,
        opportunities.skills,
        opportunities.source,
        opportunities.url,
        opportunities.verification_status AS "verificationStatus",
        opportunities.scope,
        TO_CHAR(
          opportunities.date_added,
          'YYYY-MM-DD'
        ) AS "dateAdded",
        TO_CHAR(
          opportunities.last_verified,
          'YYYY-MM-DD'
        ) AS "lastVerified",
        saved_opportunities.saved_at AS "savedAt"
      FROM saved_opportunities
      JOIN opportunities
        ON saved_opportunities.opportunity_id =
           opportunities.id
      WHERE saved_opportunities.user_id = $1
      ORDER BY saved_opportunities.saved_at DESC
      `,
      [USER_ID]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching saved opportunities:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch saved opportunities"
    });
  }
});


// POST /api/saved-opportunities
// Save an opportunity for the current user
router.post("/", async (req, res) => {
  try {
    const { opportunityId } = req.body;

    if (!opportunityId) {
      return res.status(400).json({
        error: "opportunityId is required"
      });
    }

    // Check whether the opportunity exists
    const opportunityResult = await pool.query(
      `
      SELECT id
      FROM opportunities
      WHERE id = $1
      `,
      [opportunityId]
    );

    if (opportunityResult.rows.length === 0) {
      return res.status(404).json({
        error: "Opportunity not found"
      });
    }

    // Check whether it is already saved
    const existingSavedOpportunity =
      await pool.query(
        `
        SELECT opportunity_id
        FROM saved_opportunities
        WHERE user_id = $1
          AND opportunity_id = $2
        `,
        [USER_ID, opportunityId]
      );

    if (
      existingSavedOpportunity.rows.length > 0
    ) {
      return res.status(409).json({
        error: "Opportunity is already saved"
      });
    }

    // Save the opportunity
    const result = await pool.query(
      `
      INSERT INTO saved_opportunities
        (
          user_id,
          opportunity_id,
          saved_at
        )
      VALUES
        ($1, $2, CURRENT_TIMESTAMP)
      RETURNING
        user_id AS "userId",
        opportunity_id AS "opportunityId",
        saved_at AS "savedAt"
      `,
      [USER_ID, opportunityId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(
      "Error saving opportunity:",
      error
    );

    res.status(500).json({
      error: "Failed to save opportunity"
    });
  }
});


// DELETE /api/saved-opportunities/:opportunityId
// Remove a saved opportunity
router.delete("/:opportunityId", async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const result = await pool.query(
      `
      DELETE FROM saved_opportunities
      WHERE user_id = $1
        AND opportunity_id = $2
      RETURNING
        user_id AS "userId",
        opportunity_id AS "opportunityId",
        saved_at AS "savedAt"
      `,
      [USER_ID, opportunityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Saved opportunity not found"
      });
    }

    res.json({
      message:
        "Opportunity removed from saved list",
      savedOpportunity: result.rows[0]
    });
  } catch (error) {
    console.error(
      "Error removing saved opportunity:",
      error
    );

    res.status(500).json({
      error:
        "Failed to remove saved opportunity"
    });
  }
});


export default router;