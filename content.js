
function createTrackerBox() {
  const box = document.createElement("div");
  box.id = "naukri-tracker-box";
  box.innerHTML = `
    <div><strong>Apply:</strong> <span id="applyCount">0</span></div>
    <div><strong>Company Site:</strong> <span id="companyCount">0</span></div>
    <div><strong>Total:</strong> <span id="totalCount">0</span></div>
    <button id="viewDetails">Show Details</button>
  `;
  document.body.appendChild(box);

  document.getElementById("viewDetails").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openDetails" });
  });
}

function updateCountsUI(apply, company) {
  document.getElementById("applyCount").innerText = apply;
  document.getElementById("companyCount").innerText = company;
  document.getElementById("totalCount").innerText = apply + company;
}

function getToday() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function incrementCount(type) {
  const today = getToday();
  chrome.storage.local.get(["history"], data => {
    let history = data.history || {};
    if (!history[today]) history[today] = { apply: 0, company: 0 };
    history[today][type]++;
    chrome.storage.local.set({ history });

    const apply = history[today].apply;
    const company = history[today].company;
    updateCountsUI(apply, company);
  });
}

function getTodayCounts() {
  const today = getToday();
  chrome.storage.local.get(["history"], data => {
    const counts = data.history?.[today] || { apply: 0, company: 0 };
    updateCountsUI(counts.apply, counts.company);
  });
}

function attachClickListeners() {
  const allButtons = Array.from(document.querySelectorAll("a, button"));
  allButtons.forEach(el => {
    if (el.dataset.trackerAttached) return;

    if (/apply/i.test(el.textContent)) {
      el.addEventListener("click", () => {
        if (/company site/i.test(el.textContent)) {
          incrementCount("company");
        } else {
          incrementCount("apply");
        }
      });
      el.dataset.trackerAttached = "true";
    }
  });
}

createTrackerBox();
getTodayCounts();
const observer = new MutationObserver(() => attachClickListeners());
observer.observe(document.body, { childList: true, subtree: true });
