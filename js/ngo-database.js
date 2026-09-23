// js/ngo-database.js
// Loads the NGO directory from Firestore (collection: ngos) — the same
// pattern as js/csr-database.js, so both CSR companies and NGOs are now
// managed the same way, from the same Firebase Console.

import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export async function loadNgoDirectory() {
  const snap = await getDocs(collection(db, "ngos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

window.ImpactSetuNgoDb = { loadNgoDirectory };
