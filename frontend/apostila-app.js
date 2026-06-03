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
const totalStudents = document.getElementById("totalStudents");
const highAlertsCount = document.getElementById("highAlertsCount");
const apostilaPurchaseCount = document.getElementById("apostilaPurchaseCount");

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
const apostilaTableBody = document.querySelector("#apostilaTable tbody");
const attendanceHistoryTableBody = document.querySelector("#attendanceHistoryTable tbody");

const coursesMessage = document.getElementById("coursesMessage");
const progressMessage = document.getElementById("progressMessage");
const calendarMessage = document.getElementById("calendarMessage");
const exportFeedback = document.getElementById("exportFeedback");
const studentsMessage = document.getElementById("studentsMessage");
const auditMessage = document.getElementById("auditMessage");
const controlsMessage = document.getElementById("controlsMessage");
const holidayRulesMessage = document.getElementById("holidayRulesMessage");
const holidayRulesFeedback = document.getElementById("holidayRulesFeedback");
const attendanceHistoryMessage = document.getElementById("attendanceHistoryMessage");
const selectedStudentDetails = document.getElementById("selectedStudentDetails");
const studentsSearchInput = document.getElementById("studentsSearchInput");
const studentsSearchMeta = document.getElementById("studentsSearchMeta");
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
const studentEditClassDayInput = document.getElementById("studentEditClassDay");
const studentEditClassTimeInput = document.getElementById("studentEditClassTime");
const studentEditCurrentCourseInput = document.getElementById("studentEditCurrentCourse");
const studentEditCurrentLessonInput = document.getElementById("studentEditCurrentLesson");
const studentEditChangedByInput = document.getElementById("studentEditChangedBy");
const studentEditSaveButton = document.getElementById("studentEditSaveButton");
const classScheduleCalendar = document.getElementById("classScheduleCalendar");
const classScheduleMessage = document.getElementById("classScheduleMessage");
const scheduleAssignModalEl = document.getElementById("scheduleAssignModal");
const scheduleAssignHint = document.getElementById("scheduleAssignHint");
const scheduleAssignTimeInput = document.getElementById("scheduleAssignTime");
const scheduleAssignSaveButton = document.getElementById("scheduleAssignSaveButton");
const attendanceModalEl = document.getElementById("attendanceModal");
const attendanceModalSubtitle = document.getElementById("attendanceModalSubtitle");
const attendanceSessionDateInput = document.getElementById("attendanceSessionDate");
const attendanceModalSummary = document.getElementById("attendanceModalSummary");
const attendanceModalEmpty = document.getElementById("attendanceModalEmpty");
const attendanceStudentsTableBody = document.getElementById("attendanceStudentsTableBody");
const attendanceMessagePreview = document.getElementById("attendanceMessagePreview");
const attendanceSaveButton = document.getElementById("attendanceSaveButton");
const turmaUnscheduledSearchInput = document.getElementById("turmaUnscheduledSearch");
const turmaUnscheduledList = document.getElementById("turmaUnscheduledList");
const turmaUnscheduledMeta = document.getElementById("turmaUnscheduledMeta");
const holidayRulesGenerateForm = document.getElementById("holidayRulesGenerateForm");
const holidayYearStartInput = document.getElementById("holidayYearStart");
const holidayYearEndInput = document.getElementById("holidayYearEnd");
const holidayRulesTypeFilter = document.getElementById("holidayRulesTypeFilter");
const holidayRulesBlocksFilter = document.getElementById("holidayRulesBlocksFilter");
const holidayRulesActiveFilter = document.getElementById("holidayRulesActiveFilter");
const alertsSummary = document.getElementById("alertsSummary");
const notificationsList = document.getElementById("notificationsList");
const notificationPreview = document.getElementById("notificationPreview");
const copyNotificationButton = document.getElementById("copyNotificationButton");
const apostilaSummary = document.getElementById("apostilaSummary");
const apostilaStatusMessage = document.getElementById("apostilaStatusMessage");

const exportCourses = document.getElementById("exportCourses");
const exportControls = document.getElementById("exportControls");
const exportProgress = document.getElementById("exportProgress");
const exportHolidays = document.getElementById("exportHolidays");
const exportVacations = document.getElementById("exportVacations");
const exportAudit = document.getElementById("exportAudit");
const exportPdf = document.getElementById("exportPdf");
const dashboardOverview = document.getElementById("dashboardOverview");
const dashboardOverviewDetails = document.getElementById("dashboardOverviewDetails");
const dashboardAlertsSummary = document.getElementById("dashboardAlertsSummary");
const dashboardAlertsList = document.getElementById("dashboardAlertsList");
const dashboardAttendanceSummary = document.getElementById("dashboardAttendanceSummary");
const dashboardAttendanceList = document.getElementById("dashboardAttendanceList");
const dashboardApostilaSummary = document.getElementById("dashboardApostilaSummary");
const dashboardScheduleSummary = document.getElementById("dashboardScheduleSummary");

let store = {
  courses: [],
  students: [],
  controls: [],
  progress: [],
  holidays: [],
  vacations: [],
  audits: [],
  holidayRules: [],
  attendanceHistory: [],
  apostilas: {
    summary: {
      eligibleCount: 0,
      receivedCount: 0,
      stockDebitedCount: 0,
      pendingDebitCount: 0,
      stockQuantity: 0,
      purchaseRequired: false,
      purchaseQuantity: 0
    },
    students: []
  }
};

const tableInstances = new Map();
const horizontalScrollSync = new Map();
let studentEditModalInstance = null;
let activeStudentEditId = null;
let studentsSearchTerm = "";
let turmaUnscheduledTerm = "";
let pendingScheduleStudentId = "";
let scheduleAssignModalInstance = null;
let scheduleAssignResolver = null;
let scheduleAssignModalBound = false;
let attendanceModalInstance = null;
let attendanceModalBound = false;
let attendanceModalState = {
  classDay: "",
  classTime: "",
  sessionDate: "",
  students: []
};

const CLASS_DAY_ORDER = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const CLASS_TIME_ORDER = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const ALERT_SEVERITY_ORDER = { alta: 0, media: 1, baixa: 2 };

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
      holidayRules: parsed.holidayRules || [],
      attendanceHistory: parsed.attendanceHistory || [],
      apostilas: parsed.apostilas || store.apostilas
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
      holidayRules: [],
      attendanceHistory: [],
      apostilas: {
        summary: {
          eligibleCount: 0,
          receivedCount: 0,
          stockDebitedCount: 0,
          pendingDebitCount: 0,
          stockQuantity: 0,
          purchaseRequired: false,
          purchaseQuantity: 0
        },
        students: []
      }
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
      const [courses, students, controls, progress, holidays, vacations, audits, holidayRules, attendanceHistory, apostilas] = await Promise.all([
        fetchJson(`${candidate}/cursos`, { cache: "no-store" }),
        fetchJson(`${candidate}/alunos`, { cache: "no-store" }),
        fetchJson(`${candidate}/controle`, { cache: "no-store" }),
        fetchJson(`${candidate}/progresso`, { cache: "no-store" }),
        fetchJson(`${candidate}/calendario/feriados`, { cache: "no-store" }),
        fetchJson(`${candidate}/calendario/ferias`, { cache: "no-store" }),
        fetchJson(`${candidate}/auditoria`, { cache: "no-store" }),
        fetchJson(`${candidate}/calendario/feriados/regras`, { cache: "no-store" }),
        fetchJson(`${candidate}/presencas/historico`, { cache: "no-store" }),
        fetchJson(`${candidate}/apostilas`, { cache: "no-store" })
      ]);

      activeApiBaseUrl = candidate;
      store = { courses, students, controls, progress, holidays, vacations, audits, holidayRules, attendanceHistory, apostilas };
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

