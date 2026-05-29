const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

async function main() {
  const db = await open({
    filename: path.join(__dirname, "..", "data", "database.sqlite"),
    driver: sqlite3.Database
  });

  const counts = await db.get(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN contract_start_date IS NOT NULL AND TRIM(contract_start_date) <> '' THEN 1 ELSE 0 END) AS contract_start_date_count,
      SUM(CASE WHEN register_start_date IS NOT NULL AND TRIM(register_start_date) <> '' THEN 1 ELSE 0 END) AS register_start_date_count,
      SUM(CASE WHEN register_created_date IS NOT NULL AND TRIM(register_created_date) <> '' THEN 1 ELSE 0 END) AS register_created_date_count,
      SUM(CASE WHEN status_start_date IS NOT NULL AND TRIM(status_start_date) <> '' THEN 1 ELSE 0 END) AS status_start_date_count,
      SUM(CASE WHEN projected_end_date IS NOT NULL AND TRIM(projected_end_date) <> '' THEN 1 ELSE 0 END) AS projected_end_date_count
    FROM student_registry
  `);

  const sample = await db.all(`
    SELECT student_name, contract_start_date, register_start_date, register_created_date, status_start_date, contracted_hours, completed_hours, projected_end_date
    FROM student_registry
    WHERE (contract_start_date IS NOT NULL AND TRIM(contract_start_date) <> '')
       OR (register_start_date IS NOT NULL AND TRIM(register_start_date) <> '')
       OR (register_created_date IS NOT NULL AND TRIM(register_created_date) <> '')
       OR (status_start_date IS NOT NULL AND TRIM(status_start_date) <> '')
    ORDER BY updated_at DESC
    LIMIT 8
  `);

  console.log(JSON.stringify({ counts, sample }, null, 2));
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
