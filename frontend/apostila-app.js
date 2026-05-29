const STORAGE_KEY = "controleApostilas";
const API_BASE_URL_CANDIDATES = [
  "http://127.0.0.1:3000/api",
  "http://localhost:3000/api",
  "http://192.168.10.66:3000/api"
];
let activeApiBaseUrl = API_BASE_URL_CANDIDATES[0];

const addForm = document.getElementById("addForm");
const withdrawForm = document.getElementById("withdrawForm");
const holidayForm = document.getElementById("holidayForm");
const vacationForm = document.getElementById("vacationForm");
const exportForm = document.getElementById("exportForm");
const changedByInput = document.getElementById("changedBy");

const serverStatus = document.getElementById("serverStatus");
const totalCourses = document.getElementById("totalCourses");
const totalControls = document.getElementById("totalControls");
const averageProgress = document.getElementById("averageProgress");

const courseSelect = document.getElementById("courseSelect");
const studentSelect = document.getElementById("studentSelect");
const coursesTableBody = document.querySelector("#coursesTable tbody");
const progressTableBody = document.querySelector("#progressTable tbody");
const previewTableBody = document.querySelector("#previewTable tbody");
const holidaysTableBody = document.querySelector("#holidaysTable tbody");
const vacationsTableBody = document.querySelector("#vacationsTable tbody");
const studentsTableBody = document.querySelector("#studentsTable tbody");
const auditTableBody = document.querySelector("#auditTable tbody");
const controlsTableBody = document.querySelector("#controlsTable tbody");
const holidayRulesTableBody = document.querySelector("#holidayRulesTable tbody");

const coursesMessage = document.getElementById("coursesMessage");
const progressMessage = document.getElementById("progressMessage");
const calendarMessage = document.getElementById("calendarMessage");
const exportFeedback = document.getElementById("exportFeedback");
const studentsMessage = document.getElementById("studentsMessage");
const auditMessage = document.getElementById("auditMessage");
const controlsMessage = document.getElementById("controlsMessage");
const holidayRulesMessage = document.getElementById("holidayRulesMessage");
const holidayRulesFeedback = document.getElementById("holidayRulesFeedback");
const selectedStudentDetails = document.getElementById("selectedStudentDetails");
const studentEditModalEl = document.getElementById("studentEditModal");
const studentEditForm = document.getElementById("studentEditForm");
const studentEditIdInput = document.getElementById("studentEditId");
const studentEditSummaryName = document.getElementById("studentEditSummaryName");
const studentEditSummaryUpdated = document.getElementById("studentEditSummaryUpdated");
const studentEditNameInput = document.getElementById("studentEditName");
const studentEditPhoneInput = document.getElementById("studentEditPhone");
const studentEditResponsibleInput = document.getElementById("studentEditResponsible");
const studentEditContractedHoursInput = document.getElementById("studentEditContractedHours");
const studentEditCompletedHoursInput = document.getElementById("studentEditCompletedHours");
const studentEditRegisterStartDateInput = document.getElementById("studentEditRegisterStartDate");
const studentEditStatusStartDateInput = document.getElementById("studentEditStatusStartDate");
const studentEditAbsencesInput = document.getElementById("studentEditAbsences");
const studentEditLastPresenceInput = document.getElementById("studentEditLastPresence");
const studentEditChangedByInput = document.getElementById("studentEditChangedBy");
const studentEditSaveButton = document.getElementById("studentEditSaveButton");
const holidayRulesGenerateForm = document.getElementById("holidayRulesGenerateForm");
const holidayYearStartInput = document.getElementById("holidayYearStart");
const holidayYearEndInput = document.getElementById("holidayYearEnd");
const holidayRulesTypeFilter = document.getElementById("holidayRulesTypeFilter");
const holidayRulesBlocksFilter = document.getElementById("holidayRulesBlocksFilter");
const holidayRulesActiveFilter = document.getElementById("holidayRulesActiveFilter");

const exportCourses = document.getElementById("exportCourses");
const exportControls = document.getElementById("exportControls");
const exportProgress = document.getElementById("exportProgress");
const exportHolidays = document.getElementById("exportHolidays");
const exportVacations = document.getElementById("exportVacations");
const exportAudit = document.getElementById("exportAudit");
const exportPdf = document.getElementById("exportPdf");

let store = {
  courses: [],
  students: [],
  controls: [],
  progress: [],
  holidays: [],
  vacations: [],
  audits: [],
  holidayRules: []
};

const tableInstances = new Map();
const horizontalScrollSync = new Map();
let studentEditModalInstance = null;
let activeStudentEditId = null;

function destroyEnhancedTable(tableId) {
  const instance = tableInstances.get(tableId);
  if (instance) {
    instance.destroy();
    tableInstances.delete(tableId);
  }
}

function destroyHorizontalScrollSync(tableId) {
  const cleanup = horizontalScrollSync.get(tableId);
  if (cleanup) {
    cleanup();
    horizontalScrollSync.delete(tableId);
  }
}

