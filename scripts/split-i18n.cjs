/**
 * split-i18n.cjs
 *
 * Reads translation.json for each language (en, pl, nl),
 * categorizes keys into per-page namespace files,
 * merges with existing namespace files, and writes output.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '..', 'public', 'locales');
const LANGUAGES = ['en', 'pl', 'nl'];

// Flatten nested JSON to dot-notation keys
function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

// Unflatten dot-notation keys back to nested JSON
function unflatten(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

// Categorization rules: prefix/pattern → namespace
// Order matters — first match wins
const RULES = [
  // === common (Layout, Navbar, Footer, ErrorBoundary, shared UI) ===
  { match: (k) => k.startsWith('nav.'), ns: 'common' },
  { match: (k) => k.startsWith('footer.'), ns: 'common' },
  { match: (k) => k.startsWith('error.'), ns: 'common' },
  { match: (k) => k.startsWith('errors.'), ns: 'common' },
  { match: (k) => k.startsWith('accessibility.'), ns: 'common' },
  { match: (k) => k.startsWith('buttons.'), ns: 'common' },
  { match: (k) => k.startsWith('common.'), ns: 'common' },
  { match: (k) => k.startsWith('audio_player.'), ns: 'common' },
  { match: (k) => k.startsWith('gallery.'), ns: 'common' },
  { match: (k) => k === 'loading', ns: 'common' },
  { match: (k) => k === 'media_unavailable', ns: 'common' },
  { match: (k) => k === 'error_generic_title', ns: 'common' },

  // === notFound ===
  { match: (k) => k.startsWith('404.'), ns: 'notFound' },

  // === transientica ===
  { match: (k) => k.startsWith('transientica.'), ns: 'transientica' },

  // === projectDetail (sf.*, ann.*, img.*, stats_ml.*, timeline.*, details.*, links.*, code.*, tooltips.*, project.*) ===
  { match: (k) => k.startsWith('sf.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('ann.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('img.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('stats_ml.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('details.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('details.technical_dive'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('links.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('code.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('tooltips.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('project.'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('timeline.'), ns: 'projectDetail' },
  { match: (k) => k === 'Role', ns: 'projectDetail' },
  { match: (k) => k === 'Team', ns: 'projectDetail' },
  { match: (k) => k === 'Engine', ns: 'projectDetail' },
  { match: (k) => k === 'Status', ns: 'projectDetail' },
  { match: (k) => k.startsWith('SYSTEM_'), ns: 'projectDetail' },
  { match: (k) => k.startsWith('MODULE_'), ns: 'projectDetail' },
  // project_*_full_desc, project_*_block*, project_*_collab*
  { match: (k) => /^project_[a-z_-]+_full_desc$/.test(k), ns: 'projectDetail' },
  { match: (k) => /^project_[a-z_-]+_block\d/.test(k), ns: 'projectDetail' },
  { match: (k) => /^project_[a-z_-]+_collab/.test(k), ns: 'projectDetail' },
  // Specific string values used as labels in project details
  { match: (k) => k === 'Lead Audio Designer', ns: 'projectDetail' },
  { match: (k) => k === 'Multi-Institutional', ns: 'projectDetail' },
  { match: (k) => k === 'UE5 + Wwise', ns: 'projectDetail' },
  { match: (k) => k === 'In Production', ns: 'projectDetail' },

  // === projects (listing page, filters, card summaries, tags) ===
  { match: (k) => k.startsWith('tags.'), ns: 'projects' },
  { match: (k) => k.startsWith('projects.'), ns: 'projects' },
  { match: (k) => k.startsWith('projects_'), ns: 'projects' },
  { match: (k) => k.startsWith('card.'), ns: 'projects' },
  { match: (k) => k === 'card.view_project', ns: 'projects' },
  // project_*_title, project_*_short_desc (card-level)
  { match: (k) => /^project_[a-z_-]+_title$/.test(k), ns: 'projects' },
  { match: (k) => /^project_[a-z_-]+_short_desc$/.test(k), ns: 'projects' },

  // === home (hero, skills, showreel, stats, tech, modals, categories) ===
  { match: (k) => k.startsWith('hero.'), ns: 'home' },
  { match: (k) => k.startsWith('hero_'), ns: 'home' },
  { match: (k) => k.startsWith('skills.'), ns: 'home' },
  { match: (k) => k.startsWith('demo_reel.'), ns: 'home' },
  { match: (k) => k.startsWith('core_tech.'), ns: 'home' },
  { match: (k) => k.startsWith('showreel.'), ns: 'home' },
  { match: (k) => k === 'showreel.play', ns: 'home' },
  { match: (k) => k.startsWith('stats.'), ns: 'home' },
  { match: (k) => k.startsWith('stat_'), ns: 'home' },
  { match: (k) => k.startsWith('tech_'), ns: 'home' },
  { match: (k) => k.startsWith('modal_'), ns: 'home' },
  { match: (k) => k.startsWith('skillModal_'), ns: 'home' },
  { match: (k) => k.startsWith('category_'), ns: 'home' },
  { match: (k) => k.startsWith('skill_game_'), ns: 'home' },
  { match: (k) => k.startsWith('skill_production_'), ns: 'home' },
  { match: (k) => k.startsWith('skill_dev_'), ns: 'home' },
  { match: (k) => k.startsWith('level_'), ns: 'home' },
  { match: (k) => k.startsWith('value_'), ns: 'home' },
  // *_projects (tool usage descriptions)
  { match: (k) => /^[a-z]+_projects$/.test(k), ns: 'home' },

  // === about ===
  { match: (k) => k.startsWith('about_'), ns: 'about' },
  { match: (k) => k.startsWith('philosophy_'), ns: 'about' },
  { match: (k) => k.startsWith('principle_'), ns: 'about' },
  { match: (k) => k.startsWith('timeline_'), ns: 'about' },
  { match: (k) => k.startsWith('cta_'), ns: 'about' },
  { match: (k) => k.startsWith('achievement'), ns: 'about' },
  { match: (k) => k.startsWith('status_'), ns: 'about' },
  { match: (k) => k === 'skills_subtitle', ns: 'about' },
  { match: (k) => k === 'journey_subtitle', ns: 'about' },

  // === contact ===
  { match: (k) => k.startsWith('contact_'), ns: 'contact' },
  { match: (k) => k.startsWith('contact.'), ns: 'contact' },
  { match: (k) => k === 'name', ns: 'contact' },
  { match: (k) => k === 'email', ns: 'contact' },
  { match: (k) => k === 'subject', ns: 'contact' },
  { match: (k) => k === 'message', ns: 'contact' },

  // === music ===
  { match: (k) => k.startsWith('music.'), ns: 'music' },
  { match: (k) => k.startsWith('player.'), ns: 'music' },
];

function categorize(key) {
  for (const rule of RULES) {
    if (rule.match(key)) {
      return rule.ns;
    }
  }
  return null; // orphan
}

// Main
const report = {
  perNamespace: {},
  orphans: [],
  duplicates: [],
  total: 0,
};

for (const lang of LANGUAGES) {
  const translationPath = path.join(LOCALES_DIR, lang, 'translation.json');
  if (!fs.existsSync(translationPath)) {
    console.error(`Missing: ${translationPath}`);
    continue;
  }

  const raw = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
  const flat = flatten(raw);
  const keys = Object.keys(flat);

  // Buckets: namespace → { key: value }
  const buckets = {};
  const langOrphans = [];

  for (const key of keys) {
    const ns = categorize(key);
    if (!ns) {
      langOrphans.push(key);
      continue;
    }
    if (!buckets[ns]) buckets[ns] = {};
    buckets[ns][key] = flat[key];
  }

  if (lang === 'en') {
    report.total = keys.length;
    report.orphans = langOrphans;
  }

  // For each namespace bucket, merge with existing file
  for (const [ns, newKeys] of Object.entries(buckets)) {
    const nsPath = path.join(LOCALES_DIR, lang, `${ns}.json`);
    let existing = {};
    if (fs.existsSync(nsPath)) {
      try {
        const existingRaw = JSON.parse(fs.readFileSync(nsPath, 'utf8'));
        existing = flatten(existingRaw);
      } catch (e) {
        console.warn(`Warning: Could not parse ${nsPath}, overwriting.`);
      }
    }

    // Check duplicates (key in both existing and translation.json)
    if (lang === 'en') {
      const dupes = Object.keys(newKeys).filter(k => k in existing);
      if (dupes.length > 0) {
        report.duplicates.push({ ns, keys: dupes });
      }
    }

    // Merge: new keys override existing if conflict (translation.json is canonical)
    const merged = { ...existing, ...newKeys };

    // Sort keys alphabetically for consistency
    const sorted = {};
    for (const k of Object.keys(merged).sort()) {
      sorted[k] = merged[k];
    }

    // Unflatten and write
    const nested = unflatten(sorted);
    fs.writeFileSync(nsPath, JSON.stringify(nested, null, 2) + '\n', 'utf8');

    if (lang === 'en') {
      if (!report.perNamespace[ns]) report.perNamespace[ns] = 0;
      report.perNamespace[ns] += Object.keys(newKeys).length;
    }
  }

  console.log(`[${lang}] Processed ${keys.length} keys from translation.json`);
}

// Print report
console.log('\n=== SPLIT REPORT ===');
console.log(`Total keys in EN translation.json: ${report.total}`);
console.log('\nKeys per namespace (from translation.json):');
let assigned = 0;
for (const [ns, count] of Object.entries(report.perNamespace).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${ns}: ${count}`);
  assigned += count;
}
console.log(`\nTotal assigned: ${assigned}`);
console.log(`Orphans (unmatched): ${report.orphans.length}`);
if (report.orphans.length > 0) {
  console.log('Orphan keys:');
  for (const k of report.orphans) {
    console.log(`  - ${k}`);
  }
}
if (report.duplicates.length > 0) {
  console.log('\nDuplicates (key in both translation.json and existing namespace):');
  for (const { ns, keys } of report.duplicates) {
    console.log(`  ${ns}: ${keys.length} duplicates`);
    for (const k of keys.slice(0, 5)) {
      console.log(`    - ${k}`);
    }
    if (keys.length > 5) console.log(`    ... and ${keys.length - 5} more`);
  }
}
