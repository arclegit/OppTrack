// Collector for the Arbeitnow free job board API.
// Plain HTTP + JSON parsing — no AI involved.
// https://www.arbeitnow.com/api/job-board-api

const ARBEITNOW_URL =
  "https://www.arbeitnow.com/api/job-board-api";


export async function collectArbeitnow() {
  const response = await fetch(ARBEITNOW_URL, {
    headers: {
      "User-Agent":
        "OppTrack-Ingestion/1.1.0"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Arbeitnow request failed: ` +
      `${response.status}`
    );
  }

  const data = await response.json();

  const jobs = Array.isArray(data.data)
    ? data.data
    : [];

  return jobs.map((job) => ({
    source: "arbeitnow",
    externalId: String(job.slug),
    title: job.title ?? "Untitled",
    organization: job.company_name ?? null,
    location: job.remote
      ? "Remote"
      : job.location ?? null,
    url: job.url ?? null,
    description: job.description ?? null,
    deadline: null,
    raw: job
  }));
}
