const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");
const TSV_PATH = path.join(__dirname, "..", "data", "import", "contatos-alunos.tsv");
const APPLY = process.argv.includes("--apply");

function normalizeKey(text) {
  const normalized = String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const stopwords = new Set(["de", "da", "do", "dos", "das", "e"]);
  return normalized
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !stopwords.has(token))
    .join("");
}

function parseTsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
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

function cleanPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : "";
}

function cleanText(value) {
  return String(value || "").trim();
}

async function run() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  const content = fs.readFileSync(TSV_PATH, "utf8");
  const rows = parseTsv(content);

  const students = await db.all("SELECT id, student_name, loose_name, phone, responsible FROM student_registry");
  const map = new Map();

  for (const student of students) {
    const keys = new Set([
      normalizeKey(student.student_name),
      normalizeKey(student.loose_name)
    ]);
    for (const key of keys) {
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(student);
    }
  }

  const report = {
    totalRows: rows.length,
    matched: 0,
    notFound: [],
    ambiguous: [],
    missingPhoneInDoc: 0,
    missingResponsibleInDoc: 0,
    phoneDivergences: [],
    responsibleDivergences: [],
    updatedPhone: 0,
    updatedResponsible: 0
  };

  for (const row of rows) {
    const name = cleanText(row.Nome);
    const key = normalizeKey(name);
    if (!key) continue;

    const matches = map.get(key) || [];
    if (!matches.length) {
      report.notFound.push(name);
      continue;
    }

    if (matches.length > 1) {
      report.ambiguous.push({
        nome: name,
        candidatos: matches.map((candidate) => candidate.student_name)
      });
      continue;
    }

    report.matched += 1;
    const student = matches[0];
    const docPhone = cleanPhone(row.Celular);
    const docResponsible = cleanText(row["Responsável"]);
    const dbPhone = cleanPhone(student.phone);
    const dbResponsible = cleanText(student.responsible);

    if (!docPhone) report.missingPhoneInDoc += 1;
    if (!docResponsible) report.missingResponsibleInDoc += 1;

    if (docPhone && docPhone !== dbPhone) {
      report.phoneDivergences.push({
        nome: name,
        banco: dbPhone || "",
        documento: docPhone
      });

      if (APPLY) {
        await db.run("UPDATE student_registry SET phone = ?, updated_at = ? WHERE id = ?", docPhone, new Date().toISOString(), student.id);
        report.updatedPhone += 1;
      }
    }

    if (docResponsible && docResponsible !== dbResponsible) {
      report.responsibleDivergences.push({
        nome: name,
        banco: dbResponsible || "",
        documento: docResponsible
      });

      if (APPLY) {
        await db.run(
          "UPDATE student_registry SET responsible = ?, updated_at = ? WHERE id = ?",
          docResponsible,
          new Date().toISOString(),
          student.id
        );
        report.updatedResponsible += 1;
      }
    }
  }

  report.notFound = Array.from(new Set(report.notFound)).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const summary = {
    applyMode: APPLY,
    totalRows: report.totalRows,
    matched: report.matched,
    notFoundCount: report.notFound.length,
    ambiguousCount: report.ambiguous.length,
    missingPhoneInDoc: report.missingPhoneInDoc,
    missingResponsibleInDoc: report.missingResponsibleInDoc,
    phoneDivergences: report.phoneDivergences.length,
    responsibleDivergences: report.responsibleDivergences.length,
    updatedPhone: report.updatedPhone,
    updatedResponsible: report.updatedResponsible
  };

  console.log(JSON.stringify({ summary, report }, null, 2));
  await db.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
