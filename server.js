const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "database.sqlite");

app.use(cors());
app.use(express.json());

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
  `);

  return db;
}

function normalizeText(text) {
  return text ? text.trim().toLowerCase() : "";
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
