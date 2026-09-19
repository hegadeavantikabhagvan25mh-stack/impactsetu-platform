# ImpactSetu

*Because no family should have to wait for help that already wants to find them.*

**Status:** Working prototype (MPB / MDT, IBS Hyderabad)

ImpactSetu is a platform concept that connects credible, lesser-known NGOs with CSR heads and donors, using a need-gap engine built on public data. Instead of donors defaulting to the same well-known names, it reads public data to show where real, unmet social needs exist, identifies NGOs working there, and matches them to funders who are actively looking to give in that cause area. Right now, only NFHS-5 data is actually wired in. Census and NITI Aayog are planned additions (see Roadmap below), not live yet.

## What's in this repo

`index.html` is a self-contained, static prototype demonstrating the two core sides of the platform:

- **CSR & Donor view**, the "Need-Gap Pulse": district-level child-nutrition indicators.
- **NGO view**, "Matched Opportunities": a sample of how CSR and foundation matches would look once a real database exists.

## Data provenance (important)

- **Need-Gap Pulse (child stunting % and sanitation access %) is real data.** It comes from NFHS-5 (2019-21), the National Family Health Survey conducted by the Ministry of Health & Family Welfare, Government of India (district fact sheets, rchiips.org/nfhs). Severity bands (High/Medium/Low) are our own simple threshold on the real stunting rate, not an official government tier. This is disclosed on the page itself.
- **"Matched Opportunities" (CSR company names, grant amounts, match %) is entirely fictional sample data**, clearly flagged as "SAMPLE DATA" in the UI. No real CSR/NGO matching database exists yet. This view exists only to demonstrate how the interaction would work.

There is no backend beyond a Firestore database for signup capture. This stays a front-end demo for academic presentation and early feedback.

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
4. Save. GitHub will publish it at `https://<your-username>.github.io/<repo-name>/`.

## Roadmap

- Phase 1 (current): static clickable prototype, real NFHS-5 data, sample CSR/HNI matching
- Phase 2: real public-data pipeline (Census/NFHS/NITI Aayog) and a verified NGO database
- Phase 3: real matching engine, ASHA-worker ground-truth reporting, supplier directory

## Academic context

Built as part of the Managing Platform Business (MPB) coursework at ICFAI Business School, Hyderabad.
