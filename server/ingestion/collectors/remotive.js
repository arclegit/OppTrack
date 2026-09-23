// Collector for the Remotive public API.
// Plain HTTP + JSON parsing — no AI involved.
// https://remotive.com/api/remote-jobs

const REMOTIVE_URL =
  "https://remotive.com/api/remote-jobs?limit=50";


export async function collectRemotive() {
  const response = await fetch(REMOTIVE_URL, {
    headers: {
      "User-Agent":
        "OppTrack-Ingestion/1.1.0"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Remotive request failed: ` +
      `${response.status}`
    );
  }

  const data = await response.json();

  const jobs = Array.isArray(data.jobs)
    ? data.jobs
    : [];

  return jobs.map((job) => ({
    source: "remotive",
    externalId: String(job.id),
    title: job.title ?? "Untitled",
    organization: job.company_name ?? null,
    location:
      job.candidate_required_location ??
      null,
    url: job.url ?? null,
    description: job.description ?? null,
    deadline: null,
    raw: job
  }));
}
