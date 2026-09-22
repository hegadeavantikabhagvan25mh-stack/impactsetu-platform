// js/firebase-config.js
// Single shared Firebase initialization. Every other page/module imports
// `auth` and `db` from here instead of calling initializeApp() again —
// that avoids the "duplicate app" errors you get from re-initializing
// per page, and means the config only lives in one place.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Same project as your existing signup-form integration (impactsetu-mpb3).
// Auth and Firestore share one Firebase project, so this is the only
// config block that should exist across the whole site.
const firebaseConfig = {
  apiKey: "AIzaSyBlzSgH-v2CD5n8AOkp9tQ_f8_J7kjfwk4",
  authDomain: "impactsetu-mpb3.firebaseapp.com",
  projectId: "impactsetu-mpb3",
  storageBucket: "impactsetu-mpb3.firebasestorage.app",
  messagingSenderId: "211603319333",
  appId: "1:211603319333:web:5d94de694ea6600c46adcc",
  measurementId: "G-YZXWTEHSJW"
};

export const fbApp = initializeApp(firebaseConfig);
export const auth = getAuth(fbApp);
export const db = getFirestore(fbApp);
