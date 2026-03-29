# LA County Invertebrate Field Guide

**[labugs.org](https://labugs.org)** · v3.026 · 3,438 species across 15 taxa groups

A self-contained progressive web app (PWA) field guide to the invertebrates of Los Angeles County, California. Works offline after first visit. No login required.

## Species Coverage

| Group | Species |
|---|---|
| Moths | 574 |
| Beetles | 567 |
| True Bugs & Allies | 470 |
| Flies | 403 |
| Wasps & Ants | 298 |
| Arachnids | 281 |
| Snails & Mollusks | 200 |
| Native Bees | 176 |
| Butterflies | 153 |
| Orthoptera | 144 |
| Dragonflies & Damselflies | 72 |
| Myriapods | 37 |
| Hoverflies | 36 |
| Crustaceans | 18 |
| Bumblebees | 9 |
| **Total** | **3,438** |

## Features

- **Offline-capable PWA** — network-first service worker caches all data for offline use
- **iNaturalist life list integration** — log in with your iNat username to track observed species
- **Photo cards** — CC-licensed images from iNaturalist for every species
- **Ecological associations (hp)** — species-specific notes on host plants, prey, habitat, and ecological role (100% coverage, 79% unique)
- **Cross-links to host plants** — 969 species (28%) link directly to [la-flora.org](https://la-flora.org) with one-tap deep linking
- **Peak month data** — 833 species (24%) with documented peak activity months from published sources and iNaturalist phenology
- **Elevation filter** — Coast / Lowland / Foothill / Mid-elev / Mountain toggle chips
- **Rarity filter** — Common / Uncommon / Rare / Vagrant / Endangered, calibrated from published description evidence
- **Origin filter** — Native / Introduced / Invasive / Endemic
- **Family browser** — expandable family chips with species counts, sortable alphabetically or by taxonomic order
- **Cross-group search** — search finds species across all 15 taxa groups with "Also found in" navigation
- **Deep-link URLs** — `?species=Scientific+name`, `?search=term`, `#species/Scientific_name`
- **iOS safe-area support** — Dynamic Island / notch-aware sticky navigation
- **Full SEO** — JSON-LD WebApplication schema, Open Graph tags, canonical URL

## Rarity Distribution

| Status | Species | % |
|---|---|---|
| Common | 451 | 13% |
| Uncommon | 2,864 | 83% |
| Rare | 68 | 2% |
| Vagrant | 46 | 1% |
| Endangered | 7 | <1% |

Rarity labels are derived from published description evidence only — no estimation.

## Cross-Guide Ecosystem

This guide is part of the LA County Field Guide Suite:

| Guide | URL | Species |
|---|---|---|
| 🌿 Plants, Mosses & Lichens | [la-flora.org](https://la-flora.org) | 1,476 |
| 🐛 Invertebrates | [labugs.org](https://labugs.org) | 3,438 |
| 🍄 Fungi | [lafungi.org](https://lafungi.org) | 724 |
| 🦎 Wildlife | [la-fauna.org](https://la-fauna.org) | 252 |

Cross-linking between guides: 969 invertebrate species link to host plants on la-flora.org. 46 species reference fungal associates on lafungi.org. 146 species reference vertebrate predators seeded for la-fauna.org.

## Architecture

Two-file PWA: `index.html` (77 KB) + 15 JSON data files in `data/` (~1,880 KB total). Service worker (`sw.js`) caches all assets for offline use. No build step, no framework, no dependencies.

## Data Sources

- **Species data**: iNaturalist research-grade observations for LA County
- **Photos**: CC-licensed images via iNaturalist API
- **Ecological associations**: Hogue *Insects of the Los Angeles Basin* (1993), Powell & Hogue *California Insects* (2020), Emmel & Emmel *Butterflies of Southern California* (1973), Manolis *Dragonflies and Damselflies of California* (2003), Michener *Bees of the World* (2007), Williams et al. *Bumble Bees of North America* (2014), Xerces Society pollinator lists, UC IPM, CA Bumble Bee Atlas
- **Maps**: ESRI + iNaturalist

## License

GPL v3. See [LICENSE](LICENSE).

For informational purposes only — not a substitute for expert identification.
