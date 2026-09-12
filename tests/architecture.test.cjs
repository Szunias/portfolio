const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pages } = require('../site.config.cjs');

// These tests guard the documented ownership contracts in the actual route
// registry. They intentionally do not freeze page counts or entire bundles.
test('every registered browser script has a codebase ownership entry', () => {
  const map = fs.readFileSync(path.join(__dirname, '../docs/CODEBASE.md'), 'utf8');
  const scripts = new Set(pages.flatMap(page => page.js));
  assert.ok(scripts.size, 'The route registry must contain browser scripts');
  for (const script of scripts) {
    assert.ok(map.includes('| `' + script + '.js` |'),
      'Document the responsibility of src/js/' + script + '.js in docs/CODEBASE.md');
  }
});

test('music helpers precede the player and the visualizer follows it', () => {
  for (const page of pages) {
    const library = page.js.indexOf('music-library');
    const player = page.js.indexOf('music-player');
    const visualizer = page.js.indexOf('music-visualizer');
    if (player !== -1) {
      assert.ok(library !== -1 && library < player,
        page.slug + ': music-library must load before music-player');
    }
    if (visualizer !== -1) {
      assert.ok(player !== -1 && player < visualizer,
        page.slug + ': music-player must initialize before music-visualizer');
    }
  }
});

test('a route never registers competing writers for the contact clock hands', () => {
  for (const page of pages) {
    assert.ok(!(page.js.includes('contact-clock') && page.js.includes('contact-time')),
      page.slug + ': select one clock controller, not both');
  }
});
