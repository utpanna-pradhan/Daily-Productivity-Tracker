let entries = JSON.parse(localStorage.getItem("entries")) || [];

const form = document.getElementById("taskForm");
const entriesDiv = document.getElementById("entries");
const calendarDiv = document.getElementById("calendar");
const chartCtx = document.getElementById("hoursChart").getContext("2d");

// Helper to format date as dd-mm-yy
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y.slice(2)}`;
}

// Helper to get today's date in yyyy-mm-dd format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function saveAndRender() {
  localStorage.setItem("entries", JSON.stringify(entries));
  renderEntries();
  renderCalendar();
  renderChart();
}

function renderEntries() {
  entriesDiv.innerHTML = "";
  entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((entry) => {
      const div = document.createElement("div");
      div.className = "entry";
      div.innerHTML = `
        <strong>${formatDate(entry.date)}</strong>
        <span>📝 Task: ${entry.task}</span>
        <span>⏱ Hours: ${entry.hours}</span>
        <button class="delete-btn" onclick="deleteEntry('${entry.date}')">Delete</button>
      `;
      entriesDiv.appendChild(div);
    });
}

function deleteEntry(date) {
  entries = entries.filter(e => e.date !== date);
  saveAndRender();
}

function renderCalendar() {
  calendarDiv.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 41); // show last 6 weeks

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];

    const box = document.createElement("div");
    box.className = "day-box";
    box.textContent = date.getDate();
    box.title = formatDate(dateStr);

    const entry = entries.find(e => e.date === dateStr);
    if (entry) {
      box.classList.add("logged");
    } else if (date < new Date(getTodayDate())) {
      box.classList.add("missed");
    }

    calendarDiv.appendChild(box);
  }
}

function renderChart() {
  const dateToHours = {};

  for (let i = 0; i < 42; i++) {
    const date = new Date();
    date.setDate(date.getDate() - 41 + i);
    const dStr = date.toISOString().split("T")[0];
    dateToHours[dStr] = 0;
  }

  entries.forEach(e => {
    if (e.date in dateToHours) {
      dateToHours[e.date] = parseFloat(e.hours);
    }
  });

  const labels = Object.keys(dateToHours).map(formatDate);
  const data = Object.values(dateToHours);

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(chartCtx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Hours Worked (max 14)",
        data,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#388e3c"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 14,
          title: {
            display: true,
            text: 'Hours'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = document.getElementById("task").value.trim();
  const hours = document.getElementById("hours").value.trim();
  const date = getTodayDate();

  if (!task || !hours) return;
  if (parseFloat(hours) > 14) {
    alert("Working hours should not exceed 14.");
    return;
  }

  const existing = entries.find(e => e.date === date);
  if (existing) {
    alert("Entry for today already exists.");
    return;
  }

  entries.push({ date, task, hours });
  saveAndRender();
  form.reset();
});

saveAndRender();
