const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");

function normalizeLooseName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(da|de|do|das|dos|e)\b/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1")
    .trim();
}

function toDisplayName(name) {
  const particles = new Set(["da", "de", "do", "das", "dos", "e"]);
  return String(name || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && particles.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function scoreRow(row) {
  let score = 0;
  if (String(row.attendance_status || "").trim()) score += 10;
  if (Number(row.absences_count || 0) > 0) score += 4;
  if (Number(row.contracted_hours || 0) > 0) score += 3;
  if (Number(row.completed_hours || 0) > 0) score += 2;
  if (String(row.phone || "").trim()) score += 1;
  if (String(row.updated_at || "").trim()) score += 1;
  return score;
}

function pickPrimary(group) {
  return [...group].sort((a, b) => {
    const scoreDiff = scoreRow(b) - scoreRow(a);
    if (scoreDiff !== 0) return scoreDiff;
    return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
  })[0];
}

async function ensureColumn(db, tableName, columnName, columnSql) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`);
  }
}

async function main() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await ensureColumn(db, "student_registry", "loose_name", "loose_name TEXT");

  const students = await db.all(`
    SELECT
      id, student_name, normalized_name, phone, responsible,
      contracted_hours, completed_hours,
      attendance_status, absences_count, last_presence_date,
      updated_at
    FROM student_registry
    ORDER BY student_name COLLATE NOCASE
  `);

  let renamed = 0;
  for (const row of students) {
    const formatted = toDisplayName(row.student_name);
    const looseName = normalizeLooseName(formatted);
    if (formatted !== row.student_name || looseName !== (row.loose_name || "")) {
      await db.run(
        "UPDATE student_registry SET student_name = ?, loose_name = ?, updated_at = ? WHERE id = ?",
        formatted,
        looseName,
        new Date().toISOString(),
        row.id
      );
      renamed += 1;
    }
  }

  const refreshed = await db.all(`
    SELECT
      id, student_name, phone, responsible,
      contracted_hours, completed_hours,
      attendance_status, absences_count, last_presence_date,
      updated_at
    FROM student_registry
  `);

  const groups = new Map();
  for (const row of refreshed) {
    const key = normalizeLooseName(row.student_name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  let mergedGroups = 0;
  let removedRows = 0;

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const primary = pickPrimary(group);
    const duplicates = group.filter((row) => row.id !== primary.id);

    for (const dup of duplicates) {
      await db.run(
        `
          UPDATE student_registry
          SET
            phone = COALESCE(NULLIF(phone, ''), ?),
            responsible = COALESCE(NULLIF(responsible, ''), ?),
            contracted_hours = COALESCE(contracted_hours, ?),
            completed_hours = COALESCE(completed_hours, ?),
            attendance_status = COALESCE(NULLIF(attendance_status, ''), ?),
            absences_count = COALESCE(absences_count, ?),
            last_presence_date = COALESCE(last_presence_date, ?),
            updated_at = ?
          WHERE id = ?
        `,
        dup.phone,
        dup.responsible,
        dup.contracted_hours,
        dup.completed_hours,
        dup.attendance_status,
        dup.absences_count,
        dup.last_presence_date,
        new Date().toISOString(),
        primary.id
      );

      await db.run(
        "UPDATE course_controls SET student_id = ?, student_name = ? WHERE student_id = ?",
        primary.id,
        primary.student_name,
        dup.id
      );

      await db.run(
        "DELETE FROM student_registry WHERE id = ?",
        dup.id
      );

      removedRows += 1;
    }

    mergedGroups += 1;
  }

  const total = await db.get("SELECT COUNT(*) AS c FROM student_registry");
  const withStatus = await db.get("SELECT COUNT(*) AS c FROM student_registry WHERE attendance_status IS NOT NULL AND TRIM(attendance_status) <> ''");

  console.log(`nomes_padronizados=${renamed}`);
  console.log(`grupos_mesclados=${mergedGroups}`);
  console.log(`linhas_removidas=${removedRows}`);
  console.log(`total_alunos=${total.c}`);
  console.log(`com_status=${withStatus.c}`);

  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
