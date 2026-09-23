import pool from "../db.js";
import {
  createDedupKey,
  extractOpportunity
} from "./extraction.js";

function opportunityId(dedupKey) {
  return `ext-${dedupKey.slice(0, 40)}`;
}

async function upsertOpportunity(posting, extracted) {
  const dedupKey = createDedupKey(posting);
  const result = await pool.query(
    `
    INSERT INTO opportunities
      (
        id, title, organization, category, description,
        eligibility, location, deadline, skills, source,
        url, source_url, dedup_key, verification_status,
        scope, date_added, last_verified, stipend, is_active
      )
    VALUES
      (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $11, $12, 'Source extracted', $13,
        CURRENT_DATE, CURRENT_DATE, $14,
        CASE WHEN $8 IS NULL OR $8 >= CURRENT_DATE
          THEN TRUE ELSE FALSE END
      )
    ON CONFLICT (dedup_key)
    DO UPDATE SET
      title = EXCLUDED.title,
      organization = EXCLUDED.organization,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      eligibility = EXCLUDED.eligibility,
      location = EXCLUDED.location,
      deadline = EXCLUDED.deadline,
      skills = EXCLUDED.skills,
      source = EXCLUDED.source,
      url = EXCLUDED.url,
      source_url = EXCLUDED.source_url,
      scope = EXCLUDED.scope,
      stipend = EXCLUDED.stipend,
      last_verified = CURRENT_DATE,
      updated_at = CURRENT_TIMESTAMP,
      is_active = CASE
        WHEN EXCLUDED.deadline IS NULL
          OR EXCLUDED.deadline >= CURRENT_DATE THEN TRUE
        ELSE FALSE
      END
    RETURNING id
    `,
    [
      opportunityId(dedupKey),
      extracted.title,
      extracted.organization,
      extracted.category,
      extracted.description,
      extracted.eligibility,
      extracted.location,
      extracted.deadline,
      extracted.skills,
      posting.source,
      posting.url,
      dedupKey,
      extracted.scope,
      extracted.stipend
    ]
  );

  return result.rows[0];
}

export async function promoteStagedOpportunities(limit = 20) {
  const staged = await pool.query(
    `
    SELECT *
    FROM staged_opportunities
    WHERE extracted_at IS NULL
       OR fetched_at > extracted_at
    ORDER BY fetched_at ASC
    LIMIT $1
    `,
    [limit]
  );

  const result = { promoted: 0, failed: 0 };

  for (const posting of staged.rows) {
    try {
      if (!posting.url) {
        throw new Error(
          "A staged posting needs a source URL before promotion"
        );
      }

      const extracted = await extractOpportunity(posting);
      await upsertOpportunity(posting, extracted);
      await pool.query(
        `
        UPDATE staged_opportunities
        SET extracted_at = CURRENT_TIMESTAMP,
            last_extraction_error = NULL
        WHERE id = $1
        `,
        [posting.id]
      );
      result.promoted += 1;
    } catch (error) {
      await pool.query(
        `
        UPDATE staged_opportunities
        SET last_extraction_error = $2
        WHERE id = $1
        `,
        [posting.id, error.message]
      );
      result.failed += 1;
    }
  }

  return result;
}
