import express from "express";
import pool from "../db.js";

import {
  hashPassword,
  verifyPassword
} from "../auth.js";

import {
  randomBytes,
  createHash
} from "node:crypto";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();


// ==================================================
// POST /api/auth/register
// Register a new user
// ==================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;


    // ------------------------------
    // Basic input validation
    // ------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        error:
          "Name, email, and password are required"
      });
    }


    const trimmedName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();


    if (!trimmedName) {
      return res.status(400).json({
        error:
          "Name cannot be empty"
      });
    }


    if (!normalizedEmail) {
      return res.status(400).json({
        error:
          "Email cannot be empty"
      });
    }


    // ------------------------------
    // Check whether email already exists
    // ------------------------------

    const existingUser =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        [normalizedEmail]
      );


    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error:
          "Email is already registered"
      });
    }


    // ------------------------------
    // Hash password
    // ------------------------------

    const passwordHash =
      await hashPassword(password);


    // ------------------------------
    // Create user
    // ------------------------------

    const result =
      await pool.query(
        `
        INSERT INTO users
          (
            name,
            email,
            password_hash
          )
        VALUES
          (
            $1,
            $2,
            $3
          )
        RETURNING
          id,
          name,
          email
        `,
        [
          trimmedName,
          normalizedEmail,
          passwordHash
        ]
      );


    // ------------------------------
    // Return safe user information
    // ------------------------------

    res.status(201).json({
      message:
        "Registration successful",

      user:
        result.rows[0]
    });


  } catch (error) {

    console.error(
      "Error registering user:",
      error
    );


    res.status(500).json({
      error:
        "Failed to register user"
    });
  }
});


// ==================================================
// POST /api/auth/login
// Log a user in
// ==================================================

router.post("/login", async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;


    // ------------------------------
    // Basic input validation
    // ------------------------------

    if (!email || !password) {
      return res.status(400).json({
        error:
          "Email and password are required"
      });
    }


    // ------------------------------
    // Normalize email
    // ------------------------------

    const normalizedEmail =
      email.trim().toLowerCase();


    // ------------------------------
    // Find user
    // ------------------------------

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          password_hash
        FROM users
        WHERE email = $1
        `,
        [normalizedEmail]
      );


    // ------------------------------
    // Do not reveal whether
    // the email exists
    // ------------------------------

    if (
      result.rows.length === 0 ||
      !result.rows[0].password_hash
    ) {

      return res.status(401).json({
        error:
          "Invalid email or password"
      });
    }


    const user =
      result.rows[0];


    // ------------------------------
    // Verify password
    // ------------------------------

    const passwordIsValid =
      await verifyPassword(
        password,
        user.password_hash
      );


    if (!passwordIsValid) {

      return res.status(401).json({
        error:
          "Invalid email or password"
      });
    }


    // ------------------------------
    // Generate random session token
    // ------------------------------

    const sessionToken =
      randomBytes(32)
        .toString("hex");


    // ------------------------------
    // Hash session token
    // before storing it
    // ------------------------------

    const sessionTokenHash =
      createHash("sha256")
        .update(sessionToken)
        .digest("hex");


    // ------------------------------
    // Session expires in 7 days
    // ------------------------------

    const expiresAt =
      new Date(
        Date.now() +
        7 * 24 * 60 * 60 * 1000
      );


    // ------------------------------
    // Store session in PostgreSQL
    // ------------------------------

    await pool.query(
      `
      INSERT INTO sessions
        (
          token_hash,
          user_id,
          expires_at
        )
      VALUES
        (
          $1,
          $2,
          $3
        )
      `,
      [
        sessionTokenHash,
        user.id,
        expiresAt
      ]
    );


    // ------------------------------
    // Send session token
    // as HTTP-only cookie
    // ------------------------------

    res.setHeader(
  "Set-Cookie",
  `opptrack_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None; Expires=${expiresAt.toUTCString()}`
);


    // ------------------------------
    // Return safe user information
    // ------------------------------

    res.json({
      message:
        "Login successful",

      user: {
        id:
          user.id,

        name:
          user.name,

        email:
          user.email
      }
    });


  } catch (error) {

    console.error(
      "Error logging in:",
      error
    );


    res.status(500).json({
      error:
        "Failed to log in"
    });
  }
});


// ==================================================
// GET /api/auth/me
// Return the currently authenticated user
// ==================================================

router.get(
  "/me",
  requireAuth,
  (req, res) => {

    res.json({
      user:
        req.user
    });

  }
);


// ==================================================
// POST /api/auth/logout
// Log the current user out
// ==================================================

router.post(
  "/logout",
  requireAuth,
  async (req, res) => {

    try {

      const cookieHeader =
        req.headers.cookie;


      // ------------------------------
      // If there is no cookie,
      // there is nothing to remove
      // ------------------------------

      if (!cookieHeader) {

        return res.json({
          message:
            "Logout successful"
        });

      }


      // ------------------------------
      // Extract session token
      // ------------------------------

      const cookies =
        cookieHeader.split(";");


      let sessionToken =
        null;


      for (const cookie of cookies) {

        const [
          name,
          ...valueParts
        ] =
          cookie
            .trim()
            .split("=");


        if (
          name ===
          "opptrack_session"
        ) {

          sessionToken =
            valueParts.join("=");

          break;
        }
      }


      // ------------------------------
      // Delete session from database
      // ------------------------------

      if (sessionToken) {

        const tokenHash =
          createHash("sha256")
            .update(sessionToken)
            .digest("hex");


        await pool.query(
          `
          DELETE FROM sessions
          WHERE token_hash = $1
          `,
          [tokenHash]
        );
      }


      // ------------------------------
      // Clear browser cookie
      // ------------------------------

      res.setHeader(
  "Set-Cookie",
  "opptrack_session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0"
);


      res.json({
        message:
          "Logout successful"
      });


    } catch (error) {

      console.error(
        "Error logging out:",
        error
      );


      res.status(500).json({
        error:
          "Failed to log out"
      });
    }
  }
);


export default router;