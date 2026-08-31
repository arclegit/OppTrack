import pool from "./db.js";
import opportunities from "../src/data/opportunities.js";

const seed = async () => {
  try {
    for (const opportunity of opportunities) {
      await pool.query(
        `
        INSERT INTO opportunities (
          id,
          title,
          organization,
          category,
          description,
          eligibility,
          location,
          deadline,
          skills,
          source,
          url,
          verification_status,
          scope,
          date_added,
          last_verified
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15
        )
        ON CONFLICT (id) DO NOTHING;
        `,
        [
          opportunity.id,
          opportunity.title,
          opportunity.organization,
          opportunity.category,
          opportunity.description,
          opportunity.eligibility,
          opportunity.location,
          opportunity.deadline,
          opportunity.skills,
          opportunity.source,
          opportunity.url,
          opportunity.verificationStatus,
          opportunity.scope,
          opportunity.dateAdded,
          opportunity.lastVerified
        ]
      );
    }

    console.log("Opportunities seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
};

seed();