# ImpactSetu — AI-Powered NGO Discovery & CSR Matching Platform

**Status:** Ideation-phase prototype (MPB / MDT, IBS Hyderabad)

ImpactSetu is a platform concept that connects credible, lesser-known NGOs with CSR heads and donors, using an AI-driven need-gap engine. Instead of donors defaulting to the same well-known names, ImpactSetu reads public data (Census, NFHS, NITI Aayog district indicators) to surface where real, unmet social needs exist, verifies NGOs working there, and matches them to funders actively looking to give in that cause area.

## What's in this repo

`index.html` — a self-contained, static clickable prototype demonstrating the two core sides of the platform:

- **CSR & Donor view** — the "Need-Gap Pulse": district-level child-nutrition indicators.
- **NGO view** — "Matched Opportunities": a sample of how CSR/foundation matches would be shown once a real database exists.

## Data provenance (important)

- **Need-Gap Pulse (child stunting % and sanitation access %) is real data** — sourced from NFHS-5 (2019-21), the National Family Health Survey conducted by the Ministry of Health & Family Welfare, Government of India (district fact sheets, rchiips.org/nfhs). Severity bands (High/Medium/Low) are our own simple threshold applied to the real stunting rate, not an official government tier — this is disclosed on the page itself.
- **"Matched Opportunities" (CSR company names, grant amounts, match %) is entirely fictional sample data**, clearly flagged as "SAMPLE DATA" in the UI. No real CSR/NGO matching database exists yet — this view exists only to demonstrate the interaction pattern.

There is no backend yet — this is a front-end-only demo for academic presentation and early feedback.

## Running it locally

No build step required. Just open `index.html` in any browser, or serve it locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying with GitHub Pages

1. Push this repo to GitHub (see setup steps shared separately).
2. Go to the repo's **Settings → Pages**.
3. Under "Build and deployment", set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save — GitHub will publish it at `https://<your-username>.github.io/<repo-name>/`.

## Roadmap

- Phase 1 (current): static clickable prototype, mock data
- Phase 2: real public-data pipeline (Census/NFHS/NITI Aayog) + verified NGO database
- Phase 3: AI matching engine, ASHA-worker ground-truth reporting, supplier directory

## Academic context

Built as part of the Managing Platform Business (MPB) coursework at ICFAI Business School, Hyderabad.
