const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");

function normalizeHeader(header) {
  return String(header || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeStudentName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

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

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const lowered = raw.toLowerCase();
  if (lowered === "novo" || lowered === "nao encontrado" || lowered === "não encontrado" || lowered === "#valor!") {
    return null;
  }

  const cleaned = raw.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function ensureColumn(db, tableName, columnName, columnSql) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`);
  }
}

function toRows(content) {
  const lines = String(content || "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split("\t").map(normalizeHeader);
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split("\t");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = (cols[index] || "").trim();
    });

    rows.push(row);
  }

  return rows;
}

function pickFirst(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

async function ensureTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS student_registry (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      contracted_hours REAL,
      completed_hours REAL,
      hours_remaining REAL,
      installments_remaining REAL,
      phone TEXT,
      responsible TEXT,
      enrolled_in TEXT,
      server_flag TEXT,
      attention_status TEXT,
      additional_quantity REAL,
      amount REAL,
      discounted_amount REAL,
      contact_status TEXT,
      contract_start_date TEXT,
      projected_end_date TEXT,
      register_start_date TEXT,
      register_created_date TEXT,
      register_end_date TEXT,
      notes TEXT,
      source_file TEXT,
      attendance_status TEXT,
      status_start_date TEXT,
      contract_days_since_start REAL,
      absences_count REAL,
      last_presence_date TEXT,
      days_since_last_class REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await ensureColumn(db, "student_registry", "attendance_status", "attendance_status TEXT");
  await ensureColumn(db, "student_registry", "status_start_date", "status_start_date TEXT");
  await ensureColumn(db, "student_registry", "contract_days_since_start", "contract_days_since_start REAL");
  await ensureColumn(db, "student_registry", "absences_count", "absences_count REAL");
  await ensureColumn(db, "student_registry", "last_presence_date", "last_presence_date TEXT");
  await ensureColumn(db, "student_registry", "days_since_last_class", "days_since_last_class REAL");
  await ensureColumn(db, "student_registry", "loose_name", "loose_name TEXT");
}

function toStudentRecord(row, sourceFile) {
  const rawStudentName = pickFirst(row, ["aluno", "nome"]);
  if (!rawStudentName) return null;
  const studentName = toDisplayName(rawStudentName);

  const contractedHours = parseNumber(pickFirst(row, ["contratado", "contratou"]));
  const completedHours = parseNumber(pickFirst(row, ["realizado", "fez"]));
  const hoursRemaining = parseNumber(pickFirst(row, ["horas que faltam"]));
  const installmentsRemaining = parseNumber(pickFirst(row, ["parcelas que faltam"]));
  const additionalQuantity = parseNumber(pickFirst(row, ["quantidade adicional"]));
  const amount = parseNumber(pickFirst(row, ["valor"]));
  const discountedAmount = parseNumber(pickFirst(row, ["valor com desconto"]));

  const phone = pickFirst(row, ["telefone", "contato"]);
  const responsible = pickFirst(row, ["responsavel", "responsável"]);
  const enrolledIn = pickFirst(row, ["cursando"]);
  const serverFlag = pickFirst(row, ["servidor"]);
  const attentionStatus = pickFirst(row, ["atencao", "atenção"]);
  const contactStatus = pickFirst(row, ["contato"]);
  const notes = pickFirst(row, ["observacoes", "observações"]);

  const attendanceStatus = pickFirst(row, ["status"]);
  const statusStartDate = parseDate(pickFirst(row, ["data inicio", "data inicial"]));
  const contractDaysSinceStart = parseNumber(pickFirst(row, ["dias desde lancamento contrato"]));
  const absencesCount = parseNumber(pickFirst(row, ["qtd faltas"]));
  const lastPresenceDate = parseDate(pickFirst(row, ["data ultima presenca"]));
  const daysSinceLastClass = parseNumber(pickFirst(row, ["dias desde ultima aula"]));

  const contractStartDate = parseDate(pickFirst(row, ["data de inicio de contrato"]));
  const projectedEndDate = parseDate(pickFirst(row, ["previsao de finalizacao", "previsão de finalização", "data final"]));
  const registerStartDate = parseDate(pickFirst(row, ["data inicial"]));
  const registerCreatedDate = parseDate(pickFirst(row, ["data cadastro"]));
  const registerEndDate = parseDate(pickFirst(row, ["data final"]));

  return {
    studentName,
    normalizedName: normalizeStudentName(studentName),
    looseName: normalizeLooseName(studentName),
    contractedHours,
    completedHours,
    hoursRemaining,
    installmentsRemaining,
    phone,
    responsible,
    enrolledIn,
    serverFlag,
    attentionStatus,
    additionalQuantity,
    amount,
    discountedAmount,
    contactStatus,
    contractStartDate,
    projectedEndDate,
    registerStartDate,
    registerCreatedDate,
    registerEndDate,
    attendanceStatus,
    statusStartDate,
    contractDaysSinceStart,
    absencesCount,
    lastPresenceDate,
    daysSinceLastClass,
    notes,
    sourceFile
  };
}

async function upsertStudent(db, student) {
  const now = new Date().toISOString();
  await db.run(
    `
      INSERT INTO student_registry (
        id, student_name, normalized_name, contracted_hours, completed_hours, hours_remaining,
        installments_remaining, phone, responsible, enrolled_in, server_flag, attention_status,
        additional_quantity, amount, discounted_amount, contact_status,
        contract_start_date, projected_end_date, register_start_date, register_created_date,
        register_end_date, notes, source_file, attendance_status, status_start_date,
        contract_days_since_start, absences_count, last_presence_date, days_since_last_class, loose_name,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(normalized_name) DO UPDATE SET
        student_name = COALESCE(excluded.student_name, student_registry.student_name),
        contracted_hours = COALESCE(excluded.contracted_hours, student_registry.contracted_hours),
        completed_hours = COALESCE(excluded.completed_hours, student_registry.completed_hours),
        hours_remaining = COALESCE(excluded.hours_remaining, student_registry.hours_remaining),
        installments_remaining = COALESCE(excluded.installments_remaining, student_registry.installments_remaining),
        phone = COALESCE(NULLIF(excluded.phone, ''), student_registry.phone),
        responsible = COALESCE(NULLIF(excluded.responsible, ''), student_registry.responsible),
        enrolled_in = COALESCE(NULLIF(excluded.enrolled_in, ''), student_registry.enrolled_in),
        server_flag = COALESCE(NULLIF(excluded.server_flag, ''), student_registry.server_flag),
        attention_status = COALESCE(NULLIF(excluded.attention_status, ''), student_registry.attention_status),
        additional_quantity = COALESCE(excluded.additional_quantity, student_registry.additional_quantity),
        amount = COALESCE(excluded.amount, student_registry.amount),
        discounted_amount = COALESCE(excluded.discounted_amount, student_registry.discounted_amount),
        contact_status = COALESCE(NULLIF(excluded.contact_status, ''), student_registry.contact_status),
        contract_start_date = COALESCE(excluded.contract_start_date, student_registry.contract_start_date),
        projected_end_date = COALESCE(excluded.projected_end_date, student_registry.projected_end_date),
        register_start_date = COALESCE(excluded.register_start_date, student_registry.register_start_date),
        register_created_date = COALESCE(excluded.register_created_date, student_registry.register_created_date),
        register_end_date = COALESCE(excluded.register_end_date, student_registry.register_end_date),
        notes = COALESCE(NULLIF(excluded.notes, ''), student_registry.notes),
        source_file = COALESCE(NULLIF(excluded.source_file, ''), student_registry.source_file),
        attendance_status = COALESCE(NULLIF(excluded.attendance_status, ''), student_registry.attendance_status),
        status_start_date = COALESCE(excluded.status_start_date, student_registry.status_start_date),
        contract_days_since_start = COALESCE(excluded.contract_days_since_start, student_registry.contract_days_since_start),
        absences_count = COALESCE(excluded.absences_count, student_registry.absences_count),
        last_presence_date = COALESCE(excluded.last_presence_date, student_registry.last_presence_date),
        days_since_last_class = COALESCE(excluded.days_since_last_class, student_registry.days_since_last_class),
        loose_name = COALESCE(NULLIF(excluded.loose_name, ''), student_registry.loose_name),
        updated_at = excluded.updated_at
    `,
    createId("aluno"),
    student.studentName,
    student.normalizedName,
    student.contractedHours,
    student.completedHours,
    student.hoursRemaining,
    student.installmentsRemaining,
    student.phone,
    student.responsible,
    student.enrolledIn,
    student.serverFlag,
    student.attentionStatus,
    student.additionalQuantity,
    student.amount,
    student.discountedAmount,
    student.contactStatus,
    student.contractStartDate,
    student.projectedEndDate,
    student.registerStartDate,
    student.registerCreatedDate,
    student.registerEndDate,
    student.notes,
    student.sourceFile,
    student.attendanceStatus,
    student.statusStartDate,
    student.contractDaysSinceStart,
    student.absencesCount,
    student.lastPresenceDate,
    student.daysSinceLastClass,
    student.looseName,
    now,
    now
  );
}

async function updateMatchedStudentById(db, studentId, student) {
  const now = new Date().toISOString();
  await db.run(
    `
      UPDATE student_registry SET
        student_name = COALESCE(?, student_name),
        contracted_hours = COALESCE(?, contracted_hours),
        completed_hours = COALESCE(?, completed_hours),
        hours_remaining = COALESCE(?, hours_remaining),
        installments_remaining = COALESCE(?, installments_remaining),
        phone = COALESCE(NULLIF(?, ''), phone),
        responsible = COALESCE(NULLIF(?, ''), responsible),
        enrolled_in = COALESCE(NULLIF(?, ''), enrolled_in),
        server_flag = COALESCE(NULLIF(?, ''), server_flag),
        attention_status = COALESCE(NULLIF(?, ''), attention_status),
        additional_quantity = COALESCE(?, additional_quantity),
        amount = COALESCE(?, amount),
        discounted_amount = COALESCE(?, discounted_amount),
        contact_status = COALESCE(NULLIF(?, ''), contact_status),
        contract_start_date = COALESCE(?, contract_start_date),
        projected_end_date = COALESCE(?, projected_end_date),
        register_start_date = COALESCE(?, register_start_date),
        register_created_date = COALESCE(?, register_created_date),
        register_end_date = COALESCE(?, register_end_date),
        notes = COALESCE(NULLIF(?, ''), notes),
        source_file = COALESCE(NULLIF(?, ''), source_file),
        attendance_status = COALESCE(NULLIF(?, ''), attendance_status),
        status_start_date = COALESCE(?, status_start_date),
        contract_days_since_start = COALESCE(?, contract_days_since_start),
        absences_count = COALESCE(?, absences_count),
        last_presence_date = COALESCE(?, last_presence_date),
        days_since_last_class = COALESCE(?, days_since_last_class),
        loose_name = COALESCE(NULLIF(?, ''), loose_name),
        updated_at = ?
      WHERE id = ?
    `,
    student.studentName,
    student.contractedHours,
    student.completedHours,
    student.hoursRemaining,
    student.installmentsRemaining,
    student.phone,
    student.responsible,
    student.enrolledIn,
    student.serverFlag,
    student.attentionStatus,
    student.additionalQuantity,
    student.amount,
    student.discountedAmount,
    student.contactStatus,
    student.contractStartDate,
    student.projectedEndDate,
    student.registerStartDate,
    student.registerCreatedDate,
    student.registerEndDate,
    student.notes,
    student.sourceFile,
    student.attendanceStatus,
    student.statusStartDate,
    student.contractDaysSinceStart,
    student.absencesCount,
    student.lastPresenceDate,
    student.daysSinceLastClass,
    student.looseName,
    now,
    studentId
  );
}

async function importFile(db, filePath) {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  const rows = toRows(content);

  let processed = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  for (const row of rows) {
    const student = toStudentRecord(row, path.basename(filePath));
    if (!student || !student.normalizedName) {
      skipped += 1;
      continue;
    }

    const existing = await db.get(
      "SELECT id FROM student_registry WHERE normalized_name = ?",
      student.normalizedName
    );

    if (existing) {
      await upsertStudent(db, student);
      updated += 1;
    } else {
      const looseMatches = await db.all(
        "SELECT id FROM student_registry WHERE loose_name = ? LIMIT 2",
        student.looseName
      );

      if (looseMatches.length === 1) {
        await updateMatchedStudentById(db, looseMatches[0].id, student);
        updated += 1;
      } else {
        await upsertStudent(db, student);
        inserted += 1;
      }
    }
    processed += 1;
  }

  return { filePath, rows: rows.length, processed, inserted, updated, skipped };
}

async function main() {
  const filePaths = process.argv.slice(2);
  if (!filePaths.length) {
    console.log("Uso: node backend/import-students.js <arquivo1.tsv> <arquivo2.tsv> ...");
    process.exit(0);
  }

  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await ensureTables(db);

  let totalProcessed = 0;

  for (const filePath of filePaths) {
    const result = await importFile(db, filePath);
    totalProcessed += result.processed;
    console.log(
      `${result.filePath}: linhas=${result.rows}, processadas=${result.processed}, novas=${result.inserted}, atualizadas=${result.updated}, ignoradas=${result.skipped}`
    );
  }

  const total = await db.get("SELECT COUNT(*) AS count FROM student_registry");
  await db.close();

  console.log(`Total processado neste lote: ${totalProcessed}`);
  console.log(`Total consolidado de alunos: ${total.count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
