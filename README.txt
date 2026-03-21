# LA County Invertebrate Field Guide

There are over a thousand species of invertebrates you can find in Los Angeles County — butterflies in Bel Air, scorpions in the San Gabriels, fairy shrimp in vernal pools, tarantulas crossing fire roads in October. Most people walk past all of it.

This is a free, open-source field guide designed to change that.

**1,016 species. One HTML file. No app store required.**

Built as a progressive web app with live iNaturalist integration, it works offline, caches photos permanently, tracks your personal life list, and shows you exactly what’s flying, crawling, or spinning webs near you right now — with seasonality charts, observation maps, host plants, elevation ranges, and conservation status for every species.

The entire guide is a single self-contained file. No frameworks, no build tools, no backend. Built entirely with [Claude](https://claude.ai).

**[→ Use the guide at labugs.org](https://labugs.org)**

-----

## Features

- **1,016 species + 5 subspecies** across 15 taxa groups — butterflies, moths, beetles, arachnids, native bees, dragonflies, wasps & ants, true bugs, grasshoppers, flies, hoverflies, snails, bumblebees, myriapods, and isopods
- **Live photos** from iNaturalist with IndexedDB persistent cache — returning visitors get instant photos
- **Personal life list** — enter your iNaturalist username and track your observations against the full checklist, with Seen/Unseen filters
- **Species detail sheets** with field marks, phenology (seasonality) charts, host plant data, elevation ranges, embedded Leaflet observation maps, and conservation status badges (IUCN, ESA, CESA)
- **Introduced species flagging** and regional status classification (common → historical)
- **Offline-capable PWA** — works without network after first load
- **~540 KB** uncompressed, ~140 KB gzipped

-----

## Fork This

This project is designed to be adapted for any region. The architecture cleanly separates species data from the rendering engine. Swap the data, adjust a few constants, and you have a field guide for your county, your park, your state.

The world needs more hyperlocal biodiversity tools — not fewer.

### Quick Start

```bash
git clone https://github.com/rhysmarsh/LAbugs.git
cd LAbugs
# Open index.html in a browser — that's it
```

### Project Structure

```
LAbugs/
├── index.html          # The entire app — HTML, CSS, JS, and species data
├── sw.js               # Service worker for offline support + photo caching
├── manifest.json       # PWA manifest
├── icons/              # App icons (192px + 512px, PNG + SVG)
├── _headers            # Netlify cache headers
└── _redirects          # Netlify www → apex redirect
```

Everything lives in `index.html`. There is no build step.

-----

## Adapting for Your Region

### Step 1: Configure Your Region

Inside `index.html`, find the `TAXA` configuration object (near the top of the `<script>` block). Each taxon group has:

```javascript
const TAXA = {
  butterflies: {
    label: 'Butterflies',
    emoji: '🦋',            // Tab bar icon (emoji or HTML entity)
    iNatTaxonId: 47224,     // iNaturalist taxon ID for this group
    placeId: 962,           // iNaturalist place ID for your region
    familyColors: {         // Color-coded family groupings
      Papilionidae: '#E8A735',
      Pieridae: '#4CAF50',
      // ...
    }
  },
  // ...
};
```

**To change the region**, update `placeId` across all taxa. Find your place ID by searching on [iNaturalist](https://www.inaturalist.org/places) — the number is in the URL (e.g., `/places/962` for LA County).

Common place IDs:

|Region             |Place ID|
|-------------------|--------|
|LA County          |962     |
|California         |14      |
|Massachusetts      |25      |
|Maricopa County, AZ|856     |
|King County, WA    |1185    |
|Cook County, IL    |2155    |
|Travis County, TX  |1783    |
|United Kingdom     |6857    |

### Step 2: Replace Species Data

Find the `SPECIES_DATA` object. Each taxon key contains an array of species:

```javascript
const SPECIES_DATA = {
  butterflies: [
    {
      cn: 'Western Tiger Swallowtail',       // Common name
      sn: 'Papilio rutulus',                  // Scientific name (must match iNat taxonomy)
      fam: 'Papilionidae',                    // Family (must match a key in familyColors)
      st: 'common',                           // Status: common, uncommon, rare, endangered, vagrant, extirpated, historical
      desc: 'Large yellow swallowtail...',    // Description text
      elev: 'low,foot',                       // Elevation zones (see below)
      mo: [3,4,5,6,7,8,9],                   // Months active (1-12)
      pk: [5,6,7],                            // Peak months (subset of mo)
      fm: {                                   // Field marks (key-value pairs, displayed as table)
        Wingspan: '3–4 in',
        Color: 'Yellow with black tiger stripes',
        Habitat: 'Riparian corridors, gardens'
      },
      hp: 'Platanaceae: sycamore; Salicaceae: willow, cottonwood',  // Host plants (butterflies/moths)
      // Optional flags:
      // intro: true,                          // Mark as introduced/non-native
      // ssp: true,                            // Mark as subspecies (excluded from life list counts)
    },
    // ...
  ],
  // ...
};
```

**Elevation zone codes:**

|Code   |Zone          |Feet           |
|-------|--------------|---------------|
|`coast`|Coastal       |0–300 ft       |
|`low`  |Lowland       |0–1,500 ft     |
|`foot` |Foothill      |500–4,000 ft   |
|`mid`  |Mid-elevation |2,000–6,500 ft |
|`high` |Mountain      |5,000–10,000 ft|
|`wide` |All elevations|—              |

Combine with commas: `'low,foot'`, `'foot,mid,high'`

Adjust the labels and ranges in the `rElev()` function to match your region’s topography.

### Step 3: Update Aliases and Introduced Species

**`NAME_ALIASES`** — Maps species names in your data to iNaturalist’s accepted names when they differ due to taxonomic reclassification. Used by the photo fetch system to find the right photo.

```javascript
const NAME_ALIASES = {
  'Tharsalea helloides': 'Lycaena helloides',   // Our name → iNat name
  'Lycaena helloides': 'Tharsalea helloides',   // Bidirectional
  // ...
};
```

**`INTRO_SET`** — Set of scientific names flagged as introduced/non-native:

```javascript
const INTRO_SET = new Set([
  'Apis mellifera',
  'Harmonia axyridis',
  // ...
]);
```

**`CONSERVATION`** — Conservation status badges:

```javascript
const CONSERVATION = {
  'Danaus plexippus': {iucn:'VU', esa:'PT', cesa:'Candidate'},
  'Glaucopsyche lygdamus palosverdesensis': {esa:'E'},
  // ...
};
```

### Step 4: Update Map Bounds

Find the Leaflet map initialization in `openDS()` and update the bounding box:

```javascript
// LA County bounds — change to your region
map.fitBounds([[33.70,-118.95],[34.82,-117.65]]);
```

### Step 5: Update Branding

- **Title and header** — update the `<title>` tag and the `.hdr` div
- **Footer** — update the attribution in the `<footer>` element
- **Colors** — CSS custom properties at the top: `--forest` (primary), `--gold` (accent), `--cream` (background)

-----

## Scaffolding a New Region with iNaturalist Data

You can jumpstart a species list for any region using the iNat API. This fetches the most-observed species:

```bash
# Top 200 butterflies in Maricopa County (place_id=856, taxon_id=47224)
curl "https://api.inaturalist.org/v1/observations/species_counts?place_id=856&taxon_id=47224&per_page=200" \
  | jq '.results[] | {name: .taxon.name, common: .taxon.preferred_common_name, count: .count, family: .taxon.iconic_taxon_name}'
```

This gives you names, observation counts, and taxonomy to seed your `SPECIES_DATA`. The curated layer — field marks, descriptions, phenology, host plants — is what transforms a species list into a field guide. That’s where the real work (and value) lives.

A competent naturalist working with Claude can build a 500-species guide for a new county in a day.

-----

## Technical Reference

### Photo Fetch System

Photos are fetched from iNaturalist’s `/taxa/autocomplete` endpoint by scientific name, with fallbacks:

1. **Primary query** — exact binomial (or binomial extracted from trinomial)
1. **Alias query** — if `NAME_ALIASES` has an alternate name
1. **Common name fallback** — searches by common name if scientific name queries fail
1. **Epithet fallback** — matches any species ending with the same epithet

Photos are cached in IndexedDB (`invertGuidePhotos` database) and survive browser sessions. The service worker also caches photo URLs for offline access.

Rate limiting: 3 concurrent fetches, 350ms inter-batch delay, automatic 429 backoff with re-queue.

### Life List Integration

The life list uses iNat’s `/observations/species_counts` endpoint filtered by username and place ID. Matching logic in `isO()`:

1. **Taxon ID match** — most reliable; requires photo fetch to have resolved the species’ iNat taxon ID
1. **Exact name match** — immediate; case-insensitive comparison against iNat’s returned species names
1. **Trinomial → binomial** — for subspecies entries, checks the parent species binomial

**Note:** `species_counts` disaggregates genus-level observations into probable species. This is iNat’s intended behavior and matches their own Species tab. A genus-level observation may appear as a species-level match.

### Service Worker

Cache strategy:

|Resource                  |Strategy                     |
|--------------------------|-----------------------------|
|App shell (HTML, manifest)|Cache-first, network fallback|
|iNat API calls            |Network-first, cache fallback|
|Photos (iNat, Flickr)     |Cache-first, long-lived      |
|Map tiles (ESRI)          |Cache-first                  |

Update the `CACHE_NAME` version string in `sw.js` when deploying changes to bust stale caches.

### CSS Architecture

Key classes: `.tbar` (sticky tab bar), `.sc` (species tile), `.ds-sheet` (detail modal), `.ds-phen` (phenology bar), `.ds-hp` (host plants card), `.ds-elev` (elevation badge), `.st-pip` (status pill), `.intro-mark` (introduced glyph), `.ds-cons` (conservation badges)

Brand colors are CSS custom properties: `--forest` (#1A3C35), `--gold` (#BFA46E), `--cream` (#FAF8F4)

Fonts: EB Garamond (serif, headings) + DM Sans (sans-serif, body) via Google Fonts

-----

## Deployment

The app deploys anywhere that serves static files. No server-side processing required.

### Netlify (recommended)

1. Fork the repo
1. Connect to Netlify via GitHub
1. Deploy settings: publish directory = root, no build command needed
1. Add custom domain in Domain Management
1. Netlify auto-provisions SSL

The `_headers` and `_redirects` files configure caching and www→apex redirect.

### GitHub Pages

1. Fork the repo
1. Settings → Pages → Source: Deploy from branch, select `main`
1. The guide will be live at `https://yourusername.github.io/LAbugs/`

### Any Static Host

Upload `index.html`, `sw.js`, `manifest.json`, and the `icons/` folder. That’s it.

-----

## Contributing

Contributions welcome — especially species data improvements:

- **Field mark upgrades** — more specific identification keys, especially for beetles, flies, and native bees
- **Host plant data** — many moths and some butterflies still need host plant information
- **Elevation refinement** — species with `low,foot` (the default) may benefit from more precise zone assignments
- **New species** — documented LA County records not yet in the guide
- **Taxonomy corrections** — iNaturalist periodically reclassifies species; our data should track current accepted names

Please open an issue or PR. For species data changes, include a source (iNaturalist observation link, published record, or regional authority reference).

-----

## Acknowledgments

Data: [iNaturalist](https://www.inaturalist.org) · Photos: CC-licensed via iNat · Maps: ESRI + iNat observation tiles · References: Arroyos Foothills Conservancy, CA Bumble Bee Atlas, BumbleBeeWatch, socalbutterflies.com, Essig Museum, UC IPM

Built with [Claude](https://claude.ai) by [Rhys Marsh](https://github.com/rhysmarsh).

-----

## License

MIT — use it, fork it, adapt it. If this helps spark curiosity about the living world around us, mission accomplished.