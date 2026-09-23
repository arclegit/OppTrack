BEGIN;

-- Some deployments started before v1.1. Create the staging table here so the
-- v2 migration can be applied safely to those databases as well.
CREATE TABLE IF NOT EXISTS staged_opportunities
  (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source text NOT NULL,
    external_id text,
    title text NOT NULL,
    organization text,
    location text,
    url text,
    description text,
    deadline date,
    raw_payload jsonb NOT NULL,
    fetched_at timestamp with time zone
      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source, external_id)
  );

-- Keep the existing v1 catalog intact while adding the metadata v2 needs.
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS dedup_key text,
  ADD COLUMN IF NOT EXISTS stipend text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone
    NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing manually entered rows remain visible and get stable legacy keys.
-- Their original URL is used when present; `manual://` explicitly marks a
-- demonstration/manual record rather than presenting it as an external source.
UPDATE opportunities
SET source_url = COALESCE(
      NULLIF(source_url, ''),
      NULLIF(url, ''),
      'manual://opportunity/' || id
    ),
    dedup_key = COALESCE(
      NULLIF(dedup_key, ''),
      'legacy:' || id
    ),
    verification_status = CASE
      WHEN COALESCE(
        NULLIF(source_url, ''),
        NULLIF(url, '')
      ) IS NULL THEN 'Demo / manual record'
      ELSE verification_status
    END,
    scope = CASE
      WHEN NULLIF(scope, '') IS NOT NULL
        AND lower(scope) <> 'testing' THEN scope
      WHEN lower(COALESCE(location, '')) LIKE '%remote%' THEN 'Remote'
      WHEN lower(COALESCE(location, '')) LIKE '%india%' THEN 'National'
      ELSE 'International'
    END,
    is_active = CASE
      WHEN deadline IS NULL OR deadline >= CURRENT_DATE THEN TRUE
      ELSE FALSE
    END,
    updated_at = CURRENT_TIMESTAMP;

ALTER TABLE opportunities
  ALTER COLUMN source_url SET NOT NULL,
  ALTER COLUMN dedup_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS opportunities_dedup_key_unique
  ON opportunities (dedup_key);

CREATE INDEX IF NOT EXISTS opportunities_visible_by_deadline
  ON opportunities (is_active, deadline);

-- A refreshed source item must be extracted again. This also records failures
-- without losing the raw posting.
ALTER TABLE staged_opportunities
  ADD COLUMN IF NOT EXISTS extracted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_extraction_error text;

COMMIT;