function setupHorizontalScrollSync(tableId) {
  destroyHorizontalScrollSync(tableId);

  const table = document.getElementById(tableId);
  if (!table) return;

  const wrap = table.closest(".table-wrap");
  const sync = wrap?.previousElementSibling;
  const inner = sync?.querySelector(".table-scroll-sync-inner");

  if (!wrap || !sync || !inner) return;

  let isSyncing = false;

  const syncWidths = () => {
    const targetWidth = Math.max(wrap.scrollWidth, wrap.clientWidth);
    inner.style.width = `${targetWidth}px`;
  };

  const handleTopScroll = () => {
    if (isSyncing) return;
    isSyncing = true;
    wrap.scrollLeft = sync.scrollLeft;
    isSyncing = false;
  };

  const handleBodyScroll = () => {
    if (isSyncing) return;
    isSyncing = true;
    sync.scrollLeft = wrap.scrollLeft;
    isSyncing = false;
  };

  sync.addEventListener("scroll", handleTopScroll, { passive: true });
  wrap.addEventListener("scroll", handleBodyScroll, { passive: true });
  window.addEventListener("resize", syncWidths);

  const observer = new ResizeObserver(syncWidths);
  observer.observe(wrap);

  requestAnimationFrame(syncWidths);

  horizontalScrollSync.set(tableId, () => {
    sync.removeEventListener("scroll", handleTopScroll);
    wrap.removeEventListener("scroll", handleBodyScroll);
    window.removeEventListener("resize", syncWidths);
    observer.disconnect();
  });
}

function enhanceTable(tableId) {
  if (typeof DataTable === "undefined") return;

  const element = document.getElementById(tableId);
  if (!element) return;

  destroyEnhancedTable(tableId);

  const instance = new DataTable(element, {
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    language: {
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ registros",
      info: "Mostrando _START_ a _END_ de _TOTAL_",
      infoEmpty: "Nenhum registro",
      emptyTable: "Sem dados para exibir",
      paginate: {
        first: "Primeira",
        last: "Última",
        next: "Próxima",
        previous: "Anterior"
      }
    }
  });

  tableInstances.set(tableId, instance);
}

function setServerStatus(connected, message) {
  if (!serverStatus) return;
  serverStatus.textContent = message;
  serverStatus.classList.toggle("server-online", connected);
  serverStatus.classList.toggle("server-offline", !connected);
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function loadLocalStore() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    store = {
      courses: parsed.courses || [],
      students: parsed.students || [],
      controls: parsed.controls || [],
      progress: parsed.progress || [],
      holidays: parsed.holidays || [],
      vacations: parsed.vacations || [],
      audits: parsed.audits || [],
      holidayRules: parsed.holidayRules || []
    };
  } catch {
    store = {
      courses: [],
      students: [],
      controls: [],
      progress: [],
      holidays: [],
      vacations: [],
      audits: [],
      holidayRules: []
    };
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Erro na requisição ao servidor.");
  }

  return response.json();
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  return handleResponse(response);
}

async function loadStore() {
  for (const candidate of API_BASE_URL_CANDIDATES) {
    try {
      const [courses, students, controls, progress, holidays, vacations, audits, holidayRules] = await Promise.all([
        fetchJson(`${candidate}/cursos`, { cache: "no-store" }),
        fetchJson(`${candidate}/alunos`, { cache: "no-store" }),
        fetchJson(`${candidate}/controle`, { cache: "no-store" }),
        fetchJson(`${candidate}/progresso`, { cache: "no-store" }),
        fetchJson(`${candidate}/calendario/feriados`, { cache: "no-store" }),
        fetchJson(`${candidate}/calendario/ferias`, { cache: "no-store" }),
        fetchJson(`${candidate}/auditoria`, { cache: "no-store" }),
        fetchJson(`${candidate}/calendario/feriados/regras`, { cache: "no-store" })
      ]);

      activeApiBaseUrl = candidate;
      store = { courses, students, controls, progress, holidays, vacations, audits, holidayRules };
      saveStore();
      setServerStatus(true, `Servidor conectado (${candidate}).`);
      return true;
    } catch {
      // Try the next API candidate.
    }
  }

  loadLocalStore();
  setServerStatus(false, "Servidor indisponível - exibindo dados locais.");
  return false;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("pt-BR");
}

