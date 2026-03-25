# labugs.org — LA County Invertebrate Field Guide

A free, comprehensive progressive web app field guide to **3,450 invertebrate species** of Los Angeles County, California.

## What It Is

The most comprehensive free invertebrate identification resource for LA County, covering every terrestrial and freshwater invertebrate with ≥2 research-grade iNaturalist observations in the county. Every species has a hand-written description with field marks, ecology, behavior, or conservation notes.

**Live at [labugs.org](https://labugs.org)**

## Features

- **3,450 species** across 15 taxa groups (moths, beetles, true bugs, flies, wasps/ants, arachnids, snails, native bees, butterflies, orthoptera, dragonflies, hover flies, myriapods, isopods, bumblebees)
- **iNaturalist photo integration** — species photos fetched from iNat and cached locally
- **Life list tracking** — enter your iNat username to see which species you've observed
- **Origin filter** — filter by Native, Introduced, Invasive, or Endemic (California)
- **Family filter** — browse by taxonomic family with color-coded chips
- **Status filter** — filter by abundance (common, uncommon, rare)
- **Observation tracker** — observed/unobserved filter with progress bar
- **Satellite observation maps** — ESRI satellite tiles with iNat observation overlay
- **Phenology chart** — monthly flight/activity period for each species
- **Elevation range** — coastal to alpine habitat zones
- **Offline capable** — service worker caches all data for field use
- **PWA installable** — add to home screen on iOS/Android
- **Cross-taxon search** — search across all 15 groups simultaneously

## Architecture

Split-architecture PWA. Core app shell (`index.html`, 73 KB) loads 15 per-group JSON data files (~1.3 MB total) on startup. No build step, no framework, no dependencies beyond Google Fonts.

```
├── index.html          Core app shell
├── sw.js               Service worker (cache-first)
├── manifest.json       PWA manifest
├── _headers            Netlify MIME headers
├── data/
│   ├── butterflies.json
│   ├── moths.json
│   ├── beetles.json
│   ├── ... (15 files)
└── icons/
    ├── app-icon-180x180.png
    ├── app-icon-192x192.png
    └── app-icon-512x512.png
```

## Data Sources

- **Photos**: iNaturalist taxa API
- **Species list**: iNaturalist research-grade observations in LA County (place_id=962)
- **Taxonomy**: Catalogue of Life, ITIS, BugGuide.net, World Spider Catalog, MolluscaBase
- **Descriptions**: Written from entomological literature — Powell & Hogue (*Insects of the Los Angeles Basin*), Emmel & Emmel (*Butterflies of Southern California*), UC IPM guides, CDFA pest lists

## Deployment

Drag-and-drop the project folder to [Netlify](https://app.netlify.com/drop). The `_headers` file configures proper MIME types for JSON data files.

## Part of a Suite

labugs.org is one guide in a suite of LA County natural history field guides:
- [laplants.org](https://laplants.org) — Native & naturalized plants
- [labirds.org](https://labirds.org) — Birds
- [lafungi.org](https://lafungi.org) — Fungi & lichens
- labugs.org — Invertebrates (this guide)
- Marine invertebrate guide (planned)

## License

See [LICENSE](LICENSE).
