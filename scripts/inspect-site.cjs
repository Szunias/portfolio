#!/usr/bin/env node
/** CLI only. Source composition lives in build/site-inputs.cjs; queries in site-map.cjs. */
const path = require('node:path');
const { createSiteMap, normalizeFile, selectRoutes } = require('./site-map.cjs');

const HELP = `Usage: npm run inspect -- [--page <slug-or-route> | --file <repo-path>] [--json]

Examples:
  npm run inspect -- --page music
  npm run inspect -- --file src/js/music-player.js
  node scripts/inspect-site.cjs --json

Lists shared partials, catalog data and all CSS/JS in loading order. No files are changed.
Use node directly for machine-readable JSON without npm's command banner.
Media embedded in HTML/CSS is discovered by the build, not this input map.`;

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--help' || flag === '-h') options.help = true;
    else if (flag === '--json') options.json = true;
    else if (flag === '--page' || flag === '--file') {
      const key = flag.slice(2);
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
      if (options[key] !== undefined) throw new Error(`${flag} may only be supplied once`);
      options[key] = value;
    } else throw new Error(`Unknown option: ${flag}`);
  }
  if (options.page !== undefined && options.file !== undefined) {
    throw new Error('Use either --page or --file, not both');
  }
  return options;
}

function formatText(report) {
  const lines = ['Paths are repository-relative. CSS and JS retain their loading order.',
    'A [noindex] route is still built and publicly accessible.\n'];
  for (const route of report.routes) {
    lines.push(`${route.route}${route.noindex ? ' [noindex]' : ''}${route.kind === 'static' ? ' [standalone]' : ''}`);
    lines.push(`  HTML/source  ${route.source}`);
    if (route.kind === 'page') {
      lines.push(`  Layout       ${route.layout}`);
      lines.push(`  Partials     ${route.partials.join(', ')}`);
      if (route.data.length) lines.push(`  Data         ${route.data.join(', ')}`);
      lines.push(`  CSS          ${route.css.join(', ')}`);
      lines.push(`  JS           ${route.js.join(', ') || '(none)'}`);
    }
  }
  if (!report.routes.length) lines.push('No configured route owns this unregistered source.');
  // Diagnostics always cover the entire registry, even when route output is filtered.
  for (const [label, files] of [['Unregistered sources', report.unregistered], ['Missing inputs', report.missing]]) {
    lines.push(`\n${label} (whole site): ${files.length ? '\n' + files.join('\n') : 'none'}`);
  }
  return lines.join('\n');
}

/** Dependency injection keeps tests read-only and imports free of CLI side effects. */
function inspect(args, { config, repoRoot }) {
  const options = parseArgs(args);
  if (options.help) return HELP;
  const map = createSiteMap(config, repoRoot);
  const report = { ...map, routes: selectRoutes(map, options),
    query: { page: options.page || null, file: options.file ? normalizeFile(options.file) : null } };
  return options.json ? JSON.stringify(report, null, 2) : formatText(report);
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    // Help does not require loading or evaluating site configuration.
    const options = parseArgs(args);
    console.log(options.help ? HELP : inspect(args, {
      config: require('../site.config.cjs'), repoRoot: path.resolve(__dirname, '..'),
    }));
  } catch (error) {
    console.error(`Inspect failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { inspect, parseArgs };
