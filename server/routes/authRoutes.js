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

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_MIN_LENGTH = 8;


// ==================================================
// POST /api/auth/register
// Register a new user
// ==================================================

router.post(
  "/register",
  async (req, res) => {
    try {

      const {
        name,
        email,
        password
      } = req.body;


      // ------------------------------
      // Required fields
      // ------------------------------

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          error:
            "Name, email, and password are required."
        });
      }


      // ------------------------------
      // Normalize input
      // ------------------------------

      const trimmedName =
        name.trim();

      const normalizedEmail =
        email.trim().toLowerCase();


      // ------------------------------
      // Name validation
      // ------------------------------

      if (!trimmedName) {
        return res.status(400).json({
          error:
            "Please enter your name."
        });
      }

      if (trimmedName.length < 2) {
        return res.status(400).json({
          error:
            "Name must be at least 2 characters."
        });
      }

      if (trimmedName.length > 80) {
        return res.status(400).json({
          error:
            "Name must be 80 characters or fewer."
        });
      }


      // ------------------------------
      // Email validation
      // ------------------------------

      if (!normalizedEmail) {
        return res.status(400).json({
          error:
            "Please enter your email address."
        });
      }

      if (
        normalizedEmail.length > 254
      ) {
        return res.status(400).json({
          error:
            "Email address is too long."
        });
      }

      if (
        !EMAIL_PATTERN.test(
          normalizedEmail
        )
      ) {
        return res.status(400).json({
          error:
            "Please enter a valid email address."
        });
      }


      // ------------------------------
      // Password validation
      // ------------------------------

      if (!password) {
        return res.status(400).json({
          error:
            "Please create a password."
        });
      }

      if (
        password.length <
        PASSWORD_MIN_LENGTH
      ) {
        return res.status(400).json({
          error:
            "Password must be at least 8 characters."
        });
      }

      if (!/[A-Za-z]/.test(password)) {
        return res.status(400).json({
          error:
            "Password must contain at least one letter."
        });
      }

      if (!/[0-9]/.test(password)) {
        return res.status(400).json({
          error:
            "Password must contain at least one number."
        });
      }


      // ------------------------------
      // Check whether email exists
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


      if (
        existingUser.rows.length > 0
      ) {
        return res.status(409).json({
          error:
            "This email is already registered. Try logging in instead."
        });
      }


      // ------------------------------
      // Hash password
      // ------------------------------

      const passwordHash =
        await hashPassword(
          password
        );


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

      return res.status(201).json({
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


      // ------------------------------
      // Handle PostgreSQL duplicate
      // email constraint safely
      // ------------------------------

      if (
        error.code === "23505"
      ) {
        return res.status(409).json({
          error:
            "This email is already registered. Try logging in instead."
        });
      }


      return res.status(500).json({
        error:
          "We couldn't create your account right now. Please try again."
      });
    }
  }
);


// ==================================================
// POST /api/auth/login
// Log a user in
// ==================================================

router.post(
  "/login",
  async (req, res) => {
    try {

      const {
        email,
        password
      } = req.body;


      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          error:
            "Email and password are required."
        });
      }


      const normalizedEmail =
        email.trim().toLowerCase();


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
      // Generate session token
      // ------------------------------

      const sessionToken =
        randomBytes(32)
          .toString("hex");


      const sessionTokenHash =
        createHash("sha256")
          .update(sessionToken)
          .digest("hex");


      const expiresAt =
        new Date(
          Date.now() +
          7 *
          24 *
          60 *
          60 *
          1000
        );


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
      // HTTP-only session cookie
      // ------------------------------

      res.setHeader(
        "Set-Cookie",
        `opptrack_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None; Expires=${expiresAt.toUTCString()}`
      );


      return res.json({
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


      return res.status(500).json({
        error:
          "Failed to log in"
      });
    }
  }
);


// ==================================================
// GET /api/auth/me
// Return current authenticated user
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
// Log current user out
// ==================================================

router.post(
  "/logout",
  requireAuth,
  async (req, res) => {

    try {

      const cookieHeader =
        req.headers.cookie;


      if (!cookieHeader) {
        return res.json({
          message:
            "Logout successful"
        });
      }


      const cookies =
        cookieHeader.split(";");


      let sessionToken =
        null;


      for (
        const cookie of cookies
      ) {

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


      res.setHeader(
        "Set-Cookie",
        "opptrack_session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0"
      );


      return res.json({
        message:
          "Logout successful"
      });

    } catch (error) {

      console.error(
        "Error logging out:",
        error
      );


      return res.status(500).json({
        error:
          "Failed to log out"
      });
    }
  }
);


export default router;