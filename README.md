# MontCoBugs

A free, open-source field guide to the butterflies, dragonflies, and damselflies of Montgomery County, Pennsylvania — with photos, field marks, seasonality, and observation maps.

🦋 **[Visit the live site →](https://montcobugs.netlify.app)**

## About

MontCoBugs covers:
- **Butterflies** — 73+ species
- **Dragonflies** — 38+ species
- **Damselflies** — 16+ species

Each species entry includes a photo (pulled live from iNaturalist), field marks, flight period, habitat, conservation status where relevant, and a map of observations within Montgomery County.

## Origins

This project is a fork of **[LABugs.org](https://github.com/rhysmarsh/LAbugs)** by Rhys Marsh, an outstanding field guide to the invertebrates of Los Angeles County, California. The architecture, design language, and core app logic are his work — MontCoBugs adapts that foundation for a much smaller scope (three taxa groups instead of LA's fifteen) and a different region, with new species data, descriptions, and Pennsylvania-specific habitat/seasonality information.

If you're interested in building something similar for your own region, start with [Rhys's original repo](https://github.com/rhysmarsh/LAbugs) — it's well worth a look.

## Data sources

- **Species lists & photos** — [iNaturalist](https://www.inaturalist.org), via their public API (place_id=1522 for Montgomery County, PA)
- **Odonate seasonality & habitat** — Pennsylvania DCNR's Nescopeck State Park dragonfly & damselfly checklist
- **Species descriptions & field marks** — original content, written from personal field experience and published references
- **Taxonomy** — Catalogue of Life, ITIS, and current iNaturalist taxonomic consensus

## Tech stack

No build step, no framework — just `index.html`, a handful of JSON data files, and a service worker for offline support. Deployed as a static site on Netlify.

```
MontCoBugs/
├── index.html       — the entire app
├── manifest.json     — PWA configuration
├── sw.js             — service worker (offline caching)
├── icons/            — app icons
└── data/
    ├── butterflies.json
    ├── dragonflies.json
    └── damselflies.json
```

## Running locally

Browsers block `fetch()` requests from `file://` pages, so you'll need a local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Contributing

Found an error in a species description, or have a sighting that should update our species list? Open an issue or pull request — this is very much a living document.
## License

MIT — see [LICENSE](LICENSE). MontCoBugs is built on Rhys Marsh's original MIT-licensed LABugs.org project; his copyright notice is preserved alongside this project's.

## Disclaimer

For informational purposes only — not a substitute for expert identification. Species status classifications are informed by iNaturalist observation frequency and published references but should not be taken as definitive scientific assessment.