function toDateInputValue(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function formatPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function formatHours(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function getProjectionVisualClass(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ESTOUROU") return "projection-status-overrun";
  if (normalized === "ATRASADO") return "projection-status-late";
  if (normalized === "CONCLUÍDO") return "projection-status-done";
  return "projection-status-default";
}

function getChangedBy() {
  const value = String(changedByInput?.value || studentEditChangedByInput?.value || "").trim();
  if (!value) {
    alert("Informe o nome de quem está alterando os dados.");
    return "";
  }
  return value;
}

function initializeChangedBy() {
  const targetInput = changedByInput || studentEditChangedByInput;
  if (!targetInput) return;

  const saved = localStorage.getItem("changedByName");
  if (saved && !targetInput.value) {
    targetInput.value = saved;
  }

  targetInput.addEventListener("input", () => {
    localStorage.setItem("changedByName", targetInput.value.trim());
  });
}

function openStudentEditModal(student) {
  if (!studentEditModalEl || typeof bootstrap === "undefined") return;

  activeStudentEditId = student.id;
  studentEditIdInput.value = student.id;
  studentEditSummaryName.textContent = student.student_name || "-";
  studentEditSummaryUpdated.textContent = formatDateTime(student.updated_at);
  studentEditNameInput.value = student.student_name || "";
  studentEditPhoneInput.value = student.phone || "";
  studentEditResponsibleInput.value = student.responsible || "";
  studentEditContractedHoursInput.value = student.contracted_hours ?? "";
  studentEditCompletedHoursInput.value = student.completed_hours ?? "";
  studentEditRegisterStartDateInput.value = toDateInputValue(student.register_start_date || student.status_start_date || "");
  studentEditStatusStartDateInput.value = toDateInputValue(student.status_start_date || "");
  studentEditAbsencesInput.value = student.absences_count ?? "";
  studentEditLastPresenceInput.value = toDateInputValue(student.last_presence_date || "");

  const saved = localStorage.getItem("changedByName") || "";
  if (studentEditChangedByInput && !studentEditChangedByInput.value) {
    studentEditChangedByInput.value = saved;
  }

  studentEditModalInstance = bootstrap.Modal.getOrCreateInstance(studentEditModalEl);
  studentEditModalInstance.show();
}

function closeStudentEditModal() {
  if (studentEditModalInstance) {
    studentEditModalInstance.hide();
  }
}

function createSheet(header, rows) {
  return XLSX.utils.aoa_to_sheet([header, ...rows]);
}

function createWorkbook(sheets) {
  const workbook = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([sheetName, sheet]) => {
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  });
  return workbook;
}

function generateCoursesSheet() {
  return createSheet(
    ["Curso", "Carga horária total", "Criado em"],
    store.courses.map((course) => [course.name, course.total_hours, formatDate(course.created_at)])
  );
}

function generateControlsSheet() {
  return createSheet(
    ["Curso", "Aluno", "Data inicial", "Horas semanais", "Responsável", "Observações", "Criado em"],
    store.controls.map((control) => [
      control.course_name || "",
      control.student_name || "",
      formatDate(control.start_date),
      control.weekly_hours,
      control.responsible || "",
      control.notes || "",
      formatDate(control.created_at)
    ])
  );
}

function generateProgressSheet() {
  return createSheet(
    ["Curso", "Aluno", "Início", "Horas totais", "Horas consumidas", "Horas restantes", "Sessões", "Percentual", "90% previsto", "100% previsto", "Status"],
    store.progress.map((item) => [
      item.courseName || "",
      item.studentName || "",
      formatDate(item.startDate),
      item.totalHours,
      item.consumedHours,
      item.remainingHours,
      item.completedSessions,
      formatPercent(item.percentComplete),
      formatDate(item.projectedNinetyDate),
      formatDate(item.projectedHundredDate),
      item.status || ""
    ])
  );
}

function generateHolidaysSheet() {
  return createSheet(
    ["Data", "Descrição"],
    store.holidays.map((item) => [formatDate(item.blocked_date), item.description || ""])
  );
}

function generateVacationsSheet() {
  return createSheet(
    ["Início", "Fim", "Descrição"],
    store.vacations.map((item) => [formatDate(item.start_date), formatDate(item.end_date), item.description || ""])
  );
}

function generateAuditSheet() {
  return createSheet(
    ["Data", "Ação", "Entidade", "ID", "Alterado por", "Resumo"],
    store.audits.map((item) => [
      formatDate(item.created_at?.slice(0, 10) || ""),
      item.action || "",
      item.entity_type || "",
      item.entity_id || "",
      item.changed_by || "",
      item.change_summary || ""
    ])
  );
}

function generatePdfTable(doc, title, headers, rows) {
  if (!rows.length) return;

  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.autoTable({
    startY: 22,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 98, 254] },
    margin: { left: 14, right: 14 }
  });
}

