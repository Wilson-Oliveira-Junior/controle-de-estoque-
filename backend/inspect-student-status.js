const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

async function main() {
  const db = await open({
    filename: path.join(__dirname, "..", "data", "database.sqlite"),
    driver: sqlite3.Database
  });

  const rows = await db.all(`
    SELECT student_name, attendance_status, absences_count, last_presence_date, source_file
    FROM student_registry
    WHERE student_name IN (
      'Ytalo Gabriel Arrebola de Souza',
      'Yasmim Moura de Oliveira',
      'Yasmin Ferreira Rodrigues',
      'Yago Ricardo Joaquim Zanetti'
    )
    ORDER BY student_name COLLATE NOCASE
  `);

  console.log(JSON.stringify(rows, null, 2));
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
