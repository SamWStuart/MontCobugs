# LA County Invertebrate Field Guide

**[labugs.org](https://labugs.org)** · v2.015

> For informational purposes only — not a substitute for expert identification. Species IDs may contain errors.

A free, open-source field guide to 1,016 invertebrate species (+ 5 subspecies) of Los Angeles County, California. Single-file PWA — no frameworks, no build step, no dependencies.

## Species Coverage

| Group | Species | Families |
|-------|---------|----------|
| 🦋 Butterflies | 146 (+5 ssp) | 6 |
| 🐝 Bumblebees | 9 | 1 |
| 🪁 Dragonflies & Damselflies | 72 | 7 |
| 🪰 Hoverflies | 25 | 3 |
| 🪻 Native Bees | 89 | 6 |
| 🕷️ Arachnids | 106 | 26 |
| 🦇 Moths | 139 | 16 |
| 🐝 Wasps & Ants | 80 | 17 |
| 🪲 Beetles | 131 | 27 |
| 🪲 True Bugs | 74 | 17 |
| 🦗 Grasshoppers & Orthoptera | 40 | 10 |
| 🪰 Flies | 52 | 27 |
| 🐌 Snails & Slugs | 24 | 9 |
| 🐛 Myriapods | 14 | 10 |
| 🦀 Isopods & Crustaceans | 15 | 6 |
| **Total** | **1,016 + 5 ssp** | **15 groups** |

136 species flagged as introduced (non-native). 39 species flagged as invasive.

## Features

- **iNaturalist photo integration** — species photos fetched from iNat `/taxa/autocomplete`, cached persistently in IndexedDB
- **Life list tracking** — enter your iNat username to see which LA County species you've observed, with per-taxon progress bars
- **Observation maps** — ESRI satellite + iNat observation grid overlay, scoped to LA County (place_id=962)
- **Phenology bars** — monthly activity/flight period with peak months highlighted
- **Elevation display** — coast/lowland/foothill/mid/high range for each species
- **Host plant cross-references** — larval food plants and ecological associations
- **Conservation badges** — IUCN Red List, ESA, CESA, and CA SSC listings with detailed notes
- **Introduced (✦) and Invasive (⚠ INV) badges** — non-native species flagged; invasive species causing ecological/economic harm highlighted
- **Cross-taxon search** — search results link to matches in other taxa groups
- **Collapsible family chips** — family filter with species counts, zero-count auto-hide, A→Z sort toggle
- **Status/Observed/Endemic filter chips** — filter by conservation status or life list observation status
- **Alias-aware life list** — handles iNat reclassifications (e.g., Plebejus → Icaricia, Speyeria → Argynnis) with bidirectional NAME_ALIASES
- **Offline-capable PWA** — service worker caches the guide for offline use
- **iOS edge-to-edge** — respects safe area insets on notched devices

## Architecture

Single-file PWA. All species data, CSS, and JS are inlined in one `index.html`. No build step, no framework, no external dependencies beyond Leaflet (CDN) and Google Fonts.

```
index.html        — Complete guide (single file, ~540 KB)
sw.js             — Service worker for offline caching
manifest.json     — PWA manifest
_headers          — Netlify security headers
_redirects        — Netlify redirect rules
icons/            — PWA icons (192px, 512px)
LICENSE           — GPL v3 + informational-purposes-only preamble
README.md         — This file
```

### Data Sources

- **Photos**: iNaturalist API (`/v1/taxa/autocomplete`), CC-licensed, cached in IndexedDB (`invertGuidePhotos`)
- **Life lists**: iNaturalist API (`/v1/observations/species_counts`), place_id=962 (LA County)
- **Maps**: ESRI World Imagery tiles + iNaturalist observation grid overlay
- **Taxonomy**: iNaturalist taxonomy with NAME_ALIASES for reclassified taxa

### Key References

- Powell & Hogue, *Insects of the Los Angeles Basin* (1979)
- Hogue, *Insects of the Los Angeles Basin* (1993)
- Emmel & Emmel, *Butterflies of Southern California* (1973)
- BugGuide (bugguide.net)
- iNaturalist LA County checklists
- Arroyos & Foothills Conservancy
- CA Bumble Bee Atlas
- socalbutterflies.com
- Essig Museum of Entomology, UC Berkeley
- UC IPM (Integrated Pest Management)

## Species Data Schema

Each species object follows this schema:

```javascript
{
  id: 'bp1',                    // Unique ID: {taxon_prefix}{number}
  cn: 'Pipevine Swallowtail',   // Common name
  sn: 'Battus philenor',        // Scientific name (must match iNat)
  fam: 'Papilionidae',          // Family — must match familyColors key
  st: 'rare',                   // Status: common|uncommon|rare|endangered|vagrant|extirpated|historical
  desc: '...',                  // Description (50–300 chars)
  elev: 'low,foot',             // Elevation: coast|low|foot|mid|high|wide
  mo: [3,4,5,6,7,8,9],          // Active/flight months (1–12)
  pk: [4,5],                    // Peak months (subset of mo)
  fm: {                         // Field marks (key-value pairs)
    Wingspan: '3–3.5 in',
    Upperside: '...',
    Habitat: '...',
    vs: '...',                  // Differentiation from similar species
  },
  hp: 'Aristolochia californica', // Host plants / ecological associations
  intro: true,                  // Non-native flag (optional)
  ssp: true,                    // Subspecies flag — excluded from headline counts (optional)
}
```

Species in `INTRO_SET` are displayed with a ✦ marker. Species in `INVASIVE_SET` receive an additional red ⚠ INV badge.

## Conservation Data

Species with formal conservation listings have entries in the `CONSERVATION` object:

```javascript
CONSERVATION['Danaus plexippus'] = {
  iucn: 'VU',                   // IUCN Red List category
  iucnFull: 'Vulnerable',       // Full IUCN label
  esa: 'Proposed Threatened',   // US Endangered Species Act
  cesa: 'Candidate',            // California ESA
  state: 'CA SSC',              // State listing (optional)
  note: '...',                  // Detailed conservation notes
};
```

## Deployment

Deployed via Netlify drag-and-drop zip containing:
- `index.html`
- `sw.js`
- `manifest.json`
- `_headers`
- `_redirects`
- `icons/` (icon-192.png, icon-512.png)

Service worker cache name: `invertebrate-guide-v2.015`

## Contributing

1. Fork the repository
2. Edit species data in `SPECIES_DATA` within `index.html`
3. Ensure scientific names match iNaturalist taxonomy exactly
4. Add new families to `familyColors` in the relevant `TAXA` entry
5. Add introduced species to `INTRO_SET`; invasive species to both `INTRO_SET` and `INVASIVE_SET`
6. Run the pre-publish audit (see below)
7. Increment version (format: vN.NNN, e.g., v2.016)
8. Submit pull request

### Pre-Publish Audit Checklist

- [ ] 0 duplicate scientific names
- [ ] 0 missing required fields (id, cn, sn, fam, st, desc, mo, elev)
- [ ] 0 missing family colors for any family in species data
- [ ] Peak months (pk) are subset of active months (mo)
- [ ] INTRO_SET consistent with species `intro` flags
- [ ] Even backtick count in JS
- [ ] JS validates via `new Function(script)`
- [ ] Version synced across `<title>`, header `<span>`, and SW cache name
- [ ] Disclaimer present in header subtitle, footer, and meta description

## License

GPL v3. See [LICENSE](LICENSE) for full terms of use and license.

Species photographs are individually licensed under Creative Commons by their respective iNaturalist contributors.