function generatePdfReport() {
  if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
    throw new Error("Falha ao carregar a biblioteca de PDF.");
  }

  const doc = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let pageCount = 0;

  const addSection = (title, headers, rows) => {
    if (!rows.length) return;
    if (pageCount > 0) doc.addPage();
    generatePdfTable(doc, title, headers, rows);
    pageCount += 1;
  };

  if (store.courses.length) {
    addSection("Cursos", ["Curso", "Carga horária", "Criado em"], store.courses.map((course) => [course.name, `${formatHours(course.total_hours)}h`, formatDate(course.created_at)]));
  }

  if (store.controls.length) {
    addSection("Acompanhamentos", ["Curso", "Aluno", "Início", "Horas/semana", "Responsável", "Observações"], store.controls.map((control) => [control.course_name || "", control.student_name || "", formatDate(control.start_date), `${formatHours(control.weekly_hours)}h`, control.responsible || "", control.notes || ""]));
  }

  if (store.progress.length) {
    addSection("Progresso", ["Curso", "Aluno", "Início", "Total", "Consumido", "Restante", "90%", "100%", "Status"], store.progress.map((item) => [item.courseName || "", item.studentName || "", formatDate(item.startDate), `${formatHours(item.totalHours)}h`, `${formatHours(item.consumedHours)}h`, `${formatHours(item.remainingHours)}h`, formatDate(item.projectedNinetyDate), formatDate(item.projectedHundredDate), item.status || ""]));
  }

  if (store.holidays.length) {
    addSection("Feriados", ["Data", "Descrição"], store.holidays.map((item) => [formatDate(item.blocked_date), item.description || ""]));
  }

  if (store.vacations.length) {
    addSection("Férias", ["Início", "Fim", "Descrição"], store.vacations.map((item) => [formatDate(item.start_date), formatDate(item.end_date), item.description || ""]));
  }

  if (store.audits.length) {
    addSection("Auditoria", ["Data", "Ação", "Entidade", "ID", "Alterado por", "Resumo"], store.audits.map((item) => [formatDate(item.created_at?.slice(0, 10) || ""), item.action || "", item.entity_type || "", item.entity_id || "", item.changed_by || "", item.change_summary || ""]));
  }

  doc.save("controle-apostilas.pdf");
}

function renderSummary() {
  if (totalCourses) {
    totalCourses.textContent = String(store.courses.length);
  }

  if (totalControls) {
    totalControls.textContent = String(store.controls.length);
  }

  if (averageProgress) {
    if (!store.progress.length) {
      averageProgress.textContent = "0%";
    } else {
      const totalConsumed = store.progress.reduce((sum, item) => sum + Number(item.consumedHours || 0), 0);
      const totalHours = store.progress.reduce((sum, item) => sum + Number(item.totalHours || 0), 0);
      const rate = totalHours > 0 ? totalConsumed / totalHours : 0;
      averageProgress.textContent = formatPercent(rate);
    }
  }
}

function renderCourses() {
  destroyEnhancedTable("coursesTable");

  if (courseSelect) {
    courseSelect.innerHTML = '<option value="">Selecione um curso</option>';
  }

  if (coursesTableBody) {
    coursesTableBody.innerHTML = "";
  }

  if (!store.courses.length) {
    if (coursesMessage) {
      coursesMessage.textContent = "Nenhum curso cadastrado ainda.";
    }
    return;
  }

  if (coursesMessage) {
    coursesMessage.textContent = "";
  }

  store.courses.forEach((course) => {
    if (courseSelect) {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = `${course.name} - ${formatHours(course.total_hours)}h`;
      courseSelect.appendChild(option);
    }

    if (coursesTableBody) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${course.name}</td>
        <td>${formatHours(course.total_hours)}h</td>
        <td>${formatDate(course.created_at)}</td>
        <td>
          <button type="button" class="secondary-button action-button" data-action="edit-course" data-id="${course.id}">Editar</button>
          <button type="button" class="secondary-button action-button" data-action="delete-course" data-id="${course.id}">Excluir</button>
        </td>
      `;
      coursesTableBody.appendChild(row);
    }
  });

  enhanceTable("coursesTable");
}

if (coursesTableBody) {
  coursesTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const courseId = button.dataset.id;
    const course = store.courses.find((item) => item.id === courseId);
    if (!course) return;

    const changedBy = getChangedBy();
    if (!changedBy) return;

    if (action === "edit-course") {
      const newName = prompt("Novo nome do curso:", course.name);
      if (newName === null) return;

      const newHoursRaw = prompt("Nova carga horária total:", String(course.total_hours));
      if (newHoursRaw === null) return;

      const newHours = Number(newHoursRaw);
      if (!newName.trim() || newHours <= 0) {
        alert("Informe nome e carga horária válidos.");
        return;
      }

      try {
        await fetchJson(`${activeApiBaseUrl}/cursos/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim(), totalHours: newHours, changedBy })
        });
        await refreshData();
      } catch (error) {
        alert(error.message);
      }
    }

    if (action === "delete-course") {
      const confirmed = confirm(`Deseja excluir o curso \"${course.name}\"?`);
      if (!confirmed) return;

      try {
        await fetchJson(`${activeApiBaseUrl}/cursos/${courseId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ changedBy })
        });
        await refreshData();
      } catch (error) {
        alert(error.message);
      }
    }
  });
}

function renderStudents() {
  destroyEnhancedTable("studentsTable");
  destroyHorizontalScrollSync("studentsTable");

  if (studentSelect) {
    studentSelect.innerHTML = '<option value="">Selecione um aluno importado (opcional)</option>';
  }

  if (studentsTableBody) {
    studentsTableBody.innerHTML = "";
  }

  if (!store.students.length) {
    if (studentsMessage) {
      studentsMessage.textContent = "Nenhum aluno importado ainda.";
    }
    return;
  }

  if (studentsMessage) {
    studentsMessage.textContent = "";
  }

  store.students.forEach((student) => {
    if (studentSelect) {
      const option = document.createElement("option");
      option.value = student.id;
      const contracted = student.contracted_hours ? `${formatHours(student.contracted_hours)}h` : "sem carga";
      option.textContent = `${student.student_name} - ${contracted}`;
      studentSelect.appendChild(option);
    }

    if (studentsTableBody) {
      const projection = student.projection || {};
      const projectionStatusClass = getProjectionVisualClass(projection.rhythmStatus);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.student_name || "-"}</td>
        <td>${formatDate(projection.startDate)}</td>
        <td>${student.responsible || "-"}</td>
        <td>${student.phone || "-"}</td>
        <td>${student.attendance_status || "-"}</td>
        <td>${student.absences_count ?? "-"}</td>
        <td>${formatDate(student.last_presence_date)}</td>
        <td>${formatHours(student.contracted_hours)}h</td>
        <td>${formatHours(student.completed_hours)}h</td>
        <td>${formatHours(projection.remainingHours)}h</td>
        <td><span class="projection-chip ${projectionStatusClass}">${formatDate(projection.projectedCompletionDate)}</span></td>
        <td><button type="button" class="secondary-button action-button" data-action="edit-student" data-id="${student.id}">Editar</button></td>
        <td>${formatDateTime(student.updated_at)}</td>
      `;
      studentsTableBody.appendChild(row);
    }
  });

  enhanceTable("studentsTable");
  setupHorizontalScrollSync("studentsTable");
}

