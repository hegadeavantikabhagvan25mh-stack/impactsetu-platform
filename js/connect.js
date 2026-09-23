// js/connect.js
// "Request Introduction" — the real, working connection path between a
// donor/CSR account and an NGO (or vice versa), without building actual
// in-app payments. Saves a request to Firestore; you (admin) see every
// request in the console and make the real email introduction manually.
// This is the standard first step real platforms take before automating
// messaging/payments — a deliberate scope choice, not a missing feature.

import { auth, db } from "./firebase-config.js";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/**
 * @param {Object} p
 * @param {'ngo'|'csr'} p.targetType - what kind of org is being contacted
 * @param {string} p.targetName
 * @param {string} p.message
 * @param {string} [p.amountRange] - optional funding range being proposed
 */
export async function sendConnectionRequest(p) {
  const user = auth.currentUser;
  if (!user) throw new Error("You need to be logged in to send a connection request.");

  await addDoc(collection(db, "connection_requests"), {
    fromUid: user.uid,
    fromEmail: user.email,
    fromName: user.displayName || user.email,
    targetType: p.targetType,
    targetName: p.targetName,
    targetEmail: p.targetEmail || "",
    message: p.message || "",
    amountRange: p.amountRange || "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

/** All requests *this* logged-in user has sent, newest first (sorted client-side). */
export async function getMyConnectionRequests() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(collection(db, "connection_requests"), where("fromUid", "==", user.uid));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return rows;
}

// --- Shared modal wiring, used by index.html ---------------------------

let pendingTarget = null; // { targetType, targetName, targetEmail }

function ensureModal() {
  if (document.getElementById("connect-overlay")) return;
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="modal-overlay" id="connect-overlay" onclick="if(event.target===this) window.ImpactSetuConnect.closeModal()">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="connect-modal-title">
        <button class="modal-close" onclick="window.ImpactSetuConnect.closeModal()" aria-label="Close">&times;</button>
        <h3 id="connect-modal-title">Request an introduction</h3>
        <p class="modal-sub" id="connect-modal-sub"></p>
        <div id="connect-modal-error" class="hidden" style="background:#FBEAE9; color:#B3261E; border:1px solid #F1C6C2; padding:10px 12px; border-radius:8px; font-size:13px; margin-bottom:14px;"></div>
        <form id="connect-form">
          <label class="form-label">Your message
            <textarea id="connect-message" rows="4" required placeholder="Briefly introduce your organisation and why this feels like a fit…" style="width:100%; margin-top:6px; font-family:'Inter',sans-serif; font-size:14px; padding:10px 12px; border:1px solid var(--line); border-radius:8px;"></textarea>
          </label>
          <label class="form-label">Proposed funding range (optional)
            <input type="text" id="connect-amount" placeholder="e.g. ₹5–8 L">
          </label>
          <button type="submit" class="btn btn-primary" id="connect-submit-btn" style="width:100%; margin-top:8px;">Send request</button>
        </form>
        <div id="connect-modal-success" class="hidden">
          <h3>Request sent</h3>
          <p class="modal-sub" id="connect-success-sub">We've logged your introduction request. Our team reviews these and makes the actual email connection — check your dashboard for status.</p>
          <a id="connect-mailto-btn" class="btn btn-primary hidden" style="display:block; text-align:center; text-decoration:none; margin-bottom:10px;" target="_blank" rel="noopener">Open email draft</a>
          <button class="btn btn-ghost" style="width:100%;" onclick="window.ImpactSetuConnect.closeModal()">Close</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);

  document.getElementById("connect-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("connect-modal-error");
    errEl.classList.add("hidden");
    const btn = document.getElementById("connect-submit-btn");
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      await sendConnectionRequest({
        targetType: pendingTarget.targetType,
        targetName: pendingTarget.targetName,
        targetEmail: pendingTarget.targetEmail,
        message: document.getElementById("connect-message").value,
        amountRange: document.getElementById("connect-amount").value,
      });
      document.getElementById("connect-form").classList.add("hidden");
      document.getElementById("connect-modal-success").classList.remove("hidden");

      const mailtoBtn = document.getElementById("connect-mailto-btn");
      const successSub = document.getElementById("connect-success-sub");
      if (pendingTarget.targetEmail) {
        const user = auth.currentUser;
        const subject = `Introduction via ImpactSetu — ${user?.displayName || user?.email || "a potential partner"}`;
        const amount = document.getElementById("connect-amount").value;
        const body =
          `Hi ${pendingTarget.targetName},\n\n` +
          document.getElementById("connect-message").value +
          (amount ? `\n\nProposed funding range: ${amount}` : "") +
          `\n\n— Sent via ImpactSetu (${user?.email || ""})`;
        mailtoBtn.href = `mailto:${pendingTarget.targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        mailtoBtn.textContent = `Email ${pendingTarget.targetName} now`;
        mailtoBtn.classList.remove("hidden");
        successSub.textContent = "We've logged your request, and drafted the actual email for you below — this opens your own mail app so you send it yourself.";
      } else {
        mailtoBtn.classList.add("hidden");
        successSub.textContent = "We've logged your introduction request. This organisation doesn't have a direct email on file yet, so our team will make the introduction manually — check your dashboard for status.";
      }
    } catch (err) {
      errEl.textContent = err.message || "Something went wrong sending that request.";
      errEl.classList.remove("hidden");
      if (err.message && err.message.includes("logged in")) {
        setTimeout(() => { window.location.href = "login.html"; }, 1200);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = "Send request";
    }
  });
}

function openModal(targetType, targetName, targetEmail) {
  ensureModal();
  pendingTarget = { targetType, targetName, targetEmail: targetEmail || "" };
  document.getElementById("connect-modal-title").textContent = `Connect with ${targetName}`;
  document.getElementById("connect-modal-sub").textContent =
    targetType === "ngo"
      ? "Tell them a bit about your organisation and what you're looking to fund."
      : "Tell them a bit about your NGO's work and what kind of support you're looking for.";
  document.getElementById("connect-form").classList.remove("hidden");
  document.getElementById("connect-modal-success").classList.add("hidden");
  document.getElementById("connect-modal-error").classList.add("hidden");
  document.getElementById("connect-mailto-btn").classList.add("hidden");
  document.getElementById("connect-form").reset();
  document.getElementById("connect-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const overlay = document.getElementById("connect-overlay");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

window.ImpactSetuConnect = { openModal, closeModal, sendConnectionRequest, getMyConnectionRequests };
