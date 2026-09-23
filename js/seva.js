// js/seva.js
// "Seva" — a guided-help widget, not a live LLM. A real AI chatbot would
// need a backend to keep an API key secret (unsafe to call an AI API
// directly from client-side JS on a public site), which is real
// infrastructure beyond a class prototype. This answers the common
// "how do I..." questions instantly, entirely in the browser, no backend,
// no API key, nothing to leak. Drop <script src="js/seva.js" defer></script>
// near the end of <body> on any page to add her.

(function () {
  const KB = [
    {
      q: ["what is impactsetu", "what is this site", "what is this", "about"],
      a: "ImpactSetu reads public need-gap data (real NFHS-5 government stats) across districts and matches it to verified NGOs already working there — so CSR budgets and individual donors can find credible organisations beyond the usual well-known names.",
    },
    {
      q: ["register", "sign up", "signup", "create account", "how do i join"],
      a: "Click 'Log in / Register' in the top right, go to the Register tab, and choose whether you're a Donor/HNI, an NGO, or a CSR company. NGO accounts stay pending until we manually verify them — everyone else is active right away.",
    },
    {
      q: ["login", "log in", "sign in", "forgot password"],
      a: "Use the 'Log in / Register' link in the header, Log in tab. If you've forgotten your password, there's no reset flow yet in this prototype — just register again with a different email for now.",
    },
    {
      q: ["need-gap", "need gap", "pulse", "district data", "nfhs"],
      a: "The Need-Gap Pulse shows real district-level child-stunting and sanitation data from the government's NFHS-5 survey. Severity bands (High/Medium/Low) are our own simple threshold, not an official government tier.",
    },
    {
      q: ["csr partner database", "csr database", "csr companies", "find a company"],
      a: "The CSR Partner Database (in the CSR & Donors view) lists registered CSR companies and HNI donors, with filters by state and focus area — it's live data from our Firestore database.",
    },
    {
      q: ["verified ngo", "ngo directory", "find an ngo", "list of ngos"],
      a: "The Verified NGOs list (in the NGOs view) is a directory of real organisations we've identified from public information, filterable by cause and state.",
    },
    {
      q: ["match", "matching", "fit score", "how does matching work"],
      a: "Matches are scored on cause overlap, shared districts/state, and how severe the real documented need is in that district — the % you see is that fit score, not a guarantee.",
    },
    {
      q: ["connect", "introduction", "how do i reach out", "contact an ngo", "contact a donor", "fund", "donate", "pay"],
      a: "Hit 'Connect' on any matched card, add a short message and (optionally) a funding range, and send it. That logs a real introduction request — our team reviews these and makes the actual email connection. There's no in-app payment yet, this prototype focuses on the matching and introduction step.",
    },
    {
      q: ["status", "my requests", "did they reply", "pending"],
      a: "Check your Dashboard (top right once logged in) — 'Your connection requests' shows every request you've sent and whether it's pending, accepted, or declined.",
    },
    {
      q: ["pending verification", "why is my ngo not showing", "not verified"],
      a: "New NGO accounts start as 'pending verification' until an admin manually checks your registration details — this isn't automatic yet in the prototype, so it may take a little while.",
    },
    {
      q: ["csr & donors", "ngo view", "switch view", "toggle"],
      a: "Use the 'CSR & Donors' / 'NGOs' toggle near the top of the page — it switches between the need-gap map + CSR database (for funders) and the verified NGO directory + matched opportunities (for NGOs).",
    },
    {
      q: ["contact", "help", "support", "human", "talk to someone"],
      a: "This is a student prototype (an MPB project for ICFAI Business School, Hyderabad) without live support staff yet — but I can walk you through anything on the site itself.",
    },
  ];

  const FALLBACK =
    "I'm not sure about that one yet — I can help with registering, logging in, the need-gap data, the CSR database, the NGO directory, how matching works, or how to send a connection request. Try asking about one of those, or use the buttons below.";

  const QUICK_REPLIES = [
    "How do I register?",
    "How does matching work?",
    "How do I connect with an NGO?",
    "What is the CSR Partner Database?",
  ];

  function findAnswer(text) {
    const t = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const entry of KB) {
      for (const kw of entry.q) {
        if (t.includes(kw)) {
          if (kw.length > bestScore) {
            bestScore = kw.length;
            best = entry.a;
          }
        }
      }
    }
    return best || FALLBACK;
  }

  function injectStyles() {
    const css = `
      #seva-launcher{
        position:fixed; bottom:22px; right:22px; z-index:9999;
        width:58px; height:58px; border-radius:50%; border:none; cursor:pointer;
        background:#161F38; color:white; font-family:'Fraunces',serif; font-size:22px; font-weight:600;
        box-shadow:0 8px 24px rgba(22,31,56,0.35); display:flex; align-items:center; justify-content:center;
      }
      #seva-launcher:hover{ transform:translateY(-2px); }
      #seva-panel{
        position:fixed; bottom:92px; right:22px; z-index:9999; width:340px; max-width:calc(100vw - 32px);
        max-height:min(520px, 70vh); background:#F6F4EE; border:1px solid #DAD5C7; border-radius:16px;
        box-shadow:0 20px 50px rgba(22,31,56,0.25); display:none; flex-direction:column; overflow:hidden;
        font-family:'Inter',sans-serif;
      }
      #seva-panel.open{ display:flex; }
      #seva-head{
        background:#161F38; color:white; padding:14px 16px; display:flex; align-items:center; justify-content:space-between;
      }
      #seva-head .title{ font-family:'Fraunces',serif; font-weight:600; font-size:16px; }
      #seva-head .sub{ font-size:11.5px; color:#C9CEDC; margin-top:2px; }
      #seva-close{ background:none; border:none; color:white; font-size:20px; cursor:pointer; line-height:1; }
      #seva-messages{ flex:1; overflow-y:auto; padding:14px 14px 6px; display:flex; flex-direction:column; gap:10px; }
      .seva-msg{ max-width:85%; padding:9px 12px; border-radius:12px; font-size:13.5px; line-height:1.45; }
      .seva-msg.bot{ background:white; border:1px solid #DAD5C7; color:#1B2230; align-self:flex-start; border-bottom-left-radius:3px; }
      .seva-msg.user{ background:#0F9C8A; color:white; align-self:flex-end; border-bottom-right-radius:3px; }
      #seva-quick{ display:flex; flex-wrap:wrap; gap:6px; padding:8px 14px; }
      #seva-quick button{
        background:white; border:1px solid #DAD5C7; border-radius:999px; padding:6px 11px; font-size:12px;
        color:#161F38; cursor:pointer; font-family:'Inter',sans-serif;
      }
      #seva-quick button:hover{ border-color:#0F9C8A; }
      #seva-input-row{ display:flex; gap:8px; padding:12px 14px; border-top:1px solid #DAD5C7; background:white; }
      #seva-input{
        flex:1; border:1px solid #DAD5C7; border-radius:999px; padding:9px 14px; font-size:13.5px;
        font-family:'Inter',sans-serif; outline:none;
      }
      #seva-input:focus{ border-color:#0F9C8A; }
      #seva-send{
        background:#161F38; color:white; border:none; border-radius:999px; padding:0 16px; font-weight:600;
        font-size:13px; cursor:pointer;
      }
      @media (max-width:420px){ #seva-panel{ right:16px; left:16px; width:auto; } #seva-launcher{ right:16px; } }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function addMessage(text, who) {
    const messages = document.getElementById("seva-messages");
    const div = document.createElement("div");
    div.className = "seva-msg " + who;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function handleUserText(text) {
    if (!text.trim()) return;
    addMessage(text, "user");
    document.getElementById("seva-input").value = "";
    setTimeout(() => addMessage(findAnswer(text), "bot"), 300);
  }

  function buildWidget() {
    injectStyles();

    const launcher = document.createElement("button");
    launcher.id = "seva-launcher";
    launcher.setAttribute("aria-label", "Open Seva, your ImpactSetu guide");
    launcher.textContent = "S";
    document.body.appendChild(launcher);

    const panel = document.createElement("div");
    panel.id = "seva-panel";
    panel.innerHTML = `
      <div id="seva-head">
        <div>
          <div class="title">Seva</div>
          <div class="sub">Your ImpactSetu guide</div>
        </div>
        <button id="seva-close" aria-label="Close">&times;</button>
      </div>
      <div id="seva-messages"></div>
      <div id="seva-quick"></div>
      <div id="seva-input-row">
        <input id="seva-input" type="text" placeholder="Ask Seva anything about the site…" />
        <button id="seva-send">Send</button>
      </div>
    `;
    document.body.appendChild(panel);

    const quickWrap = panel.querySelector("#seva-quick");
    QUICK_REPLIES.forEach((q) => {
      const btn = document.createElement("button");
      btn.textContent = q;
      btn.onclick = () => handleUserText(q);
      quickWrap.appendChild(btn);
    });

    addMessage(
      "Hi, I'm Seva 👋 I can guide you around ImpactSetu — registering, matching, connecting with an NGO or donor, anything. What do you need?",
      "bot"
    );

    launcher.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
    panel.querySelector("#seva-close").addEventListener("click", () => panel.classList.remove("open"));
    panel.querySelector("#seva-send").addEventListener("click", () => handleUserText(document.getElementById("seva-input").value));
    panel.querySelector("#seva-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserText(e.target.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