async function editStudent(student) {
  openStudentEditModal(student);
}

async function saveStudentEdit() {
  if (!activeStudentEditId) return;

  const changedBy = getChangedBy();
  if (!changedBy) return;

  const payload = {
    studentName: String(studentEditNameInput.value || "").trim(),
    phone: String(studentEditPhoneInput.value || "").trim(),
    responsible: String(studentEditResponsibleInput.value || "").trim(),
    contractedHours: String(studentEditContractedHoursInput.value || "").trim(),
    completedHours: String(studentEditCompletedHoursInput.value || "").trim(),
    registerStartDate: String(studentEditRegisterStartDateInput.value || "").trim(),
    statusStartDate: String(studentEditStatusStartDateInput.value || "").trim(),
    absencesCount: String(studentEditAbsencesInput.value || "").trim(),
    lastPresenceDate: String(studentEditLastPresenceInput.value || "").trim(),
    changedBy
  };

  if (!payload.studentName) {
    alert("Informe o nome do aluno.");
    return;
  }

  if (studentEditSaveButton) {
    studentEditSaveButton.disabled = true;
  }

  try {
    await fetchJson(`${activeApiBaseUrl}/alunos/${activeStudentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    closeStudentEditModal();
    await refreshData();
  } catch (error) {
    alert(error.message);
  } finally {
    if (studentEditSaveButton) {
      studentEditSaveButton.disabled = false;
    }
  }
}

if (studentsTableBody) {
  studentsTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit-student") {
      const student = store.students.find((item) => String(item.id) === String(button.dataset.id));
      if (!student) return;
      await editStudent(student);
    }
  });
}

if (studentEditForm) {
  studentEditForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveStudentEdit();
  });
}

if (studentEditSaveButton) {
  studentEditSaveButton.addEventListener("click", () => {
    saveStudentEdit();
  });
}

function renderAudit() {
  destroyEnhancedTable("auditTable");

  if (!auditTableBody) return;
  auditTableBody.innerHTML = "";

  if (!store.audits.length) {
    if (auditMessage) {
      auditMessage.textContent = "Nenhum histórico de auditoria registrado ainda.";
    }
    return;
  }

  if (auditMessage) {
    auditMessage.textContent = "";
  }

  store.audits.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(item.created_at)}</td>
      <td>${item.action || "-"}</td>
      <td>${item.entity_type || "-"}</td>
      <td>${item.entity_id || "-"}</td>
      <td>${item.changed_by || "-"}</td>
      <td>${item.change_summary || "-"}</td>
    `;
    auditTableBody.appendChild(row);
  });

  enhanceTable("auditTable");
}

