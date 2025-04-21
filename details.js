
function getStartOfWeek(offset) {
  const today = new Date();
  const start = new Date(today.setDate(today.getDate() - today.getDay() - (offset * 7)));
  return new Date(start.setHours(0,0,0,0));
}

function getWeekDates(offset) {
  const dates = [];
  let start = getStartOfWeek(offset);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

let chartInstance = null;

function populateWeekSelector() {
  const select = document.getElementById("weekSelector");
  for (let i = 0; i < 4; i++) {
    const label = i === 0 ? "Current Week" : `${i} Week(s) Ago`;
    const opt = new Option(label, i);
    select.appendChild(opt);
  }
  select.addEventListener("change", () => renderTable(parseInt(select.value)));
}

function renderTable(offset) {
  chrome.storage.local.get(["history"], data => {
    const dates = getWeekDates(offset);
    const applyData = [];
    const companyData = [];
    const totalData = [];

    const tbody = document.querySelector("#statsTable tbody");
    tbody.innerHTML = "";

    dates.forEach(date => {
      const entry = data.history?.[date] || { apply: 0, company: 0 };
      const total = entry.apply + entry.company;
      tbody.innerHTML += `<tr><td>${date}</td><td>${entry.apply}</td><td>${entry.company}</td><td>${total}</td></tr>`;
      applyData.push(entry.apply);
      companyData.push(entry.company);
      totalData.push(total);
    });

    const ctx = document.getElementById("chart").getContext("2d");
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Apply', data: applyData, borderColor: 'blue', fill: false },
          { label: 'Company Site', data: companyData, borderColor: 'green', fill: false },
          { label: 'Total', data: totalData, borderColor: 'black', fill: false }
        ]
      }
    });
  });
}

populateWeekSelector();
renderTable(0);
