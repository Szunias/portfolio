#!/usr/bin/env node
/**
 * build.cjs — Assembles static HTML pages from layouts, partials, CSS, JS, and page content.
 *
 * Usage:  node build.cjs
 * Output: dist/*.html
 *
 * Zero npm dependencies. Reads site.config.cjs for page definitions.
 */

const fs = require('fs');
const path = require('path');

const config = require('./site.config.cjs');

const SRC    = path.join(__dirname, 'src');
const DIST   = path.join(__dirname, 'dist');

// ─── Helpers ────────────────────────────────────────────────────

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

/** Escape only characters that break HTML attribute values. */
function escAttr(str) {
  return str.replace(/"/g, '&quot;');
}

/** Generate OG + Twitter meta tags from page config. */
function ogTags(page) {
  const ogTitle = page.ogTitle || page.title;
  const lines = [
    `<meta property="og:title" content="${escAttr(ogTitle)}">`,
    `<meta property="og:description" content="${escAttr(page.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escAttr(page.canonical)}">`,
    `<meta property="og:site_name" content="Igor Szuniewicz">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escAttr(ogTitle)}">`,
    `<meta name="twitter:description" content="${escAttr(page.description)}">`,
  ];
  if (page.ogImage) {
    lines.splice(4, 0, `<meta property="og:image" content="${escAttr(page.ogImage)}">`);
  }
  return lines.join('\n');
}

// ─── Cache partials ─────────────────────────────────────────────

const partials = {};
function getPartial(name) {
  if (!partials[name]) {
    partials[name] = read(path.join(SRC, 'partials', `${name}.html`));
  }
  return partials[name];
}

// ─── Cache CSS / JS ─────────────────────────────────────────────

const cssCache = {};
function getCSS(name) {
  if (!cssCache[name]) {
    cssCache[name] = read(path.join(SRC, 'css', `${name}.css`));
  }
  return cssCache[name];
}

const jsCache = {};
function getJS(name) {
  if (!jsCache[name]) {
    jsCache[name] = read(path.join(SRC, 'js', `${name}.js`));
  }
  return jsCache[name];
}

// ─── Build ──────────────────────────────────────────────────────

function buildPage(page) {
  // 1. Read layout
  const layoutPath = path.join(SRC, 'layouts', `${page.layout}.html`);
  if (!fs.existsSync(layoutPath)) {
    throw new Error(`Layout not found: src/layouts/${page.layout}.html (required by ${page.slug})`);
  }
  let html = read(layoutPath);

  // 2. Read page content
  const pagePath = path.join(SRC, 'pages', `${page.slug}.html`);
  if (!fs.existsSync(pagePath)) {
    throw new Error(`Page content not found: src/pages/${page.slug}.html`);
  }
  const content = read(pagePath);

  // 3. Assemble CSS (single file per layout type)
  const css = getCSS(page.css);

  // 4. Assemble JS (concatenate files)
  const js = page.js.map(name => getJS(name)).join('\n\n');

  // 5. Replace placeholders
  html = html.replace('<!-- TITLE -->', page.title);
  html = html.replace('<!-- DESCRIPTION -->', escAttr(page.description));
  html = html.replace('<!-- CANONICAL -->', page.canonical);
  html = html.replace('<!-- OG_TAGS -->', ogTags(page));
  html = html.replace('<!-- CSS -->', css);
  html = html.replace('<!-- CONTENT -->', content);
  html = html.replace('<!-- JS -->', js);

  // 6. Optional partials
  if (page.lightbox) {
    html = html.replace('<!-- LIGHTBOX -->', '<!-- LIGHTBOX -->\n' + getPartial('lightbox'));
  } else {
    html = html.replace('<!-- LIGHTBOX -->', '');
  }

  if (page.layout === 'music') {
    html = html.replace('<!-- PLAYER -->', getPartial('player-bar'));
  }

  // 7. Schema (home page)
  if (page.schema) {
    html = html.replace('<!-- SCHEMA -->', page.schema);
  } else {
    html = html.replace('<!-- SCHEMA -->', '');
  }

  return html;
}

// ─── Main ───────────────────────────────────────────────────────

function main() {
  // Clean dist to avoid stale output (e.g. hero-*.html from old configs)
  cleanDir(DIST);
  ensureDir(DIST);

  let built = 0;
  const failed = [];

  // Build templated pages
  for (const page of config.pages) {
    try {
      const html = buildPage(page);
      const outPath = path.join(DIST, `${page.slug}.html`);
      fs.writeFileSync(outPath, html, 'utf8');
      built++;
      console.log(`  ✓ ${page.slug}.html`);
    } catch (err) {
      failed.push({ slug: page.slug, error: err.message });
      console.error(`  ✗ ${page.slug}.html — ${err.message}`);
    }
  }

  // Copy static files (external pages not using the layout system)
  let copied = 0;
  if (config.staticCopy) {
    for (const file of config.staticCopy) {
      const src = path.join(__dirname, file);
      const outName = path.basename(file);
      const dest = path.join(DIST, outName);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        copied++;
        console.log(`  → ${outName} (copied)`);
      } else {
        console.warn(`  ⚠ ${file} not found, skipping`);
      }
    }
  }

  // Copy favicon assets
  const faviconDir = path.join(DIST, 'assets');
  ensureDir(faviconDir);
  for (const f of ['favicon.svg', 'favicon.ico']) {
    const src = path.join(SRC, 'assets', f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(faviconDir, f));
      console.log(`  → assets/${f} (copied)`);
    }
  }

  // Copy root-level assets referenced by pages (useful for local preview;
  // CI also copies these + old/ via the deploy workflow).
  const rootAssets = [
    'audioqscreenshot.png',
    'transienticascreenshot.webm',
    'UnrealEngineDemo.mp4',
    'PythonPrototypeDemo.mp4',
    'szuniewicz-ai-audio-thesis-2026.pdf',
    'Igor_Szuniewicz_CV.pdf',
  ];
  for (const f of rootAssets) {
    const src = path.join(__dirname, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, f));
    }
  }

  console.log(`\nDone: ${built} pages built, ${copied} files copied → dist/`);

  if (failed.length) {
    console.error(`\n${failed.length} page(s) failed:`);
    for (const f of failed) console.error(`  - ${f.slug}: ${f.error}`);
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  console.error(`\nBuild failed: ${err.message}`);
  process.exit(1);
}
