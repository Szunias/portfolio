import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES = ['en', 'pl', 'nl'];
const SOURCE_LOCALE = 'en';
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');

// Parse CLI arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');

// Terms that are allowed to remain in English (technologies, proper nouns, etc.)
const ALLOWED_ENGLISH_TERMS = [
  // Technologies & Tools
  'Wwise', 'FMOD', 'Unity', 'Unreal Engine', 'C++', 'C#', 'JUCE', 'VST', 'VST3', 'AU', 'AAX',
  'Pro Tools', 'Reaper', 'Ableton', 'Max/MSP', 'Pure Data', 'Logic Pro',
  'Git', 'GitHub', 'Node.js', 'React', 'Next.js', 'TypeScript', 'JavaScript',
  'Python', 'TensorFlow', 'PyTorch', 'LibTorch',

  // Project names
  'Shadow Frames', 'AudioLab', 'Transientica', 'Gradwork', 'Richter',
  'Not Today Darling', 'Pause & Deserve', 'Middleware Optimization',

  // Technical terms
  'RTPC', 'DSP', 'API', 'UI', 'UX', 'CPU', 'GPU', 'RAM', 'SSD',
  'MIDI', 'OSC', 'DAW', 'LFO', 'ADSR', 'EQ', 'FFT',

  // Audio terms (often kept in English internationally)
  'Sound Design', 'Game Audio', 'Middleware', 'Plugin', 'Plugins',
  'Mix', 'Master', 'Reverb', 'Delay', 'Compressor', 'Limiter',
  'Audio Middleware', 'Game Engines', 'Audio Tools', 'Pipeline Tools',

  // Common proper nouns & brands
  'LinkedIn', 'YouTube', 'Vimeo', 'SoundCloud', 'Bandcamp',
  'Howest DAE', 'Igor Szuniewicz',

  // Role titles (often kept in English for professional contexts)
  'Audio Designer & Developer', 'Audio Designer', 'Sound Designer',

  // Labels and categories
  'Status', 'Dossier', 'Expert', 'Development', 'Tools',

  // Words that are identical/similar across languages (cognates)
  'Horror', 'Contact', 'Home', 'Email', 'Multiplayer', 'Portfolio',
  'Machine Learning', 'AI', 'screenshot', 'Start', 'Solo', 'Team',
  'Engine', 'Prototype', 'Metrics', 'Problem', 'Pipeline', 'Releases',

  // More project/game names
  'Amorak', 'Akantilado', 'Not Today, Darling!', 'Ellen', 'Paw-ism',
  'Boney Boogaloo', 'Stomach Aches',

  // Tech/Brand names
  'Spotify', 'Itch.io', 'MetaSounds', 'ElevenLabs', 'TensorFlow', 'PyTorch',
  'Windows', 'Cubase', 'Blueprint', 'Blueprints',

  // Audio/Game industry terms
  'Foley', 'Surround', '5.1 Surround', 'Funk', 'Real-time', 'Multi-Platform',

  // Common short words that might match accidentally
  'OK', 'vs', 'null', 'true', 'false',
];

