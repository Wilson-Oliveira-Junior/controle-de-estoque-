const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

function normalizeLoose(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(da|de|do|das|dos|e)\b/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

async function main() {
  const db = await open({
    filename: path.join(__dirname, "..", "data", "database.sqlite"),
    driver: sqlite3.Database
  });

  const students = await db.all(`
    SELECT id, student_name, normalized_name, attendance_status, contracted_hours, completed_hours, updated_at
    FROM student_registry
    ORDER BY student_name COLLATE NOCASE
  `);

  const byLoose = new Map();
  for (const s of students) {
    const key = normalizeLoose(s.student_name);
    if (!key) continue;
    if (!byLoose.has(key)) byLoose.set(key, []);
    byLoose.get(key).push(s);
  }

  const probableDuplicates = [...byLoose.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      key: normalizeLoose(group[0].student_name),
      names: group.map((s) => s.student_name),
      ids: group.map((s) => s.id)
    }));

  const missingStatus = students.filter((s) => !String(s.attendance_status || "").trim()).length;
  const withStatus = students.length - missingStatus;

  console.log(`total=${students.length}`);
  console.log(`com_status=${withStatus}`);
  console.log(`sem_status=${missingStatus}`);
  console.log(`duplicidades_provaveis=${probableDuplicates.length}`);

  probableDuplicates.slice(0, 30).forEach((dup, index) => {
    console.log(`dup_${index + 1}: ${dup.names.join(" || ")}`);
  });

  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
