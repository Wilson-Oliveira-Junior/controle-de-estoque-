const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "..", "data", "database.sqlite");

app.use(cors());
app.use(express.json());

async function ensureColumn(db, tableName, columnName, columnSql) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`);
  }
}

async function initDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      module TEXT NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      responsible TEXT NOT NULL,
      student TEXT,
      material TEXT NOT NULL,
      module TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS course_catalog (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      total_hours REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS course_controls (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      weekly_hours REAL NOT NULL DEFAULT 2,
      responsible TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES course_catalog (id)
    );

    CREATE TABLE IF NOT EXISTS calendar_holidays (
      id TEXT PRIMARY KEY,
      blocked_date TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS holiday_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      day INTEGER,
      month INTEGER,
      type TEXT NOT NULL,
      municipio TEXT,
      uf TEXT,
      blocks_school INTEGER NOT NULL DEFAULT 1,
      data_movel INTEGER NOT NULL DEFAULT 0,
      movable_rule TEXT,
      offset_days INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_vacations (
      id TEXT PRIMARY KEY,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      change_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY,
      class_day TEXT NOT NULL,
      class_time TEXT NOT NULL,
      session_date TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (class_day, class_time, session_date)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (session_id, student_id),
      FOREIGN KEY (session_id) REFERENCES attendance_sessions (id)
    );
  `);

  await ensureColumn(db, "course_controls", "student_id", "student_id TEXT");
  await ensureColumn(db, "course_controls", "updated_at", "updated_at TEXT");
  await ensureColumn(db, "course_catalog", "updated_at", "updated_at TEXT");
  await ensureColumn(db, "calendar_holidays", "holiday_type", "holiday_type TEXT");
  await ensureColumn(db, "calendar_holidays", "municipio", "municipio TEXT");
  await ensureColumn(db, "calendar_holidays", "uf", "uf TEXT");
  await ensureColumn(db, "calendar_holidays", "source_rule_id", "source_rule_id TEXT");
  await ensureColumn(db, "calendar_holidays", "generated_year", "generated_year INTEGER");
  await ensureColumn(db, "holiday_rules", "blocks_school", "blocks_school INTEGER NOT NULL DEFAULT 1");
  await ensureColumn(db, "holiday_rules", "weekday", "weekday INTEGER");
  await ensureColumn(db, "holiday_rules", "nth_in_month", "nth_in_month INTEGER");

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_attendance_sessions_lookup
    ON attendance_sessions (class_day, class_time, session_date);
  `);

  const hasStudentRegistry = await db.get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'student_registry'"
  );

  if (hasStudentRegistry) {
    await ensureColumn(db, "student_registry", "phone", "phone TEXT");
    await ensureColumn(db, "student_registry", "responsible", "responsible TEXT");
    await ensureColumn(db, "student_registry", "contracted_hours", "contracted_hours REAL");
    await ensureColumn(db, "student_registry", "completed_hours", "completed_hours REAL");
    await ensureColumn(db, "student_registry", "attendance_status", "attendance_status TEXT");
    await ensureColumn(db, "student_registry", "absences_count", "absences_count REAL");
    await ensureColumn(db, "student_registry", "last_presence_date", "last_presence_date TEXT");
    await ensureColumn(db, "student_registry", "updated_at", "updated_at TEXT");
    await ensureColumn(db, "student_registry", "package_percent", "package_percent REAL");
    await ensureColumn(db, "student_registry", "completed_sessions_count", "completed_sessions_count REAL");
    await ensureColumn(db, "student_registry", "extra_sessions_count", "extra_sessions_count REAL");
    await ensureColumn(db, "student_registry", "scheduled_sessions_count", "scheduled_sessions_count REAL");
    await ensureColumn(db, "student_registry", "presences_count", "presences_count REAL");
    await ensureColumn(db, "student_registry", "repositions_count", "repositions_count REAL");
    await ensureColumn(db, "student_registry", "presence_percent", "presence_percent REAL");
    await ensureColumn(db, "student_registry", "schedule_note", "schedule_note TEXT");
    await ensureColumn(db, "student_registry", "class_day", "class_day TEXT");
    await ensureColumn(db, "student_registry", "class_time", "class_time TEXT");
    await ensureColumn(db, "student_registry", "current_course", "current_course TEXT");
    await ensureColumn(db, "student_registry", "current_lesson", "current_lesson REAL");
    await ensureColumn(db, "student_registry", "apostila_received", "apostila_received INTEGER NOT NULL DEFAULT 0");
    await ensureColumn(db, "student_registry", "apostila_received_at", "apostila_received_at TEXT");
    await ensureColumn(db, "student_registry", "apostila_stock_debited", "apostila_stock_debited INTEGER NOT NULL DEFAULT 0");
    await ensureColumn(db, "student_registry", "apostila_stock_debited_at", "apostila_stock_debited_at TEXT");

    await db.run(
      `
        UPDATE student_registry
        SET register_start_date = status_start_date
        WHERE
          (register_start_date IS NULL OR TRIM(register_start_date) = '')
          AND status_start_date IS NOT NULL
          AND TRIM(status_start_date) <> ''
      `
    );

    await syncApostilaReceipts(db);
  }

  await ensureDefaultHolidayRules(db);

  return db;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(text) {
  return text ? text.trim().toLowerCase() : "";
}

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

function isCourseNameInPlannedList(courseName, plannedCourseNames) {
  const normalizedCourseName = normalizeLookupText(courseName);
  if (!normalizedCourseName) return false;

  return plannedCourseNames.some((plannedCourseName) => {
    const normalizedPlannedName = normalizeLookupText(plannedCourseName);
    if (!normalizedPlannedName) return false;
    return normalizedCourseName.includes(normalizedPlannedName) || normalizedPlannedName.includes(normalizedCourseName);
  });
}

function getChangedBy(req) {
  return String(req.body?.changedBy || "").trim();
}

function requireChangedBy(req, res) {
  const changedBy = getChangedBy(req);
  if (!changedBy) {
    res.status(400).json({ error: "changedBy is required." });
    return "";
  }
  return changedBy;
}

async function registerAuditLog(db, { entityType, entityId, action, changedBy, changeSummary = "" }) {
  await db.run(
    `
      INSERT INTO audit_log (id, entity_type, entity_id, action, changed_by, change_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    createId("audit"),
    entityType,
    entityId,
    action,
    changedBy,
    String(changeSummary || "").trim(),
    new Date().toISOString()
  );
}

function normalizeDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAttendanceStatus(value) {
  const text = normalizeLookupText(value);
  if (text === "falta" || text === "ausente") return "absence";
  if (text === "reposicao" || text === "reposiçao" || text === "reposição") return "reposition";
  return "presence";
}

function attendanceStatusLabel(status) {
  if (status === "absence") return "Falta";
  if (status === "reposition") return "Reposição";
  return "Presença";
}

async function getApostilaInventoryItem(db) {
  return db.get(
    `
      SELECT *
      FROM inventory
      WHERE LOWER(TRIM(name)) LIKE ?
      ORDER BY LOWER(TRIM(name)) ASC, LOWER(TRIM(module)) ASC
      LIMIT 1
    `,
    "%apostila%"
  );
}

