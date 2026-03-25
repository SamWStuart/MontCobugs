"""v3.000 Build QC — validates split architecture integrity"""
import json, re, os
from collections import defaultdict

V3 = '/home/claude/v3'

print("=" * 60)
print("  labugs v3.000 — Architecture QC")
print("=" * 60)

# 1. Core HTML validation
print("\n[1] Core HTML")
with open(os.path.join(V3, 'index.html'), 'r') as f:
    html = f.read()
print(f"  Size: {len(html):,} bytes ({len(html)/1024:.0f} KB)")

# JS syntax
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
js_scripts = [s for s in scripts if not s.strip().startswith('{')]
js = max(js_scripts, key=len)
with open('/tmp/v3qc.js', 'w') as f:
    f.write(js)
import subprocess
result = subprocess.run(['node', '-c', '/tmp/v3qc.js'], capture_output=True, text=True)
js_ok = result.returncode == 0
print(f"  JS syntax: {'✓ PASS' if js_ok else '✗ FAIL: ' + result.stderr}")

# Backtick count
bt = html.count('`')
print(f"  Backticks: {bt} ({'even ✓' if bt % 2 == 0 else 'ODD ✗'})")

# SPECIES_DATA is empty
sd_empty = 'SPECIES_DATA={}' in html
print(f"  SPECIES_DATA empty: {'✓' if sd_empty else '✗ — inline data still present!'}")

# Data loader present
loader_ok = 'loadAllData' in html and 'loadProg' in html
print(f"  Data loader: {'✓ present' if loader_ok else '✗ MISSING'}")

# Version
v3_count = html.count('v3.000')
print(f"  Version refs: {v3_count} ({'✓' if v3_count >= 2 else '✗ incomplete'})")

# 2. Data files validation
print("\n[2] Data Files")
all_species = {}
total_species = 0
total_bytes = 0

for fname in sorted(os.listdir(os.path.join(V3, 'data'))):
    if not fname.endswith('.json'):
        continue
    group = fname.replace('.json', '')
    fpath = os.path.join(V3, 'data', fname)
    sz = os.path.getsize(fpath)
    total_bytes += sz
    
    with open(fpath) as f:
        try:
            data = json.load(f)
            all_species[group] = data
            total_species += len(data)
            print(f"  {fname}: {len(data)} spp, {sz:,} bytes ✓")
        except json.JSONDecodeError as e:
            print(f"  {fname}: ✗ INVALID JSON — {e}")

print(f"\n  Total: {total_species} species, {total_bytes:,} bytes ({total_bytes/1024:.0f} KB)")

# 3. Cross-file integrity
print("\n[3] Cross-File Integrity")

# TAXA_ORDER matches data files
taxa_match = re.search(r'const TAXA_ORDER=\[([^\]]+)\]', html)
taxa = [t.strip().strip("'\"") for t in taxa_match.group(1).split(',')] if taxa_match else []
data_groups = set(all_species.keys())
taxa_set = set(taxa)
if taxa_set == data_groups:
    print(f"  TAXA_ORDER ↔ data files: ✓ ({len(taxa)} groups)")
else:
    missing_files = taxa_set - data_groups
    extra_files = data_groups - taxa_set
    if missing_files: print(f"  ✗ Missing data files: {missing_files}")
    if extra_files: print(f"  ✗ Extra data files: {extra_files}")

# ID uniqueness
id_map = defaultdict(list)
for g, spp in all_species.items():
    for sp in spp:
        id_map[sp['id']].append((g, sp.get('cn', '')))
id_dupes = {k: v for k, v in id_map.items() if len(v) > 1}
print(f"  ID uniqueness: {'✓ no duplicates' if not id_dupes else f'✗ {len(id_dupes)} duplicates'}")
for sid, entries in list(id_dupes.items())[:3]:
    print(f"    {sid}: {entries}")

# CN uniqueness
cn_map = defaultdict(list)
for g, spp in all_species.items():
    for sp in spp:
        cn_map[sp.get('cn', '')].append((g, sp['id']))
cn_dupes = {k: v for k, v in cn_map.items() if len(v) > 1}
print(f"  CN uniqueness: {'✓ no duplicates' if not cn_dupes else f'✗ {len(cn_dupes)} duplicates'}")

# Cross-group SN uniqueness
sn_map = defaultdict(list)
for g, spp in all_species.items():
    for sp in spp:
        sn = sp.get('sn', '')
        sn_map[sn].append((g, sp['id']))