function renderControls() {
  destroyEnhancedTable("controlsTable");

  if (!controlsTableBody) return;
  controlsTableBody.innerHTML = "";

  if (!store.controls.length) {
    if (controlsMessage) {
      controlsMessage.textContent = "Nenhum acompanhamento cadastrado ainda.";
    }
    return;
  }

  if (controlsMessage) {
    controlsMessage.textContent = "";
  }

  store.controls.forEach((control) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${control.course_name || "-"}</td>
      <td>${control.student_name || "-"}</td>
      <td>${formatDate(control.start_date)}</td>
      <td>${formatHours(control.weekly_hours)}h</td>
      <td>${control.responsible || "-"}</td>
      <td>${control.notes || "-"}</td>
    `;
    controlsTableBody.appendChild(row);
  });

  enhanceTable("controlsTable");
}

function renderSelectedStudent(student) {
  if (!selectedStudentDetails) return;

  if (!student) {
    selectedStudentDetails.innerHTML = "Selecione um aluno importado para preencher os dados automaticamente.";
    return;
  }

  const projection = student.projection || {};
  const projectionStatusClass = getProjectionVisualClass(projection.rhythmStatus);
  selectedStudentDetails.innerHTML = `
    <strong>${student.student_name || "-"}</strong><br />
    Início base: ${formatDate(projection.startDate)}<br />
    Status: ${student.attendance_status || "-"}<br />
    Faltas: ${student.absences_count ?? "-"}<br />
    Ultima presenca: ${formatDate(student.last_presence_date)}<br />
    Restante: ${formatHours(projection.remainingHours)}h<br />
    Previsão final: <span class="projection-chip ${projectionStatusClass}">${formatDate(projection.projectedCompletionDate)}</span><br />
    Situação: ${projection.rhythmStatus || "-"}<br />
    Responsavel: ${student.responsible || "-"}<br />
    Telefone: ${student.phone || "-"}
  `;
}

function renderProgress(targetBody = progressTableBody) {
  if (targetBody === progressTableBody) {
    destroyEnhancedTable("progressTable");
  }

  if (!targetBody) return;
  targetBody.innerHTML = "";

  if (!store.progress.length) {
    if (progressMessage) {
      progressMessage.textContent = "Nenhum acompanhamento cadastrado ainda.";
    }
    return;
  }

  if (progressMessage) {
    progressMessage.textContent = "";
  }

  store.progress.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.courseName || "-"}</td>
      <td>${item.studentName || "-"}</td>
      <td>${formatDate(item.startDate)}</td>
      <td>${formatHours(item.totalHours)}h</td>
      <td>${formatHours(item.consumedHours)}h</td>
      <td>${formatPercent(item.percentComplete)}</td>
      <td>${formatDate(item.projectedNinetyDate)}</td>
      <td>${formatDate(item.projectedHundredDate)}</td>
      <td>${item.status || "-"}</td>
    `;
    targetBody.appendChild(row);
  });

  if (targetBody === progressTableBody) {
    enhanceTable("progressTable");
  }
}

function renderPreview() {
  if (!previewTableBody) return;
  previewTableBody.innerHTML = "";

  if (!store.progress.length) {
    if (progressMessage) {
      progressMessage.textContent = "Nenhum acompanhamento cadastrado ainda.";
    }
    return;
  }

  if (progressMessage) {
    progressMessage.textContent = "";
  }

  store.progress.slice(0, 5).forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.courseName || "-"}</td>
      <td>${item.studentName || "-"}</td>
      <td>${formatPercent(item.percentComplete)}</td>
      <td>${item.status || "-"}</td>
    `;
    previewTableBody.appendChild(row);
  });
}

function renderCalendar() {
  if (holidaysTableBody) {
    holidaysTableBody.innerHTML = "";
  }
  if (vacationsTableBody) {
    vacationsTableBody.innerHTML = "";
  }

  if (calendarMessage) {
    calendarMessage.textContent = store.holidays.length || store.vacations.length ? "" : "Nenhum bloqueio de calendário registrado ainda.";
  }

  store.holidays.forEach((item) => {
    if (!holidaysTableBody) return;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(item.blocked_date)}</td>
      <td>${item.description || "-"}</td>
    `;
    holidaysTableBody.appendChild(row);
  });

  store.vacations.forEach((item) => {
    if (!vacationsTableBody) return;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(item.start_date)}</td>
      <td>${formatDate(item.end_date)}</td>
      <td>${item.description || "-"}</td>
    `;
    vacationsTableBody.appendChild(row);
  });
}

function holidayRecurrenceLabel(rule) {
  if (!Number(rule.data_movel)) {
    if (rule.day && rule.month) {
      return `${String(rule.day).padStart(2, "0")}/${String(rule.month).padStart(2, "0")}`;
    }
    return "Fixo";
  }

  if (rule.movable_rule === "EASTER_OFFSET") {
    const offset = Number(rule.offset_days || 0);
    if (offset === 0) return "Páscoa";
    if (offset > 0) return `Páscoa +${offset}`;
    return `Páscoa ${offset}`;
  }

  if (rule.movable_rule === "NTH_WEEKDAY_OF_MONTH") {
    return "Domingo ordinal";
  }

  return "Data móvel";
}

function getFilteredHolidayRules() {
  const selectedType = String(holidayRulesTypeFilter?.value || "").trim();
  const selectedBlocks = String(holidayRulesBlocksFilter?.value || "").trim();
  const selectedActive = String(holidayRulesActiveFilter?.value || "").trim();

  return store.holidayRules.filter((rule) => {
    if (selectedType && String(rule.type || "").toUpperCase() !== selectedType.toUpperCase()) {
      return false;
    }

    if (selectedBlocks && String(Number(rule.blocks_school || 0)) !== selectedBlocks) {
      return false;
    }

    if (selectedActive && String(Number(rule.active || 0)) !== selectedActive) {
      return false;
    }

    return true;
  });
}

function renderHolidayRules() {
  destroyEnhancedTable("holidayRulesTable");
  if (!holidayRulesTableBody) return;

  holidayRulesTableBody.innerHTML = "";

  if (!store.holidayRules.length) {
    if (holidayRulesMessage) {
      holidayRulesMessage.textContent = "Nenhuma regra de feriado encontrada.";
    }
    return;
  }

  const filteredRules = getFilteredHolidayRules();

  if (!filteredRules.length) {
    if (holidayRulesMessage) {
      holidayRulesMessage.textContent = "Nenhuma regra encontrada para os filtros selecionados.";
    }
    return;
  }

  if (holidayRulesMessage) {
    holidayRulesMessage.textContent = "";
  }

  filteredRules.forEach((rule) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rule.name || "-"}</td>
      <td>${rule.type || "-"}</td>
      <td>${holidayRecurrenceLabel(rule)}</td>
      <td>
        <select data-role="blocksSchool" data-id="${rule.id}">
          <option value="1" ${Number(rule.blocks_school) ? "selected" : ""}>Sim</option>
          <option value="0" ${Number(rule.blocks_school) ? "" : "selected"}>Não</option>
        </select>
      </td>
      <td>
        <select data-role="active" data-id="${rule.id}">
          <option value="1" ${Number(rule.active) ? "selected" : ""}>Sim</option>
          <option value="0" ${Number(rule.active) ? "" : "selected"}>Não</option>
        </select>
      </td>
      <td>
        <button type="button" class="secondary-button action-button" data-action="save-holiday-rule" data-id="${rule.id}">Salvar</button>
      </td>
    `;
    holidayRulesTableBody.appendChild(row);
  });

  enhanceTable("holidayRulesTable");
}

