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
  `);

  await ensureColumn(db, "course_controls", "student_id", "student_id TEXT");
  await ensureColumn(db, "course_controls", "updated_at", "updated_at TEXT");
  await ensureColumn(db, "course_catalog", "updated_at", "updated_at TEXT");

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
  }

  return db;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(text) {
  return text ? text.trim().toLowerCase() : "";
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

function addDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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

async function loadBlockedDates(db) {
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

async function getCourseById(db, courseId) {
  return db.get("SELECT * FROM course_catalog WHERE id = ?", courseId);
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
          responsible,
          attendance_status,
          absences_count,
          last_presence_date,
          contracted_hours,
          completed_hours,
          phone,
          updated_at
        FROM student_registry
        ORDER BY student_name COLLATE NOCASE
      `
    );

    res.json(students);
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

    const blockedDates = await loadBlockedDates(db);
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

    const blockedDates = await loadBlockedDates(db);
    res.json(calculateProgress(control, blockedDates));
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
