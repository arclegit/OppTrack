import "dotenv/config";
import pool from "../db.js";
import { promoteStagedOpportunities } from "./promote.js";

const limit = Number(process.env.EXTRACTION_BATCH_SIZE || 20);

try {
  const result = await promoteStagedOpportunities(limit);
  console.log(
    `Extraction complete: ${result.promoted} promoted, ${result.failed} failed`
  );
} catch (error) {
  console.error("Extraction failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
