// js/auth.js
// Real accounts: Firebase Authentication (email/password) + a matching
// profile document in Firestore's `users` collection that carries the
// role (donor / ngo / csr) and the rest of the profile fields.
//
// Import this as a <script type="module"> on any page that needs auth.
// It attaches everything it exports to window.ImpactSetuAuth as well,
// so plain (non-module) inline onclick="" handlers can call it too —
// same pattern your existing index.html already uses for Firestore saves.

import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/**
 * Create a real account + profile document.
 * @param {Object} p
 * @param {string} p.email
 * @param {string} p.password
 * @param {'donor'|'ngo'|'csr'} p.role
 * @param {string} p.name
 * @param {string} p.org
 * @param {string} p.city
 * @param {string} [p.state]
 * @param {Object} [p.extra] - role-specific extra fields (e.g. NGO's csr1Number)
 */
export async function registerUser(p) {
  const cred = await createUserWithEmailAndPassword(auth, p.email, p.password);
  await updateProfile(cred.user, { displayName: p.name });

  const profile = {
    uid: cred.user.uid,
    email: p.email,
    role: p.role,
    name: p.name,
    org: p.org || "",
    city: p.city || "",
    state: p.state || "",
    // NGOs go live only after manual review; donor/CSR accounts are
    // usable immediately since there's nothing to verify to browse.
    status: p.role === "ngo" ? "pending_verification" : "active",
    createdAt: serverTimestamp(),
    ...((p.extra) || {}),
  };

  await setDoc(doc(db, "users", cred.user.uid), profile);
  return { user: cred.user, profile };
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  return { user: cred.user, profile };
}

export function logoutUser() {
  return signOut(auth);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Fires `callback(user, profile)` on every auth change, `callback(null, null)`
 * when signed out. Use this once per page to drive whatever that page needs
 * to show for a logged-in vs logged-out visitor.
 */
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null, null);
    const profile = await getUserProfile(user.uid);
    callback(user, profile);
  });
}

/**
 * Drop-in header widget: pass the ids of the elements already sitting in
 * your nav (see index.html / login.html / dashboard.html for the markup)
 * and this keeps them in sync with the auth state automatically.
 */
export function wireAuthHeader({
  loggedOutEl = "auth-logged-out",
  loggedInEl = "auth-logged-in",
  nameEl = "auth-user-name",
  dashboardLinkEl = "auth-dashboard-link",
  logoutBtnEl = "auth-logout-btn",
} = {}) {
  watchAuthState((user, profile) => {
    const outEl = document.getElementById(loggedOutEl);
    const inEl = document.getElementById(loggedInEl);
    if (!outEl || !inEl) return;
    if (user && profile) {
      outEl.classList.add("hidden");
      inEl.classList.remove("hidden");
      const nEl = document.getElementById(nameEl);
      if (nEl) nEl.textContent = profile.name || profile.email;
      const dEl = document.getElementById(dashboardLinkEl);
      if (dEl) dEl.href = `dashboard.html?role=${encodeURIComponent(profile.role)}`;
    } else {
      outEl.classList.remove("hidden");
      inEl.classList.add("hidden");
    }
  });

  const logoutBtn = document.getElementById(logoutBtnEl);
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await logoutUser();
      window.location.href = "index.html";
    });
  }
}

/**
 * Call at the top of a page that should only be visible to a signed-in
 * user (optionally restricted to specific roles). Redirects to
 * login.html if the check fails. Returns a Promise<{user, profile}>.
 */
export function requireAuth({ roles = null, redirectTo = "login.html" } = {}) {
  return new Promise((resolve) => {
    watchAuthState((user, profile) => {
      if (!user || !profile) {
        window.location.href = redirectTo;
        return;
      }
      if (roles && !roles.includes(profile.role)) {
        window.location.href = redirectTo;
        return;
      }
      resolve({ user, profile });
    });
  });
}

// Expose to plain <script> blocks (non-module) the same way firebase-config's
// window.__saveToFirestore is already used in index.html.
window.ImpactSetuAuth = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  watchAuthState,
  wireAuthHeader,
  requireAuth,
};
