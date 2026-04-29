const STORAGE_KEY = "controleEstoque";

const addForm = document.getElementById("addForm");
const withdrawForm = document.getElementById("withdrawForm");
const inventoryTableBody = document.querySelector("#inventoryTable tbody");
const historyTableBody = document.querySelector("#historyTable tbody");
const withdrawMaterial = document.getElementById("withdrawMaterial");
const exportForm = document.getElementById("exportForm");
const exportInventory = document.getElementById("exportInventory");
const exportHistory = document.getElementById("exportHistory");
const exportFeedback = document.getElementById("exportFeedback");
const inventoryMessage = document.getElementById("inventoryMessage");
const historyMessage = document.getElementById("historyMessage");
const totalMaterials = document.getElementById("totalMaterials");
const totalQuantity = document.getElementById("totalQuantity");
const totalWithdrawals = document.getElementById("totalWithdrawals");

let store = {
  inventory: [],
  history: []
};

function loadStore() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      store = JSON.parse(saved);
    } catch (error) {
      store = { inventory: [], history: [] };
    }
  }
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("pt-BR");
}

function createSheet(header, rows) {
  const worksheetData = [header, ...rows];
  return XLSX.utils.aoa_to_sheet(worksheetData);
}

function createWorkbook(sheets) {
  const workbook = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([sheetName, sheet]) => {
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  });
  return workbook;
}

function generateInventorySheet() {
  const header = ["Material", "Módulo", "Quantidade"];
  const rows = store.inventory.map((item) => [item.name, item.module, item.quantity]);
  return createSheet(header, rows);
}

function generateHistorySheet() {
  const header = ["Data", "Ação", "Responsável", "Aluno", "Material", "Módulo", "Quantidade"];
  const rows = store.history.map((entry) => [
    formatDate(entry.date),
    entry.action || "Saída",
    entry.responsible || "",
    entry.student || "",
    entry.material,
    entry.module || "",
    entry.quantity
  ]);
  return createSheet(header, rows);
}

function renderSummary() {
  if (!totalMaterials || !totalQuantity || !totalWithdrawals) return;
  totalMaterials.textContent = store.inventory.length;
  totalQuantity.textContent = store.inventory.reduce((sum, item) => sum + item.quantity, 0);
  totalWithdrawals.textContent = store.history.length;
}

function renderInventory() {
  if (inventoryTableBody) {
    inventoryTableBody.innerHTML = "";
  }
  if (withdrawMaterial) {
    withdrawMaterial.innerHTML = "<option value=\"\">Selecione um material</option>";
  }

  if (!store.inventory.length) {
    if (inventoryMessage) {
      inventoryMessage.textContent = "Nenhum material cadastrado ainda.";
    }
    renderSummary();
    return;
  }

  if (inventoryMessage) {
    inventoryMessage.textContent = "";
  }

  store.inventory.forEach((item) => {
    if (inventoryTableBody) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.module}</td>
        <td>${item.quantity}</td>
      `;
      inventoryTableBody.appendChild(row);
    }

    if (withdrawMaterial) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} (${item.module}) — ${item.quantity} em estoque`;
      withdrawMaterial.appendChild(option);
    }
  });

  renderSummary();
}

