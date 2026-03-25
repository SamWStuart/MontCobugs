# labugs.org — Continuation Prompt (v3.001)
*Updated: 24 March 2026 — for Claude Opus*

---

## What This Is

labugs.org is a progressive web app field guide to 1,070+ invertebrate species of LA County — the most comprehensive free invertebrate ID resource for the region. It is one guide in a suite of LA County natural history field guides sharing a common architecture.

For the full shared architecture, build lessons, species data schema, version conventions, pre-publish audit checklist, and cross-guide context, **read the master continuation prompt first**:

→ Upload and read `continuation-prompt.md` before proceeding.

This file covers labugs-specific state only.

---

## ⚠ Architecture Change: v3.001

**v3.001 is a split-architecture migration from the v2.x single-file monolith.** The species data that was inline in `index.html` (~500 KB) is now split into 15 per-group JSON files loaded on demand.

### Why the split
- v2.021 hit 585 KB (87% species data). Single-file ceiling was ~2,000 species with aggressive compression.
- LA County has 5,000-8,000 identifiable macro-invertebrate species. A truly comprehensive guide needs 2,500-3,500 species minimum.
- Split architecture supports ~4,400 species at current data density within a 2 MB budget, or ~11,000 at 5 MB.

### What changed
- `index.html` is now a 65 KB app shell with `SPECIES_DATA={}` (empty at load time)
- Species data lives in `data/{group}.json` (15 files, 497 KB total)
- `loadAllData()` fetches all 15 JSONs in parallel on startup
- Progressive rendering: active taxon renders immediately when its data arrives
- Service worker precaches core + all 15 data files for offline use
- Loading indicator shows "Loading species data… N%" during fetch
- **All UI features, CSS, and user-facing behavior are identical to v2.021**

### What did NOT change
- All 1,067 species with full field marks, descriptions, conservation status
- INTRO_SET (152), INVASIVE_SET (44), CONSERVATION (17) remain inline in core HTML
- SEO suite (JSON-LD, OG, Twitter, meta) unchanged in core HTML
- PWA meta tags, safe area handling, icon references all unchanged
- fetchLL, life list, search, subspecies bundling all work identically
- All `SPECIES_DATA[k]||[]` guard patterns (10 occurrences) protect against empty data during async load

---

## Current File State

- **Version**: v3.001
- **Core app shell**: 65 KB (`index.html`)
- **Species data**: 497 KB across 15 JSON files in `data/`
- **Total species**: 1,068 main + 5 subspecies = 1,073 across 15 taxa groups
- **Node.js syntax**: ✅ clean (`node -c` passes on extracted JS)
- **Backtick count**: 122 (even ✅)
- **GitHub**: https://github.com/rhysmarsh/LA-bugs

### Deployment structure

```
labugs.org/
├── index.html              (65 KB app shell)
├── manifest.json
├── sw.js                   (precaches core + all 15 data files)
├── data/
│   ├── butterflies.json    (85 KB — 151 spp)
│   ├── moths.json          (68 KB — 141 spp)
│   ├── beetles.json        (57 KB — 134 spp)
│   ├── arachnids.json      (47 KB — 106 spp)
│   ├── nativeBees.json     (38 KB — 89 spp)
│   ├── wasps.json          (38 KB — 82 spp)
│   ├── trueBugs.json       (38 KB — 84 spp)
│   ├── flies.json          (34 KB — 68 spp)
│   ├── dragonflies.json    (33 KB — 71 spp)
│   ├── orthoptera.json     (22 KB — 44 spp)
│   ├── snails.json         (15 KB — 28 spp)
│   ├── hoverflies.json     (13 KB — 28 spp)
│   ├── myriapods.json      (9 KB — 16 spp)
│   ├── isopods.json        (8 KB — 16 spp)
│   └── bumblebees.json     (5 KB — 9 spp)
└── icons/
    ├── app-icon-180x180.png
    ├── app-icon-192x192.png
    └── app-icon-512x512.png
```

### Group counts and next expansion IDs

| Group | Count | Next ID | Data file |
|---|---|---|---|
| butterflies | 151 (5 ssp) | N/A | butterflies.json |
| bumblebees | 9 | N/A | bumblebees.json |
| dragonflies | 71 | N/A | dragonflies.json |
| hoverflies | 28 | `ho_e4` | hoverflies.json |
| nativeBees | 89 | `nb_n{iNat_id}` | nativeBees.json |
| arachnids | 106 | N/A | arachnids.json |
| moths | 149 | `mo_e29` | moths.json |
| wasps | 85 | `wa_e11` | wasps.json |
| beetles | 136 | `be_e20` | beetles.json |
| trueBugs | 82 | `tr_e19` | trueBugs.json |
| orthoptera | 47 | `or_e10` | orthoptera.json |
| flies | 62 | `fl_e37` | flies.json |
| snails | 28 | `sn_e5` | snails.json |
| myriapods | 16 | `my_e3` | myriapods.json |
| isopods | 16 | `is_e2` | isopods.json |

### Capacity

- Avg bytes/species: 479
- **2 MB data budget: ~4,377 species** (3,310 headroom from current 1,067)
- 5 MB data budget: ~10,943 species
- No single-file ceiling — each group file grows independently

