/** Source composition shared by the builder and the read-only inspector.
 * Ordered arrays are intentional: CSS cascade and classic-script startup depend
 * on them. Change registration in site.config.cjs, not in generated output.
 */
const path = require('node:path');
const MUSIC_CATALOG_SOURCE = 'src/data/music-tracks.json';

const SHARED_STYLESHEETS = Object.freeze(['_fonts', '_tokens', '_chrome']);
const CHROME_PARTIALS = Object.freeze([
  Object.freeze(['<!-- HEAD -->', 'head']),
  Object.freeze(['<!-- SITE_HEADER -->', 'site-header']),
  Object.freeze(['<!-- COLOPHON -->', 'colophon']),
]);

function pageCssNames(page) {
  return Array.isArray(page.css) ? page.css : [page.css];
}

function staticCopyEntries(cfg) {
  return (cfg.staticCopy || []).map(entry => (
    typeof entry === 'string'
      ? { file: entry, outName: path.basename(entry), sitemap: true }
      : { ...entry, outName: entry.outName || (entry.file ? path.basename(entry.file) : '') }
  ));
}

/** Repository-relative inputs; media references inside HTML/CSS are build-owned. */
function pageSources(page) {
  return {
    source: `src/pages/${page.slug}.html`,
    layout: `src/layouts/${page.layout}.html`,
    partials: CHROME_PARTIALS.map(([, name]) => `src/partials/${name}.html`)
      .concat(page.layout === 'music' ? ['src/partials/player-bar.html'] : []),
    data: page.musicCatalog !== undefined ? [MUSIC_CATALOG_SOURCE] : [],
    css: [...SHARED_STYLESHEETS, ...pageCssNames(page)].map(name => `src/css/${name}.css`),
    js: page.js.map(name => `src/js/${name}.js`),
  };
}

module.exports = { MUSIC_CATALOG_SOURCE, SHARED_STYLESHEETS, CHROME_PARTIALS, pageCssNames, staticCopyEntries, pageSources };
