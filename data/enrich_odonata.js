// enrich_odonata.js
// Cross-references DCNR Nescopeck State Park odonate checklist against
// your MontCo dragonflies.json and damselflies.json, populating:
//   st    — common/uncommon/rare (from DCNR C/U/R codes)
//   water — habitat type (stream/pond/marsh/vernal pool/open area)
//   mo    — flight months as numbers (from DCNR flight period codes)
//
// DCNR flight period codes:
//   1 = Late Spring   (late April–May)      → months 4, 5
//   2 = Early Summer  (June–mid July)       → months 6, 7
//   3 = Late Summer   (mid July–August)     → months 7, 8
//   4 = Fall          (September–Nov)       → months 9, 10, 11
//
// DCNR habitat codes:
//   S = stream or creek
//   P = pond or lake
//   M = marsh
//   V = vernal pool
//   O = open area / field / road
//
// NOTE: Some species names have been updated since this 2014 pamphlet.
// Synonym mappings are included below. Unmatched species are logged
// at the end so you can handle them manually.

const fs = require('fs');

// ─── DCNR SPECIES DATABASE ───────────────────────────────────────────────────
// Format: 'Scientific Name': { st, periods: [1,2,3,4 booleans], habitat: 'SPMVO' }
// Periods map to: 1=late spring, 2=early summer, 3=late summer, 4=fall

