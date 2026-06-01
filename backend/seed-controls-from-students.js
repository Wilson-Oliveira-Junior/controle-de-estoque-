const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");

function normalizeLookupText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePlannedCourseNames(enrolledIn) {
  const raw = String(enrolledIn || "").trim();
  if (!raw) return [];

  const names = raw
    .split(/[,;|]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^\d+\s*[_-]\s*/, "").trim())
    .filter(Boolean);

  return [...new Set(names)];
}

function matchesCourseName(catalogName, plannedName) {
  const a = normalizeLookupText(catalogName);
  const b = normalizeLookupText(plannedName);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toIsoToday() {
  return new Date().toISOString().slice(0, 10);
}

function pickStartDate(student) {
  const values = [student.register_start_date, student.status_start_date, student.contract_start_date];
  for (const value of values) {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  }
  return toIsoToday();
}

async function main() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS course_controls (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      student_id TEXT,
      student_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      weekly_hours REAL NOT NULL DEFAULT 2,
      responsible TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );
  `);

  const students = await db.all(`
    SELECT id, student_name, responsible, enrolled_in, register_start_date, status_start_date, contract_start_date
    FROM student_registry
    WHERE enrolled_in IS NOT NULL AND TRIM(enrolled_in) <> ''
    ORDER BY student_name COLLATE NOCASE
  `);

  const courses = await db.all(`
    SELECT id, name
    FROM course_catalog
    ORDER BY name COLLATE NOCASE
  `);

  let studentsWithProgramming = 0;
  let studentsWithMappedCourses = 0;
  let createdControls = 0;
  let existingControls = 0;
  let unmatchedCourseTokens = 0;

  for (const student of students) {
    const plannedNames = parsePlannedCourseNames(student.enrolled_in);
    if (!plannedNames.length) continue;

    studentsWithProgramming += 1;
    let mappedForStudent = 0;

    for (const plannedName of plannedNames) {
      const match = courses.find((course) => matchesCourseName(course.name, plannedName));
      if (!match) {
        unmatchedCourseTokens += 1;
        continue;
      }

      mappedForStudent += 1;
      const alreadyExists = await db.get(
        "SELECT id FROM course_controls WHERE student_id = ? AND course_id = ? LIMIT 1",
        student.id,
        match.id
      );

      if (alreadyExists) {
        existingControls += 1;
        continue;
      }

      const now = new Date().toISOString();
      await db.run(
        `
          INSERT INTO course_controls (
            id, course_id, student_id, student_name, start_date, weekly_hours, responsible, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        createId("ctrl"),
        match.id,
        student.id,
        student.student_name,
        pickStartDate(student),
        2,
        String(student.responsible || "Sistema").trim() || "Sistema",
        "Gerado automaticamente pela programação do aluno",
        now,
        now
      );
      createdControls += 1;
    }

    if (mappedForStudent > 0) {
      studentsWithMappedCourses += 1;
    }
  }

  const totalControls = await db.get("SELECT COUNT(*) AS c FROM course_controls");

  console.log(`students_with_programming=${studentsWithProgramming}`);
  console.log(`students_with_mapped_courses=${studentsWithMappedCourses}`);
  console.log(`created_controls=${createdControls}`);
  console.log(`existing_controls=${existingControls}`);
  console.log(`unmatched_course_tokens=${unmatchedCourseTokens}`);
  console.log(`total_controls=${totalControls.c}`);

  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
