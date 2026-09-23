import pool from "../db.js";


// Raw postings from external sources land in
// this staging table before any cleaning,
// deduplication, or promotion into the main
// opportunities table.

export async function ensureStagingTable() {
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS staged_opportunities
      (
        id
          integer GENERATED ALWAYS AS IDENTITY
          PRIMARY KEY,

        source
          text NOT NULL,

        external_id
          text,

        title
          text NOT NULL,

        organization
          text,

        location
          text,

        url
          text,

        description
          text,

        deadline
          date,

        raw_payload
          jsonb NOT NULL,

        fetched_at
          timestamp with time zone
          NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (source, external_id)
      )
    `
  );
}


// Insert one parsed posting into staging.
// Duplicates from the same source are skipped.
export async function stagePosting(posting) {
  const result = await pool.query(
    `
    INSERT INTO staged_opportunities
      (
        source,
        external_id,
        title,
        organization,
        location,
        url,
        description,
        deadline,
        raw_payload
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (source, external_id)
    DO NOTHING
    RETURNING id
    `,
    [
      posting.source,
      posting.externalId ?? null,
      posting.title,
      posting.organization ?? null,
      posting.location ?? null,
      posting.url ?? null,
      posting.description ?? null,
      posting.deadline ?? null,
      JSON.stringify(posting.raw)
    ]
  );

  return result.rows.length > 0;
}