function buildAttendanceAbsenceMessage(student, sessionDate) {
  return `Olá ${student.student_name || "aluno(a)"} notamos sua ausência na aula de ${student.class_day || "dia"} em ${formatDate(sessionDate)}, está tudo bem? Se precisar de algo, estamos à disposição.`;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getStudentsForSchedule(classDay, classTime) {
  return store.students
    .filter((student) => normalizeClassDayValue(student.class_day) === classDay && normalizeClassTimeValue(student.class_time) === normalizeClassTimeValue(classTime))
    .sort((left, right) => String(left.student_name || "").localeCompare(String(right.student_name || ""), "pt-BR"));
}

function attendanceStatusOptions(selectedValue = "presence") {
  const options = [
    ["presence", "Presença"],
    ["absence", "Falta"],
    ["reposition", "Reposição"]
  ];

  return options.map(([value, label]) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${label}</option>`).join("");
}

function bindAttendanceModal() {
  if (attendanceModalBound || !attendanceModalEl || typeof bootstrap === "undefined") return;

  attendanceModalBound = true;
  attendanceModalInstance = new bootstrap.Modal(attendanceModalEl, {
    backdrop: "static",
    keyboard: true
  });

  attendanceSaveButton?.addEventListener("click", saveAttendanceModal);

  attendanceSessionDateInput?.addEventListener("change", async () => {
    if (!attendanceModalState.classDay || !attendanceModalState.classTime) return;
    attendanceModalState.sessionDate = String(attendanceSessionDateInput.value || getTodayIsoDate()).trim();
    await loadAttendanceModalData();
  });

  attendanceModalEl.addEventListener("hidden.bs.modal", () => {
    attendanceModalState = {
      classDay: "",
      classTime: "",
      sessionDate: "",
      students: []
    };
    if (attendanceStudentsTableBody) {
      attendanceStudentsTableBody.innerHTML = "";
    }
    if (attendanceMessagePreview) {
      attendanceMessagePreview.value = "";
    }
  });
}

async function loadAttendanceModalData() {
  if (!attendanceModalState.classDay || !attendanceModalState.classTime || !attendanceModalState.sessionDate) return;

  const students = getStudentsForSchedule(attendanceModalState.classDay, attendanceModalState.classTime);
  attendanceModalState.students = students;
  let existingRecords = [];

  try {
    const existing = await fetchJson(
      `${activeApiBaseUrl}/presencas?classDay=${encodeURIComponent(attendanceModalState.classDay)}&classTime=${encodeURIComponent(attendanceModalState.classTime)}&sessionDate=${encodeURIComponent(attendanceModalState.sessionDate)}`,
      { cache: "no-store" }
    );
    existingRecords = Array.isArray(existing.records) ? existing.records : [];
  } catch {
    existingRecords = [];
  }

  const existingStatusByStudent = new Map(
    existingRecords.map((record) => [String(record.student_id || record.studentId || ""), String(record.status || "presence")])
  );

  if (attendanceModalSummary) {
    attendanceModalSummary.textContent = `${students.length} aluno(s) nesta turma em ${attendanceModalState.classDay} • ${formatClassTimeLabel(attendanceModalState.classTime)}.`;
  }

  if (attendanceModalEmpty) {
    attendanceModalEmpty.classList.toggle("d-none", students.length > 0);
  }

  if (!attendanceStudentsTableBody) return;

  attendanceStudentsTableBody.innerHTML = "";

  if (!students.length) {
    return;
  }

  students.forEach((student) => {
    const selectedStatus = existingStatusByStudent.get(String(student.id)) || "presence";
    const row = document.createElement("tr");
    row.className = "attendance-student-row";
    row.dataset.studentId = student.id;
    row.innerHTML = `
      <td>
        <strong>${student.student_name || "-"}</strong><br />
        <small class="text-muted">${student.attendance_status || "Sem chamada registrada"}</small>
      </td>
      <td>${student.responsible || "-"}</td>
      <td>${student.current_lesson ?? "-"}</td>
      <td>
        <select class="form-select form-select-sm attendance-status-select" data-student-id="${student.id}">
          ${attendanceStatusOptions(selectedStatus)}
        </select>
      </td>
      <td>
        <button type="button" class="btn btn-outline-primary btn-sm attendance-message-button" data-student-id="${student.id}" disabled>
          Copiar mensagem
        </button>
      </td>
    `;
    attendanceStudentsTableBody.appendChild(row);
  });

  attendanceStudentsTableBody.querySelectorAll(".attendance-status-select").forEach((select) => {
    select.addEventListener("change", () => {
      const row = select.closest("tr");
      if (!row) return;
      const copyButton = row.querySelector(".attendance-message-button");
      const isAbsence = select.value === "absence";
      if (copyButton) {
        copyButton.disabled = !isAbsence;
      }
      updateAttendancePreview();
    });
  });

  attendanceStudentsTableBody.querySelectorAll(".attendance-message-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const studentId = button.dataset.studentId;
      const student = attendanceModalState.students.find((item) => String(item.id) === String(studentId));
      if (!student) return;
      const message = buildAttendanceAbsenceMessage(student, attendanceModalState.sessionDate);
      if (attendanceMessagePreview) {
        attendanceMessagePreview.value = message;
      }
      try {
        await navigator.clipboard.writeText(message);
        setClassScheduleFeedback(`Mensagem de falta copiada para ${student.student_name}.`);
      } catch {
        setClassScheduleFeedback(`Mensagem pronta para ${student.student_name}. Copie manualmente se necessário.`);
      }
    });
  });

  attendanceStudentsTableBody.querySelectorAll(".attendance-status-select").forEach((select) => {
    const row = select.closest("tr");
    const copyButton = row?.querySelector(".attendance-message-button");
    if (copyButton) {
      copyButton.disabled = select.value !== "absence";
    }
  });

  updateAttendancePreview();
}

function updateAttendancePreview() {
  if (!attendanceStudentsTableBody || !attendanceMessagePreview) return;

  const selectedSelect = Array.from(attendanceStudentsTableBody.querySelectorAll(".attendance-status-select")).find((select) => select.value === "absence");
  if (selectedSelect) {
    const row = selectedSelect.closest("tr");
    if (row) {
      const studentId = row.dataset.studentId;
      const student = attendanceModalState.students.find((item) => String(item.id) === String(studentId));
      attendanceMessagePreview.value = student ? buildAttendanceAbsenceMessage(student, attendanceModalState.sessionDate) : "";
      return;
    }
  }

  attendanceMessagePreview.value = "";
}

async function openAttendanceModal(classDay, classTime) {
  bindAttendanceModal();

  if (!attendanceModalInstance || !attendanceSessionDateInput) {
    setClassScheduleFeedback("Não foi possível abrir a chamada nesta tela.");
    return;
  }

  attendanceModalState.classDay = classDay;
  attendanceModalState.classTime = classTime;
  attendanceModalState.sessionDate = getTodayIsoDate();
  attendanceSessionDateInput.value = attendanceModalState.sessionDate;

  if (attendanceModalSubtitle) {
    attendanceModalSubtitle.textContent = `${classDay} • ${formatClassTimeLabel(classTime)}`;
  }

  attendanceModalInstance.show();
  await loadAttendanceModalData();
}

async function saveAttendanceModal() {
  if (!attendanceModalState.classDay || !attendanceModalState.classTime || !attendanceModalState.sessionDate) return;

  const changedBy = getChangedBy();
  if (!changedBy) return;

  const rows = Array.from(attendanceStudentsTableBody?.querySelectorAll("tr[data-student-id]") || []);
  const records = rows.map((row) => {
    const studentId = row.dataset.studentId;
    const select = row.querySelector(".attendance-status-select");
    return {
      studentId,
      status: select?.value || "presence"
    };
  });

  if (!records.length) {
    setClassScheduleFeedback("Nenhum aluno disponível para chamada neste horário.");
    return;
  }

  if (attendanceSaveButton) {
    attendanceSaveButton.disabled = true;
  }

  try {
    await fetchJson(`${activeApiBaseUrl}/presencas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classDay: attendanceModalState.classDay,
        classTime: attendanceModalState.classTime,
        sessionDate: attendanceModalState.sessionDate,
        records,
        changedBy
      })
    });
    attendanceModalInstance?.hide();
    await refreshData();
    setClassScheduleFeedback(`Chamada salva para ${attendanceModalState.classDay} • ${formatClassTimeLabel(attendanceModalState.classTime)}.`);
  } catch (error) {
    setClassScheduleFeedback(error.message);
  } finally {
    if (attendanceSaveButton) {
      attendanceSaveButton.disabled = false;
    }
  }
}