[holidayRulesTypeFilter, holidayRulesBlocksFilter, holidayRulesActiveFilter].forEach((filter) => {
  if (!filter) return;
  filter.addEventListener("change", () => {
    renderHolidayRules();
  });
});

function initializeDateFields() {
  const startDate = document.getElementById("startDate");
  const blockedDate = document.getElementById("blockedDate");
  const vacationStartDate = document.getElementById("vacationStartDate");
  const vacationEndDate = document.getElementById("vacationEndDate");

  const today = new Date().toISOString().slice(0, 10);
  if (startDate && !startDate.value) startDate.value = today;
  if (blockedDate && !blockedDate.value) blockedDate.value = today;
  if (vacationStartDate && !vacationStartDate.value) vacationStartDate.value = today;
  if (vacationEndDate && !vacationEndDate.value) vacationEndDate.value = today;
}

async function refreshData() {
  await loadStore();
  renderSummary();
  renderCourses();
  renderStudents();
  renderControls();
  renderProgress();
  renderPreview();
  renderCalendar();
  renderHolidayRules();
  renderAudit();
  initializeDateFields();
}

if (holidayRulesTableBody) {
  holidayRulesTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action='save-holiday-rule']");
    if (!button) return;

    const changedBy = getChangedBy();
    if (!changedBy) return;

    const ruleId = button.dataset.id;
    const blocksSelect = holidayRulesTableBody.querySelector(`select[data-role='blocksSchool'][data-id='${ruleId}']`);
    const activeSelect = holidayRulesTableBody.querySelector(`select[data-role='active'][data-id='${ruleId}']`);
    if (!blocksSelect || !activeSelect) return;

    const blocksSchool = blocksSelect.value === "1";
    const active = activeSelect.value === "1";

    try {
      await fetchJson(`${activeApiBaseUrl}/calendario/feriados/regras/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocksSchool, active, changedBy })
      });

      if (holidayRulesFeedback) {
        holidayRulesFeedback.textContent = "Regra atualizada com sucesso.";
      }

      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (holidayRulesGenerateForm) {
  holidayRulesGenerateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const changedBy = getChangedBy();
    if (!changedBy) return;

    const yearStart = Number(holidayYearStartInput?.value || new Date().getFullYear());
    const yearEnd = Number(holidayYearEndInput?.value || yearStart);

    if (!Number.isInteger(yearStart) || !Number.isInteger(yearEnd) || yearEnd < yearStart) {
      alert("Informe anos válidos para geração.");
      return;
    }

    try {
      const response = await fetchJson(`${activeApiBaseUrl}/calendario/feriados/regras/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearStart, yearEnd, changedBy })
      });

      if (holidayRulesFeedback) {
        holidayRulesFeedback.textContent = `Geração concluída (${response.yearStart}-${response.yearEnd}). Inseridos: ${response.inserted}.`;
      }

      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (studentSelect) {
  studentSelect.addEventListener("change", () => {
    const selectedId = studentSelect.value;
    if (!selectedId) {
      renderSelectedStudent(null);
      return;
    }

    const student = store.students.find((item) => item.id === selectedId);
    if (!student) {
      renderSelectedStudent(null);
      return;
    }

    const studentNameInput = document.getElementById("studentName");
    const responsibleInput = document.getElementById("controlResponsible");

    if (studentNameInput) {
      studentNameInput.value = student.student_name || "";
    }

    if (responsibleInput && !responsibleInput.value.trim()) {
      responsibleInput.value = student.responsible || "";
    }

    renderSelectedStudent(student);
  });
}

