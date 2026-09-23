import "dotenv/config";
import pool from "../db.js";

try {
  const result = await pool.query(
    `
    UPDATE opportunities
    SET is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE deadline < CURRENT_DATE
      AND is_active IS DISTINCT FROM FALSE
    `
  );

  console.log(`Hidden ${result.rowCount} expired opportunities`);
} catch (error) {
  console.error("Expiry cleanup failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
