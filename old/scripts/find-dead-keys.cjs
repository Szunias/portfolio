#!/usr/bin/env node
/**
 * Dead Key Finder for i18n JSON Files
 *
 * Cross-references translation keys against actual usage in:
 * - portfolioData.json (content_blocks, challenges_solved, etc.)
 * - ProjectDetails.tsx and sub-components
 *
 * Outputs: structured report of dead keys per project namespace
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'portfolioData.json');
const EN_LOCALES = path.join(PROJECT_ROOT, 'public', 'locales', 'en');

// Project namespace mapping (from portfolioData)
const PROJECT_NAMESPACES = [
  'shadowFrames',
  'notTodayDarling',
  'transientica',
  'audioq',
  'amorak',
  'soundDesign',
  'rayAnimation',
  'middlewareOptimization',
  'akantilado',
  'richter',
  'gradwork',
  'pauseAndDeserve',
  'wwiseUnrealFixer',
  'unrealEngineRebuilder'
];

// Read JSON file safely
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to read ${filePath}: ${err.message}`);
    return null;
  }
}

// Get all keys from a nested object (flattens to dot notation)
function getAllKeys(obj, prefix = '') {
  let keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(fullKey);
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Scan portfolioData for referenced keys in a project
function findReferencedKeys(project) {
  const referenced = new Set();

  // Helper to collect all string values
  function collectStrings(obj) {
    if (typeof obj === 'string') {
      return [obj];
    }
    if (Array.isArray(obj)) {
      return obj.flatMap(collectStrings);
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).flatMap(collectStrings);
    }
    return [];
  }

  // Scan content_blocks for title/content/mediaCaption keys
  if (project.content_blocks) {
    project.content_blocks.forEach(block => {
      ['title', 'content', 'mediaCaption'].forEach(field => {
        if (block[field] && typeof block[field] === 'string') {
          referenced.add(block[field]);
        }
      });

      // stats_grid items
      if (block.items) {
        block.items.forEach(item => {
          if (item.label) referenced.add(item.label);
          if (item.value && typeof item.value === 'string') {
            // Only add if it looks like a key (not a literal value)
            if (item.value.includes('.') || item.value.includes('_')) {
              referenced.add(item.value);
            }
          }
        });
      }
    });
  }

  // Scan challenges_solved
  if (project.challenges_solved) {
    project.challenges_solved.forEach(challenge => {
      ['challenge', 'problem', 'solution'].forEach(field => {
        if (challenge[field]) referenced.add(challenge[field]);
      });
    });
  }

  // Scan responsibilities
  if (Array.isArray(project.responsibilities)) {
    project.responsibilities.forEach(key => referenced.add(key));
  }

  // Scan technical_achievements
  if (project.technical_achievements) {
    Object.values(project.technical_achievements).forEach(value => {
      if (typeof value === 'string') referenced.add(value);
    });
  }

  // Scan audio_systems
  if (project.audio_systems) {
    Object.values(project.audio_systems).forEach(value => {
      if (typeof value === 'string') referenced.add(value);
    });
  }

  // Scan technical_stack
  if (project.technical_stack) {
    Object.values(project.technical_stack).forEach(value => {
      if (typeof value === 'string') referenced.add(value);
    });
  }

  // Scan key_scenes
  if (Array.isArray(project.key_scenes)) {
    project.key_scenes.forEach(key => referenced.add(key));
  }

  // Scan code_snippets annotations
  if (project.code_snippets) {
    project.code_snippets.forEach(snippet => {
      if (snippet.annotations) {
        snippet.annotations.forEach(ann => {
          if (ann.label) referenced.add(ann.label);
          if (ann.explanation) referenced.add(ann.explanation);
        });
      }
    });
  }

  // Scan media.images for captions
  if (project.media?.images) {
    project.media.images.forEach(img => {
      if (typeof img === 'object' && img.caption) {
        referenced.add(img.caption);
      }
    });
  }

  return referenced;
}

// Check projectDetail.json for referenced keys
function checkProjectDetailKeys() {
  const projectDetailPath = path.join(EN_LOCALES, 'projectDetail.json');
  const projectDetailJSON = readJSON(projectDetailPath);
  if (!projectDetailJSON) return { totalKeys: 0, usedKeys: 0, deadKeys: [] };

  const allKeys = getAllKeys(projectDetailJSON);
  const portfolioData = readJSON(DATA_FILE);
  if (!portfolioData) return { totalKeys: 0, usedKeys: 0, deadKeys: [] };

  const used = new Set();

  // Check all projects for title/short_desc/full_desc keys
  portfolioData.featured_projects.forEach(project => {
    used.add(`project_${project.id}_title`);
    used.add(`project_${project.id}_short_desc`);
    used.add(`project_${project.id}_full_desc`);

    // Scan for any keys referenced in project data
    const projectKeys = findReferencedKeys(project);
    projectKeys.forEach(key => used.add(key));
  });

  // Check for sf.* keys (Shadow Frames specific)
  allKeys.forEach(key => {
    if (key.startsWith('sf.')) {
      // Check if key is referenced by shadow_frames project
      const sfProject = portfolioData.featured_projects.find(p => p.id === 'shadow_frames');
      if (sfProject) {
        const sfKeys = findReferencedKeys(sfProject);
        if (sfKeys.has(key)) {
          used.add(key);
        }
      }
    }

    // Check annotation keys (ann.*)
    if (key.startsWith('ann.')) {
      // Scan all projects for code_snippets
      portfolioData.featured_projects.forEach(project => {
        if (project.code_snippets) {
          project.code_snippets.forEach(snippet => {
            if (snippet.annotations) {
              snippet.annotations.forEach(ann => {
                if (ann.label === key || ann.explanation === key) {
                  used.add(key);
                }
              });
            }
          });
        }
      });
    }

    // Check img.* keys
    if (key.startsWith('img.')) {
      portfolioData.featured_projects.forEach(project => {
        if (project.media?.images) {
          project.media.images.forEach(img => {
            if (typeof img === 'object' && img.caption === key) {
              used.add(key);
            }
          });
        }
      });
    }
  });

  const deadKeys = allKeys.filter(key => !used.has(key));

  return {
    totalKeys: allKeys.length,
    usedKeys: used.size,
    deadKeys
  };
}

// Main analysis function
function analyzeProject(namespace) {
  const jsonPath = path.join(EN_LOCALES, `${namespace}.json`);
  const json = readJSON(jsonPath);
  if (!json) {
    return { namespace, error: 'File not found or invalid JSON' };
  }

  const allKeys = getAllKeys(json);
  const portfolioData = readJSON(DATA_FILE);
  if (!portfolioData) {
    return { namespace, error: 'Could not read portfolioData.json' };
  }

  // Find the project entry
  const project = portfolioData.featured_projects.find(p => p.i18nNamespace === namespace);
  if (!project) {
    return {
      namespace,
      totalKeys: allKeys.length,
      usedKeys: 0,
      deadKeys: allKeys,
      note: 'Project not found in portfolioData.json'
    };
  }

  const referenced = findReferencedKeys(project);
  const deadKeys = allKeys.filter(key => !referenced.has(key));

  return {
    namespace,
    projectId: project.id,
    totalKeys: allKeys.length,
    usedKeys: referenced.size,
    deadKeys,
    deadCount: deadKeys.length
  };
}

// Run analysis
console.log('🔍 Dead Key Finder\n');
console.log('Analyzing 14 project namespaces + projectDetail.json...\n');

const results = [];

// Analyze each project namespace
PROJECT_NAMESPACES.forEach(ns => {
  const result = analyzeProject(ns);
  results.push(result);
});

// Analyze projectDetail.json
const pdResult = checkProjectDetailKeys();
results.push({
  namespace: 'projectDetail',
  ...pdResult,
  deadCount: pdResult.deadKeys.length
});

// Print summary
console.log('📊 SUMMARY\n');
results.forEach(r => {
  if (r.error) {
    console.log(`❌ ${r.namespace}: ${r.error}`);
  } else {
    const status = r.deadCount === 0 ? '✅' : '⚠️';
    console.log(`${status} ${r.namespace}: ${r.totalKeys} total, ${r.usedKeys} used, ${r.deadCount} dead`);
  }
});

// Print detailed dead keys
console.log('\n\n📋 DETAILED DEAD KEYS\n');
results.forEach(r => {
  if (!r.error && r.deadCount > 0) {
    console.log(`\n🔴 ${r.namespace} (${r.deadCount} dead keys):`);
    r.deadKeys.slice(0, 20).forEach(key => {
      console.log(`   - ${key}`);
    });
    if (r.deadKeys.length > 20) {
      console.log(`   ... and ${r.deadKeys.length - 20} more`);
    }
  }
});

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: results.map(r => ({
    namespace: r.namespace,
    totalKeys: r.totalKeys,
    usedKeys: r.usedKeys,
    deadCount: r.deadCount,
    error: r.error
  })),
  details: results
};

const reportPath = path.join(PROJECT_ROOT, 'scripts', 'dead-keys-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n\n✅ Full report saved to: ${reportPath}`);