// Patterns that are allowed to match between EN and other locales
const ALLOWED_PATTERNS = [
  /^https?:\/\//, // URLs
  /^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Email addresses
  /^\d+$/, // Pure numbers
  /^[A-Z]{2,5}$/, // Abbreviations like "DSP", "API"
  /^[A-Z][a-z]+ & [A-Z][a-z]+/, // Patterns like "Unity & Unreal"
  /^[A-Z][a-zA-Z]+ [A-Z][a-zA-Z]+$/, // Two capitalized words (likely proper noun)
  /^(Middleware|Engines|Audio|Game|Tools):?$/, // Category labels
  /^[A-Z]+( [A-Z]+)*$/, // ALL CAPS titles
  /VST|AU|AAX|plugins?/i, // Plugin format mentions
  /^CV \/ Resume$/, // CV button
  /DAE:/, // DAE prefix
  /^\w+, \w+(, \w+)*$/, // Comma-separated lists (likely project names)
  /^[A-Za-z#]+ scripting$/, // "C# scripting" etc
  /^@\w+$/, // Usernames like @Szunias
  /^[A-Z][a-z]+:$/, // Labels ending with colon
  /^\w+\.\w+$/, // Domain-like names (Itch.io)
  /\(Cloud\)/, // Cloud service indicators
  /^AI /, // AI prefix
  /Pre-gen/, // AI Pre-gen
  /Gameplay$/, // Video titles ending with Gameplay
  /Blueprint/, // Unreal Blueprint terms
  /^Sprint \d+$/, // Agile sprints
  /^\d+\.\d+ /, // Version-like prefixes like "5.1 Surround"
  /Platforms?$/, // Platform mentions
  /^[A-Z][a-z]+$/, // Single capitalized word (proper noun pattern)
  /^<?\d+m?s>?$/, // Latency values like "<60ms"
  /\.h:/, // C++ header references
  /\.cpp:/, // C++ source references
];

// ============================================================
// Utility functions
// ============================================================

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  // Match only ICU message format placeholders like {name}, {count, plural, ...}
  // Exclude code blocks (containing newlines, semicolons, parentheses inside braces)
  const matches = str.match(/\{[a-zA-Z_][a-zA-Z0-9_]*(?:,\s*[^}]+)?\}/g);
  if (!matches) return [];
  // Filter out false positives that look like code
  return matches.filter(m => {
    const inner = m.slice(1, -1);
    // Skip if contains code-like patterns
    if (/[;\n()=<>]/.test(inner)) return false;
    // Skip if it's all caps and longer than 10 chars (likely code constant)
    if (/^[A-Z_]+$/.test(inner) && inner.length > 10) return false;
    return true;
  }).sort();
}

function isAllowedEnglishTerm(value) {
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();

  // Very short strings (<=3 chars) are likely abbreviations/codes
  if (trimmed.length <= 3) return true;

  // Check exact matches first (case insensitive)
  for (const term of ALLOWED_ENGLISH_TERMS) {
    if (trimmed === term || trimmed.toLowerCase() === term.toLowerCase()) {
      return true;
    }
  }

  // Check patterns
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Check if value contains mostly allowed terms (for comma-separated lists)
  const words = trimmed.split(/[,&/]+/).map(w => w.trim()).filter(Boolean);
  if (words.length > 1) {
    const allowedCount = words.filter(word => {
      // Check if this word/phrase is in allowed terms
      for (const term of ALLOWED_ENGLISH_TERMS) {
        if (word === term || word.toLowerCase() === term.toLowerCase()) return true;
        if (term.includes(word) || word.includes(term)) return true;
      }
      // Short words are allowed
      if (word.length <= 4) return true;
      return false;
    }).length;
    // If >70% of words are allowed, consider it OK
    if (allowedCount / words.length >= 0.7) return true;
  }

  // Check if value contains any known allowed term as substring
  for (const term of ALLOWED_ENGLISH_TERMS) {
    if (term.length >= 4 && trimmed.includes(term)) {
      return true;
    }
  }

  return false;
}