---

## v3 Build Procedure

**This is substantially simpler than v2 monolith surgery.**

### Adding species to existing groups

1. Read target `data/{group}.json`
2. Parse JSON array
3. Append new species objects
4. Write back with `json.dumps(separators=(',',':'))`
5. If species is introduced/invasive: update `INTRO_SET` / `INVASIVE_SET` in `index.html`
6. If species has conservation status: update `CONSERVATION` in `index.html`
7. Update static subtitle count in `index.html` header
8. Update SEO counts in `index.html` (meta description, OG, Twitter, JSON-LD)
9. Bump version in `index.html` (title, header span, JSON-LD softwareVersion)
10. Update SW cache name in `sw.js`
11. Run `v3_qc.py`

### Editing core app logic

1. Edit `index.html` directly
2. Extract JS, `node -c` validate
3. Verify backtick count stays even
4. No need to touch data files

### Adding a new taxa group

1. Create `data/{newgroup}.json` with species array
2. Add group name to `TAXA_ORDER` in `index.html`
3. Add group config to `TAXA` object (label, iNatTaxonId, placeId, emoji)
4. Add `'/data/{newgroup}.json'` to `DATA_ASSETS` in `sw.js`
5. Run QC

### QC script (`v3_qc.py`)

Validates: JS syntax, backtick parity, SPECIES_DATA empty in core, data loader present, all 15 data files valid JSON, TAXA_ORDER ↔ data files match, zero ID/CN/SN duplicates across all files, INTRO_SET/INVASIVE_SET/CONSERVATION cross-validated.

---

## Architecture Notes

- `fetchLL` uses per-taxon loop over `TAXA_ORDER`, one iNat API call per group
- `IDB_NAME`: `'invertGuidePhotos'`
- Both `INVASIVE_SET` and `INTRO_SET` exist (plant guide only has `INTRO_SET`)
- `CONSERVATION` object: 17 species with IUCN/ESA/CESA/NatureServe badges
- Subspecies bundling: `sspMap`, `isOParent()`, gold pill, gold-bordered detail sheet section

### Data loader flow

```
1. Show "Loading species data… 0%" indicator
2. Fetch all 15 group JSONs in parallel (Promise.all)
3. On each arrival: assign to SPECIES_DATA[group], increment counter
4. If group === active taxon → render() immediately (progressive rendering)
5. After all resolve: rSub() + final render()
6. Progress indicator auto-hides
```

### PWA elements (verified v2.021, unchanged v3)

- `apple-mobile-web-app-capable: yes` + `black-translucent`
- `viewport-fit: cover` with safe area CSS variables
- Header: `padding-top: calc(22px + var(--safe-top))`
- Sticky tab bar: `padding-top: env(safe-area-inset-top)` with box-shadow fill
- Body: `padding-bottom: var(--safe-bot)`, left/right safe area

---

## Outstanding Work

### 🔴 Priority 1: v3 deployment testing

Serve v3 locally and verify: all tabs load, life list works, cross-taxon search works, offline mode via SW cache, progressive rendering, home screen PWA standalone mode.

### 🟡 Priority 2: OG image

Placeholder `https://labugs.org/icons/og-image.png` needs actual 1200×630 image.

### 🟢 Priority 3: Expansion (now uncapped)

With 3,310 species headroom, file size is no longer a constraint. Priorities:
- *Iris oratoria* (Mediterranean Mantis), *Stictocephala bisonia* (Buffalo Treehopper), *Glycaspis brimblecombei* (Red Gum Lerp Psyllid)
- Expand flies, trueBugs, moths, beetles toward comprehensive coverage
- Focus on quality and accuracy per species card — no need to compress

### 🔵 Backport to other guides (case-by-case)

Features ready to backport: SEO suite, icon system, CONSERVATION object, INVASIVE_SET + INTRO_SET pattern, safe area CSS audit, build QC cross-validation.

**Split architecture**: evaluate per guide. Only needed for guides expecting >1,500 species. Plant guide may stay single-file if scope remains bounded. Decision point: when any guide approaches 500 KB.

---

## Build History: v2.015 → v3.001

| Version | Key changes | Species delta |
|---|---|---|
| v2.017 | Data integrity + feature backport from plant guide | -8 (dedup) |
| v2.018 | CN dedup complete + first expansion | +7 |
| v2.019 | SEO suite + native snails | +4 |
| v2.020 | Icons + mosquitoes, blow flies, PSHB, termites | +16 net |
| v2.021 | Encounter-gap fills + PWA audit | +12 |
| v3.001 | **Split architecture migration** — no species changes | 0 |

---

## Source References

- Powell & Hogue, *Insects of the Los Angeles Basin* (1979 / 1993)
- Emmel & Emmel, *Butterflies of Southern California* (1973)
- Magney, *Terrestrial Gastropods of Los Angeles County* (2016)
- NHM LA County SLIME project; California Insect Barcode Initiative
- BugGuide.net; iNaturalist LA County place_id=962; BAMONA
- UC IPM guides; Essig Museum CA Moth Specimen Database
- CDPH vector control; GLACVCD *Aedes* programs
- Cumming (2018) — forensic Calliphoridae of LA County
