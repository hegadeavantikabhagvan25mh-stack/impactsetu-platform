// js/matching.js
// Real matching logic, replacing the hardcoded sample `matches` array.
// Pure functions — no Firebase imports here — so they're easy to test
// on their own and reusable from index.html, dashboard.html, etc.

/**
 * Score one NGO against one CSR/HNI funder.
 * Returns 0-100 plus which district/cause actually drove the score,
 * so the UI can say *why* something matched instead of just a number.
 *
 * ngo:   { org, cause, region, state, desc }               (from data/ngos.json)
 * csr:   { name, type, focusAreas[], state, districts[], grantRange }  (from Firestore csr_companies)
 * gaps:  district need-gap array (from data/districts.json), used to
 *        reward matches in districts with real high-severity need.
 */
export function scoreMatch(ngo, csr, gaps = []) {
  let score = 0;
  const reasons = [];

  const ngoCause = (ngo.cause || "").toLowerCase();
  const focusAreas = (csr.focusAreas || []).map((f) => f.toLowerCase());
  const causeHit = focusAreas.some(
    (f) => f === ngoCause || f.includes(ngoCause) || ngoCause.includes(f)
  );
  if (causeHit) {
    score += 45;
    reasons.push(ngo.cause);
  }

  const sameState = csr.state && ngo.state && csr.state === ngo.state;
  if (sameState) score += 15;

  const districts = (csr.districts || []).map((d) => d.toLowerCase());
  const districtHit = districts.includes((ngo.region || "").toLowerCase());
  if (districtHit) {
    score += 30;
    reasons.push(ngo.region);
  }

  // Bonus for real, documented need in that district (NFHS-5 severity),
  // so a match in a genuinely underserved district ranks above a
  // coincidental cause/geography overlap with no real need behind it.
  const districtGap = gaps.find(
    (g) =>
      g.region &&
      ngo.region &&
      g.region.toLowerCase() === ngo.region.toLowerCase() &&
      g.state === ngo.state
  );
  if (districtGap) {
    if (districtGap.severity === "high") score += 10;
    else if (districtGap.severity === "medium") score += 5;
  }

  return { score: Math.min(100, score), reasons, districtGap };
}

/**
 * Every NGO x CSR pair above `minScore`, sorted best-first, shaped for
 * the existing match-card renderer (org / type / cause / region / amount / fit).
 */
export function computeAllMatches(ngoDirectory, csrCompanies, gaps = [], minScore = 40) {
  const out = [];
  for (const ngo of ngoDirectory) {
    for (const csr of csrCompanies) {
      const { score, reasons } = scoreMatch(ngo, csr, gaps);
      if (score < minScore) continue;
      out.push({
        org: csr.name,
        type: csr.type === "HNI" ? "HNI" : "CSR",
        cause: reasons[0] || ngo.cause,
        region: ngo.region,
        state: ngo.state,
        amount: csr.grantRange || "Amount on request",
        fit: score,
        matchedNgo: ngo.org,
      });
    }
  }
  return out.sort((a, b) => b.fit - a.fit);
}

/** Top matches for one specific NGO (used on an NGO's own dashboard). */
export function getTopMatchesForNgo(ngo, csrCompanies, gaps = [], limit = 5) {
  return csrCompanies
    .map((csr) => ({ csr, ...scoreMatch(ngo, csr, gaps) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Top NGO matches for one specific CSR/donor (used on a CSR dashboard). */
export function getTopMatchesForCsr(csr, ngoDirectory, gaps = [], limit = 5) {
  return ngoDirectory
    .map((ngo) => ({ ngo, ...scoreMatch(ngo, csr, gaps) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

window.ImpactSetuMatching = {
  scoreMatch,
  computeAllMatches,
  getTopMatchesForNgo,
  getTopMatchesForCsr,
};
