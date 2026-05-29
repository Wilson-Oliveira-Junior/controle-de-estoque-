const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");
const TSV_PATH = path.join(__dirname, "..", "data", "import", "validacao-horas-anexo.tsv");

function toLooseName(text) {
  const normalized = String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const alnumWithSpaces = normalized.replace(/[^a-z0-9]+/g, " ").trim();
  if (!alnumWithSpaces) return "";

  const stopwords = new Set(["de", "da", "do", "dos", "das", "e"]);
  const tokens = alnumWithSpaces
    .split(/\s+/)
    .filter((token) => token && !stopwords.has(token));

  return tokens.join("");
}

function parseDateBrToIso(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function parseNumber(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const normalized = text.replace(".", "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseTsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
}

async function run() {
  const raw = fs.readFileSync(TSV_PATH, "utf8");
  const rows = parseTsv(raw);

  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  const students = await db.all(
    `
      SELECT
        id,
        student_name,
        loose_name,
        contracted_hours,
        completed_hours,
        register_start_date,
        status_start_date,
        projected_end_date
      FROM student_registry
    `
  );

  const studentsByLoose = new Map();
  for (const student of students) {
    const keys = new Set([
      toLooseName(student.student_name),
      toLooseName(student.loose_name)
    ]);

    for (const key of keys) {
      if (!key) continue;
      if (!studentsByLoose.has(key)) {
        studentsByLoose.set(key, []);
      }
      studentsByLoose.get(key).push(student);
    }
  }

  const report = {
    totalRowsInDoc: rows.length,
    matchedRows: 0,
    notFoundInDb: [],
    duplicateNamesInDoc: [],
    contractedHoursMismatch: [],
    startDateMismatch: [],
    completedHoursMismatch: [],
    projectedEndDateMismatch: []
  };

  const seenDocNames = new Map();

  for (const row of rows) {
    const name = String(row.Aluno || "").trim();
    if (!name) continue;

    const docCount = (seenDocNames.get(name) || 0) + 1;
    seenDocNames.set(name, docCount);

    const loose = toLooseName(name);
    const candidates = studentsByLoose.get(loose) || [];

    if (candidates.length === 0) {
      report.notFoundInDb.push(name);
      continue;
    }

    if (docCount > 1) {
      report.duplicateNamesInDoc.push(name);
    }

    const student = candidates[0];
    report.matchedRows += 1;

    const docContracted = parseNumber(row.Horas_Contratadas);
    const dbContracted = Number.isFinite(Number(student.contracted_hours)) ? Number(student.contracted_hours) : null;
    if (docContracted !== null && dbContracted !== null && Math.abs(docContracted - dbContracted) > 0.001) {
      report.contractedHoursMismatch.push({
        aluno: name,
        doc: docContracted,
        banco: dbContracted
      });
    }

    const docStart = parseDateBrToIso(row.Data_Inicio);
    const dbStart = String(student.register_start_date || "").trim();
    if (docStart && dbStart && docStart !== dbStart) {
      report.startDateMismatch.push({
        aluno: name,
        doc: docStart,
        banco: dbStart
      });
    }

    const docCompleted = parseNumber(row.Horas_Consumidas);
    const dbCompleted = Number.isFinite(Number(student.completed_hours)) ? Number(student.completed_hours) : null;
    if (docCompleted !== null && dbCompleted !== null && Math.abs(docCompleted - dbCompleted) > 0.001) {
      report.completedHoursMismatch.push({
        aluno: name,
        doc: docCompleted,
        banco: dbCompleted
      });
    }

    const docProjectedEnd = parseDateBrToIso(row.Data_Fim);
    const dbProjectedEnd = String(student.projected_end_date || "").trim();
    if (docProjectedEnd && dbProjectedEnd && docProjectedEnd !== dbProjectedEnd) {
      report.projectedEndDateMismatch.push({
        aluno: name,
        doc: docProjectedEnd,
        banco: dbProjectedEnd
      });
    }
  }

  report.notFoundInDb = Array.from(new Set(report.notFoundInDb)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  report.duplicateNamesInDoc = Array.from(new Set(report.duplicateNamesInDoc)).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const summary = {
    totalRowsInDoc: report.totalRowsInDoc,
    matchedRows: report.matchedRows,
    notFoundCount: report.notFoundInDb.length,
    duplicateNamesInDocCount: report.duplicateNamesInDoc.length,
    contractedHoursMismatchCount: report.contractedHoursMismatch.length,
    startDateMismatchCount: report.startDateMismatch.length,
    completedHoursMismatchCount: report.completedHoursMismatch.length,
    projectedEndDateMismatchCount: report.projectedEndDateMismatch.length
  };

  console.log(JSON.stringify({ summary, report }, null, 2));
  await db.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