cross_sn = {k: v for k, v in sn_map.items() if len(set(e[0] for e in v)) > 1}
print(f"  Cross-group SN: {'✓ no duplicates' if not cross_sn else f'✗ {len(cross_sn)} duplicates'}")

# Same-group SN uniqueness
sg_dupes = 0
for g, spp in all_species.items():
    seen = {}
    for sp in spp:
        sn = sp.get('sn', '')
        if sn in seen:
            sg_dupes += 1
            print(f"    ✗ {g}: {sn} ({seen[sn]} & {sp['id']})")
        else:
            seen[sn] = sp['id']
print(f"  Same-group SN: {'✓ no duplicates' if sg_dupes == 0 else f'✗ {sg_dupes} duplicates'}")

# INTRO_SET validation
all_sn = set()
for g, spp in all_species.items():
    for sp in spp:
        all_sn.add(sp.get('sn', ''))

intro_match = re.search(r"const INTRO_SET=new Set\(\[([^\]]+)\]\)", html)
if intro_match:
    intro_list = [s.strip().strip("'\"") for s in intro_match.group(1).split(',')]
    intro_orphans = [s for s in intro_list if s not in all_sn]
    print(f"  INTRO_SET: {len(intro_list)} entries, {'✓ all valid' if not intro_orphans else f'✗ {len(intro_orphans)} orphans: {intro_orphans[:3]}'}")

inv_match = re.search(r"const INVASIVE_SET=new Set\(\[([^\]]+)\]\)", html)
if inv_match:
    inv_list = [s.strip().strip("'\"") for s in inv_match.group(1).split(',')]
    inv_orphans = [s for s in inv_list if s not in all_sn]
    print(f"  INVASIVE_SET: {len(inv_list)} entries, {'✓ all valid' if not inv_orphans else f'✗ {len(inv_orphans)} orphans'}")

cons_match = re.search(r'const CONSERVATION=\{(.+?)\};', html, re.DOTALL)
if cons_match:
    cons_keys = re.findall(r'"([^"]+)":\{', cons_match.group(1))
    cons_orphans = [s for s in cons_keys if s not in all_sn]
    print(f"  CONSERVATION: {len(cons_keys)} entries, {'✓ all valid' if not cons_orphans else f'✗ orphans: {cons_orphans}'}")

# 4. Supporting files
print("\n[4] Supporting Files")
for fname in ['sw.js', 'manifest.json']:
    fpath = os.path.join(V3, fname)
    exists = os.path.exists(fpath)
    sz = os.path.getsize(fpath) if exists else 0
    print(f"  {fname}: {'✓' if exists else '✗ MISSING'} ({sz:,} bytes)")

for icon in ['app-icon-180x180.png', 'app-icon-192x192.png', 'app-icon-512x512.png']:
    ipath = os.path.join(V3, 'icons', icon)
    exists = os.path.exists(ipath)
    print(f"  icons/{icon}: {'✓' if exists else '✗ MISSING'}")

# 5. Architecture summary
print("\n" + "=" * 60)
ssp = sum(1 for g in all_species for sp in all_species[g] if sp.get('ssp'))
avg = total_bytes / total_species if total_species else 0
budget_2mb = int(2 * 1024 * 1024 / avg) if avg else 0
budget_5mb = int(5 * 1024 * 1024 / avg) if avg else 0

print(f"  Architecture: Split (core + {len(all_species)} data files)")
print(f"  Core app shell: {len(html):,} bytes ({len(html)/1024:.0f} KB)")
print(f"  Species data: {total_bytes:,} bytes ({total_bytes/1024:.0f} KB)")
print(f"  Total species: {total_species} ({total_species - ssp} main + {ssp} ssp)")
print(f"  Avg bytes/species: {avg:.0f}")
print(f"  Capacity @ 2 MB data: ~{budget_2mb:,} species")
print(f"  Capacity @ 5 MB data: ~{budget_5mb:,} species")
print(f"  Headroom: {budget_2mb - total_species:,} more species before 2 MB")
print("=" * 60)

all_ok = js_ok and bt % 2 == 0 and sd_empty and loader_ok and not id_dupes and not cn_dupes and not cross_sn and sg_dupes == 0
print(f"\n  OVERALL: {'✓ ALL CHECKS PASSED' if all_ok else '✗ ISSUES FOUND'}")