async function syncApostilaReceipts(db) {
  const hasStudentRegistry = await db.get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'student_registry'"
  );

  if (!hasStudentRegistry) {
    return { receivedMarked: 0, stockDebited: 0 };
  }

  await ensureColumn(db, "student_registry", "apostila_received", "apostila_received INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "student_registry", "apostila_received_at", "apostila_received_at TEXT");
  await ensureColumn(db, "student_registry", "apostila_stock_debited", "apostila_stock_debited INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "student_registry", "apostila_stock_debited_at", "apostila_stock_debited_at TEXT");

  const eligibleStudents = await db.all(
    `
      SELECT id, student_name, current_lesson, apostila_received, apostila_received_at, apostila_stock_debited, apostila_stock_debited_at
      FROM student_registry
      WHERE CAST(COALESCE(current_lesson, 0) AS REAL) >= 5
      ORDER BY CAST(COALESCE(current_lesson, 0) AS REAL) ASC, student_name COLLATE NOCASE
    `
  );

  let receivedMarked = 0;
  let stockDebited = 0;
  const now = new Date().toISOString();

  for (const student of eligibleStudents) {
    if (Number(student.apostila_received || 0) !== 1) {
      await db.run(
        `
          UPDATE student_registry
          SET apostila_received = 1,
              apostila_received_at = COALESCE(apostila_received_at, ?)
          WHERE id = ?
        `,
        now,
        student.id
      );
      receivedMarked += 1;
    }

    if (Number(student.apostila_stock_debited || 0) === 1) {
      continue;
    }

    const stockItem = await getApostilaInventoryItem(db);
    if (!stockItem || Number(stockItem.quantity || 0) <= 0) {
      continue;
    }

    const updatedQuantity = Number(stockItem.quantity || 0) - 1;
    await db.run("UPDATE inventory SET quantity = ? WHERE id = ?", updatedQuantity, stockItem.id);
    await db.run(
      `
        UPDATE student_registry
        SET apostila_stock_debited = 1,
            apostila_stock_debited_at = COALESCE(apostila_stock_debited_at, ?)
        WHERE id = ?
      `,
      now,
      student.id
    );
    stockDebited += 1;
  }

  return { receivedMarked, stockDebited };
}

async function rebuildAttendanceStats(db) {
  const aggregateRows = await db.all(
    `
      SELECT
        ar.student_id,
        MAX(ar.student_name) AS student_name,
        SUM(CASE WHEN ar.status = 'presence' THEN 1 ELSE 0 END) AS presences_count,
        SUM(CASE WHEN ar.status = 'absence' THEN 1 ELSE 0 END) AS absences_count,
        SUM(CASE WHEN ar.status = 'reposition' THEN 1 ELSE 0 END) AS repositions_count,
        MAX(CASE WHEN ar.status IN ('presence', 'reposition') THEN s.session_date ELSE NULL END) AS last_presence_date
      FROM attendance_records ar
      INNER JOIN attendance_sessions s ON s.id = ar.session_id
      GROUP BY ar.student_id
    `
  );

  await db.run(
    `
      UPDATE student_registry
      SET
        presences_count = 0,
        absences_count = 0,
        repositions_count = 0,
        presence_percent = NULL,
        last_presence_date = NULL
    `
  );

  for (const row of aggregateRows) {
    const presences = normalizeNumber(row.presences_count, 0);
    const absences = normalizeNumber(row.absences_count, 0);
    const repositions = normalizeNumber(row.repositions_count, 0);
    const totalSessions = presences + absences + repositions;
    const presencePercent = totalSessions > 0 ? (presences + repositions) / totalSessions : null;

    await db.run(
      `
        UPDATE student_registry
        SET
          presences_count = ?,
          absences_count = ?,
          repositions_count = ?,
          presence_percent = ?,
          last_presence_date = ?
        WHERE id = ?
      `,
      presences,
      absences,
      repositions,
      presencePercent,
      row.last_presence_date || null,
      row.student_id
    );
  }
}

function normalizePercent(value) {
  const parsed = Number(String(value || "").replace("%", "").replace(",", "."));
  if (!Number.isFinite(parsed)) return null;
  return parsed > 1 ? parsed / 100 : parsed;
}

function normalizeClassDay(value) {
  const normalized = String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const values = {
    segunda: "Segunda",
    terca: "Terça",
    quarta: "Quarta",
    quinta: "Quinta",
    sexta: "Sexta",
    sabado: "Sábado"
  };

  return values[normalized] || "";
}

function parseClassTimeLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

  const rangeMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(?:as|a|ate|-)\s*(\d{1,2})(?::(\d{2}))?/);
  if (rangeMatch) {
    const startHour = rangeMatch[1].padStart(2, "0");
    const startMinute = rangeMatch[2] || "00";
    const endHour = rangeMatch[3].padStart(2, "0");
    const endMinute = rangeMatch[4] || "00";
    return `${startHour}:${startMinute}-${endHour}:${endMinute}`;
  }

  const simpleMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?/);
  if (simpleMatch) {
    return `${simpleMatch[1].padStart(2, "0")}:${simpleMatch[2] || "00"}`;
  }

  return text;
}

function addDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toIsoDateFromUtc(date) {
  return date.toISOString().slice(0, 10);
}

function addDaysToIso(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDateFromUtc(date);
}

function easterSunday(year) {
  // Meeus/Jones/Butcher algorithm (Gregorian calendar)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function ensureDefaultHolidayRules(db) {
  const now = new Date().toISOString();
  const defaults = [
    { name: "Confraternização Universal", day: 1, month: 1, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Tiradentes", day: 21, month: 4, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Dia do Trabalho", day: 1, month: 5, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Independência do Brasil", day: 7, month: 9, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Nossa Senhora Aparecida", day: 12, month: 10, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Finados", day: 2, month: 11, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Proclamação da República", day: 15, month: 11, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Natal", day: 25, month: 12, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Paixão de Cristo", day: null, month: null, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 1, movableRule: "EASTER_OFFSET", offsetDays: -2 },
    { name: "Páscoa", day: null, month: null, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 1, movableRule: "EASTER_OFFSET", offsetDays: 0 },
    { name: "Carnaval (Segunda-feira)", day: null, month: null, type: "FACULTATIVO", municipio: null, uf: null, blocksSchool: 0, dataMovel: 1, movableRule: "EASTER_OFFSET", offsetDays: -48 },
    { name: "Carnaval (Terça-feira)", day: null, month: null, type: "FACULTATIVO", municipio: null, uf: null, blocksSchool: 0, dataMovel: 1, movableRule: "EASTER_OFFSET", offsetDays: -47 },
    { name: "Corpus Christi", day: null, month: null, type: "NACIONAL", municipio: null, uf: null, blocksSchool: 1, dataMovel: 1, movableRule: "EASTER_OFFSET", offsetDays: 60 },
    { name: "Revolução Constitucionalista", day: 9, month: 7, type: "ESTADUAL", municipio: null, uf: "SP", blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Emancipação Político-Administrativa de Paulínia", day: 28, month: 2, type: "MUNICIPAL", municipio: "Paulínia", uf: "SP", blocksSchool: 1, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Sagrado Coração de Jesus (Padroeiro de Paulínia)", day: null, month: null, type: "MUNICIPAL", municipio: "Paulínia", uf: "SP", blocksSchool: 1, dataMovel: 1, movableRule: "EASTER_OFFSET", offsetDays: 68 },
    { name: "Dia dos Namorados", day: 12, month: 6, type: "COMEMORATIVA", municipio: null, uf: null, blocksSchool: 0, dataMovel: 0, movableRule: null, offsetDays: null },
    { name: "Dia das Mães", day: null, month: 5, type: "COMEMORATIVA", municipio: null, uf: null, blocksSchool: 0, dataMovel: 1, movableRule: "NTH_WEEKDAY_OF_MONTH", offsetDays: null, weekday: 0, nthInMonth: 2 },
    { name: "Dia dos Pais", day: null, month: 8, type: "COMEMORATIVA", municipio: null, uf: null, blocksSchool: 0, dataMovel: 1, movableRule: "NTH_WEEKDAY_OF_MONTH", offsetDays: null, weekday: 0, nthInMonth: 2 }
  ];

  for (const rule of defaults) {
    const existing = await db.get(
      `
        SELECT id
        FROM holiday_rules
        WHERE
          name = ?
          AND type = ?
          AND COALESCE(municipio, '') = COALESCE(?, '')
          AND COALESCE(uf, '') = COALESCE(?, '')
      `,
      rule.name,
      rule.type,
      rule.municipio,
      rule.uf
    );

    if (existing) {
      await db.run(
        "UPDATE holiday_rules SET blocks_school = ? WHERE id = ?",
        rule.blocksSchool,
        existing.id
      );
      continue;
    }

    await db.run(
      `
        INSERT INTO holiday_rules (
          id, name, day, month, type, municipio, uf, blocks_school, data_movel, movable_rule, offset_days, weekday, nth_in_month, active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `,
      createId("holiday-rule"),
      rule.name,
      rule.day,
      rule.month,
      rule.type,
      rule.municipio,
      rule.uf,
      rule.blocksSchool,
      rule.dataMovel,
      rule.movableRule,
      rule.offsetDays,
      rule.weekday ?? null,
      rule.nthInMonth ?? null,
      now
    );
  }

  await db.run(
    `
      DELETE FROM calendar_holidays
      WHERE source_rule_id IN (
        SELECT id
        FROM holiday_rules
        WHERE COALESCE(blocks_school, 1) = 0
      )
    `
  );
}

