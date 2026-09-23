import "dotenv/config";

import pool from "../db.js";

import {
  ensureStagingTable,
  stagePosting
} from "./staging.js";

import {
  collectRemotive
} from "./collectors/remotive.js";

import {
  collectArbeitnow
} from "./collectors/arbeitnow.js";


// Ingestion runner.
// Fetches raw postings from external sources
// and lands them in the staged_opportunities
// table. No AI, no promotion into the main
// opportunities table yet — that review step
// is deliberate.

const collectors = [
  ["remotive", collectRemotive],
  ["arbeitnow", collectArbeitnow]
];


async function run() {
  await ensureStagingTable();

  let totalFetched = 0;
  let totalInserted = 0;

  for (
    const [name, collect]
    of collectors
  ) {
    try {
      const postings = await collect();

      let inserted = 0;

      for (const posting of postings) {
        const wasInserted =
          await stagePosting(posting);

        if (wasInserted) {
          inserted += 1;
        }
      }

      totalFetched += postings.length;
      totalInserted += inserted;

      console.log(
        `[${name}] fetched ` +
        `${postings.length}, ` +
        `staged ${inserted} new`
      );

    } catch (error) {
      console.error(
        `[${name}] collector failed:`,
        error.message
      );
    }
  }

  console.log(
    `Ingestion complete: ` +
    `${totalInserted} new of ` +
    `${totalFetched} fetched`
  );
}


run()
  .catch((error) => {
    console.error(
      "Ingestion failed:",
      error
    );
    process.exitCode = 1;
  })
  .finally(() => pool.end());
