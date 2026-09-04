import pool from "./db.js";

try {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log("Tables:", result.rows);
} catch (error) {
  console.error("Database check failed:", error.message);
} finally {
  await pool.end();
}