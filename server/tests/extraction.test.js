import test from "node:test";
import assert from "node:assert/strict";

import {
  createDedupKey,
  extractOpportunity
} from "../ingestion/extraction.js";

const POSTING = {
  source: "demo",
  external_id: "abc-123",
  title: "Demo internship",
  organization: "ABC",
  location: "India",
  url: "https://example.test/opportunities/abc-123",
  deadline: null,
  description: "A clearly labelled demo opportunity."
};

test("dedup keys are stable per source and external ID", () => {
  assert.equal(
    createDedupKey(POSTING),
    createDedupKey({ ...POSTING, title: "Updated title" })
  );
});

test("extraction sends strict structured-output configuration", async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({
          title: "Demo internship",
          organization: "ABC",
          category: "Internship",
          description: "A clearly labelled demo opportunity.",
          eligibility: null,
          location: "India",
          scope: "National",
          deadline: null,
          stipend: null,
          skills: []
        })
      })
    };
  };

  const extracted = await extractOpportunity(POSTING, {
    apiKey: "test-key",
    fetchImpl
  });

  const body = JSON.parse(request.options.body);
  assert.equal(request.url, "https://api.openai.com/v1/responses");
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, "json_schema");
  assert.equal(body.text.format.strict, true);
  assert.equal(extracted.scope, "National");
});