function truncate(str, maxLen = 50) {
  if (typeof str !== 'string') return String(str);
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

// ============================================================
// Check functions
// ============================================================

function checkMissingKeys(sourceKeys, targetKeys, locale, namespace) {
  const missing = sourceKeys.filter(k => !targetKeys.includes(k));
  const extra = targetKeys.filter(k => !sourceKeys.includes(k));

  const errors = [];
  const warnings = [];

  if (missing.length > 0) {
    errors.push({
      type: 'MISSING_KEY',
      locale,
      namespace,
      keys: missing,
      message: `${missing.length} missing key(s)`
    });
  }

  if (extra.length > 0) {
    warnings.push({
      type: 'EXTRA_KEY',
      locale,
      namespace,
      keys: extra,
      message: `${extra.length} extra key(s) not in ${SOURCE_LOCALE}`
    });
  }

  return { errors, warnings };
}

function checkUntranslatedTexts(sourceData, targetData, commonKeys, locale, namespace) {
  const warnings = [];

  for (const key of commonKeys) {
    const sourceValue = getValue(sourceData, key);
    const targetValue = getValue(targetData, key);

    // Only check strings
    if (typeof sourceValue !== 'string' || typeof targetValue !== 'string') continue;

    // Check if values are identical
    if (sourceValue === targetValue && !isAllowedEnglishTerm(sourceValue)) {
      warnings.push({
        type: 'UNTRANSLATED',
        locale,
        namespace,
        key,
        value: truncate(sourceValue),
        message: `Possibly untranslated: "${truncate(sourceValue)}"`
      });
    }
  }

  return warnings;
}

function checkEmptyValues(data, keys, locale, namespace) {
  const warnings = [];

  for (const key of keys) {
    const value = getValue(data, key);

    if (value === '' || value === null || value === undefined) {
      warnings.push({
        type: 'EMPTY_VALUE',
        locale,
        namespace,
        key,
        message: `Empty value for key`
      });
    }
  }

  return warnings;
}

function checkPlaceholderMismatches(sourceData, targetData, commonKeys, locale, namespace) {
  const errors = [];

  for (const key of commonKeys) {
    const sourceValue = getValue(sourceData, key);
    const targetValue = getValue(targetData, key);

    // Only check strings
    if (typeof sourceValue !== 'string' || typeof targetValue !== 'string') continue;

    const sourcePlaceholders = extractPlaceholders(sourceValue);
    const targetPlaceholders = extractPlaceholders(targetValue);

    // Compare placeholder sets
    const sourcePH = JSON.stringify(sourcePlaceholders);
    const targetPH = JSON.stringify(targetPlaceholders);

    if (sourcePH !== targetPH) {
      errors.push({
        type: 'PLACEHOLDER_MISMATCH',
        locale,
        namespace,
        key,
        expected: sourcePlaceholders,
        actual: targetPlaceholders,
        message: `Placeholder mismatch: expected ${sourcePH}, got ${targetPH}`
      });
    }
  }

  return errors;
}

function checkTypeMismatches(sourceData, targetData, commonKeys, locale, namespace) {
  const errors = [];

  for (const key of commonKeys) {
    const sourceValue = getValue(sourceData, key);
    const targetValue = getValue(targetData, key);

    const sourceType = Array.isArray(sourceValue) ? 'array' : typeof sourceValue;
    const targetType = Array.isArray(targetValue) ? 'array' : typeof targetValue;

    if (sourceType !== targetType) {
      errors.push({
        type: 'TYPE_MISMATCH',
        locale,
        namespace,
        key,
        expected: sourceType,
        actual: targetType,
        message: `Type mismatch: expected ${sourceType}, got ${targetType}`
      });
    }
  }

  return errors;
}

// ============================================================
// Report formatting
// ============================================================

function formatReport(errors, warnings, infos) {
  const lines = [];

  if (errors.length > 0) {
    lines.push('\n[ERROR] Critical issues found:');
    lines.push('─'.repeat(50));

    // Group by type
    const byType = groupBy(errors, 'type');

    for (const [type, items] of Object.entries(byType)) {
      lines.push(`\n  ${formatErrorType(type)}:`);
      for (const item of items) {
        if (item.keys) {
          lines.push(`    ${item.locale}/${item.namespace}.json: ${item.message}`);
          if (VERBOSE) {
            item.keys.slice(0, 10).forEach(k => lines.push(`      - ${k}`));
            if (item.keys.length > 10) lines.push(`      ... and ${item.keys.length - 10} more`);
          }
        } else {
          lines.push(`    ${item.locale}/${item.namespace}.json: ${item.key}`);
          lines.push(`      ${item.message}`);
        }
      }
    }
  }

  if (warnings.length > 0) {
    lines.push('\n[WARNING] Potential issues:');
    lines.push('─'.repeat(50));

    const byType = groupBy(warnings, 'type');

    for (const [type, items] of Object.entries(byType)) {
      lines.push(`\n  ${formatErrorType(type)}: ${items.length} issue(s)`);
      if (VERBOSE) {
        for (const item of items) {
          lines.push(`    ${item.locale}/${item.namespace}.json: ${item.key}`);
          lines.push(`      ${item.message}`);
        }
      } else if (items.length <= 5) {
        for (const item of items) {
          lines.push(`    ${item.locale}/${item.namespace}.json: ${item.key}`);
        }
      } else {
        items.slice(0, 3).forEach(item => {
          lines.push(`    ${item.locale}/${item.namespace}.json: ${item.key}`);
        });
        lines.push(`    ... and ${items.length - 3} more (use --verbose to see all)`);
      }
    }
  }

  if (infos.length > 0 && VERBOSE) {
    lines.push('\n[INFO] Additional information:');
    lines.push('─'.repeat(50));
    for (const info of infos) {
      lines.push(`  ${info}`);
    }
  }

  return lines.join('\n');
}

function formatErrorType(type) {
  const labels = {
    'MISSING_KEY': 'Missing keys',
    'EXTRA_KEY': 'Extra keys',
    'UNTRANSLATED': 'Possibly untranslated texts',
    'EMPTY_VALUE': 'Empty values',
    'PLACEHOLDER_MISMATCH': 'Placeholder mismatches',
    'TYPE_MISMATCH': 'Type mismatches',
    'MISSING_FILE': 'Missing files'
  };
  return labels[type] || type;
}

function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

// ============================================================
// Main check
// ============================================================

function checkTranslations() {
  const allErrors = [];
  const allWarnings = [];
  const allInfos = [];

  // Get all JSON files from source locale
  const sourceFiles = fs.readdirSync(path.join(MESSAGES_DIR, SOURCE_LOCALE))
    .filter(f => f.endsWith('.json'));

  console.log(`\n📋 Translation Check Report`);
  console.log(`   Source locale: ${SOURCE_LOCALE}`);
  console.log(`   Target locales: ${LOCALES.filter(l => l !== SOURCE_LOCALE).join(', ')}`);
  console.log(`   Namespaces: ${sourceFiles.length}`);
  if (VERBOSE) console.log(`   Mode: verbose`);
  console.log('═'.repeat(50));

  for (const file of sourceFiles) {
    const namespace = file.replace('.json', '');

    // Load source file
    const sourcePath = path.join(MESSAGES_DIR, SOURCE_LOCALE, file);
    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const sourceKeys = getKeys(sourceData);

    // Check source for empty values
    const sourceEmptyWarnings = checkEmptyValues(sourceData, sourceKeys, SOURCE_LOCALE, namespace);
    allWarnings.push(...sourceEmptyWarnings);

    // Compare with other locales
    for (const locale of LOCALES.filter(l => l !== SOURCE_LOCALE)) {
      const targetPath = path.join(MESSAGES_DIR, locale, file);

      if (!fs.existsSync(targetPath)) {
        allErrors.push({
          type: 'MISSING_FILE',
          locale,
          namespace,
          message: `File ${locale}/${file} is missing`
        });
        continue;
      }

      const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      const targetKeys = getKeys(targetData);

      // Check 1: Missing/extra keys
      const { errors: keyErrors, warnings: keyWarnings } =
        checkMissingKeys(sourceKeys, targetKeys, locale, namespace);
      allErrors.push(...keyErrors);
      allWarnings.push(...keyWarnings);

      // Get common keys for further checks
      const commonKeys = sourceKeys.filter(k => targetKeys.includes(k));

      // Check 2: Type mismatches
      const typeErrors = checkTypeMismatches(sourceData, targetData, commonKeys, locale, namespace);
      allErrors.push(...typeErrors);

      // Check 3: Placeholder mismatches
      const placeholderErrors = checkPlaceholderMismatches(sourceData, targetData, commonKeys, locale, namespace);
      allErrors.push(...placeholderErrors);

      // Check 4: Empty values
      const emptyWarnings = checkEmptyValues(targetData, targetKeys, locale, namespace);
      allWarnings.push(...emptyWarnings);

      // Check 5: Untranslated texts
      const untranslatedWarnings = checkUntranslatedTexts(sourceData, targetData, commonKeys, locale, namespace);
      allWarnings.push(...untranslatedWarnings);
    }
  }

  // Add summary info
  allInfos.push(`Checked ${sourceFiles.length} namespace(s) across ${LOCALES.length} locale(s)`);
  allInfos.push(`Total keys per locale: ~${getKeys(JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, SOURCE_LOCALE, sourceFiles[0]), 'utf8'))).length * sourceFiles.length}`);

  // Print report
  const report = formatReport(allErrors, allWarnings, allInfos);
  console.log(report);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('Summary:');
  console.log(`  Errors: ${allErrors.length}`);
  console.log(`  Warnings: ${allWarnings.length}`);

  if (allErrors.length > 0) {
    console.log('\n❌ Translation check FAILED\n');
    process.exit(1);
  } else if (allWarnings.length > 0) {
    console.log('\n⚠️  Translation check passed with warnings\n');
    process.exit(0);
  } else {
    console.log('\n✅ All translations OK\n');
    process.exit(0);
  }
}

checkTranslations();