function nthWeekdayOfMonth(year, month, weekday, nthInMonth) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = firstDay.getUTCDay();
  const delta = (weekday - firstWeekday + 7) % 7;
  const day = 1 + delta + (nthInMonth - 1) * 7;
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCMonth() !== month - 1) {
    return "";
  }

  return toIsoDateFromUtc(date);
}

function ruleDateForYear(rule, year) {
  if (!Number(rule.data_movel)) {
    if (!rule.day || !rule.month) return "";
    return `${year}-${String(rule.month).padStart(2, "0")}-${String(rule.day).padStart(2, "0")}`;
  }

  if (rule.movable_rule === "EASTER_OFFSET") {
    const easter = easterSunday(year);
    return addDaysToIso(easter, Number(rule.offset_days || 0));
  }

  if (rule.movable_rule === "NTH_WEEKDAY_OF_MONTH") {
    const month = Number(rule.month || 0);
    const weekday = Number(rule.weekday);
    const nthInMonth = Number(rule.nth_in_month);
    if (!month || !Number.isInteger(weekday) || !nthInMonth) {
      return "";
    }
    return nthWeekdayOfMonth(year, month, weekday, nthInMonth);
  }

  return "";
}

function holidayTypePriority(type) {
  switch (String(type || "").toUpperCase()) {
    case "MUNICIPAL":
      return 5;
    case "ESTADUAL":
      return 4;
    case "NACIONAL":
      return 3;
    case "FACULTATIVO":
      return 2;
    case "COMEMORATIVA":
      return 1;
    default:
      return 0;
  }
}

