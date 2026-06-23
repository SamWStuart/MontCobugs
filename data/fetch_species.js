const https = require('https');
const fs = require('fs');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MontCoWings/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function fetchAllSpecies(taxonId, label) {
  const placeId = 1522;
  let page = 1;
  let allResults = [];

  while (true) {
    const url = `https://api.inaturalist.org/v1/observations/species_counts?place_id=${placeId}&taxon_id=${taxonId}&quality_grade=research&per_page=500&page=${page}`;
    console.log(`Fetching ${label} page ${page}...`);
    const data = await fetchJSON(url);
    allResults = allResults.concat(data.results);
    console.log(`  Got ${data.results.length} (${allResults.length} of ${data.total_results} total)`);
    if (allResults.length >= data.total_results || data.results.length === 0) break;
    page++;
    await new Promise(r => setTimeout(r, 1500));
  }

  // Enrich with full taxonomy in batches of 30
  console.log(`  Fetching taxonomy for ${allResults.length} ${label}...`);
  
  for (let i = 0; i < allResults.length; i += 30) {
    const batch = allResults.slice(i, i + 30);
    const ids = batch.map(r => r.taxon.id).join(',');
    const url = `https://api.inaturalist.org/v1/taxa?taxon_id=${ids}&per_page=30`;
    const data = await fetchJSON(url);
    
    for (const taxon of (data.results || [])) {
      const match = allResults.find(r => r.taxon.id === taxon.id);
      if (match && taxon.ancestors) {
        const familyAncestor = taxon.ancestors.find(a => a.rank === 'family');
        if (familyAncestor) match.taxon._family = familyAncestor.name;
      }
    }
    await new Promise(r => setTimeout(r, 600));
    console.log(`  Taxonomy batch ${Math.floor(i/30)+1}/${Math.ceil(allResults.length/30)} done`);
  }

  console.log(`${label}: ${allResults.length} species total\n`);
  return allResults;
}

function buildButterfly(results) {
  return results.map((r, i) => ({
    id:   `bu${i + 1}`,
    cn:   r.taxon.preferred_common_name || '',
    sn:   r.taxon.name,
    fam: r.taxon._family || '',
    obs:  r.count,
    wiki: r.taxon.wikipedia_url || '',
    st:   'uncommon',
    desc: '',
    fm: {
      'Wingspan':      '',
      'Upperside':     '',
      'Underside':     '',
      'Flight Period': '',
      'Host Plants':   '',
      'Habitat':       ''
    },
    mo:    [],
    pk:    [],
    hp:    '',
    pkSrc: 'pub'
  }));
}

function buildOdonate(results, prefix) {
  return results.map((r, i) => ({
    id:   `${prefix}${i + 1}`,
    cn:   r.taxon.preferred_common_name || '',
    sn:   r.taxon.name,
    fam:  r.taxon._family ||   '',
    obs:  r.count,
    wiki: r.taxon.wikipedia_url || '',
    st:   'uncommon',
    desc: '',
    fm: {
      'Size':            '',
      'Male':            '',
      'Female':          '',
      'Similar Species': '',
      'Habitat':         '',
      'Flight Period':   ''
    },
    mo:    [],
    pk:    [],
    water: '',
    pkSrc: 'pub'
  }));
}

async function main() {
  // iNat taxon IDs
  const BUTTERFLIES = 47224;  // Papilionoidea
  const DRAGONFLIES = 47927;  // Anisoptera
  const DAMSELFLIES = 47928;  // Zygoptera

  const butterflies = await fetchAllSpecies(BUTTERFLIES, 'Butterflies');
  const dragonflies = await fetchAllSpecies(DRAGONFLIES, 'Dragonflies');
  const damselflies = await fetchAllSpecies(DAMSELFLIES, 'Damselflies');

fs.writeFileSync('data/butterflies.json',  JSON.stringify(buildButterfly(butterflies), null, 2));
fs.writeFileSync('data/dragonflies.json',  JSON.stringify(buildOdonate(dragonflies, 'dr'), null, 2));
fs.writeFileSync('data/damselflies.json',  JSON.stringify(buildOdonate(damselflies, 'da'), null, 2));

  console.log('Done! Check your data/ folder.');
  console.log(`  butterflies.json — ${butterflies.length} species`);
  console.log(`  dragonflies.json — ${dragonflies.length} species`);
  console.log(`  damselflies.json — ${damselflies.length} species`);
}

main().catch(console.error);