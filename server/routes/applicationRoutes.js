import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const validStatuses = [
  "Interested",
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected"
];

// All application routes require authentication.
router.use(requireAuth);


// GET /api/applications
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        applications.id,
        applications.user_id AS "userId",
        applications.opportunity_id AS "opportunityId",
        applications.status,
        applications.applied_date::text AS "appliedDate",
        applications.notes,
        applications.follow_up_date::text AS "followUpDate",
        opportunities.title,
        opportunities.organization
      FROM applications
      JOIN opportunities
        ON applications.opportunity_id = opportunities.id
      WHERE applications.user_id = $1
      ORDER BY applications.id
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching applications:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch applications"
    });
  }
});


// POST /api/applications
router.post("/", async (req, res) => {
  try {
    const {
      opportunityId,
      status,
      appliedDate,
      notes,
      followUpDate
    } = req.body;

    if (!opportunityId) {
      return res.status(400).json({
        error: "opportunityId is required"
      });
    }

    if (
      !status ||
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        error: "Invalid application status"
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

    // Check whether this user is already tracking this opportunity
    const existingApplication =
      await pool.query(
        `
        SELECT id
        FROM applications
        WHERE user_id = $1
          AND opportunity_id = $2
        `,
        [req.user.id, opportunityId]
      );

    if (
      existingApplication.rows.length > 0
    ) {
      return res.status(409).json({
        error:
          "Application already exists for this opportunity"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO applications
        (
          user_id,
          opportunity_id,
          status,
          applied_date,
          notes,
          follow_up_date
        )
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        user_id AS "userId",
        opportunity_id AS "opportunityId",
        status,
        applied_date::text AS "appliedDate",
        notes,
        follow_up_date::text AS "followUpDate"
      `,
      [
        req.user.id,
        opportunityId,
        status,
        appliedDate || null,
        notes || null,
        followUpDate || null
      ]
    );

    res.status(201).json(
      result.rows[0]
    );
  } catch (error) {
    console.error(
      "Error creating application:",
      error
    );

    res.status(500).json({
      error: "Failed to create application"
    });
  }
});


// PATCH /api/applications/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      appliedDate,
      notes,
      followUpDate
    } = req.body;

    if (
      !status ||
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        error: "Invalid application status"
      });
    }

    // Check whether this application belongs to this user
    const existingApplication =
      await pool.query(
        `
        SELECT id
        FROM applications
        WHERE id = $1
          AND user_id = $2
        `,
        [id, req.user.id]
      );

    if (
      existingApplication.rows.length === 0
    ) {
      return res.status(404).json({
        error: "Application not found"
      });
    }

    const result = await pool.query(
      `
      UPDATE applications
      SET
        status = $1,
        applied_date = $2,
        notes = $3,
        follow_up_date = $4
      WHERE id = $5
        AND user_id = $6
      RETURNING
        id,
        user_id AS "userId",
        opportunity_id AS "opportunityId",
        status,
        applied_date::text AS "appliedDate",
        notes,
        follow_up_date::text AS "followUpDate"
      `,
      [
        status,
        appliedDate || null,
        notes || null,
        followUpDate || null,
        id,
        req.user.id
      ]
    );

    res.json(
      result.rows[0]
    );
  } catch (error) {
    console.error(
      "Error updating application:",
      error
    );

    res.status(500).json({
      error: "Failed to update application"
    });
  }
});


// DELETE /api/applications/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM applications
      WHERE id = $1
        AND user_id = $2
      RETURNING
        id,
        user_id AS "userId",
        opportunity_id AS "opportunityId",
        status,
        applied_date::text AS "appliedDate",
        notes,
        follow_up_date::text AS "followUpDate"
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Application not found"
      });
    }

    res.json({
      message:
        "Application deleted successfully",
      application: result.rows[0]
    });
  } catch (error) {
    console.error(
      "Error deleting application:",
      error
    );

    res.status(500).json({
      error: "Failed to delete application"
    });
  }
});


export default router;