async function materializeHolidayRules(db, startYear, endYear) {
  const rules = await db.all(
    `
      SELECT *
      FROM holiday_rules
      WHERE active = 1 AND COALESCE(blocks_school, 1) = 1
      ORDER BY type, name
    `
  );

  let inserted = 0;

  for (let year = startYear; year <= endYear; year += 1) {
    for (const rule of rules) {
      const blockedDate = ruleDateForYear(rule, year);
      if (!blockedDate) continue;

      const existing = await db.get(
        "SELECT id, description, holiday_type FROM calendar_holidays WHERE blocked_date = ?",
        blockedDate
      );

      if (!existing) {
        const result = await db.run(
          `
            INSERT INTO calendar_holidays (
              id, blocked_date, description, holiday_type, municipio, uf, source_rule_id, generated_year, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          createId("feriado-auto"),
          blockedDate,
          rule.name,
          rule.type,
          rule.municipio || "",
          rule.uf || "",
          rule.id,
          year,
          new Date().toISOString()
        );
        inserted += Number(result?.changes || 0);
        continue;
      }

      const incomingPriority = holidayTypePriority(rule.type);
      const existingPriority = holidayTypePriority(existing.holiday_type);
      if (incomingPriority > existingPriority) {
        await db.run(
          `
            UPDATE calendar_holidays
            SET description = ?, holiday_type = ?, municipio = ?, uf = ?, source_rule_id = ?, generated_year = ?
            WHERE id = ?
          `,
          rule.name,
          rule.type,
          rule.municipio || "",
          rule.uf || "",
          rule.id,
          year,
          existing.id
        );
      }
    }
  }

  return inserted;
}

function isSunday(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  return date.getUTCDay() === 0;
}

function isDateBlocked(dateString, blockedDates) {
  if (!dateString) return true;
  if (isSunday(dateString)) return true;
  return blockedDates.has(dateString);
}

async function loadBlockedDates(db, controls = []) {
  const currentYear = new Date().getUTCFullYear();
  const startYears = controls
    .map((control) => Number(String(control.start_date || "").slice(0, 4)))
    .filter((year) => Number.isFinite(year) && year > 1999 && year < 2100);

  const minYear = startYears.length ? Math.min(...startYears, currentYear) : currentYear;
  const maxYear = Math.max(currentYear + 3, minYear + 1);
  await materializeHolidayRules(db, minYear, maxYear);

  const blockedDates = new Set();

  const holidays = await db.all("SELECT blocked_date FROM calendar_holidays ORDER BY blocked_date ASC");
  holidays.forEach((holiday) => {
    const date = normalizeDate(holiday.blocked_date);
    if (date) {
      blockedDates.add(date);
    }
  });

  const vacations = await db.all("SELECT start_date, end_date FROM calendar_vacations ORDER BY start_date ASC");
  vacations.forEach((vacation) => {
    let startDate = normalizeDate(vacation.start_date);
    let endDate = normalizeDate(vacation.end_date);
    if (!startDate || !endDate) {
      return;
    }

    if (endDate < startDate) {
      const swap = startDate;
      startDate = endDate;
      endDate = swap;
    }

    let current = startDate;
    while (current <= endDate) {
      blockedDates.add(current);
      current = addDays(current, 1);
    }
  });

  return blockedDates;
}

function countWeeklySessionsInclusive(startDate, endDate, blockedDates) {
  if (!startDate || !endDate || endDate < startDate) {
    return 0;
  }

  let current = startDate;
  let count = 0;

  while (current <= endDate) {
    if (!isDateBlocked(current, blockedDates)) {
      count += 1;
    }
    current = addDays(current, 7);
  }

  return count;
}

function nthSessionDate(startDate, sessionNumber, blockedDates) {
  if (!startDate || sessionNumber <= 0) {
    return "";
  }

  let current = startDate;
  let matchedSessions = 0;

  for (let i = 0; i < 520; i += 1) {
    if (!isDateBlocked(current, blockedDates)) {
      matchedSessions += 1;
      if (matchedSessions === sessionNumber) {
        return current;
      }
    }

    current = addDays(current, 7);
  }

  return "";
}

function calculateProgress(control, blockedDates) {
  const totalHours = normalizeNumber(control.total_hours, 0);
  const weeklyHours = normalizeNumber(control.weekly_hours, 2) || 2;
  const startDate = normalizeDate(control.start_date);
  const today = normalizeDate(new Date());

  const completedSessions = countWeeklySessionsInclusive(startDate, today, blockedDates);
  const consumedHours = completedSessions * weeklyHours;
  const percentComplete = totalHours > 0 ? consumedHours / totalHours : 0;

  const sessionsForNinety = Math.max(0, Math.ceil((totalHours * 0.9) / weeklyHours));
  const sessionsForHundred = Math.max(0, Math.ceil(totalHours / weeklyHours));

  const projectedNinetyDate = nthSessionDate(startDate, sessionsForNinety, blockedDates);
  const projectedHundredDate = nthSessionDate(startDate, sessionsForHundred, blockedDates);

  let status = "OK";
  if (consumedHours >= totalHours) {
    status = "ESTOUROU";
  } else if (consumedHours >= totalHours * 0.9) {
    status = "ATENÇÃO 90%";
  }

  return {
    id: control.id,
    courseId: control.course_id,
    courseName: control.course_name,
    studentName: control.student_name,
    responsible: control.responsible,
    notes: control.notes || "",
    startDate,
    weeklyHours,
    totalHours,
    completedSessions,
    consumedHours,
    remainingHours: Math.max(totalHours - consumedHours, 0),
    percentComplete,
    projectedNinetyDate,
    projectedHundredDate,
    status
  };
}

function getStudentStartDate(student) {
  return normalizeDate(student.register_start_date || "");
}

function calculateStudentProjection(student, blockedDates) {
  const startDate = getStudentStartDate(student);
  const contractedHours = normalizeNumber(student.contracted_hours, 0);
  const completedHours = normalizeNumber(student.completed_hours, 0);
  const today = normalizeDate(new Date());
  const plannedSessions = contractedHours > 0 ? Math.ceil(contractedHours / 2) : 0;
  const plannedCompletionDate = startDate && plannedSessions > 0
    ? nthSessionDate(startDate, plannedSessions, blockedDates)
    : "";

  if (!startDate || contractedHours <= 0) {
    const overrunHours = Math.max(completedHours - contractedHours, 0);
    const rhythmStatus = contractedHours > 0 && overrunHours > 0
      ? "ESTOUROU"
      : (startDate ? "SEM CARGA" : "SEM DATA INICIAL");

    return {
      startDate,
      contractedHours,
      completedHours,
      remainingHours: Math.max(contractedHours - completedHours, 0),
      elapsedSessions: 0,
      expectedCompletedHours: 0,
      averageHoursPerSession: 0,
      rhythmStatus,
      projectedCompletionDate: "",
      plannedCompletionDate,
      overrunHours,
      percentComplete: contractedHours > 0 ? completedHours / contractedHours : 0,
      projectionSource: "INSUFICIENTE"
    };
  }

  const elapsedSessions = countWeeklySessionsInclusive(startDate, today, blockedDates);
  const expectedCompletedHours = elapsedSessions * 2;
  const averageHoursPerSession = elapsedSessions > 0 && completedHours > 0
    ? completedHours / elapsedSessions
    : 2;
  const effectiveHoursPerSession = averageHoursPerSession > 0 ? averageHoursPerSession : 2;
  const remainingHours = Math.max(contractedHours - completedHours, 0);
  const overrunHours = Math.max(completedHours - contractedHours, 0);
  const additionalSessionsNeeded = remainingHours > 0 ? Math.ceil(remainingHours / effectiveHoursPerSession) : 0;
  const projectedCompletionDate = remainingHours <= 0
    ? plannedCompletionDate
    : nthSessionDate(startDate, elapsedSessions + additionalSessionsNeeded, blockedDates);

  let rhythmStatus = "NO RITMO";
  const deltaHours = completedHours - expectedCompletedHours;
  if (deltaHours >= 8) {
    rhythmStatus = "ADIANTADO";
  } else if (deltaHours <= -8) {
    rhythmStatus = "ATRASADO";
  }

  if (completedHours > contractedHours && contractedHours > 0) {
    rhythmStatus = "ESTOUROU";
  } else if (completedHours >= contractedHours && contractedHours > 0) {
    rhythmStatus = "CONCLUÍDO";
  }

  return {
    startDate,
    contractedHours,
    completedHours,
    remainingHours,
    elapsedSessions,
    expectedCompletedHours,
    averageHoursPerSession,
    rhythmStatus,
    projectedCompletionDate,
    plannedCompletionDate,
    overrunHours,
    percentComplete: contractedHours > 0 ? completedHours / contractedHours : 0,
    projectionSource: "CALCULADO"
  };
}

async function getCourseById(db, courseId) {
  return db.get("SELECT * FROM course_catalog WHERE id = ?", courseId);
}

async function getStudentByIdForControlValidation(db, studentId) {
  return db.get(
    `
      SELECT id, student_name, normalized_name, enrolled_in
      FROM student_registry
      WHERE id = ?
    `,
    studentId
  );
}

async function validateCourseForStudentProgramming(db, { studentId, studentName, courseName }) {
  const hasStudentRegistry = await db.get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'student_registry'"
  );

  if (!hasStudentRegistry) {
    return {
      ok: false,
      error: "Base de alunos não encontrada. Importe os alunos para validar a programação."
    };
  }

  const normalizedStudentId = String(studentId || "").trim();
  if (!normalizedStudentId) {
    return {
      ok: false,
      error: "Selecione um aluno importado para vincular o acompanhamento à programação."
    };
  }

  const student = await getStudentByIdForControlValidation(db, normalizedStudentId);
  if (!student) {
    return {
      ok: false,
      error: "Aluno importado não encontrado para validação da programação."
    };
  }

  const normalizedProvidedName = normalizeLookupText(studentName);
  const normalizedRegistryName = normalizeLookupText(student.student_name);
  if (normalizedProvidedName && normalizedRegistryName && normalizedProvidedName !== normalizedRegistryName) {
    return {
      ok: false,
      error: "O nome digitado não corresponde ao aluno importado selecionado."
    };
  }

  const plannedCourseNames = parsePlannedCourseNames(student.enrolled_in);
  if (!plannedCourseNames.length) {
    return {
      ok: false,
      error: `Aluno ${student.student_name} sem programação de cursos cadastrada.`
    };
  }

  if (!isCourseNameInPlannedList(courseName, plannedCourseNames)) {
    return {
      ok: false,
      error: `O curso selecionado não pertence à programação do aluno ${student.student_name}.`
    };
  }

  return { ok: true, student };
}

async function getControlById(db, controlId) {
  return db.get(
    `
      SELECT
        cc.*,
        c.name AS course_name,
        c.total_hours
      FROM course_controls cc
      INNER JOIN course_catalog c ON c.id = cc.course_id
      WHERE cc.id = ?
    `,
    controlId
  );
}

async function findInventoryItem(db, name, module) {
  return db.get(
    "SELECT * FROM inventory WHERE LOWER(TRIM(name)) = ? AND LOWER(TRIM(module)) = ?",
    normalizeText(name),
    normalizeText(module)
  );
}

async function upsertInventory(db, name, module, quantity) {
  const existing = await findInventoryItem(db, name, module);
  if (existing) {
    const updatedQuantity = existing.quantity + quantity;
    await db.run("UPDATE inventory SET quantity = ? WHERE id = ?", updatedQuantity, existing.id);
    return { ...existing, quantity: updatedQuantity };
  }

  const id = `mat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await db.run(
    "INSERT INTO inventory (id, name, module, quantity) VALUES (?, ?, ?, ?)",
    id,
    name.trim(),
    module.trim(),
    quantity
  );
  return { id, name: name.trim(), module: module.trim(), quantity };
}

app.get("/api/inventory", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all("SELECT * FROM inventory ORDER BY name COLLATE NOCASE");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all("SELECT * FROM history ORDER BY date DESC");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/cursos", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all("SELECT * FROM course_catalog ORDER BY name COLLATE NOCASE");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/alunos", async (req, res) => {
  try {
    const db = await initDb();

    const hasStudentRegistry = await db.get(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'student_registry'"
    );

    if (!hasStudentRegistry) {
      return res.json([]);
    }

    const students = await db.all(
      `
        SELECT
          id,
          student_name,
          normalized_name,
          enrolled_in,
          responsible,
          absences_count,
          last_presence_date,
          contracted_hours,
          completed_hours,
          installments_remaining,
          contract_start_date,
          register_start_date,
          register_created_date,
          status_start_date,
          phone,
          package_percent,
          completed_sessions_count,
          extra_sessions_count,
          scheduled_sessions_count,
          presences_count,
          repositions_count,
          presence_percent,
          schedule_note,
          class_day,
          class_time,
          current_course,
          current_lesson,
          apostila_received,
          apostila_received_at,
          apostila_stock_debited,
          apostila_stock_debited_at,
          updated_at
        FROM student_registry
        ORDER BY student_name COLLATE NOCASE
      `
    );

    const blockedDates = await loadBlockedDates(
      db,
      students.map((student) => ({ start_date: getStudentStartDate(student) })).filter((student) => student.start_date)
    );

    res.json(
      students.map((student) => {
        const projection = calculateStudentProjection(student, blockedDates);
        const hoursRemaining = Math.max(
          normalizeNumber(student.contracted_hours, 0) - normalizeNumber(student.completed_hours, 0),
          0
        );

        return {
          ...student,
          hours_remaining: hoursRemaining,
          projected_end_date: projection.projectedCompletionDate,
          package_percent: normalizePercent(student.package_percent),
          completed_sessions_count: normalizeNumber(student.completed_sessions_count, 0),
          extra_sessions_count: normalizeNumber(student.extra_sessions_count, 0),
          scheduled_sessions_count: normalizeNumber(student.scheduled_sessions_count, 0),
          presences_count: normalizeNumber(student.presences_count, 0),
          repositions_count: normalizeNumber(student.repositions_count, 0),
          presence_percent: normalizePercent(student.presence_percent),
          schedule_note: student.schedule_note || "",
          class_day: normalizeClassDay(student.class_day || ""),
          class_time: parseClassTimeLabel(student.class_time || ""),
          current_course: student.current_course || "",
          current_lesson: normalizeNumber(student.current_lesson, 0),
          apostila_received: Number(student.apostila_received || 0) === 1,
          apostila_received_at: student.apostila_received_at || "",
          apostila_stock_debited: Number(student.apostila_stock_debited || 0) === 1,
          apostila_stock_debited_at: student.apostila_stock_debited_at || "",
          projection
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/alunos/:id", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const db = await initDb();
    const current = await db.get("SELECT * FROM student_registry WHERE id = ?", req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Student not found." });
    }

    const studentName = String(req.body?.studentName || current.student_name || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const responsible = String(req.body?.responsible || "").trim();
    const contractedHours = req.body?.contractedHours === "" || req.body?.contractedHours === null || req.body?.contractedHours === undefined
      ? null
      : normalizeNumber(req.body?.contractedHours, current.contracted_hours);
    const completedHours = req.body?.completedHours === "" || req.body?.completedHours === null || req.body?.completedHours === undefined
      ? null
      : normalizeNumber(req.body?.completedHours, current.completed_hours);
    const registerStartDate = normalizeDate(req.body?.registerStartDate || current.register_start_date || "");
    const statusStartDate = normalizeDate(req.body?.statusStartDate || current.status_start_date || "");
    const absencesCount = req.body?.absencesCount === "" || req.body?.absencesCount === null || req.body?.absencesCount === undefined
      ? null
      : normalizeNumber(req.body?.absencesCount, current.absences_count);
    const lastPresenceDate = normalizeDate(req.body?.lastPresenceDate || current.last_presence_date || "");
    const classDay = normalizeClassDay(req.body?.classDay || current.class_day || "");
    const classTime = String(req.body?.classTime || current.class_time || "").trim();
    const currentCourse = String(req.body?.currentCourse || current.current_course || "").trim();
    const currentLesson = req.body?.currentLesson === "" || req.body?.currentLesson === null || req.body?.currentLesson === undefined
      ? null
      : normalizeNumber(req.body?.currentLesson, current.current_lesson);

    if (!studentName) {
      return res.status(400).json({ error: "studentName is required." });
    }

    const normalizedName = studentName.toUpperCase();
    const looseName = studentName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(da|de|do|das|dos|e)\b/g, " ")
      .replace(/[^a-z0-9]/g, "")
      .replace(/(.)\1+/g, "$1")
      .trim();

    const updatedAt = new Date().toISOString();
    await db.run(
      `
        UPDATE student_registry SET
          student_name = ?,
          normalized_name = ?,
          loose_name = ?,
          phone = ?,
          responsible = ?,
          contracted_hours = COALESCE(?, contracted_hours),
          completed_hours = COALESCE(?, completed_hours),
          register_start_date = ?,
          status_start_date = ?,
          absences_count = COALESCE(?, absences_count),
          last_presence_date = ?,
          class_day = ?,
          class_time = ?,
          current_course = ?,
          current_lesson = COALESCE(?, current_lesson),
          updated_at = ?
        WHERE id = ?
      `,
      studentName,
      normalizedName,
      looseName,
      phone,
      responsible,
      contractedHours,
      completedHours,
      registerStartDate || null,
      statusStartDate || null,
      absencesCount,
      lastPresenceDate || null,
      classDay || null,
      classTime || null,
      currentCourse || null,
      currentLesson,
      updatedAt,
      req.params.id
    );

    await syncApostilaReceipts(db);

    await registerAuditLog(db, {
      entityType: "student",
      entityId: req.params.id,
      action: "UPDATE",
      changedBy,
      changeSummary: `Aluno atualizado: ${studentName}`
    });

    res.json({ ok: true, id: req.params.id, updatedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cursos", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const { name, totalHours } = req.body;
    const normalizedName = String(name || "").trim();
    const normalizedHours = normalizeNumber(totalHours, 0);

    if (!normalizedName || normalizedHours <= 0) {
      return res.status(400).json({ error: "name and totalHours are required." });
    }

    const db = await initDb();
    const id = createId("curso");
    const createdAt = new Date().toISOString();

    await db.run(
      "INSERT INTO course_catalog (id, name, total_hours, created_at) VALUES (?, ?, ?, ?)",
      id,
      normalizedName,
      normalizedHours,
      createdAt
    );

    await registerAuditLog(db, {
      entityType: "course",
      entityId: id,
      action: "CREATE",
      changedBy,
      changeSummary: `Curso criado: ${normalizedName} (${normalizedHours}h)`
    });

    res.json({ id, name: normalizedName, totalHours: normalizedHours, createdAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/cursos/:id", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const { name, totalHours } = req.body;
    const normalizedName = String(name || "").trim();
    const normalizedHours = normalizeNumber(totalHours, 0);

    if (!normalizedName || normalizedHours <= 0) {
      return res.status(400).json({ error: "name and totalHours are required." });
    }

    const db = await initDb();
    const current = await db.get("SELECT * FROM course_catalog WHERE id = ?", req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Course not found." });
    }

    const updatedAt = new Date().toISOString();
    await db.run(
      "UPDATE course_catalog SET name = ?, total_hours = ?, updated_at = ? WHERE id = ?",
      normalizedName,
      normalizedHours,
      updatedAt,
      req.params.id
    );

    await registerAuditLog(db, {
      entityType: "course",
      entityId: req.params.id,
      action: "UPDATE",
      changedBy,
      changeSummary: `Curso atualizado: ${current.name} -> ${normalizedName}; ${current.total_hours}h -> ${normalizedHours}h`
    });

    res.json({ id: req.params.id, name: normalizedName, totalHours: normalizedHours, updatedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cursos/:id", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const db = await initDb();
    const current = await db.get("SELECT * FROM course_catalog WHERE id = ?", req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Course not found." });
    }

    const controlsUsingCourse = await db.get("SELECT COUNT(*) AS c FROM course_controls WHERE course_id = ?", req.params.id);
    if (controlsUsingCourse.c > 0) {
      return res.status(400).json({
        error: "Este curso possui acompanhamentos vinculados. Exclua os acompanhamentos antes de remover o curso."
      });
    }

    await db.run("DELETE FROM course_catalog WHERE id = ?", req.params.id);

    await registerAuditLog(db, {
      entityType: "course",
      entityId: req.params.id,
      action: "DELETE",
      changedBy,
      changeSummary: `Curso removido: ${current.name} (${current.total_hours}h)`
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/controle", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all(
      `
        SELECT
          cc.*,
          c.name AS course_name,
          c.total_hours
        FROM course_controls cc
        INNER JOIN course_catalog c ON c.id = cc.course_id
        ORDER BY cc.created_at DESC
      `
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/controle", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const { courseId, studentId = "", studentName, startDate, weeklyHours = 2, responsible, notes = "" } = req.body;
    const normalizedStudentName = String(studentName || "").trim();
    const normalizedStartDate = normalizeDate(startDate);
    const normalizedWeeklyHours = normalizeNumber(weeklyHours, 2);
    const normalizedResponsible = String(responsible || "").trim();

    if (!courseId || !normalizedStudentName || !normalizedStartDate || normalizedWeeklyHours <= 0 || !normalizedResponsible) {
      return res.status(400).json({
        error: "courseId, studentName, startDate, weeklyHours and responsible are required."
      });
    }

    const db = await initDb();
    const course = await getCourseById(db, courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    const programmingValidation = await validateCourseForStudentProgramming(db, {
      studentId,
      studentName: normalizedStudentName,
      courseName: course.name
    });
    if (!programmingValidation.ok) {
      return res.status(400).json({ error: programmingValidation.error });
    }

    const id = createId("ctrl");
    const createdAt = new Date().toISOString();

    await db.run(
      `
        INSERT INTO course_controls (
          id, course_id, student_id, student_name, start_date, weekly_hours, responsible, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      courseId,
      String(studentId || "").trim(),
      normalizedStudentName,
      normalizedStartDate,
      normalizedWeeklyHours,
      normalizedResponsible,
      String(notes || "").trim(),
      createdAt,
      createdAt
    );

    await registerAuditLog(db, {
      entityType: "control",
      entityId: id,
      action: "CREATE",
      changedBy,
      changeSummary: `Acompanhamento criado para ${normalizedStudentName} no curso ${course.name}`
    });

    res.json({
      id,
      courseId,
      studentId: String(studentId || "").trim(),
      studentName: normalizedStudentName,
      startDate: normalizedStartDate,
      weeklyHours: normalizedWeeklyHours,
      responsible: normalizedResponsible,
      notes: String(notes || "").trim(),
      createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/controle/:id", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const { courseId, studentId = "", studentName, startDate, weeklyHours = 2, responsible, notes = "" } = req.body;
    const normalizedStudentName = String(studentName || "").trim();
    const normalizedStartDate = normalizeDate(startDate);
    const normalizedWeeklyHours = normalizeNumber(weeklyHours, 2);
    const normalizedResponsible = String(responsible || "").trim();

    if (!courseId || !normalizedStudentName || !normalizedStartDate || normalizedWeeklyHours <= 0 || !normalizedResponsible) {
      return res.status(400).json({
        error: "courseId, studentName, startDate, weeklyHours and responsible are required."
      });
    }

    const db = await initDb();
    const current = await db.get("SELECT * FROM course_controls WHERE id = ?", req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Control not found." });
    }

    const course = await getCourseById(db, courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    const programmingValidation = await validateCourseForStudentProgramming(db, {
      studentId,
      studentName: normalizedStudentName,
      courseName: course.name
    });
    if (!programmingValidation.ok) {
      return res.status(400).json({ error: programmingValidation.error });
    }

    const updatedAt = new Date().toISOString();
    await db.run(
      `
        UPDATE course_controls
        SET course_id = ?, student_id = ?, student_name = ?, start_date = ?, weekly_hours = ?, responsible = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `,
      courseId,
      String(studentId || "").trim(),
      normalizedStudentName,
      normalizedStartDate,
      normalizedWeeklyHours,
      normalizedResponsible,
      String(notes || "").trim(),
      updatedAt,
      req.params.id
    );

    await registerAuditLog(db, {
      entityType: "control",
      entityId: req.params.id,
      action: "UPDATE",
      changedBy,
      changeSummary: `Acompanhamento atualizado para ${normalizedStudentName} (${course.name})`
    });

    res.json({ success: true, updatedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/controle/:id", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const db = await initDb();
    const current = await db.get("SELECT * FROM course_controls WHERE id = ?", req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Control not found." });
    }

    await db.run("DELETE FROM course_controls WHERE id = ?", req.params.id);

    await registerAuditLog(db, {
      entityType: "control",
      entityId: req.params.id,
      action: "DELETE",
      changedBy,
      changeSummary: `Acompanhamento removido de ${current.student_name}`
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/calendario/feriados", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all("SELECT * FROM calendar_holidays ORDER BY blocked_date ASC");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/calendario/feriados/regras", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all(
      `
        SELECT id, name, day, month, type, municipio, uf, blocks_school, data_movel, movable_rule, offset_days, active
        FROM holiday_rules
        ORDER BY
          CASE type WHEN 'NACIONAL' THEN 1 WHEN 'ESTADUAL' THEN 2 WHEN 'MUNICIPAL' THEN 3 ELSE 4 END,
          name COLLATE NOCASE
      `
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/calendario/feriados/regras/:id", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const blocksSchool = req.body?.blocksSchool;
    const active = req.body?.active;

    if (blocksSchool === undefined && active === undefined) {
      return res.status(400).json({ error: "Informe blocksSchool e/ou active." });
    }

    const db = await initDb();
    const current = await db.get("SELECT * FROM holiday_rules WHERE id = ?", req.params.id);
    if (!current) {
      return res.status(404).json({ error: "Regra de feriado não encontrada." });
    }

    const nextBlocksSchool = blocksSchool === undefined ? Number(current.blocks_school || 0) : (blocksSchool ? 1 : 0);
    const nextActive = active === undefined ? Number(current.active || 0) : (active ? 1 : 0);

    await db.run(
      "UPDATE holiday_rules SET blocks_school = ?, active = ? WHERE id = ?",
      nextBlocksSchool,
      nextActive,
      req.params.id
    );

    if (!nextBlocksSchool || !nextActive) {
      await db.run("DELETE FROM calendar_holidays WHERE source_rule_id = ?", req.params.id);
    } else {
      const year = new Date().getUTCFullYear();
      await materializeHolidayRules(db, year, year + 3);
    }

    await registerAuditLog(db, {
      entityType: "holiday-rule",
      entityId: req.params.id,
      action: "UPDATE",
      changedBy,
      changeSummary: `Regra ${current.name}: bloqueia=${nextBlocksSchool ? "sim" : "não"}; ativa=${nextActive ? "sim" : "não"}`
    });

    const updated = await db.get(
      `
        SELECT id, name, day, month, type, municipio, uf, blocks_school, data_movel, movable_rule, offset_days, active
        FROM holiday_rules
        WHERE id = ?
      `,
      req.params.id
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/calendario/feriados/regras/gerar", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const yearStart = normalizeNumber(req.body?.yearStart, new Date().getUTCFullYear());
    const yearEnd = normalizeNumber(req.body?.yearEnd, yearStart + 1);

    if (!Number.isInteger(yearStart) || !Number.isInteger(yearEnd) || yearStart < 2000 || yearEnd < yearStart || yearEnd > yearStart + 10) {
      return res.status(400).json({ error: "yearStart/yearEnd inválidos." });
    }

    const db = await initDb();
    const inserted = await materializeHolidayRules(db, yearStart, yearEnd);

    await registerAuditLog(db, {
      entityType: "holiday-rule",
      entityId: `${yearStart}-${yearEnd}`,
      action: "GENERATE",
      changedBy,
      changeSummary: `Feriados gerados por regras (${yearStart}-${yearEnd}). Inseridos: ${inserted}`
    });

    res.json({ success: true, yearStart, yearEnd, inserted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/calendario/feriados", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const { blockedDate, description = "" } = req.body;
    const normalizedDate = normalizeDate(blockedDate);

    if (!normalizedDate) {
      return res.status(400).json({ error: "blockedDate is required." });
    }

    const db = await initDb();
    const id = createId("feriado");
    const createdAt = new Date().toISOString();

    await db.run(
      "INSERT INTO calendar_holidays (id, blocked_date, description, created_at) VALUES (?, ?, ?, ?)",
      id,
      normalizedDate,
      String(description || "").trim(),
      createdAt
    );

    await registerAuditLog(db, {
      entityType: "holiday",
      entityId: id,
      action: "CREATE",
      changedBy,
      changeSummary: `Feriado cadastrado em ${normalizedDate}`
    });

    res.json({ id, blockedDate: normalizedDate, description: String(description || "").trim(), createdAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/calendario/ferias", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all("SELECT * FROM calendar_vacations ORDER BY start_date ASC");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/calendario/ferias", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const { startDate, endDate, description = "" } = req.body;
    let normalizedStartDate = normalizeDate(startDate);
    let normalizedEndDate = normalizeDate(endDate);

    if (!normalizedStartDate || !normalizedEndDate) {
      return res.status(400).json({ error: "startDate and endDate are required." });
    }

    if (normalizedEndDate < normalizedStartDate) {
      const swap = normalizedStartDate;
      normalizedStartDate = normalizedEndDate;
      normalizedEndDate = swap;
    }

    const db = await initDb();
    const id = createId("ferias");
    const createdAt = new Date().toISOString();

    await db.run(
      "INSERT INTO calendar_vacations (id, start_date, end_date, description, created_at) VALUES (?, ?, ?, ?, ?)",
      id,
      normalizedStartDate,
      normalizedEndDate,
      String(description || "").trim(),
      createdAt
    );

    await registerAuditLog(db, {
      entityType: "vacation",
      entityId: id,
      action: "CREATE",
      changedBy,
      changeSummary: `Férias cadastradas de ${normalizedStartDate} até ${normalizedEndDate}`
    });

    res.json({
      id,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      description: String(description || "").trim(),
      createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/progresso", async (req, res) => {
  try {
    const db = await initDb();
    const controls = await db.all(
      `
        SELECT
          cc.*,
          c.name AS course_name,
          c.total_hours
        FROM course_controls cc
        INNER JOIN course_catalog c ON c.id = cc.course_id
        ORDER BY cc.created_at DESC
      `
    );

    const blockedDates = await loadBlockedDates(db, controls);
    const payload = controls.map((control) => calculateProgress(control, blockedDates));
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/progresso/:id", async (req, res) => {
  try {
    const db = await initDb();
    const control = await getControlById(db, req.params.id);
    if (!control) {
      return res.status(404).json({ error: "Control not found." });
    }

    const blockedDates = await loadBlockedDates(db, [control]);
    res.json(calculateProgress(control, blockedDates));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/apostilas", async (req, res) => {
  try {
    const db = await initDb();
    const hasStudentRegistry = await db.get(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'student_registry'"
    );

    if (!hasStudentRegistry) {
      return res.json({ summary: { eligibleCount: 0, receivedCount: 0, stockDebitedCount: 0, pendingDebitCount: 0, stockQuantity: 0, purchaseRequired: false, purchaseQuantity: 0 }, students: [] });
    }

    const stockItem = await getApostilaInventoryItem(db);
    const students = await db.all(
      `
        SELECT
          id,
          student_name,
          current_course,
          current_lesson,
          class_day,
          class_time,
          apostila_received,
          apostila_received_at,
          apostila_stock_debited,
          apostila_stock_debited_at
        FROM student_registry
        WHERE CAST(COALESCE(current_lesson, 0) AS REAL) >= 5
           OR COALESCE(apostila_received, 0) = 1
        ORDER BY CAST(COALESCE(current_lesson, 0) AS REAL) DESC, student_name COLLATE NOCASE
      `
    );

    const eligibleCount = students.filter((student) => normalizeNumber(student.current_lesson, 0) >= 5).length;
    const receivedCount = students.filter((student) => Number(student.apostila_received || 0) === 1).length;
    const stockDebitedCount = students.filter((student) => Number(student.apostila_stock_debited || 0) === 1).length;
    const pendingDebitCount = Math.max(receivedCount - stockDebitedCount, 0);
    const stockQuantity = stockItem ? normalizeNumber(stockItem.quantity, 0) : 0;

    res.json({
      summary: {
        eligibleCount,
        receivedCount,
        stockDebitedCount,
        pendingDebitCount,
        stockQuantity,
        purchaseRequired: pendingDebitCount > 0,
        purchaseQuantity: pendingDebitCount
      },
      students: students.map((student) => ({
        ...student,
        current_lesson: normalizeNumber(student.current_lesson, 0),
        current_course: student.current_course || "",
        class_day: normalizeClassDay(student.class_day || ""),
        class_time: parseClassTimeLabel(student.class_time || ""),
        apostila_received: Number(student.apostila_received || 0) === 1,
        apostila_received_at: student.apostila_received_at || "",
        apostila_stock_debited: Number(student.apostila_stock_debited || 0) === 1,
        apostila_stock_debited_at: student.apostila_stock_debited_at || ""
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/presencas", async (req, res) => {
  try {
    const classDay = String(req.query.classDay || "").trim();
    const classTime = String(req.query.classTime || "").trim();
    const sessionDate = normalizeDate(req.query.sessionDate || "");

    if (!classDay || !classTime || !sessionDate) {
      return res.status(400).json({ error: "classDay, classTime and sessionDate are required." });
    }

    const db = await initDb();
    const session = await db.get(
      `
        SELECT *
        FROM attendance_sessions
        WHERE class_day = ? AND class_time = ? AND session_date = ?
      `,
      classDay,
      classTime,
      sessionDate
    );

    if (!session) {
      return res.json({ session: null, records: [] });
    }

    const records = await db.all(
      `
        SELECT *
        FROM attendance_records
        WHERE session_id = ?
        ORDER BY student_name COLLATE NOCASE
      `,
      session.id
    );

    res.json({ session, records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/presencas", async (req, res) => {
  try {
    const changedBy = requireChangedBy(req, res);
    if (!changedBy) return;

    const classDay = String(req.body?.classDay || "").trim();
    const classTime = String(req.body?.classTime || "").trim();
    const sessionDate = normalizeDate(req.body?.sessionDate || "");
    const recordsInput = Array.isArray(req.body?.records) ? req.body.records : [];

    if (!classDay || !classTime || !sessionDate || !recordsInput.length) {
      return res.status(400).json({ error: "classDay, classTime, sessionDate and records are required." });
    }

    const db = await initDb();
    const recordStudentIds = recordsInput
      .map((record) => String(record?.studentId || record?.student_id || "").trim())
      .filter(Boolean);

    let students = [];
    if (recordStudentIds.length) {
      const placeholders = recordStudentIds.map(() => "?").join(", ");
      students = await db.all(
        `
          SELECT id, student_name, class_day, class_time
          FROM student_registry
          WHERE id IN (${placeholders})
          ORDER BY student_name COLLATE NOCASE
        `,
        ...recordStudentIds
      );
    }

    if (!students.length) {
      students = await db.all(
        `
          SELECT id, student_name, class_day, class_time
          FROM student_registry
          WHERE LOWER(TRIM(class_day)) = LOWER(TRIM(?))
            AND LOWER(TRIM(class_time)) = LOWER(TRIM(?))
          ORDER BY student_name COLLATE NOCASE
        `,
        classDay,
        classTime
      );
    }

    const sessionId = createId("att");
    const now = new Date().toISOString();
    const existingSession = await db.get(
      `
        SELECT *
        FROM attendance_sessions
        WHERE class_day = ? AND class_time = ? AND session_date = ?
      `,
      classDay,
      classTime,
      sessionDate
    );

    const activeSessionId = existingSession ? existingSession.id : sessionId;

    if (existingSession) {
      await db.run(
        `
          UPDATE attendance_sessions
          SET created_by = ?, updated_at = ?
          WHERE id = ?
        `,
        changedBy,
        now,
        existingSession.id
      );
      await db.run("DELETE FROM attendance_records WHERE session_id = ?", existingSession.id);
    } else {
      await db.run(
        `
          INSERT INTO attendance_sessions (
            id, class_day, class_time, session_date, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        activeSessionId,
        classDay,
        classTime,
        sessionDate,
        changedBy,
        now,
        now
      );
    }

    const studentById = new Map(students.map((student) => [String(student.id), student]));
    const savedRecords = [];

    for (const record of recordsInput) {
      const studentId = String(record?.studentId || "").trim();
      const student = studentById.get(studentId);
      if (!student) continue;

      const normalizedStatus = normalizeAttendanceStatus(record?.status);
      const notes = String(record?.notes || "").trim();

      await db.run(
        `
          INSERT INTO attendance_records (
            id, session_id, student_id, student_name, status, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        createId("attrec"),
        activeSessionId,
        student.id,
        student.student_name,
        normalizedStatus,
        notes,
        now,
        now
      );

      await db.run(
        `
          UPDATE student_registry
          SET attendance_status = ?, updated_at = ?
          WHERE id = ?
        `,
        attendanceStatusLabel(normalizedStatus),
        now,
        student.id
      );

      savedRecords.push({
        studentId: student.id,
        studentName: student.student_name,
        status: normalizedStatus,
        notes
      });
    }

    await rebuildAttendanceStats(db);

    await registerAuditLog(db, {
      entityType: "attendance",
      entityId: activeSessionId,
      action: existingSession ? "UPDATE" : "CREATE",
      changedBy,
      changeSummary: `${classDay} ${classTime} em ${sessionDate}: ${savedRecords.length} registro(s)`
    });

    res.json({
      sessionId: activeSessionId,
      classDay,
      classTime,
      sessionDate,
      records: savedRecords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/presencas/historico", async (req, res) => {
  try {
    const db = await initDb();
    const sessions = await db.all(
      `
        SELECT
          s.id,
          s.class_day,
          s.class_time,
          s.session_date,
          s.created_by,
          s.created_at,
          s.updated_at,
          COUNT(r.id) AS total_records,
          SUM(CASE WHEN r.status = 'presence' THEN 1 ELSE 0 END) AS presences_count,
          SUM(CASE WHEN r.status = 'absence' THEN 1 ELSE 0 END) AS absences_count,
          SUM(CASE WHEN r.status = 'reposition' THEN 1 ELSE 0 END) AS repositions_count
        FROM attendance_sessions s
        LEFT JOIN attendance_records r ON r.session_id = s.id
        GROUP BY s.id
        ORDER BY s.session_date DESC, s.class_day ASC, s.class_time ASC
      `
    );

    res.json(
      sessions.map((session) => ({
        ...session,
        total_records: normalizeNumber(session.total_records, 0),
        presences_count: normalizeNumber(session.presences_count, 0),
        absences_count: normalizeNumber(session.absences_count, 0),
        repositions_count: normalizeNumber(session.repositions_count, 0)
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auditoria", async (req, res) => {
  try {
    const db = await initDb();
    const items = await db.all(
      "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 300"
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const { name, module, quantity, responsible } = req.body;
    if (!name || !module || !quantity || !responsible) {
      return res.status(400).json({ error: "name, module, quantity and responsible are required." });
    }

    const db = await initDb();
    const item = await upsertInventory(db, name, module, quantity);
    const historyId = `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await db.run(
      "INSERT INTO history (id, action, responsible, student, material, module, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      historyId,
      "Entrada",
      responsible.trim(),
      "",
      item.name,
      item.module,
      quantity,
      new Date().toISOString()
    );

    await syncApostilaReceipts(db);

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/withdraw", async (req, res) => {
  try {
    const { materialId, quantity, student, responsible, date } = req.body;
    if (!materialId || !quantity || !student || !responsible || !date) {
      return res.status(400).json({ error: "materialId, quantity, student, responsible and date are required." });
    }

    const db = await initDb();
    const item = await db.get("SELECT * FROM inventory WHERE id = ?", materialId);
    if (!item) {
      return res.status(404).json({ error: "Material not found." });
    }

    if (quantity > item.quantity) {
      return res.status(400).json({ error: "Quantidade de retirada maior do que o estoque disponível." });
    }

    const updatedQuantity = item.quantity - quantity;
    await db.run("UPDATE inventory SET quantity = ? WHERE id = ?", updatedQuantity, materialId);

    const historyId = `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await db.run(
      "INSERT INTO history (id, action, responsible, student, material, module, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      historyId,
      "Saída",
      responsible.trim(),
      student.trim(),
      item.name,
      item.module,
      quantity,
      date
    );

    res.json({ ...item, quantity: updatedQuantity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor de API iniciado em http://0.0.0.0:${PORT}`);
});
