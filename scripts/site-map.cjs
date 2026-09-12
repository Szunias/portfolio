/** Read-only route ownership, derived from the same composition as the builder.
 * This maps entry inputs, not media referenced inside HTML/CSS. The full build
 * remains responsible for discovering and validating those media references.
 */
const fs = require('node:fs');
const path = require('node:path');
const { pageSources, staticCopyEntries } = require('./build/site-inputs.cjs');

const SOURCE_TYPES = Object.freeze({
  pages: '.html', layouts: '.html', partials: '.html', css: '.css', js: '.js',
});

function normalizeFile(value) {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0')) {
    throw new Error('Use a non-empty repository-relative file path');
  }
  const input = value.replace(/\\/g, '/');
  const normalized = path.posix.normalize(input);
  if (path.posix.isAbsolute(normalized) || /^[a-z]:/i.test(normalized) ||
      normalized === '..' || normalized.startsWith('../')) {
    throw new Error('File paths must stay inside the repository');
  }
  return normalized;
}

function routeInputs(route) {
  return [route.source, route.layout, ...(route.partials || []),
    ...(route.css || []), ...(route.js || [])].filter(Boolean);
}

function sourceFiles(root, directory, extension) {
  const current = path.join(root, directory);
  if (!fs.existsSync(current)) return [];
  return fs.readdirSync(current, { withFileTypes: true }).flatMap(entry => {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(root, relative, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [relative] : [];
  });
}

function createSiteMap(config, repoRoot) {
  if (!Array.isArray(config.pages)) throw new Error('site.config.cjs must define a pages array');
  const routes = config.pages.map(page => ({
    kind: 'page', slug: page.slug,
    route: page.slug === 'index' ? '/' : `/${page.slug}.html`,
    noindex: Boolean(page.noindex), ...pageSources(page),
  }));
  for (const entry of staticCopyEntries(config)) {
    routes.push({ kind: 'static', route: `/${entry.outName}`,
      noindex: Boolean(entry.noindex), source: entry.file });
  }
  const owners = new Map();
  for (const route of routes) {
    for (const file of routeInputs(route)) {
      const key = normalizeFile(file);
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(route.route);
    }
  }
  const files = Object.fromEntries([...owners].sort(([a], [b]) => a.localeCompare(b))
    .map(([file, routes]) => [file, [...routes]]));
  const unregistered = Object.entries(SOURCE_TYPES)
    .flatMap(([directory, extension]) => sourceFiles(repoRoot, `src/${directory}`, extension))
    .filter(file => !owners.has(file)).sort();
  const missing = [...owners.keys()].filter(file => {
    try { return !fs.statSync(path.join(repoRoot, file)).isFile(); }
    catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes(error.code)) return true;
      throw error;
    }
  }).sort();
  return { schemaVersion: 1, routes, files, unregistered, missing };
}

function selectRoutes(map, { page, file } = {}) {
  if (page !== undefined && file !== undefined) throw new Error('Use either --page or --file, not both');
  if (file !== undefined) {
    const key = normalizeFile(file);
    const owners = map.files[key] || [];
    // An unregistered source is a useful answer, not a missing-route error.
    if (!owners.length && !map.unregistered.includes(key)) {
      throw new Error(`No configured input or unregistered source matches ${key}`);
    }
    return map.routes.filter(route => owners.includes(route.route));
  }
  if (page !== undefined) {
    const query = page.replace(/^\/+/, '');
    const routes = map.routes.filter(route => route.route === page ||
      route.route.slice(1) === query || route.slug === query ||
      (route.slug === 'index' && query === 'index.html'));
    if (!routes.length) throw new Error(`No configured route matches ${page}`);
    return routes;
  }
  return map.routes;
}

module.exports = { createSiteMap, normalizeFile, routeInputs, selectRoutes };