function getApostilaStatus(student) {
  const currentLesson = Number(student?.current_lesson || 0);
  const received = Number(student?.apostila_received || 0) === 1;
  const debited = Number(student?.apostila_stock_debited || 0) === 1;

  if (received || currentLesson >= 5) {
    return {
      label: "Recebida",
      badgeClass: debited ? "bg-success" : "bg-warning text-dark",
      detail: debited ? "Baixada do estoque" : "Pendente de baixa"
    };
  }

  return {
    label: "Pendente",
    badgeClass: "bg-secondary",
    detail: "Abaixo da aula 5"
  };
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
  if (studentEditClassDayInput) {
    studentEditClassDayInput.value = normalizeClassDayValue(student.class_day || "");
  }
  if (studentEditClassTimeInput) {
    studentEditClassTimeInput.value = student.class_time || "";
  }
  if (studentEditCurrentCourseInput) {
    studentEditCurrentCourseInput.value = student.current_course || "";
  }
  if (studentEditCurrentLessonInput) {
    studentEditCurrentLessonInput.value = student.current_lesson ?? "";
  }

  const saved = localStorage.getItem("changedByName") || "";
  if (studentEditChangedByInput) {
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

  if (totalStudents) {
    totalStudents.textContent = String(store.students.length);
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

  const alerts = getStudentAlerts();
  const highAlerts = alerts.filter((item) => item.severity === "alta").length;
  const apostilaSummaryData = store.apostilas?.summary || {};
  const purchaseCount = Number(apostilaSummaryData.purchaseRequired ? apostilaSummaryData.purchaseQuantity : 0);

  if (highAlertsCount) {
    highAlertsCount.textContent = String(highAlerts);
  }

  if (apostilaPurchaseCount) {
    apostilaPurchaseCount.textContent = String(purchaseCount);
  }

  if (dashboardOverview) {
    const scheduledStudents = store.students.filter((student) => normalizeClassDayValue(student.class_day) && normalizeClassTimeValue(student.class_time)).length;
    const unscheduledStudents = Math.max(store.students.length - scheduledStudents, 0);
    dashboardOverview.textContent = `${store.students.length} aluno(s), ${alerts.length} aviso(s), ${highAlerts} em prioridade alta e ${purchaseCount} apostila(s) para comprar.`;

    if (dashboardOverviewDetails) {
      dashboardOverviewDetails.innerHTML = [
        {
          title: `${scheduledStudents} com turma definida`,
          text: `${unscheduledStudents} ainda sem dia/horário.`
        },
        {
          title: `${store.attendanceHistory.length} chamadas registradas`,
          text: store.attendanceHistory.length ? `Última chamada em ${formatDate(store.attendanceHistory[0].session_date)}.` : "Ainda não há chamadas registradas."
        },
        {
          title: `${store.progress.filter((item) => Number(item.percentComplete || 0) >= 0.9).length} perto de finalizar`,
          text: `${store.progress.filter((item) => Number(item.percentComplete || 0) >= 1).length} já concluídos.`
        }
      ]
        .map((item) => `<div class="dashboard-pill"><strong>${item.title}</strong><span>${item.text}</span></div>`)
        .join("");
    }
  }
}

function renderDashboardPanels() {
  const alerts = getStudentAlerts();
  const criticalAlerts = alerts.slice(0, 5);
  const recentSessions = store.attendanceHistory.slice(0, 5);
  const apostilaSummaryData = store.apostilas?.summary || {};

  if (dashboardAlertsSummary) {
    dashboardAlertsSummary.textContent = alerts.length
      ? `${alerts.length} alerta(s) no total, com ${alerts.filter((item) => item.severity === "alta").length} de alta prioridade.`
      : "Nenhum alerta crítico no momento.";
  }

  if (dashboardAlertsList) {
    dashboardAlertsList.innerHTML = criticalAlerts.length
      ? criticalAlerts.map((item) => `<div class="dashboard-list-item severity-${item.severity}"><strong>${item.student.student_name || "-"}</strong><span>${item.summary}</span></div>`).join("")
      : '<div class="dashboard-list-item severity-baixa"><strong>Tudo tranquilo</strong><span>Sem pendências urgentes agora.</span></div>';
  }

  if (dashboardAttendanceSummary) {
    dashboardAttendanceSummary.textContent = recentSessions.length
      ? `Mostrando as ${Math.min(recentSessions.length, 5)} chamadas mais recentes.`
      : "Nenhuma chamada registrada ainda.";
  }

  if (dashboardAttendanceList) {
    dashboardAttendanceList.innerHTML = recentSessions.length
      ? recentSessions.map((session) => `<div class="dashboard-list-item"><strong>${session.class_day || "-"} • ${formatClassTimeLabel(session.class_time)}</strong><span>${formatDate(session.session_date)} - ${session.total_records || 0} aluno(s), ${session.absences_count || 0} falta(s), ${session.repositions_count || 0} reposição(ões).</span></div>`).join("")
      : '<div class="dashboard-list-item severity-baixa"><strong>Sem histórico</strong><span>Ainda não há chamadas registradas.</span></div>';
  }

  if (dashboardApostilaSummary) {
    dashboardApostilaSummary.textContent = apostilaSummaryData.purchaseRequired
      ? `Comprar ${apostilaSummaryData.purchaseQuantity || 0} apostila(s) agora. ${apostilaSummaryData.pendingDebitCount || 0} alunos aguardando baixa.`
      : `Apostilas em dia. ${apostilaSummaryData.receivedCount || 0} alunos já marcados e estoque atual ${apostilaSummaryData.stockQuantity || 0}.`;
  }

  if (dashboardScheduleSummary) {
    const unscheduledStudents = store.students.filter((student) => !normalizeClassDayValue(student.class_day) || !normalizeClassTimeValue(student.class_time)).slice(0, 5);
    dashboardScheduleSummary.innerHTML = unscheduledStudents.length
      ? unscheduledStudents.map((student) => `<div class="dashboard-list-item"><strong>${student.student_name || "-"}</strong><span>Sem turma definida. ${student.responsible || "Sem responsável"}</span></div>`).join("")
      : '<div class="dashboard-list-item severity-baixa"><strong>Agenda completa</strong><span>Nenhum aluno sem turma no momento.</span></div>';
  }
}

function normalizeLookupText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeClassDayValue(value) {
  const normalized = normalizeLookupText(value);
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

function normalizeClassTimeValue(value) {
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

  const parts = text.split(/[,;|]/).map((entry) => entry.trim()).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];

  return `${parts[0]}-${parts[parts.length - 1]}`;
}

function formatClassTimeLabel(value) {
  const normalized = normalizeClassTimeValue(value);
  if (!normalized) return "Horário não informado";
  const [start, end] = normalized.split("-");
  return end ? `${start} às ${end}` : start;
}

function formatClassTimeKey(value) {
  return normalizeClassTimeValue(value);
}

function toIsoDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarBlockedDateSet() {
  const blocked = new Set();

  store.holidays.forEach((item) => {
    const date = String(item?.blocked_date || "").trim();
    if (date) blocked.add(date);
  });

  store.vacations.forEach((item) => {
    const start = String(item?.start_date || "").trim();
    const end = String(item?.end_date || "").trim();
    if (!start || !end) return;

    let cursor = new Date(`${start}T12:00:00`);
    const last = new Date(`${end}T12:00:00`);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return;

    while (cursor <= last) {
      blocked.add(toIsoDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return blocked;
}

function getNextClassForStudent(student) {
  const classDay = normalizeClassDayValue(student?.class_day || "");
  const classTime = normalizeClassTimeValue(student?.class_time || "");
  if (!classDay || !classTime) return null;

  const weekdayByDayName = {
    Segunda: 1,
    "Terça": 2,
    Quarta: 3,
    Quinta: 4,
    Sexta: 5,
    "Sábado": 6
  };

  const targetWeekday = weekdayByDayName[classDay];
  if (targetWeekday === undefined) return null;

  const blockedDates = getCalendarBlockedDateSet();
  const now = new Date();

  for (let offset = 0; offset <= 60; offset += 1) {
    const candidate = new Date(now);
    candidate.setHours(12, 0, 0, 0);
    candidate.setDate(now.getDate() + offset);

    if (candidate.getDay() !== targetWeekday) continue;

    const isoDate = toIsoDateKey(candidate);
    if (blockedDates.has(isoDate)) continue;

    return {
      day: classDay,
      timeLabel: formatClassTimeLabel(classTime),
      isoDate
    };
  }

  return null;
}

function compareClassTimeKeys(left, right) {
  const leftIndex = CLASS_TIME_ORDER.indexOf(left.split("-")[0]);
  const rightIndex = CLASS_TIME_ORDER.indexOf(right.split("-")[0]);
  return leftIndex - rightIndex || left.localeCompare(right, "pt-BR");
}

function matchesStudentSearch(student) {
  if (!studentsSearchTerm) return true;

  const haystack = [
    student.student_name,
    student.responsible,
    student.phone,
    student.class_day,
    student.class_time,
    student.attendance_status
  ].map(normalizeLookupText).join(" ");

  return haystack.includes(studentsSearchTerm);
}

function updateStudentsSearchMeta(total, visible) {
  if (!studentsSearchMeta) return;

  if (!total) {
    studentsSearchMeta.textContent = "Ainda não há alunos importados para pesquisar.";
    return;
  }

  if (!studentsSearchTerm) {
    studentsSearchMeta.textContent = `${total} alunos carregados para consulta e edição.`;
    return;
  }

  studentsSearchMeta.textContent = `${visible} de ${total} alunos correspondem à busca atual.`;
}

function getWeeklyScheduleStudents() {
  return store.students
    .filter((student) => normalizeClassDayValue(student.class_day) && String(student.class_time || "").trim())
    .sort((left, right) => {
      const dayDiff = CLASS_DAY_ORDER.indexOf(normalizeClassDayValue(left.class_day))
        - CLASS_DAY_ORDER.indexOf(normalizeClassDayValue(right.class_day));

      if (dayDiff !== 0) return dayDiff;

      return compareClassTimeKeys(formatClassTimeKey(left.class_time), formatClassTimeKey(right.class_time));
    });
}

function getWeeklyScheduleGroups() {
  const groups = new Map();

  getWeeklyScheduleStudents().forEach((student) => {
    const day = normalizeClassDayValue(student.class_day);
    const timeKey = formatClassTimeKey(student.class_time);
    const key = `${day}|${timeKey}`;

    if (!groups.has(key)) {
      groups.set(key, { day, timeKey, students: [] });
    }

    groups.get(key).students.push(student);
  });

  const grouped = [];
  CLASS_DAY_ORDER.forEach((day) => {
    [...groups.values()]
      .filter((group) => group.day === day)
      .sort((left, right) => compareClassTimeKeys(left.timeKey, right.timeKey))
      .forEach((group) => grouped.push(group));
  });

  return grouped;
}

function studentScheduleLabel(student) {
  const day = normalizeClassDayValue(student.class_day) || "Sem dia";
  const time = formatClassTimeLabel(student.class_time);
  return `${day} • ${time}`;
}

function setClassScheduleFeedback(message) {
  if (!classScheduleMessage) return;
  classScheduleMessage.textContent = message || "";
}

function selectStudentForScheduleMove(studentId) {
  const currentId = String(studentId || "");
  if (!currentId) return;

  pendingScheduleStudentId = pendingScheduleStudentId === currentId ? "" : currentId;
  const selectedStudent = store.students.find((student) => String(student.id) === pendingScheduleStudentId);

  if (selectedStudent) {
    setClassScheduleFeedback(`Aluno selecionado: ${selectedStudent.student_name}. Agora clique no dia/turma de destino.`);
  } else {
    setClassScheduleFeedback("Seleção de aluno cancelada.");
  }
}

function resolveScheduledStudentId(event) {
  const draggedId = String(event?.dataTransfer?.getData("text/student-id") || "").trim();
  if (draggedId) return draggedId;
  return String(pendingScheduleStudentId || "").trim();
}

async function handleScheduleTargetInteraction(classDay, event = null) {
  const studentId = resolveScheduledStudentId(event);
  if (!studentId) {
    setClassScheduleFeedback("Selecione um aluno para mover: clique no aluno e depois no destino.");
    return;
  }

  await promptAndMoveStudentToDay(studentId, classDay);
}

async function updateStudentSchedule(studentId, classDay, classTime) {
  const changedBy = getChangedBy();
  if (!changedBy) return false;

  const normalizedTime = normalizeClassTimeValue(classTime) || String(classTime || "").trim();
  if (!classDay || !normalizedTime) {
    setClassScheduleFeedback("Informe dia e horário válidos para salvar a turma.");
    return false;
  }

  try {
    await fetchJson(`${activeApiBaseUrl}/alunos/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: store.students.find((student) => String(student.id) === String(studentId))?.student_name || "",
        classDay,
        classTime: normalizedTime,
        changedBy
      })
    });

    await refreshData();
    pendingScheduleStudentId = "";
    setClassScheduleFeedback(`Turma atualizada: ${classDay} • ${formatClassTimeLabel(normalizedTime)}.`);
    return true;
  } catch (error) {
    setClassScheduleFeedback(`Falha ao salvar turma: ${error.message}`);
    return false;
  }
}

async function promptAndMoveStudentToDay(studentId, classDay) {
  const student = store.students.find((item) => String(item.id) === String(studentId));
  const fallbackTime = normalizeClassTimeValue(student?.class_time || "") || "";
  const existingTimes = getWeeklyScheduleGroups()
    .filter((group) => group.day === classDay)
    .map((group) => formatClassTimeLabel(group.timeKey));
  const hints = existingTimes.length
    ? `Horários já existentes em ${classDay}: ${existingTimes.join(", ")}`
    : `Ainda não há turma criada em ${classDay}.`;
  const enteredTime = await requestScheduleTime(classDay, fallbackTime, hints);
  if (enteredTime === null) return;

  const trimmedTime = String(enteredTime).trim();
  if (!trimmedTime) {
    setClassScheduleFeedback("Horário não informado. Nenhuma turma foi alterada.");
    return;
  }

  await updateStudentSchedule(studentId, classDay, trimmedTime);
}

function bindScheduleAssignModal() {
  if (scheduleAssignModalBound || !scheduleAssignModalEl || typeof bootstrap === "undefined") return;

  scheduleAssignModalBound = true;
  scheduleAssignModalInstance = new bootstrap.Modal(scheduleAssignModalEl, {
    backdrop: "static",
    keyboard: true
  });

  scheduleAssignSaveButton?.addEventListener("click", () => {
    if (!scheduleAssignResolver) return;
    const value = String(scheduleAssignTimeInput?.value || "").trim();
    const resolve = scheduleAssignResolver;
    scheduleAssignResolver = null;
    scheduleAssignModalInstance?.hide();
    resolve(value);
  });

  scheduleAssignModalEl.addEventListener("hidden.bs.modal", () => {
    if (!scheduleAssignResolver) return;
    const resolve = scheduleAssignResolver;
    scheduleAssignResolver = null;
    resolve(null);
  });
}

function requestScheduleTime(classDay, fallbackTime, hintText) {
  bindScheduleAssignModal();

  if (!scheduleAssignModalInstance || !scheduleAssignTimeInput) {
    setClassScheduleFeedback("Não foi possível abrir o formulário de horário nesta tela.");
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    scheduleAssignResolver = resolve;
    if (scheduleAssignHint) {
      scheduleAssignHint.textContent = `${hintText} Exemplo: 19 as 21.`;
    }
    scheduleAssignTimeInput.value = fallbackTime || "";
    const title = scheduleAssignModalEl.querySelector("#scheduleAssignModalLabel");
    if (title) {
      title.textContent = `Informar horário para ${classDay}`;
    }
    scheduleAssignModalInstance.show();
    setTimeout(() => {
      scheduleAssignTimeInput.focus();
      scheduleAssignTimeInput.select();
    }, 50);
  });
}

function getUnscheduledStudents() {
  return store.students
    .filter((student) => !normalizeClassDayValue(student.class_day) || !normalizeClassTimeValue(student.class_time))
    .sort((left, right) => String(left.student_name || "").localeCompare(String(right.student_name || ""), "pt-BR"));
}

function renderUnscheduledStudents() {
  if (!turmaUnscheduledList) return;

  turmaUnscheduledList.innerHTML = "";
  const allUnscheduled = getUnscheduledStudents();
  const visibleStudents = turmaUnscheduledTerm
    ? allUnscheduled.filter((student) => normalizeLookupText(student.student_name).includes(turmaUnscheduledTerm))
    : allUnscheduled;

  if (turmaUnscheduledMeta) {
    turmaUnscheduledMeta.textContent = `${visibleStudents.length} de ${allUnscheduled.length} aluno(s) sem turma.`;
  }

  if (!visibleStudents.length) {
    const empty = document.createElement("p");
    empty.className = "class-schedule-empty";
    empty.textContent = "Nenhum aluno sem turma encontrado.";
    turmaUnscheduledList.appendChild(empty);
    return;
  }

  visibleStudents.forEach((student) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "class-student-chip";
    chip.draggable = true;
    chip.dataset.studentId = student.id;
    chip.title = "Arraste para um dia/horário ou clique para editar";
    chip.innerHTML = `
      <strong>${student.student_name || "-"}</strong>
      <small>${student.responsible || "Sem responsável"}</small>
      <span>${studentScheduleLabel(student)}</span>
    `;
    chip.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/student-id", String(student.id));
      event.dataTransfer.effectAllowed = "move";
    });
    chip.addEventListener("click", (event) => {
      event.stopPropagation();
      selectStudentForScheduleMove(student.id);
      renderUnscheduledStudents();
      renderWeeklyClassSchedule();
    });
    if (String(student.id) === String(pendingScheduleStudentId)) {
      chip.classList.add("is-selected");
    }
    turmaUnscheduledList.appendChild(chip);
  });
}

function parseStudentPlannedCourseNames(student) {
  const raw = String(student?.enrolled_in || "").trim();
  if (!raw) return [];

  const names = raw
    .split(/[,;|]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^\d+\s*[_-]\s*/, "").trim())
    .filter(Boolean);

  return [...new Set(names)];
}

function findBestCourseMatchByName(courseName) {
  const plannedNormalized = normalizeLookupText(courseName);
  if (!plannedNormalized) return null;

  const exact = store.courses.find((course) => normalizeLookupText(course.name) === plannedNormalized);
  if (exact) return exact;

  return store.courses.find((course) => {
    const normalizedCourseName = normalizeLookupText(course.name);
    if (!normalizedCourseName) return false;
    return normalizedCourseName.includes(plannedNormalized) || plannedNormalized.includes(normalizedCourseName);
  }) || null;
}

function getStudentCourseMapping(student) {
  const plannedNames = parseStudentPlannedCourseNames(student);
  const matchedCourses = [];
  const unmatchedNames = [];

  plannedNames.forEach((name) => {
    const matched = findBestCourseMatchByName(name);
    if (matched) {
      if (!matchedCourses.some((course) => course.id === matched.id)) {
        matchedCourses.push(matched);
      }
      return;
    }
    unmatchedNames.push(name);
  });

  return { plannedNames, matchedCourses, unmatchedNames };
}

function renderCourseSelectOptions(courses, placeholder = "Selecione um curso") {
  if (!courseSelect) return;

  const previousValue = courseSelect.value;
  courseSelect.innerHTML = `<option value="">${placeholder}</option>`;

  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = `${course.name} - ${formatHours(course.total_hours)}h`;
    courseSelect.appendChild(option);
  });

  if (previousValue && courses.some((course) => String(course.id) === String(previousValue))) {
    courseSelect.value = previousValue;
  }
}

function getMappedProgressForStudent(student, mappedCourses) {
  const normalizedStudentName = normalizeLookupText(student?.student_name || "");
  if (!normalizedStudentName || !mappedCourses.length) {
    return { completed: 0, pending: mappedCourses.length };
  }

  const activeCourseIds = new Set(
    store.controls
      .filter((control) => normalizeLookupText(control.student_name) === normalizedStudentName)
      .map((control) => String(control.course_id || ""))
  );

  let completed = 0;
  mappedCourses.forEach((course) => {
    if (activeCourseIds.has(String(course.id))) {
      completed += 1;
    }
  });

  return {
    completed,
    pending: Math.max(mappedCourses.length - completed, 0)
  };
}

function getStudentProgrammingBuckets(student) {
  const mapping = getStudentCourseMapping(student);
  const normalizedStudentName = normalizeLookupText(student?.student_name || "");
  const normalizedCurrentCourse = normalizeLookupText(student?.current_course || "");

  const progressByCourseId = new Map(
    store.progress
      .filter((item) => normalizeLookupText(item.studentName) === normalizedStudentName)
      .map((item) => [String(item.courseId || ""), item])
  );

  const completedCourses = [];
  const inProgressCourses = [];
  const pendingCourses = [];

  mapping.matchedCourses.forEach((course) => {
    const progressItem = progressByCourseId.get(String(course.id));
    if (progressItem && Number(progressItem.percentComplete || 0) >= 1) {
      completedCourses.push({
        name: course.name,
        status: progressItem.status || "CONCLUÍDO",
        percentComplete: progressItem.percentComplete
      });
      return;
    }

    if (progressItem) {
      inProgressCourses.push({
        name: course.name,
        status: progressItem.status || "EM ANDAMENTO",
        percentComplete: progressItem.percentComplete
      });
      return;
    }

    pendingCourses.push({ name: course.name });
  });

  const plannedOrderMap = new Map();
  mapping.plannedNames.forEach((name, index) => {
    const normalized = normalizeLookupText(name);
    if (normalized) plannedOrderMap.set(normalized, index);
  });

  const compareByPlannedOrder = (left, right) => {
    const leftIndex = plannedOrderMap.get(normalizeLookupText(left.name));
    const rightIndex = plannedOrderMap.get(normalizeLookupText(right.name));
    const safeLeft = Number.isInteger(leftIndex) ? leftIndex : Number.MAX_SAFE_INTEGER;
    const safeRight = Number.isInteger(rightIndex) ? rightIndex : Number.MAX_SAFE_INTEGER;
    if (safeLeft !== safeRight) return safeLeft - safeRight;
    return String(left.name || "").localeCompare(String(right.name || ""), "pt-BR");
  };

  const compareWithCurrentFirst = (left, right) => {
    if (normalizedCurrentCourse) {
      const leftIsCurrent = normalizeLookupText(left.name) === normalizedCurrentCourse;
      const rightIsCurrent = normalizeLookupText(right.name) === normalizedCurrentCourse;
      if (leftIsCurrent !== rightIsCurrent) {
        return leftIsCurrent ? -1 : 1;
      }
    }
    return compareByPlannedOrder(left, right);
  };

  completedCourses.sort(compareByPlannedOrder);
  inProgressCourses.sort(compareWithCurrentFirst);
  pendingCourses.sort(compareByPlannedOrder);

  return {
    mapping,
    completedCourses,
    inProgressCourses,
    pendingCourses,
    unmatchedNames: mapping.unmatchedNames
  };
}

function applyStudentCourseFilter(student) {
  if (!courseSelect) return;

  if (!student) {
    renderCourseSelectOptions(store.courses, "Selecione um curso");
    return;
  }

  const mapping = getStudentCourseMapping(student);
  if (mapping.matchedCourses.length) {
    renderCourseSelectOptions(mapping.matchedCourses, "Selecione um curso da programação");
    return;
  }

  renderCourseSelectOptions(store.courses, "Selecione um curso");
}

function renderCourses() {
  destroyEnhancedTable("coursesTable");

  renderCourseSelectOptions(store.courses, "Selecione um curso");

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
    updateStudentsSearchMeta(0, 0);
    return;
  }

  const filteredStudents = store.students.filter(matchesStudentSearch);
  updateStudentsSearchMeta(store.students.length, filteredStudents.length);

  if (studentsMessage) {
    studentsMessage.textContent = filteredStudents.length ? "" : "Nenhum aluno encontrado para a busca informada.";
  }

  store.students.forEach((student) => {
    if (studentSelect) {
      const option = document.createElement("option");
      option.value = student.id;
      const contracted = student.contracted_hours ? `${formatHours(student.contracted_hours)}h` : "sem carga";
      option.textContent = `${student.student_name} - ${contracted}`;
      studentSelect.appendChild(option);
    }
  });

  filteredStudents.forEach((student) => {
    if (studentsTableBody) {
      const projection = student.projection || {};
      const projectionStatusClass = getProjectionVisualClass(projection.rhythmStatus);
      const apostilaStatus = getApostilaStatus(student);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.student_name || "-"}</td>
        <td>${formatDate(projection.startDate)}</td>
        <td>${student.responsible || "-"}</td>
        <td>${student.phone || "-"}</td>
        <td>${student.attendance_status || "-"}</td>
        <td><span class="badge ${apostilaStatus.badgeClass}">${apostilaStatus.label}</span></td>
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

function renderApostilas() {
  const hasDedicatedApostilaData = Boolean(store.apostilas?.students?.length);
  const sourceStudents = hasDedicatedApostilaData ? store.apostilas.students : store.students.filter((student) => {
    const lesson = Number(student.current_lesson || 0);
    return lesson >= 5 || Number(student.apostila_received || 0) === 1;
  });

  if (apostilaSummary) {
    const summary = hasDedicatedApostilaData
      ? (store.apostilas?.summary || {})
      : {
          eligibleCount: sourceStudents.filter((student) => Number(student.current_lesson || 0) >= 5).length,
          receivedCount: sourceStudents.filter((student) => Number(student.apostila_received || 0) === 1).length,
          stockDebitedCount: sourceStudents.filter((student) => Number(student.apostila_stock_debited || 0) === 1).length,
          pendingDebitCount: sourceStudents.filter((student) => Number(student.apostila_received || 0) === 1 && Number(student.apostila_stock_debited || 0) !== 1).length,
          stockQuantity: 0,
          purchaseRequired: sourceStudents.some((student) => Number(student.apostila_received || 0) === 1 && Number(student.apostila_stock_debited || 0) !== 1),
          purchaseQuantity: sourceStudents.filter((student) => Number(student.apostila_received || 0) === 1 && Number(student.apostila_stock_debited || 0) !== 1).length
        };
    const purchaseText = summary.purchaseRequired ? `Comprar ${summary.purchaseQuantity} apostila(s)` : "Sem necessidade de compra no momento";
    apostilaSummary.textContent = `${summary.eligibleCount || 0} aluno(s) já passaram da aula 5, ${summary.receivedCount || 0} com apostila registrada, estoque atual ${summary.stockQuantity || 0}, ${purchaseText.toLowerCase()}.`;
  }

  if (apostilaStatusMessage) {
    const summary = hasDedicatedApostilaData
      ? (store.apostilas?.summary || {})
      : {
          pendingDebitCount: sourceStudents.filter((student) => Number(student.apostila_received || 0) === 1 && Number(student.apostila_stock_debited || 0) !== 1).length,
          purchaseRequired: sourceStudents.some((student) => Number(student.apostila_received || 0) === 1 && Number(student.apostila_stock_debited || 0) !== 1)
        };
    apostilaStatusMessage.textContent = summary.purchaseRequired
      ? `Atenção: existem ${summary.pendingDebitCount || 0} apostila(s) aguardando baixa. Reponha o estoque.`
      : "O estoque de apostilas está em dia para os alunos que já passaram da aula 5.";
  }

  if (!apostilaTableBody) return;

  apostilaTableBody.innerHTML = "";
  const apostilaStudents = sourceStudents.slice();

  if (!apostilaStudents.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="5" class="text-center text-muted py-4">Nenhum aluno elegível para controle de apostilas ainda.</td>';
    apostilaTableBody.appendChild(row);
    return;
  }

  apostilaStudents.forEach((student) => {
    const status = getApostilaStatus(student);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.student_name || "-"}</td>
      <td>${student.current_course || "-"}</td>
      <td>${student.current_lesson ?? "-"}</td>
      <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
      <td>${status.detail}</td>
    `;
    apostilaTableBody.appendChild(row);
  });
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
    currentCourse: String(studentEditCurrentCourseInput?.value || "").trim(),
    currentLesson: String(studentEditCurrentLessonInput?.value || "").trim(),
    classDay: normalizeClassDayValue(studentEditClassDayInput?.value || ""),
    classTime: String(studentEditClassTimeInput?.value || "").trim(),
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

if (studentsSearchInput) {
  studentsSearchInput.addEventListener("input", () => {
    studentsSearchTerm = normalizeLookupText(studentsSearchInput.value);
    renderStudents();
  });
}

if (copyNotificationButton) {
  copyNotificationButton.addEventListener("click", async () => {
    const text = String(notificationPreview?.value || "").trim();
    if (!text) {
      alert("Selecione um aviso para gerar a mensagem antes de copiar.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      alert("Mensagem copiada para a área de transferência.");
    } catch {
      alert("Não foi possível copiar automaticamente. Copie manualmente o texto do campo.");
    }
  });
}

if (turmaUnscheduledSearchInput) {
  turmaUnscheduledSearchInput.addEventListener("input", () => {
    turmaUnscheduledTerm = normalizeLookupText(turmaUnscheduledSearchInput.value);
    renderUnscheduledStudents();
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

function renderAttendanceHistory() {
  destroyEnhancedTable("attendanceHistoryTable");

  if (!attendanceHistoryTableBody) return;
  attendanceHistoryTableBody.innerHTML = "";

  if (!store.attendanceHistory.length) {
    if (attendanceHistoryMessage) {
      attendanceHistoryMessage.textContent = "Nenhuma chamada registrada ainda.";
    }
    return;
  }

  if (attendanceHistoryMessage) {
    attendanceHistoryMessage.textContent = "";
  }

  store.attendanceHistory.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(session.session_date)}</td>
      <td>${session.class_day || "-"}</td>
      <td>${formatClassTimeLabel(session.class_time)}</td>
      <td>${session.total_records ?? 0}</td>
      <td>${session.presences_count ?? 0}</td>
      <td>${session.absences_count ?? 0}</td>
      <td>${session.repositions_count ?? 0}</td>
      <td>${session.created_by || "-"}</td>
    `;
    attendanceHistoryTableBody.appendChild(row);
  });

  enhanceTable("attendanceHistoryTable");
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
  const apostilaStatus = getApostilaStatus(student);
  const buckets = getStudentProgrammingBuckets(student);
  const progress = getMappedProgressForStudent(student, buckets.mapping.matchedCourses);
  const plannedSummary = buckets.mapping.plannedNames.length
    ? `${buckets.mapping.matchedCourses.length}/${buckets.mapping.plannedNames.length} cursos mapeados`
    : "Sem programação informada";

  const renderCourseList = (items, emptyMessage, formatter = (item) => item.name) => {
    if (!items.length) {
      return `<li class="student-programming-empty">${emptyMessage}</li>`;
    }

    return items
      .map((item) => `<li>${formatter(item)}</li>`)
      .join("");
  };

  selectedStudentDetails.innerHTML = `
    <div class="student-overview">
      <strong>${student.student_name || "-"}</strong>
      <div class="student-overview-grid">
        <span><b>Início base:</b> ${formatDate(projection.startDate)}</span>
        <span><b>Status:</b> ${student.attendance_status || "-"}</span>
        <span><b>Faltas:</b> ${student.absences_count ?? "-"}</span>
        <span><b>Última presença:</b> ${formatDate(student.last_presence_date)}</span>
        <span><b>Restante:</b> ${formatHours(projection.remainingHours)}h</span>
        <span><b>Situação:</b> ${projection.rhythmStatus || "-"}</span>
        <span><b>Responsável:</b> ${student.responsible || "-"}</span>
        <span><b>Telefone:</b> ${student.phone || "-"}</span>
        <span><b>% pacote:</b> ${student.package_percent != null ? formatPercent(student.package_percent) : "-"}</span>
        <span><b>% presença:</b> ${student.presence_percent != null ? formatPercent(student.presence_percent) : "-"}</span>
        <span><b>Aulas realizadas:</b> ${student.completed_sessions_count ?? "-"}</span>
        <span><b>Aulas extras:</b> ${student.extra_sessions_count ?? "-"}</span>
        <span><b>Agendamentos:</b> ${student.scheduled_sessions_count ?? "-"}</span>
        <span><b>Presenças:</b> ${student.presences_count ?? "-"}</span>
        <span><b>Reposições:</b> ${student.repositions_count ?? "-"}</span>
      </div>
      <div><b>Agenda:</b> ${student.class_day || "-"} • ${student.class_time || "-"}</div>
      <div><b>Curso atual:</b> ${student.current_course || "-"} • <b>Aula atual:</b> ${student.current_lesson ?? "-"}</div>
      <div><b>Apostila:</b> ${apostilaStatus.label} • ${apostilaStatus.detail}</div>
      <div><b>Observação do relatório:</b> ${student.schedule_note || "-"}</div>
      <div><b>Previsão final:</b> <span class="projection-chip ${projectionStatusClass}">${formatDate(projection.projectedCompletionDate)}</span></div>
      <div><b>Programação:</b> ${plannedSummary}</div>
      <div><b>Acompanhados na programação:</b> ${progress.completed}</div>
      <div><b>Pendentes da programação:</b> ${progress.pending}</div>
    </div>

    <div class="student-programming-grid">
      <section class="student-programming-card student-programming-complete">
        <h3>Concluídos</h3>
        <ul class="student-programming-list">
          ${renderCourseList(
            buckets.completedCourses,
            "Nenhum curso concluído identificado.",
            (item) => `${item.name} <span>${formatPercent(item.percentComplete)}</span>`
          )}
        </ul>
      </section>

      <section class="student-programming-card student-programming-current">
        <h3>Cursando</h3>
        <ul class="student-programming-list">
          ${renderCourseList(
            buckets.inProgressCourses,
            "Nenhum curso em andamento identificado.",
            (item) => `${item.name} <span>${formatPercent(item.percentComplete)}</span>`
          )}
        </ul>
      </section>

      <section class="student-programming-card student-programming-pending">
        <h3>Faltam cursar</h3>
        <ul class="student-programming-list">
          ${renderCourseList(buckets.pendingCourses, "Nenhum curso pendente identificado.")}
        </ul>
      </section>
    </div>

    <div class="student-programming-unmatched">
      <h3>Sem correspondência no catálogo</h3>
      <ul class="student-programming-list">
        ${renderCourseList(buckets.unmatchedNames.map((name) => ({ name })), "Todos os cursos do relatório já foram reconhecidos.")}
      </ul>
    </div>
  `;
}

function buildNotificationMessage(student, alertItem) {
  const nextClass = getNextClassForStudent(student);
  const dateText = nextClass
    ? `${formatDate(nextClass.isoDate)} às ${nextClass.timeLabel}`
    : `${student.class_day || "dia não definido"} • ${formatClassTimeLabel(student.class_time)}`;

  return [
    `Olá ${student.student_name || "aluno(a)"}, tudo bem?`,
    `Lembrete automático: ${alertItem.summary}.`,
    `Próxima aula prevista: ${dateText}.`,
    "Qualquer dúvida, estou à disposição para ajudar na organização do curso."
  ].join(" ");
}

function getStudentAlerts() {
  const alerts = [];

  store.students.forEach((student) => {
    const contractedHours = Number(student.contracted_hours || 0);
    const completedHours = Number(student.completed_hours || 0);
    const remainingHours = Math.max(contractedHours - completedHours, 0);
    const consumedRate = contractedHours > 0 ? completedHours / contractedHours : 0;

    const scheduledLessons = Number(student.scheduled_sessions_count || 0);
    const completedLessons = Number(student.completed_sessions_count || 0);
    const remainingLessons = scheduledLessons > 0 ? Math.max(scheduledLessons - completedLessons, 0) : null;

    const presenceRate = Number(student.presence_percent || 0);
    const absences = Number(student.absences_count || 0);

    if (contractedHours > 0 && (remainingHours <= 2 || consumedRate >= 0.9)) {
      alerts.push({
        student,
        severity: remainingHours <= 1 ? "alta" : "media",
        type: "horas",
        summary: `faltam ${formatHours(remainingHours)}h para finalizar as horas contratadas`
      });
    }

    if (remainingLessons !== null && remainingLessons <= 2) {
      alerts.push({
        student,
        severity: remainingLessons <= 1 ? "alta" : "media",
        type: "apostila",
        summary: `faltam ${remainingLessons} aula(s) para concluir a apostila atual`
      });
    }

    if ((student.presence_percent != null && presenceRate < 0.75) || absences >= 8) {
      alerts.push({
        student,
        severity: presenceRate < 0.6 || absences >= 12 ? "alta" : "media",
        type: "presenca",
        summary: `atenção em presença/faltas (${formatPercent(presenceRate)}, ${absences} falta(s))`
      });
    }

    if (!normalizeClassDayValue(student.class_day) || !normalizeClassTimeValue(student.class_time)) {
      alerts.push({
        student,
        severity: "alta",
        type: "agenda",
        summary: "aluno sem dia e horário definidos na agenda"
      });
    }
  });

  alerts.sort((left, right) => {
    const severityDiff = (ALERT_SEVERITY_ORDER[left.severity] ?? 9) - (ALERT_SEVERITY_ORDER[right.severity] ?? 9);
    if (severityDiff !== 0) return severityDiff;
    return String(left.student.student_name || "").localeCompare(String(right.student.student_name || ""), "pt-BR");
  });

  return alerts;
}

function renderNotifications() {
  if (!notificationsList) return;

  notificationsList.innerHTML = "";
  const alerts = getStudentAlerts();
  const highCount = alerts.filter((item) => item.severity === "alta").length;
  const mediumCount = alerts.filter((item) => item.severity === "media").length;

  if (alertsSummary) {
    alertsSummary.textContent = alerts.length
      ? `${alerts.length} aviso(s): ${highCount} alta prioridade e ${mediumCount} média prioridade.`
      : "Nenhum aviso crítico no momento.";
  }

  if (!alerts.length) {
    if (notificationPreview) {
      notificationPreview.value = "";
    }
    if (copyNotificationButton) {
      copyNotificationButton.disabled = true;
    }
    const empty = document.createElement("p");
    empty.className = "class-schedule-empty";
    empty.textContent = "Sem pendências para notificação agora.";
    notificationsList.appendChild(empty);
    return;
  }

  const selectAlert = (alertItem) => {
    const message = buildNotificationMessage(alertItem.student, alertItem);
    if (notificationPreview) {
      notificationPreview.value = message;
    }
    if (copyNotificationButton) {
      copyNotificationButton.disabled = false;
    }
  };

  alerts.forEach((alertItem, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `notification-item severity-${alertItem.severity}`;
    button.innerHTML = `
      <span class="notification-student">${alertItem.student.student_name || "-"}</span>
      <span class="notification-summary">${alertItem.summary}</span>
      <span class="notification-meta">${alertItem.student.class_day || "Sem dia"} • ${formatClassTimeLabel(alertItem.student.class_time)}</span>
    `;
    button.addEventListener("click", () => {
      selectAlert(alertItem);
    });
    notificationsList.appendChild(button);

    if (index === 0) {
      selectAlert(alertItem);
    }
  });
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

  renderWeeklyClassSchedule();
  renderUnscheduledStudents();
}

function renderWeeklyClassSchedule() {
  if (!classScheduleCalendar) return;

  classScheduleCalendar.innerHTML = "";
  const groupedTurmas = getWeeklyScheduleGroups();

  if (classScheduleMessage) {
    classScheduleMessage.textContent = groupedTurmas.length
      ? ""
      : "Nenhuma turma com dia e horário cadastrados ainda.";
  }

  CLASS_DAY_ORDER.forEach((classDay) => {
    const column = document.createElement("section");
    column.className = "class-schedule-column";
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", async (event) => {
      const targetElement = event.target instanceof Element ? event.target : null;
      if (targetElement?.closest(".class-schedule-card") || targetElement?.closest(".class-schedule-day-dropzone")) {
        return;
      }
      event.preventDefault();
      await handleScheduleTargetInteraction(classDay, event);
    });
    column.addEventListener("click", async (event) => {
      const targetElement = event.target instanceof Element ? event.target : null;
      if (targetElement?.closest(".class-schedule-card") || targetElement?.closest(".class-schedule-day-dropzone") || targetElement?.closest(".class-student-chip")) {
        return;
      }
      await handleScheduleTargetInteraction(classDay, null);
    });

    const dayGroups = groupedTurmas.filter((group) => group.day === classDay);

    column.innerHTML = `
      <div class="class-schedule-column-header">
        <h3>${classDay}</h3>
        <span>${dayGroups.length} turmas</span>
      </div>
    `;

    const dayDropzone = document.createElement("div");
    dayDropzone.className = "class-schedule-day-dropzone";
    dayDropzone.textContent = "Solte aqui para criar uma nova turma neste dia";
    dayDropzone.addEventListener("dragover", (event) => event.preventDefault());
    dayDropzone.addEventListener("drop", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await handleScheduleTargetInteraction(classDay, event);
    });
    dayDropzone.addEventListener("click", async (event) => {
      event.stopPropagation();
      await handleScheduleTargetInteraction(classDay, null);
    });
    column.appendChild(dayDropzone);

    if (!dayGroups.length) {
      const empty = document.createElement("p");
      empty.className = "class-schedule-empty";
      empty.textContent = "Solte um aluno aqui para criar uma turma.";
      column.appendChild(empty);
    } else {
      dayGroups.forEach((group) => {
        const card = document.createElement("article");
        card.className = "class-schedule-card";

        card.dataset.classDay = group.day;
        card.dataset.classTime = group.timeKey;
        card.addEventListener("dragover", (event) => event.preventDefault());
        card.addEventListener("drop", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          await handleScheduleTargetInteraction(group.day, event);
        });
        card.addEventListener("click", async (event) => {
          const targetElement = event.target instanceof Element ? event.target : null;
          if (targetElement?.closest(".class-student-chip")) return;
          await handleScheduleTargetInteraction(group.day, null);
        });

        card.innerHTML = `
          <div class="class-schedule-card-header">
            <div class="class-schedule-card-actions">
              <strong>${formatClassTimeLabel(group.timeKey)}</strong>
              <button type="button" class="attendance-call-button" data-action="open-attendance">Chamada</button>
            </div>
            <span>${group.students.length} aluno(s)</span>
          </div>
          <div class="class-schedule-card-students"></div>
        `;

        card.querySelector('[data-action="open-attendance"]')?.addEventListener("click", async (event) => {
          event.stopPropagation();
          await openAttendanceModal(group.day, group.timeKey);
        });

        const list = card.querySelector(".class-schedule-card-students");
        group.students.forEach((student) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "class-student-chip";
          chip.draggable = true;
          chip.dataset.studentId = student.id;
          chip.title = "Arraste para outra turma ou clique para editar";
          chip.innerHTML = `
            <strong>${student.student_name || "-"}</strong>
            <small>${student.responsible || "Sem responsável"}</small>
            <span>${studentScheduleLabel(student)}</span>
          `;
          chip.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/student-id", String(student.id));
            event.dataTransfer.effectAllowed = "move";
          });
          chip.addEventListener("click", (event) => {
            event.stopPropagation();
            selectStudentForScheduleMove(student.id);
            renderWeeklyClassSchedule();
            renderUnscheduledStudents();
          });
          if (String(student.id) === String(pendingScheduleStudentId)) {
            chip.classList.add("is-selected");
          }
          list.appendChild(chip);
        });

        column.appendChild(card);
      });
    }

    classScheduleCalendar.appendChild(column);
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
  renderDashboardPanels();
  renderCourses();
  renderStudents();
  renderApostilas();
  renderControls();
  renderProgress();
  renderPreview();
  renderCalendar();
  renderHolidayRules();
  renderAudit();
  renderAttendanceHistory();
  renderNotifications();
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
      applyStudentCourseFilter(null);
      renderSelectedStudent(null);
      return;
    }

    const student = store.students.find((item) => item.id === selectedId);
    if (!student) {
      applyStudentCourseFilter(null);
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

    applyStudentCourseFilter(student);
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

    if (!studentId) {
      alert("Selecione um aluno importado para validar a programação antes de salvar.");
      return;
    }

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
  renderDashboardPanels();
  renderCourses();
  renderStudents();
  renderApostilas();
  renderControls();
  renderProgress();
  renderPreview();
  renderCalendar();
  renderHolidayRules();
  renderAudit();
  renderAttendanceHistory();
  renderNotifications();
  applyStudentCourseFilter(null);
  renderSelectedStudent(null);
  initializeDateFields();
}

init();