const DCNR = {
  // DAMSELFLIES — SPREADWINGS
  'Lestes disjunctus':          { st: 'common',   periods: [0,1,0,0], habitat: 'PM'   },
  'Lestes eurinus':             { st: 'rare',     periods: [0,1,0,0], habitat: 'VM'   },
  'Lestes forcipatus':          { st: 'rare',     periods: [0,1,0,0], habitat: 'VPM'  },
  'Lestes inaequalis':          { st: 'uncommon', periods: [0,1,1,0], habitat: 'PM'   },
  'Lestes rectangularis':       { st: 'common',   periods: [0,1,1,0], habitat: 'VPM'  },
  'Lestes vigilax':             { st: 'common',   periods: [0,1,1,0], habitat: 'PM'   },

  // DAMSELFLIES — POND DAMSELS
  'Amphiagrion saucium':        { st: 'uncommon', periods: [0,1,1,0], habitat: 'M'    },
  'Argia fumipennis':           { st: 'common',   periods: [0,1,1,0], habitat: 'SPO'  },
  'Argia moesta':               { st: 'common',   periods: [0,1,1,0], habitat: 'SPO'  },
  'Argia translata':            { st: 'rare',     periods: [0,0,1,1], habitat: 'S'    },
  'Chromagrion conditum':       { st: 'common',   periods: [1,0,0,0], habitat: 'VPM'  },
  'Enallagma aspersum':         { st: 'common',   periods: [0,1,1,0], habitat: 'PM'   },
  'Enallagma civile':           { st: 'common',   periods: [0,0,1,1], habitat: 'PMO'  },
  'Enallagma cyathigerum':      { st: 'uncommon', periods: [0,1,0,0], habitat: 'PM'   },
  'Enallagma divagans':         { st: 'uncommon', periods: [0,0,1,0], habitat: 'SP'   },
  'Enallagma exsulans':         { st: 'common',   periods: [0,0,1,0], habitat: 'S'    },
  'Enallagma geminatum':        { st: 'common',   periods: [0,0,1,0], habitat: 'P'    },
  'Enallagma hageni':           { st: 'common',   periods: [0,1,0,0], habitat: 'PM'   },
  'Enallagma signatum':         { st: 'common',   periods: [0,0,1,0], habitat: 'SP'   },
  'Enallagma traviatum':        { st: 'common',   periods: [0,1,0,0], habitat: 'P'    },
  'Enallagma vesperum':         { st: 'uncommon', periods: [0,0,1,0], habitat: 'P'    },
  'Ischnura posita':            { st: 'common',   periods: [1,1,1,1], habitat: 'VPM'  },
  'Ischnura verticalis':        { st: 'common',   periods: [1,1,1,1], habitat: 'VPM'  },
  'Nehalennia gracilis':        { st: 'uncommon', periods: [0,1,1,0], habitat: 'PM'   },
  'Nehalennia irene':           { st: 'common',   periods: [0,1,1,0], habitat: 'PM'   },

  // DAMSELFLIES — BROADWINGS
  'Calopteryx maculata':        { st: 'common',   periods: [0,1,1,1], habitat: 'SPO'  },
  'Calopteryx amata':           { st: 'rare',     periods: [0,1,0,0], habitat: 'S'    },

  // DRAGONFLIES — DARNERS
  'Aeshna canadensis':          { st: 'common',   periods: [0,1,1,1], habitat: 'MO'   },
  'Aeshna mutata':              { st: 'rare',     periods: [1,1,0,0], habitat: 'PMO'  },
  'Aeshna tuberculifera':       { st: 'uncommon', periods: [0,0,1,1], habitat: 'PMO'  },
  'Aeshna umbrosa':             { st: 'common',   periods: [0,0,1,1], habitat: 'CO'   },
  'Aeshna verticalis':          { st: 'common',   periods: [0,1,1,1], habitat: 'PMO'  },
  'Anax junius':                { st: 'common',   periods: [1,1,1,1], habitat: 'PMO'  },
  'Anax longipes':              { st: 'rare',     periods: [1,1,1,0], habitat: 'P'    },
  'Basiaeschna janata':         { st: 'common',   periods: [1,0,0,0], habitat: 'SPO'  },
  'Boyeria vinosa':             { st: 'common',   periods: [0,0,1,1], habitat: 'S'    },
  'Boyeria grafiana':           { st: 'rare',     periods: [0,0,1,1], habitat: 'S'    }, // Boyeria faciania synonym
  'Epiaeschna heros':           { st: 'rare',     periods: [1,1,0,0], habitat: 'PMO'  },
  'Gomphaeschna furcillata':    { st: 'rare',     periods: [1,1,0,0], habitat: 'PMO'  },

  // DRAGONFLIES — EMERALDS
  'Cordulia shurtleffii':       { st: 'common',   periods: [0,1,1,0], habitat: 'PO'   },
  'Dorocordulia libera':        { st: 'uncommon', periods: [0,1,1,0], habitat: 'PO'   },
  'Epitheca cynosura':          { st: 'common',   periods: [1,0,0,0], habitat: 'PO'   },
  'Epitheca princeps':          { st: 'common',   periods: [0,1,1,0], habitat: 'PO'   },
  'Epitheca canis':             { st: 'rare',     periods: [1,1,0,0], habitat: 'PMO'  },
  'Helocordulia uhleri':        { st: 'uncommon', periods: [1,0,0,0], habitat: 'S'    },

  // DRAGONFLIES — SKIMMERS
  'Celithemis elisa':           { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Celithemis eponina':         { st: 'uncommon', periods: [0,1,1,0], habitat: 'PMO'  },
  'Erythemis simplicicollis':   { st: 'common',   periods: [1,1,1,0], habitat: 'PMO'  },
  'Leucorrhinia intacta':       { st: 'common',   periods: [1,1,0,0], habitat: 'PMO'  },
  'Libellula cyanea':           { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Libellula incesta':          { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Libellula julia':            { st: 'common',   periods: [1,1,0,0], habitat: 'PMO'  },
  'Libellula luctuosa':         { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Libellula lydia':            { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Libellula pulchella':        { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Libellula quadrimaculata':   { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Libellula semifasciata':     { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Pachydiplax longipennis':    { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Pantala flavescens':         { st: 'common',   periods: [0,1,1,1], habitat: 'PMO'  },
  'Pantala hymenaea':           { st: 'common',   periods: [0,1,1,1], habitat: 'PMO'  },
  'Perithemis tenera':          { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Sympetrum janeae':           { st: 'common',   periods: [0,0,1,1], habitat: 'PMO'  },
  'Sympetrum rubicundulum':     { st: 'common',   periods: [0,0,1,1], habitat: 'PMO'  },
  'Sympetrum semicinctum':      { st: 'rare',     periods: [0,0,1,1], habitat: 'PMO'  },
  'Sympetrum vicinum':          { st: 'common',   periods: [0,0,1,1], habitat: 'PMO'  },
  'Tramea carolina':            { st: 'common',   periods: [0,1,1,0], habitat: 'PMO'  },
  'Tramea lacerata':            { st: 'uncommon', periods: [0,0,1,1], habitat: 'PO'   },

  // DRAGONFLIES — CLUBTAILS
  'Arigomphus villosipes':      { st: 'common',   periods: [0,1,0,0], habitat: 'P'    },
  'Gomphus exilis':             { st: 'common',   periods: [1,1,0,0], habitat: 'PMO'  },
  'Gomphus lividus':            { st: 'common',   periods: [0,1,1,0], habitat: 'SPO'  },
  'Gomphus spicatus':           { st: 'common',   periods: [0,1,1,0], habitat: 'SPO'  },
  'Hagenius brevistylus':       { st: 'uncommon', periods: [0,1,1,0], habitat: 'S'    },
  'Lanthus parvulus':           { st: 'rare',     periods: [0,1,1,0], habitat: 'S'    },

  // DRAGONFLIES — SPIKETAILS
  'Cordulegaster diastatops':   { st: 'common',   periods: [0,1,1,0], habitat: 'S'    },
  'Cordulegaster maculata':     { st: 'common',   periods: [0,1,1,0], habitat: 'S'    },
  'Cordulegaster obliqua':      { st: 'rare',     periods: [0,1,1,0], habitat: 'S'    },

  // DRAGONFLIES — CRUISERS
  'Didymops transversa':        { st: 'common',   periods: [0,1,0,0], habitat: 'SP'   },
  'Macromia illinoiensis':      { st: 'common',   periods: [0,1,1,0], habitat: 'S'    },
};

// Known taxonomy synonyms: old DCNR name → current iNat name
const SYNONYMS = {
  'Anax longipies':           'Anax longipes',
  'Boyeria faciania':         'Boyeria grafiana',
  'Cordulia shurtleffi':      'Cordulia shurtleffii',
  'Helocordulia uhlen':       'Helocordulia uhleri',
  'Libellula julia':          'Libellula julia',
  'Lantus parvulus':          'Lanthus parvulus',
  'Argia fumipennis variabilis': 'Argia fumipennis',
};

// ─── HABITAT CODE → readable string ─────────────────────────────────────────
function habitatToText(codes) {
  const map = {
    S: 'stream/creek',
    P: 'pond/lake',
    M: 'marsh',
    V: 'vernal pool',
    O: 'open area'
  };
  return [...codes].filter(c => map[c]).map(c => map[c]).join(', ');
}

// ─── FLIGHT PERIODS → month numbers ──────────────────────────────────────────
// Period 1: late April–May       → 4, 5
// Period 2: June–mid July        → 6, 7
// Period 3: mid July–August      → 7, 8
// Period 4: September–November   → 9, 10, 11
function periodsToMonths(periods) {
  const monthSets = [
    [4, 5],
    [6, 7],
    [7, 8],
    [9, 10, 11]
  ];
  const months = new Set();
  periods.forEach((active, i) => {
    if (active) monthSets[i].forEach(m => months.add(m));
  });
  return [...months].sort((a, b) => a - b);
}

// Peak months = months that appear in 2+ consecutive active periods
function inferPeak(periods) {
  const all = periodsToMonths(periods);
  // Simple heuristic: middle third of flight season
  if (all.length <= 2) return all;
  const start = Math.floor(all.length / 3);
  const end = Math.ceil((2 * all.length) / 3);
  return all.slice(start, end);
}

// ─── LOOKUP: find DCNR entry for a species ───────────────────────────────────
function lookupDCNR(scientificName) {
  // Direct match
  if (DCNR[scientificName]) return DCNR[scientificName];
  // Synonym match
  const resolved = SYNONYMS[scientificName];
  if (resolved && DCNR[resolved]) return DCNR[resolved];
  // Genus-level fuzzy: if species name has changed but genus matches
  const genus = scientificName.split(' ')[0];
  const genusMatches = Object.keys(DCNR).filter(k => k.startsWith(genus + ' '));
  if (genusMatches.length === 1) {
    console.log(`  ~ Genus match: "${scientificName}" → "${genusMatches[0]}"`);
    return DCNR[genusMatches[0]];
  }
  return null;
}

// ─── ENRICH A JSON FILE ───────────────────────────────────────────────────────
function enrichFile(filename) {
  const path = `data/${filename}`;
  const species = JSON.parse(fs.readFileSync(path, 'utf8'));

  let matched = 0;
  let unmatched = [];

  const enriched = species.map(s => {
    const dcnr = lookupDCNR(s.sn);

    if (dcnr) {
      matched++;
      const months = periodsToMonths(dcnr.periods);
      return {
        ...s,
        st:    dcnr.st,
        mo:    months,
        pk:    inferPeak(dcnr.periods),
        water: habitatToText(dcnr.habitat)
      };
    } else {
      unmatched.push(s.sn);
      return s; // leave unchanged
    }
  });

  fs.writeFileSync(path, JSON.stringify(enriched, null, 2));
  console.log(`\n${filename}: ${matched} matched, ${unmatched.length} unmatched`);
  if (unmatched.length > 0) {
    console.log('  Unmatched (fill in manually):');
    unmatched.forEach(sn => console.log(`    - ${sn}`));
  }
}

// ─── RUN ─────────────────────────────────────────────────────────────────────
console.log('Enriching odonate JSON files from DCNR checklist...\n');
enrichFile('dragonflies.json');
enrichFile('damselflies.json');
console.log('\nDone. Butterflies.json was not changed.');
