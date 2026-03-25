# LA County Invertebrate Field Guide

**Version 3.000** · 1,060+ species · [labugs.org](https://labugs.org)

A free, open-source progressive web app (PWA) field guide to the invertebrates of Los Angeles County, California. Covers butterflies, moths, bees, wasps, beetles, dragonflies, spiders, scorpions, snails, and more — with iNaturalist-sourced photos, field marks, seasonality charts, and observation maps.

## Architecture

**v3 split architecture.** The app shell (HTML, CSS, JS) loads instantly at 73 KB. Species data loads on demand from 15 per-group JSON files (499 KB total). Service worker caches everything for offline use.

```
labugs.org/
├── index.html              73 KB   App shell (CSS, JS, SEO, conservation data)
├── manifest.json            1 KB   PWA manifest
├── sw.js                    1 KB   Service worker (cache-first, precaches all data)
├── data/
│   ├── butterflies.json    85 KB   151 species
│   ├── moths.json          68 KB   141 species
│   ├── beetles.json        57 KB   134 species
│   ├── arachnids.json      47 KB   106 species
│   ├── nativeBees.json     38 KB    89 species
│   ├── wasps.json          38 KB    82 species
│   ├── trueBugs.json       38 KB    84 species
│   ├── flies.json          34 KB    68 species
│   ├── dragonflies.json    33 KB    71 species
│   ├── orthoptera.json     22 KB    44 species
│   ├── snails.json         15 KB    28 species
│   ├── hoverflies.json     13 KB    28 species
│   ├── myriapods.json       9 KB    16 species
│   ├── isopods.json         8 KB    16 species
│   └── bumblebees.json      5 KB     9 species
└── icons/
    ├── app-icon-180x180.png         Apple touch icon
    ├── app-icon-192x192.png         Android/PWA icon
    └── app-icon-512x512.png         Splash/large icon
```

### Capacity

At current data density (479 bytes/species), the architecture supports ~4,400 species within a 2 MB data budget — well beyond the estimated 2,500-3,500 identifiable macro-invertebrate species in LA County.

## Features

- **1,067 species** across 15 taxa groups
- **Progressive loading** — active tab renders immediately; other groups load in parallel
- **Offline-first PWA** — service worker caches core + all data files
- **iNaturalist integration** — live observation maps and photo galleries
- **Life list tracker** — mark species observed; persists in IndexedDB
- **Subspecies bundling** — parent cards show subspecies observation status
- **Conservation badges** — IUCN, ESA, CESA, NatureServe for 17 imperiled species
- **Invasive species flagging** — 44 invasive + 147 introduced species marked
- **Seasonality charts** — monthly activity bars with peak indicators
- **Search** — by common name, scientific name, or family (cross-taxon)
- **iOS safe area support** — notch/Dynamic Island handling in standalone mode
- **SEO** — JSON-LD structured data, OpenGraph, Twitter cards

## Deployment

1. Copy the entire directory structure to your web root
2. Serve over HTTPS (required for service worker)
3. Create `icons/og-image.png` (1200×630px) for social sharing previews

No build step. No npm dependencies. No server-side rendering. CDN dependencies (Google Fonts, Leaflet, iNaturalist API) load at runtime.

## Species Coverage

| Group | Species | Families | Highlights |
|---|---|---|---|
| Butterflies | 151 | 6 | PV Blue (FE), El Segundo Blue (FE), Quino Checkerspot (FE) |
| Moths | 141 | 24 | Sphingidae (21), Erebidae (22), Noctuidae (24) |
| Beetles | 134 | 32 | Tiger beetles, fireflies, PSHB invasive, ladybugs |
| Arachnids | 106 | 40 | Spiders, scorpions, tarantulas, solifuges |
| Native Bees | 89 | 6 | Carpenter bees to fairy bees; 50+ solitary |
| True Bugs | 84 | 35 | Stink bugs, assassin bugs, cicadas, leafhoppers |
| Wasps | 82 | 20 | Tarantula hawks, ants, termites, velvet ants |
| Dragonflies | 71 | 8 | 43 dragonflies + 28 damselflies |
| Flies | 68 | 34 | *Aedes* invasive mosquitoes, robber flies, blow flies |
| Orthoptera | 44 | 13 | Grasshoppers, mantids, cockroaches, silverfish, snakeflies |
| Hoverflies | 28 | 4 | Aphid predators, bee mimics |
| Snails | 28 | 17 | 3 NatureServe G1 endemic shoulderbands |
| Myriapods | 16 | 11 | Giant centipede, Catalina Island endemic |
| Isopods | 16 | 10 | Pillbugs, fairy shrimp (2 federally listed) |
| Bumblebees | 9 | 1 | All 9 LA County *Bombus* |

## Development

### Adding species

Edit `data/{group}.json` directly. Each file is a JSON array of species objects:

```json
[
  {
    "id": "fl_e29",
    "cn": "Common Name",
    "sn": "Genus species",
    "fam": "Familyidae",
    "st": "common",
    "desc": "Description text.",
    "mo": [3,4,5,6,7,8,9],
    "fm": {
      "Size": "measurement",
      "Color": "description",
      "Habitat": "where found"
    }
  }
]
```

If the species is introduced/invasive or has conservation status, also update `INTRO_SET`, `INVASIVE_SET`, or `CONSERVATION` in `index.html`.

### Build QC

Run `v3_qc.py` before every release. Validates JS syntax, data file integrity, zero duplicates across all files, and cross-reference integrity between core HTML sets and species data.

### Version convention

`v3.NNN` — increment by .001 per build. Sync across: `<title>`, header `<span>`, JSON-LD `softwareVersion`, and `sw.js` cache name.

## Related Guides

Part of the LA County Natural History Field Guide suite:
- **labugs.org** — Invertebrates (this guide)
- **laplants.org** — Native & naturalized plants

## License

MIT

## Author

Rhys Marsh · Los Angeles, California