if (addForm) {
  addForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("courseName").value.trim();
    const totalHours = Number(document.getElementById("courseHours").value);

    if (!name || totalHours <= 0) {
      alert("Informe o nome do curso e a carga horária total.");
      return;
    }

    const changedBy = getChangedBy();
    if (!changedBy) return;

    try {
      await fetchJson(`${activeApiBaseUrl}/cursos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, totalHours, changedBy })
      });
      addForm.reset();
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (withdrawForm) {
  withdrawForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const courseId = courseSelect?.value;
    const studentId = studentSelect?.value || "";
    const studentName = document.getElementById("studentName").value.trim();
    const startDate = document.getElementById("startDate").value;
    const weeklyHours = Number(document.getElementById("weeklyHours").value);
    const responsible = document.getElementById("controlResponsible").value.trim();
    const notes = document.getElementById("controlNotes").value.trim();

    if (!courseId || !studentName || !startDate || weeklyHours <= 0 || !responsible) {
      alert("Preencha todos os campos do acompanhamento corretamente.");
      return;
    }

    const changedBy = getChangedBy();
    if (!changedBy) return;

    try {
      await fetchJson(`${activeApiBaseUrl}/controle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, studentId, studentName, startDate, weeklyHours, responsible, notes, changedBy })
      });
      withdrawForm.reset();
      initializeDateFields();
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (holidayForm) {
  holidayForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const blockedDate = document.getElementById("blockedDate").value;
    const description = document.getElementById("holidayDescription").value.trim();

    if (!blockedDate) {
      alert("Informe a data do feriado.");
      return;
    }

    const changedBy = getChangedBy();
    if (!changedBy) return;

    try {
      await fetchJson(`${activeApiBaseUrl}/calendario/feriados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedDate, description, changedBy })
      });
      holidayForm.reset();
      initializeDateFields();
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (vacationForm) {
  vacationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const startDate = document.getElementById("vacationStartDate").value;
    const endDate = document.getElementById("vacationEndDate").value;
    const description = document.getElementById("vacationDescription").value.trim();

    if (!startDate || !endDate) {
      alert("Informe o início e o fim das férias.");
      return;
    }

    const changedBy = getChangedBy();
    if (!changedBy) return;

    try {
      await fetchJson(`${activeApiBaseUrl}/calendario/ferias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, description, changedBy })
      });
      vacationForm.reset();
      initializeDateFields();
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  });
}

if (exportForm) {
  exportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (typeof XLSX === "undefined") {
      if (exportFeedback) {
        exportFeedback.textContent = "Falha ao carregar a biblioteca de exportação Excel.";
      }
      return;
    }

    const wantsCourses = exportCourses?.checked;
    const wantsControls = exportControls?.checked;
    const wantsProgress = exportProgress?.checked;
    const wantsHolidays = exportHolidays?.checked;
    const wantsVacations = exportVacations?.checked;
    const wantsAudit = exportAudit?.checked;
    const wantsPdf = exportPdf?.checked;

    if (!wantsCourses && !wantsControls && !wantsProgress && !wantsHolidays && !wantsVacations && !wantsAudit && !wantsPdf) {
      if (exportFeedback) {
        exportFeedback.textContent = "Selecione ao menos uma opção para exportar.";
      }
      return;
    }

    const sheets = {};
    if (wantsCourses && store.courses.length) sheets.Cursos = generateCoursesSheet();
    if (wantsControls && store.controls.length) sheets.Controle = generateControlsSheet();
    if (wantsProgress && store.progress.length) sheets.Progresso = generateProgressSheet();
    if (wantsHolidays && store.holidays.length) sheets.Feriados = generateHolidaysSheet();
    if (wantsVacations && store.vacations.length) sheets.Ferias = generateVacationsSheet();
    if (wantsAudit && store.audits.length) sheets.Auditoria = generateAuditSheet();

    if (Object.keys(sheets).length === 0) {
      if (exportFeedback) {
        exportFeedback.textContent = "Não há dados para exportar com as opções selecionadas.";
      }
      return;
    }

    const workbook = createWorkbook(sheets);
    XLSX.writeFile(workbook, "controle-apostilas.xlsx");

    if (wantsPdf) {
      generatePdfReport();
    }

    if (exportFeedback) {
      exportFeedback.textContent = wantsPdf ? "Arquivos Excel e PDF gerados com sucesso." : "Arquivo Excel gerado com sucesso.";
    }
  });
}

async function init() {
  initializeChangedBy();

  if (holidayYearStartInput && !holidayYearStartInput.value) {
    holidayYearStartInput.value = String(new Date().getFullYear());
  }
  if (holidayYearEndInput && !holidayYearEndInput.value) {
    holidayYearEndInput.value = String(new Date().getFullYear());
  }

  await loadStore();
  renderSummary();
  renderCourses();
  renderStudents();
  renderControls();
  renderProgress();
  renderPreview();
  renderCalendar();
  renderHolidayRules();
  renderAudit();
  renderSelectedStudent(null);
  initializeDateFields();
}

init();