function renderHistory() {
  if (!historyTableBody) return;
  historyTableBody.innerHTML = "";

  if (!store.history.length) {
    if (historyMessage) {
      historyMessage.textContent = "Nenhum registro de movimentação ainda.";
    }
    return;
  }

  if (historyMessage) {
    historyMessage.textContent = "";
  }

  [...store.history].reverse().forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(entry.date)}</td>
      <td>${entry.action || "Saída"}</td>
      <td>${entry.responsible || "-"}</td>
      <td>${entry.student || "-"}</td>
      <td>${entry.material}</td>
      <td>${entry.module || "-"}</td>
      <td>${entry.quantity}</td>
    `;
    historyTableBody.appendChild(row);
  });
}

function getMaterialById(id) {
  return store.inventory.find((item) => item.id === id);
}

function createOrUpdateMaterial(name, module, quantity) {
  const existing = store.inventory.find(
    (item) => item.name.toLowerCase().trim() === name.toLowerCase().trim() && item.module === module
  );

  if (existing) {
    existing.quantity += quantity;
    return { item: existing, action: "Entrada" };
  }

  const newItem = {
    id: `mat-${Date.now()}`,
    name: name.trim(),
    module,
    quantity
  };
  store.inventory.push(newItem);
  return { item: newItem, action: "Entrada" };
}

if (addForm) {
  addForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("materialName").value;
    const module = document.getElementById("materialModule").value;
    const quantity = Number(document.getElementById("materialQuantity").value);
    const responsible = document.getElementById("addResponsible").value.trim();

    if (!name || !module || quantity <= 0 || !responsible) {
      alert("Preencha todos os campos corretamente, incluindo o responsável.");
      return;
    }

    const { item, action } = createOrUpdateMaterial(name, module, quantity);
    store.history.push({
      id: `hist-${Date.now()}`,
      action,
      responsible,
      material: item.name,
      module: item.module,
      quantity,
      student: "-",
      date: new Date().toISOString()
    });

    saveStore();
    renderInventory();
    renderHistory();
    addForm.reset();
    document.getElementById("materialQuantity").value = 1;
  });
}

if (withdrawForm) {
  withdrawForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const materialId = withdrawMaterial?.value;
    const quantity = Number(document.getElementById("withdrawQuantity").value);
    const student = document.getElementById("studentName").value.trim();
    const responsible = document.getElementById("withdrawResponsible").value.trim();
    const date = document.getElementById("withdrawDate").value;

    if (!materialId || !student || !responsible || !date || quantity <= 0) {
      alert("Preencha todos os campos de retirada corretamente, incluindo o responsável.");
      return;
    }

    const item = getMaterialById(materialId);
    if (!item) {
      alert("Material não encontrado no estoque.");
      return;
    }

    if (quantity > item.quantity) {
      alert("Quantidade de retirada maior do que o estoque disponível.");
      return;
    }

    item.quantity -= quantity;
    store.history.push({
      id: `hist-${Date.now()}`,
      action: "Saída",
      responsible,
      material: item.name,
      module: item.module,
      quantity,
      student,
      date
    });

    saveStore();
    renderInventory();
    renderHistory();
    withdrawForm.reset();
    document.getElementById("withdrawQuantity").value = 1;
  });
}

if (exportForm) {
  exportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    exportFeedback.textContent = "";

    if (typeof XLSX === "undefined") {
      exportFeedback.textContent = "Falha ao carregar a biblioteca de exportação Excel.";
      return;
    }

    const wantsInventory = exportInventory?.checked;
    const wantsHistory = exportHistory?.checked;

    if (!wantsInventory && !wantsHistory) {
      exportFeedback.textContent = "Selecione ao menos uma opção para exportar.";
      return;
    }

    const sheets = {};
    if (wantsInventory) {
      if (!store.inventory.length) {
        exportFeedback.textContent = "Não há itens no estoque para exportar.";
      } else {
        sheets.Estoque = generateInventorySheet();
      }
    }

    if (wantsHistory) {
      if (!store.history.length) {
        exportFeedback.textContent = exportFeedback.textContent
          ? exportFeedback.textContent + "\nNão há histórico para exportar."
          : "Não há histórico para exportar.";
      } else {
        sheets.Histórico = generateHistorySheet();
      }
    }

    if (Object.keys(sheets).length === 0) {
      return;
    }

    const workbook = createWorkbook(sheets);
    XLSX.writeFile(workbook, "controle-estoque.xlsx");
    exportFeedback.textContent = "Arquivo Excel gerado com sucesso.";
  });
}

function initializeDate() {
  const dateField = document.getElementById("withdrawDate");
  if (!dateField) return;
  const today = new Date().toISOString().slice(0, 10);
  dateField.value = today;
}

function init() {
  loadStore();
  initializeDate();
  renderInventory();
  renderHistory();
}

init();
