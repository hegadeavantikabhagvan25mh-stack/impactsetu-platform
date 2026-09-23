// seed-ngos.js
//
// Bulk-imports data/ngos_seed.json into Firestore's ngos collection in one
// shot, using the Admin SDK — same pattern as seed-csr-companies.js.
//
// ---- ONE-TIME SETUP (skip anything you already did for the CSR seed) ----
// 1. Install Node.js if you don't have it: https://nodejs.org (LTS version).
// 2. In this folder, run:  npm install firebase-admin
// 3. Get a service account key (skip if you still have the one from before):
//    Firebase console → gear icon (top left) → Project settings →
//    Service accounts tab → "Generate new private key" → a .json file
//    downloads. Rename it serviceAccountKey.json and put it in this same
//    folder, next to this script.
//    ⚠️ This file can read/write your entire database with no restrictions.
//    Never upload it to GitHub or share it. Delete it once you're done.
// 4. Make sure ngos_seed.json is also in this same folder.
//
// ---- RUN ----
//    node seed-ngos.js
//
// It will print each NGO as it's added, then exit.

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));
const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "ngos_seed.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function run() {
  const ngos = seedData.ngos;
  console.log(`Seeding ${ngos.length} NGOs…`);

  for (const ngo of ngos) {
    const ref = await db.collection("ngos").add({
      ...ngo,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${ngo.org}  (doc id: ${ref.id})`);
  }

  console.log("Done. Check the Firestore console → ngos to confirm.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
