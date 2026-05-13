const DEFAULT_OPTIONS = {
  morningStart: "07:30",
  morningEnd: "12:00",
  lunchStart: "12:00",
  lunchEnd: "13:30",
  afternoonStart: "13:30",
  afternoonEnd: "17:00"
};

let widgetOptions = { ...DEFAULT_OPTIONS };
let lastRecords = [];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

grist.ready({
  requiredAccess: "read table",
  hasCustomOptions: true,
  columns: [
    { name: "Formation", title: "Formation", type: "Text" },
    { name: "Jour", title: "Jour", type: "Choice" },
    { name: "Heure", title: "Heure", type: "Choice" }
  ]
});

grist.onOptions(options => {
  widgetOptions = {
    ...DEFAULT_OPTIONS,
    ...(options || {})
  };

  renderPlanning(lastRecords);
});

grist.onRecords(records => {
  lastRecords = records || [];
  renderPlanning(lastRecords);
});

grist.onEditOptions(() => {
  showOptions();
});

function getSlots() {
  return [
    {
      key: "Matin",
      label: "Matin",
      time: `${widgetOptions.morningStart} - ${widgetOptions.morningEnd}`
    },
    {
      key: "Pause",
      label: "Pause méridienne",
      time: `${widgetOptions.lunchStart} - ${widgetOptions.lunchEnd}`
    },
    {
      key: "Après-midi",
      label: "Après-midi",
      time: `${widgetOptions.afternoonStart} - ${widgetOptions.afternoonEnd}`
    }
  ];
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("-", " ")
    .replace(/\s+/g, " ");
}

function findCourses(records, day, slot) {
  return records.filter(record =>
    normalize(record.Formation) &&
    normalize(record.Jour) === normalize(day) &&
    normalize(record.Heure) === normalize(slot)
  );
}

function renderPlanning(records) {
  const container = document.getElementById("planning");
  if (!container) return;

  container.innerHTML = "";

  addCell("", "header");

  DAYS.forEach(day => {
    addCell(day, "header");
  });

  getSlots().forEach(slot => {
    addCell(`
      ${slot.label}
      <span class="time">${slot.time}</span>
    `, "slot");

    DAYS.forEach(day => {
      if (slot.key === "Pause") {
        addCell(`
          Pause méridienne
          <span class="time">${slot.time}</span>
        `, "pause");
        return;
      }

      const courses = findCourses(records, day, slot.key);

      if (!courses.length) {
        addCell("Libre", "free");
        return;
      }

      const html = courses.map(course => `
        <div class="course">
          ${escapeHtml(course.Formation)}
          <span class="time">${slot.time}</span>
        </div>
      `).join("");

      addCell(html);
    });
  });
}

function addCell(content, className = "") {
  const container = document.getElementById("planning");

  const div = document.createElement("div");
  div.className = `cell ${className}`;
  div.innerHTML = content;

  container.appendChild(div);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toggleOptions() {
  const panel = document.getElementById("optionsPanel");
  if (!panel) return;

  panel.style.display = panel.style.display === "none" ? "block" : "none";

  if (panel.style.display === "block") {
    fillOptionsForm();
  }
}

function showOptions() {
  const panel = document.getElementById("optionsPanel");
  if (!panel) return;

  panel.style.display = "block";
  fillOptionsForm();
}

function hideOptions() {
  const panel = document.getElementById("optionsPanel");
  if (!panel) return;

  panel.style.display = "none";
}

function fillOptionsForm() {
  Object.keys(DEFAULT_OPTIONS).forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.value = widgetOptions[key] || DEFAULT_OPTIONS[key];
    }
  });
}

async function saveOptions() {
  const newOptions = {};

  Object.keys(DEFAULT_OPTIONS).forEach(key => {
    const input = document.getElementById(key);
    newOptions[key] = input?.value || DEFAULT_OPTIONS[key];
  });

  await grist.setOptions(newOptions);

  widgetOptions = {
    ...DEFAULT_OPTIONS,
    ...newOptions
  };

  hideOptions();
  renderPlanning(lastRecords);
}
