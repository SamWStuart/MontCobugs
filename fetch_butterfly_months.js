// fetch_butterfly_months.js
// Fetches monthly observation histograms from iNaturalist for each butterfly
// and populates the mo (flight months) and pk (peak months) fields
// in data/butterflies.json
//
// mo = months with meaningful observations (above noise threshold)
// pk = peak months (top tier of observation counts)
//
// Run: node fetch_butterfly_months.js

const https = require('https');
const fs = require('fs');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MontCoWings/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function fetchMonthlyHistogram(taxonId, placeId = 1522) {
  const url = `https://api.inaturalist.org/v1/observations/histogram?taxon_id=${taxonId}&place_id=${placeId}&quality_grade=research&date_field=observed&interval=month_of_year`;
  const data = await fetchJSON(url);
  
  // Response has results.month_of_year: { "1": count, "2": count, ... "12": count }
  const histogram = data.results?.month_of_year || {};
  
  // Convert to array of [month, count] pairs
  const monthly = [];
  for (let m = 1; m <= 12; m++) {
    monthly.push({ month: m, count: histogram[m] || 0 });
  }
  
  return monthly;
}

function calculateMonths(monthly) {
  const total = monthly.reduce((sum, m) => sum + m.count, 0);
  
  if (total === 0) return { mo: [], pk: [] };
  
  const maxCount = Math.max(...monthly.map(m => m.count));
  
  // Noise threshold: month must have at least 3% of total observations
  // AND at least 2 absolute observations to be included in mo
  // This filters out stray winter records for species that don't overwinter
  const noiseThreshold = Math.max(2, total * 0.03);
  
  // Peak threshold: top 40% of the max count
  const peakThreshold = maxCount * 0.40;
  
  const mo = monthly
    .filter(m => m.count >= noiseThreshold)
    .map(m => m.month);
  
  const pk = monthly
    .filter(m => m.count >= peakThreshold && m.count >= noiseThreshold)
    .map(m => m.month);
  
  return { mo, pk };
}

async function getInatTaxonId(scientificName) {
  // Look up the iNat taxon ID for a species by scientific name
  const url = `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(scientificName)}&per_page=5`;
  const data = await fetchJSON(url);
  
  const results = data.results || [];
  const nameLower = scientificName.toLowerCase();
  
  // Try exact match first
  const exact = results.find(t => t.name.toLowerCase() === nameLower);
  if (exact) return exact.id;
  
  // Try genus+species match (in case of subspecies in our data)
  const parts = scientificName.split(' ');
  if (parts.length >= 2) {
    const binomial = (parts[0] + ' ' + parts[1]).toLowerCase();
    const bi = results.find(t => t.name.toLowerCase() === binomial);
    if (bi) return bi.id;
  }
  
  return null;
}

async function main() {
  const path = 'data/butterflies.json';
  const species = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  console.log(`Processing ${species.length} butterfly species...\n`);
  
  let updated = 0;
  let noData = [];
  let alreadyHad = [];
  
  for (let i = 0; i < species.length; i++) {
    const sp = species[i];
    
    // Skip if already has month data
    if (sp.mo && sp.mo.length > 0) {
      alreadyHad.push(sp.cn);
      console.log(`  [${i+1}/${species.length}] ${sp.cn} — already has month data, skipping`);
      continue;
    }
    
    process.stdout.write(`  [${i+1}/${species.length}] ${sp.cn} (${sp.sn})... `);
    
    try {
      // First try using the iNat taxon ID we already have stored
      // Our JSON has iNat IDs embedded in the wiki URL or we can look them up
      let taxonId = null;
      
      // Extract taxon ID from wikipedia URL if it exists (not reliable)
      // Better to look up by scientific name
      taxonId = await getInatTaxonId(sp.sn);
      
      if (!taxonId) {
        console.log(`❌ taxon not found`);
        noData.push(sp.cn);
        await new Promise(r => setTimeout(r, 300));
        continue;
      }
      
      await new Promise(r => setTimeout(r, 400));
      
      const monthly = await fetchMonthlyHistogram(taxonId);
      const { mo, pk } = calculateMonths(monthly);
      
      if (mo.length === 0) {
        console.log(`⚠ no observations found`);
        noData.push(sp.cn);
      } else {
        sp.mo = mo;
        sp.pk = pk;
        updated++;
        
        // Show a summary
        const monthNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const moStr = mo.map(m => monthNames[m]).join(',');
        const pkStr = pk.map(m => monthNames[m]).join(',');
        console.log(`✓  mo:[${moStr}]  pk:[${pkStr}]`);
      }
      
      await new Promise(r => setTimeout(r, 600));
      
    } catch (e) {
      console.log(`❌ error: ${e.message}`);
      noData.push(sp.cn);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  // Save updated file
  fs.writeFileSync(path, JSON.stringify(species, null, 2));
  
  console.log('\n─────────────────────────────────────');
  console.log(`Done.`);
  console.log(`  Updated:      ${updated} species`);
  console.log(`  Already had:  ${alreadyHad.length} species (skipped)`);
  console.log(`  No data:      ${noData.length} species`);
  
  if (noData.length > 0) {
    console.log(`\nSpecies with no month data (fill manually):`);
    noData.forEach(cn => console.log(`  - ${cn}`));
  }
}

main().catch(console.error);
