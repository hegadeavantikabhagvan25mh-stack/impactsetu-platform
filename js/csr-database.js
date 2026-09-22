// js/csr-database.js
// Loads the real CSR/donor database from Firestore (collection: csr_companies)
// and drives the filterable table in index.html's CSR & Donors view.
// This replaces the static sample data you pasted from the Firebase console
// snippet — same table shape, live data instead of a hardcoded snippet.

import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let csrCompanies = [];

export async function loadCsrCompanies() {
  const snap = await getDocs(collection(db, "csr_companies"));
  csrCompanies = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  populateCsrFilters();
  return csrCompanies;
}

export function getCsrCompanies() {
  return csrCompanies;
}

function populateCsrFilters() {
  const stateSel = document.getElementById("csr-state-filter");
  const causeSel = document.getElementById("csr-cause-filter");
  if (!stateSel || !causeSel) return;

  const states = [...new Set(csrCompanies.map((c) => c.state).filter(Boolean))].sort();
  const causes = [
    ...new Set(csrCompanies.flatMap((c) => c.focusAreas || []).filter(Boolean)),
  ].sort();

  stateSel.innerHTML =
    '<option value="All">All States</option>' +
    states.map((s) => `<option value="${s}">${s}</option>`).join("");
  causeSel.innerHTML =
    '<option value="All">All Focus Areas</option>' +
    causes.map((c) => `<option value="${c}">${c}</option>`).join("");
}

export function renderCsrDatabase() {
  const body = document.getElementById("company-table-body");
  if (!body) return;

  const stateFilter = document.getElementById("csr-state-filter")?.value || "All";
  const causeFilter = document.getElementById("csr-cause-filter")?.value || "All";
  const query = (document.getElementById("csr-search")?.value || "").trim().toLowerCase();

  const filtered = csrCompanies.filter((c) => {
    const matchesState = stateFilter === "All" || c.state === stateFilter;
    const matchesCause = causeFilter === "All" || (c.focusAreas || []).includes(causeFilter);
    const matchesQuery =
      !query ||
      (c.name || "").toLowerCase().includes(query) ||
      (c.districts || []).some((d) => d.toLowerCase().includes(query));
    return matchesState && matchesCause && matchesQuery;
  });

  if (filtered.length === 0) {
    body.innerHTML = `<tr><td colspan="4" style="color:var(--ink-soft); font-size:13.5px;">No CSR partners matched that search or filter.</td></tr>`;
    return;
  }

  body.innerHTML = filtered
    .map(
      (c) => `
      <tr>
        <td>${c.name}${c.verified ? ' <span class="chip" style="background:#E7F4F1; color:var(--teal-deep); font-size:11px;">Verified</span>' : ""}</td>
        <td>${c.state || "—"}</td>
        <td>${(c.focusAreas || []).join(", ") || "—"}</td>
        <td>${(c.districts || []).join(", ") || "—"}</td>
      </tr>`
    )
    .join("");
}

/** Wires the filter/search controls once the table exists in the DOM. */
export function initCsrDatabaseUI() {
  ["csr-state-filter", "csr-cause-filter"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", renderCsrDatabase);
  });
  document.getElementById("csr-search")?.addEventListener("input", renderCsrDatabase);
}

window.ImpactSetuCsrDb = { loadCsrCompanies, getCsrCompanies, renderCsrDatabase, initCsrDatabaseUI, populateCsrFilters };
