/**
 * verify-i18n.cjs
 *
 * Validates i18n key coverage:
 * Part A: Extract translation keys from source code (.tsx/.ts)
 * Part B: Extract translation keys from portfolioData.json
 * Part C: Read all locale JSON namespace files
 * Part D: Generate reports (missing, orphaned, cross-language gaps)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const LOCALES_DIR = path.join(ROOT, 'public', 'locales');
const LANGUAGES = ['en', 'pl', 'nl'];
const PORTFOLIO_DATA_PATH = path.join(SRC_DIR, 'data', 'portfolioData.json');

// Namespaces that should NOT be checked for orphan keys (per-project namespaces have their own logic)
const PER_PROJECT_NAMESPACES = [
  'gradwork', 'soundDesign', 'middlewareOptimization', 'shadowFrames',
  'audioq', 'amorak', 'akantilado', 'pauseAndDeserve', 'notTodayDarling',
  'wwiseUnrealFixer', 'rayAnimation', 'richter', 'unrealEngineRebuilder'
];

// ============= UTILITIES =============

function flatten(obj, prefix) {
  prefix = prefix || '';
  const result = {};
  for (const k of Object.keys(obj)) {
    const fk = prefix ? prefix + '.' + k : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      Object.assign(result, flatten(obj[k], fk));
    } else {
      result[fk] = obj[k];
    }
  }
  return result;
}

function getAllFiles(dir, ext) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ============= PART A: Extract keys from source code =============

function extractKeysFromSource() {
  const keyMap = new Map(); // key -> Set<sourceFile>

  const tsxFiles = [
    ...getAllFiles(SRC_DIR, '.tsx'),
    ...getAllFiles(SRC_DIR, '.ts')
  ].filter(f => !f.endsWith('.d.ts'));

  // Load portfolioData for dynamic key expansion
  const portfolioData = JSON.parse(fs.readFileSync(PORTFOLIO_DATA_PATH, 'utf8'));
  const allProjects = [
    ...(portfolioData.featured_projects || []),
    ...(portfolioData.additional_projects || [])
  ];
  const projectIds = allProjects.map(p => p.id);

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(ROOT, file);

    // Match t('key'), t("key"), t(`key`)
    const tRegex = /\bt\(\s*['"`]([^'"`\n${}]+?)['"`]/g;
    let match;
    while ((match = tRegex.exec(content)) !== null) {
      const key = match[1];
      if (!keyMap.has(key)) keyMap.set(key, new Set());
      keyMap.get(key).add(relPath);
    }

    // Match i18n.t('key'), i18n.t("key")
    const i18nRegex = /i18n\.t\(\s*['"`]([^'"`\n${}]+?)['"`]/g;
    while ((match = i18nRegex.exec(content)) !== null) {
      const key = match[1];
      if (!keyMap.has(key)) keyMap.set(key, new Set());
      keyMap.get(key).add(relPath);
    }

    // Match tCommon('key')
    const tCommonRegex = /tCommon\(\s*['"`]([^'"`\n${}]+?)['"`]/g;
    while ((match = tCommonRegex.exec(content)) !== null) {
      const key = match[1];
      if (!keyMap.has(key)) keyMap.set(key, new Set());
      keyMap.get(key).add(relPath);
    }

    // Expand dynamic keys: t(`project_${id}_title`) etc.
    const dynamicRegex = /\bt\(\s*`project_\$\{[^}]+\}_(title|short_desc|full_desc|block\d+_title|block\d+_content|collab_title|collab_desc)`/g;
    while ((match = dynamicRegex.exec(content)) !== null) {
      const suffix = match[1];
      for (const pid of projectIds) {
        const key = `project_${pid}_${suffix}`;
        if (!keyMap.has(key)) keyMap.set(key, new Set());
        keyMap.get(key).add(relPath + ' (dynamic)');
      }
    }
  }

  return keyMap;
}

// ============= PART B: Extract keys from portfolioData.json =============

function extractKeysFromData() {
  const keys = new Set();
  const data = JSON.parse(fs.readFileSync(PORTFOLIO_DATA_PATH, 'utf8'));

  const KNOWN_PREFIXES = ['sf.', 'ann.', 'img.', 'stats_ml.', 'project_', 'transientica.', 'details.', 'code.', 'links.', 'tooltips.'];
  const TRANSLATION_FIELDS = ['title', 'content', 'mediaCaption', 'caption', 'label', 'value', 'challenge', 'problem', 'solution', 'description', 'short_description', 'full_description'];

  function walk(obj, fieldName) {
    if (typeof obj === 'string') {
      // Check if this string looks like a translation key
      if (obj.includes('.') && KNOWN_PREFIXES.some(p => obj.startsWith(p))) {
        keys.add(obj);
      }
      return;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) walk(item, fieldName);
      return;
    }
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        walk(v, k);
      }
    }
  }

  walk(data, '');
  return keys;
}

// ============= PART C: Read all locale JSON files =============

function readAllNamespaces() {
  // Returns Map<namespace, Map<lang, Set<key>>>
  const nsMap = new Map();

  for (const lang of LANGUAGES) {
    const langDir = path.join(LOCALES_DIR, lang);
    if (!fs.existsSync(langDir)) continue;

    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const ns = file.replace('.json', '');
      if (ns === 'translation' || ns === 'pawism') continue; // Skip monolith and orphaned

      const filePath = path.join(langDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const flat = flatten(data);

        if (!nsMap.has(ns)) nsMap.set(ns, new Map());
        nsMap.get(ns).set(lang, new Set(Object.keys(flat)));
      } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
      }
    }
  }

  return nsMap;
}

// ============= PART D: Reports =============

function generateReports(sourceKeys, dataKeys, nsMap) {
  let hasErrors = false;

  // Combine all EN keys from all namespaces
  const allENKeys = new Set();
  for (const [ns, langMap] of nsMap) {
    const enKeys = langMap.get('en');
    if (enKeys) {
      for (const k of enKeys) allENKeys.add(k);
    }
  }

  // Combined used keys (source + data)
  const usedKeys = new Set([...sourceKeys.keys(), ...dataKeys]);

  // 1. MISSING KEYS: key used in code/data but not in any EN namespace
  const missingKeys = [];
  for (const key of usedKeys) {
    if (!allENKeys.has(key)) {
      // Skip keys that are clearly not translation keys (contain variables, etc.)
      if (key.includes('${') || key.includes('{{') || key.length < 2) continue;
      // Skip keys that only look like CSS class names, paths, etc.
      if (key.startsWith('/') || key.startsWith('http')) continue;
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.log(`\n❌ MISSING KEYS (${missingKeys.length}): Used in code/data but not in any namespace`);
    for (const k of missingKeys.sort()) {
      const sources = sourceKeys.get(k);
      const fromData = dataKeys.has(k);
      const src = sources ? [...sources].join(', ') : (fromData ? 'portfolioData.json' : 'unknown');
      console.log(`  - ${k}  (from: ${src})`);
    }
    hasErrors = true;
  } else {
    console.log('\n✅ No missing keys');
  }

  // 2. MISSING TRANSLATIONS: key in EN but not in PL/NL
  const missingTranslations = { pl: [], nl: [] };
  for (const [ns, langMap] of nsMap) {
    if (PER_PROJECT_NAMESPACES.includes(ns)) continue; // Skip per-project namespaces
    const enKeys = langMap.get('en') || new Set();
    for (const otherLang of ['pl', 'nl']) {
      const otherKeys = langMap.get(otherLang) || new Set();
      for (const k of enKeys) {
        if (!otherKeys.has(k)) {
          missingTranslations[otherLang].push(`${ns}:${k}`);
        }
      }
    }
  }

  for (const lang of ['pl', 'nl']) {
    if (missingTranslations[lang].length > 0) {
      console.log(`\n⚠️  MISSING ${lang.toUpperCase()} TRANSLATIONS (${missingTranslations[lang].length}):`);
      for (const k of missingTranslations[lang].sort().slice(0, 20)) {
        console.log(`  - ${k}`);
      }
      if (missingTranslations[lang].length > 20) {
        console.log(`  ... and ${missingTranslations[lang].length - 20} more`);
      }
    } else {
      console.log(`\n✅ ${lang.toUpperCase()} has all translations`);
    }
  }

  // 3. ORPHANED KEYS: in namespace files but never used in code/data
  const orphanedKeys = [];
  for (const [ns, langMap] of nsMap) {
    if (PER_PROJECT_NAMESPACES.includes(ns)) continue;
    const enKeys = langMap.get('en') || new Set();
    for (const k of enKeys) {
      if (!usedKeys.has(k)) {
        orphanedKeys.push(`${ns}:${k}`);
      }
    }
  }

  if (orphanedKeys.length > 0) {
    console.log(`\nℹ️  POTENTIALLY ORPHANED KEYS (${orphanedKeys.length}):`);
    for (const k of orphanedKeys.sort().slice(0, 30)) {
      console.log(`  - ${k}`);
    }
    if (orphanedKeys.length > 30) {
      console.log(`  ... and ${orphanedKeys.length - 30} more`);
    }
  } else {
    console.log('\n✅ No orphaned keys');
  }

  return hasErrors;
}

// ============= MAIN =============

console.log('=== i18n VERIFICATION ===\n');

console.log('Part A: Extracting keys from source code...');
const sourceKeys = extractKeysFromSource();
console.log(`  Found ${sourceKeys.size} unique keys in source`);

console.log('Part B: Extracting keys from portfolioData.json...');
const dataKeys = extractKeysFromData();
console.log(`  Found ${dataKeys.size} keys in data`);

console.log('Part C: Reading namespace files...');
const nsMap = readAllNamespaces();
console.log(`  Found ${nsMap.size} namespaces`);

console.log('\nPart D: Generating reports...');
const hasErrors = generateReports(sourceKeys, dataKeys, nsMap);

if (hasErrors) {
  console.log('\n❌ Verification found errors. Fix missing keys before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed!');
  process.exit(0);
}
