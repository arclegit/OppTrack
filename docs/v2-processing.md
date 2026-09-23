# V2 processing

## What changed

V2 turns a raw staged posting into one structured catalog opportunity. The pipeline keeps the original source URL and a stable deduplication key on every catalog row. It does not add scraping or a new source.

```
Public API collector → staged_opportunities → structured extraction → opportunities
                                              │                    │
                                              └── source URL + dedup key
```

## Extraction

`npm run extract` reads staged rows that are new or refreshed. The server sends the source record to the OpenAI Responses API with a strict JSON schema and receives title, category, description, deadline, eligibility, stipend, skills, location, and scope.

The API key stays in `OPENAI_API_KEY` on the server. It must never be placed in a `VITE_*` variable or committed to Git. `OPENAI_EXTRACTION_MODEL` defaults to `gpt-4o-mini` and may be changed in the hosting environment.

The extractor does not invent missing information. Nullable fields remain null when the source does not state them. `source_url` comes directly from the staged source, not from the model.

## Deduplication and updates

The key is a SHA-256 hash of `source:external_id` (or the source URL if the source has no external ID). It identifies the source record rather than the current wording of its description. When a collector receives an updated source record, it refreshes staging; the next extraction updates the corresponding catalog row instead of creating a duplicate. An extended deadline therefore makes the existing row visible again.

## Expiry handling

`npm run hide-expired` marks records with a deadline before the current database date as inactive. The public catalog and saved-opportunity view also exclude past deadlines, so an overdue row is hidden even before the maintenance command runs. This preserves a user's application history instead of deleting rows that may be referenced by saved opportunities or applications.

Run the v2 migration before either command:

```bash
psql "$DATABASE_URL" -f server/migrations/20260923_v2_opportunity_extraction.sql
```

The migration gives manually entered demo records explicit `manual://opportunity/...` source identifiers when no source URL was supplied. They remain clearly labelled as manual/demo data rather than appearing to come from a real provider. It also fills missing scope values: rows located in India become `National`, and remote rows become `Remote`.
