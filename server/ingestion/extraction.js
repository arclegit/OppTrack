import { createHash } from "node:crypto";

const OPENAI_RESPONSES_URL =
  "https://api.openai.com/v1/responses";

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    organization: {
      anyOf: [{ type: "string" }, { type: "null" }]
    },
    category: {
      type: "string",
      enum: [
        "Internship",
        "Scholarship",
        "Hackathon",
        "Competition",
        "Job",
        "Workshop",
        "Event",
        "Other"
      ]
    },
    description: { type: "string" },
    location: {
      anyOf: [{ type: "string" }, { type: "null" }]
    },
    scope: {
      type: "string",
      enum: [
        "College",
        "Community",
        "District",
        "State",
        "National",
        "Remote",
        "International"
      ]
    },
    deadline: {
      anyOf: [
        { type: "string", format: "date" },
        { type: "null" }
      ]
    },
    eligibility: {
      anyOf: [{ type: "string" }, { type: "null" }]
    },
    stipend: {
      anyOf: [{ type: "string" }, { type: "null" }]
    },
    skills: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "title",
    "organization",
    "category",
    "description",
    "eligibility",
    "location",
    "scope",
    "deadline",
    "stipend",
    "skills"
  ],
  additionalProperties: false
};

function textForExtraction(posting) {
  return JSON.stringify({
    source: posting.source,
    sourceTitle: posting.title,
    sourceOrganization: posting.organization,
    sourceLocation: posting.location,
    sourceDeadline: posting.deadline,
    sourceUrl: posting.url,
    postingText: (posting.description || "").slice(0, 30000)
  });
}

export function createDedupKey(posting) {
  const stableSourceId = posting.external_id || posting.url;

  if (!stableSourceId) {
    throw new Error("A staged posting needs an external ID or source URL");
  }

  return createHash("sha256")
    .update(`${posting.source}:${stableSourceId}`)
    .digest("hex");
}

export async function extractOpportunity(
  posting,
  {
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_EXTRACTION_MODEL || "gpt-4o-mini",
    fetchImpl = fetch
  } = {}
) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for extraction");
  }

  const response = await fetchImpl(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Extract an opportunity posting into the supplied schema. " +
                "Use only the supplied source record. Do not invent missing " +
                "facts: use null when a nullable fact is absent. Classify an " +
                "India-wide opportunity as National and a location-independent " +
                "opportunity as Remote."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: textForExtraction(posting)
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "opportunity_extraction",
          strict: true,
          schema: EXTRACTION_SCHEMA
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI extraction failed with status ${response.status}`
    );
  }

  const body = await response.json();

  if (!body.output_text) {
    throw new Error("OpenAI returned no structured extraction");
  }

  return JSON.parse(body.output_text);
}
