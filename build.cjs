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
const { execSync } = require('child_process');

const config = require('./site.config.cjs');

/** Git mtime (ISO date) for a file, or null if unavailable/untracked. */
function gitMtime(filePath) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso || null;
  } catch (_) { return null; }
}

const SRC    = path.join(__dirname, 'src');
const DIST   = path.join(__dirname, 'dist');
const generatedDescriptionTracks = [];

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

function copyDir(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

function isGitIgnored(filePath) {
  try {
    execSync(`git check-ignore -q -- "${filePath}"`, {
      cwd: __dirname, stdio: 'ignore',
    });
    return true;
  } catch (_) {
    return false;
  }
}

function copyDirFiltered(src, dest, options = {}) {
  const skipExtensions = new Set(options.skipExtensions || []);
  const skipped = [];

  function walk(from, to) {
    ensureDir(to);
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const srcPath = path.join(from, entry.name);
      const destPath = path.join(to, entry.name);
      const rel = path.relative(__dirname, srcPath).replace(/\\/g, '/');

      if (options.skipIgnored && isGitIgnored(rel)) {
        skipped.push(rel);
        continue;
      }

      if (entry.isDirectory()) {
        walk(srcPath, destPath);
      } else if (!skipExtensions.has(path.extname(entry.name).toLowerCase())) {
        fs.copyFileSync(srcPath, destPath);
      } else {
        skipped.push(rel);
      }
    }
  }

  if (fs.existsSync(src)) walk(src, dest);
  return skipped;
}

/** Escape characters that break HTML attribute values. Order matters: & first. */
function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
    lines.push(`<meta name="twitter:image" content="${escAttr(page.ogImage)}">`);
  }
  return lines.join('\n');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function videoLabelFromContext(prefix) {
  const headings = [...prefix.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)];
  if (headings.length) {
    const text = stripTags(headings[headings.length - 1][1]);
    if (text) return `Video: ${text}`;
  }
  return 'Project video';
}

function vttEscape(text) {
  return String(text)
    .replace(/-->/g, 'to')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addGeneratedDescriptionTracks(html, pageSlug) {
  let counter = 0;
  return html.replace(/<video\b(?=[^>]*\bcontrols\b)([^>]*)>([\s\S]*?)<\/video>/gi, (match, attrs, inner, offset) => {
    if (/<track\b(?=[^>]*\bkind=(["'])descriptions\1)/i.test(inner)) return match;
    counter++;
    const context = html.slice(Math.max(0, offset - 2500), offset);
    const label = videoLabelFromContext(context).replace(/^Video:\s*/i, '');
    const file = `descriptions/${pageSlug}-${counter}.vtt`;
    const text = `Audio description summary: ${label}. The surrounding page text describes the sound design, implementation choices, and result shown in this video.`;
    generatedDescriptionTracks.push({ file, text });
    const track = `<track kind="descriptions" src="${file}" srclang="en" label="English audio description summary">`;
    if (/<source\b/i.test(inner)) {
      return `<video${attrs}>${inner.replace(/((?:\s*<source\b[^>]*>\s*)+)/i, `$1      ${track}\n`)}</video>`;
    }
    return `<video${attrs}>\n      ${track}${inner}</video>`;
  });
}

function enhanceVideoAccessibility(html, pageSlug) {
  let counter = 0;
  let output = html.replace(
    /(<video\b(?=[^>]*\bcontrols\b)(?![^>]*\baria-describedby=)([^>]*)>[\s\S]*?<\/video>)(\s*<\/div>\s*<p\s+class="video-caption")([^>]*>)/gi,
    (match, videoHtml, attrs, captionStart, captionAttrs) => {
      counter++;
      const id = `video-caption-${counter}`;
      const describedVideo = videoHtml.replace(/<video\b/i, `<video aria-describedby="${id}"`);
      const describedCaptionStart = /\bid=/.test(captionAttrs)
        ? captionStart
        : `${captionStart} id="${id}"`;
      return describedVideo + describedCaptionStart + captionAttrs;
    }
  );

  output = output.replace(/<video\b(?=[^>]*\bcontrols\b)(?![^>]*\baria-label=)(?![^>]*\baria-labelledby=)(?![^>]*\baria-describedby=)([^>]*)>/gi, (match, attrs, offset) => {
    const context = output.slice(Math.max(0, offset - 2500), offset);
    return `<video aria-label="${escAttr(videoLabelFromContext(context))}"${attrs}>`;
  });

  return addGeneratedDescriptionTracks(output, pageSlug);
}

function enhanceIframeLoading(html) {
  return html.replace(/<iframe\b(?![^>]*\bloading=)([^>]*)>/gi, '<iframe loading="lazy"$1>');
}

function enhanceInlineSvgAccessibility(html) {
  return html.replace(/<svg\b(?![^>]*\baria-hidden=)(?![^>]*\brole=)([^>]*)>/gi, '<svg aria-hidden="true" focusable="false"$1>');
}

function ensureNoindex(html) {
  if (/<meta\b(?=[^>]*\bname=["']robots["'])/i.test(html)) {
    return html.replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i, '<meta name="robots" content="noindex, nofollow">');
  }
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, '  <meta name="robots" content="noindex, nofollow">\n</head>');
  }
  return html;
}

function decodeHtmlAttr(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function urlPathname(value, siteOrigin) {
  const raw = decodeHtmlAttr(value).trim();
  if (!raw || raw.startsWith('#')) return null;
  if (/^(mailto:|tel:|data:|javascript:|spotify:|feed:)/i.test(raw)) return null;
  try {
    const parsed = new URL(raw, siteOrigin + '/');
    if (parsed.origin !== siteOrigin) return null;
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
  } catch (_) {
    const noHash = raw.split('#')[0].split('?')[0];
    if (!noHash) return null;
    try { return decodeURIComponent(noHash); } catch (_) { return noHash; }
  }
}

function collectLocalRefsFromHtml(html, siteOrigin) {
  const refs = new Set();
  const attrRe = /\b(?:href|src|poster|action|data-src|data-cover)=["']([^"']+)["']/gi;
  const metaImageRe = /<meta\b(?=[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'])[^>]*\bcontent=["']([^"']+)["'][^>]*>/gi;
  const urlRe = /url\((["']?)([^)"']+)\1\)/gi;
  const srcsetRe = /\bsrcset=["']([^"']+)["']/gi;

  for (const match of html.matchAll(attrRe)) {
    const ref = urlPathname(match[1], siteOrigin);
    if (ref) refs.add(ref);
  }
  for (const match of html.matchAll(metaImageRe)) {
    const ref = urlPathname(match[1], siteOrigin);
    if (ref) refs.add(ref);
  }
  for (const match of html.matchAll(urlRe)) {
    const before = match.index > 0 ? html[match.index - 1] : '';
    if (/[A-Za-z0-9_.-]/.test(before)) continue;
    const ref = urlPathname(match[2], siteOrigin);
    if (ref) refs.add(ref);
  }
  for (const match of html.matchAll(srcsetRe)) {
    for (const part of decodeHtmlAttr(match[1]).split(',')) {
      const ref = urlPathname(part.trim().split(/\s+/)[0], siteOrigin);
      if (ref) refs.add(ref);
    }
  }
  return refs;
}

function copyReferencedAssets(refs) {
  const copied = [];
  for (const rel of refs) {
    if (!rel || rel.endsWith('.html') || rel === 'sitemap.xml' || rel === 'robots.txt') continue;
    if (rel.startsWith('assets/')) continue;
    const src = path.join(__dirname, rel);
    const dest = path.join(DIST, rel);
    if (fs.existsSync(src) && fs.statSync(src).isFile()) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      copied.push(rel);
    }
  }
  return copied;
}

function validateLocalRefsInDist(htmlFiles, siteOrigin) {
  const missing = [];
  for (const file of htmlFiles) {
    const html = read(path.join(DIST, file));
    for (const rel of collectLocalRefsFromHtml(html, siteOrigin)) {
      if (!rel || rel.startsWith('assets/favicon')) continue;
      const target = path.join(DIST, rel);
      if (!fs.existsSync(target)) missing.push(`${file}: ${rel}`);
    }
  }
  if (missing.length) {
    throw new Error(`Missing local asset(s) after build:\n  - ${missing.slice(0, 30).join('\n  - ')}${missing.length > 30 ? `\n  ...and ${missing.length - 30} more` : ''}`);
  }
}

function staticCopyEntries(cfg) {
  return (cfg.staticCopy || []).map(entry => (
    typeof entry === 'string' ? { file: entry, sitemap: true } : entry
  ));
}

function rewriteRootRelativeUrls(html, origin) {
  const cleanOrigin = origin.replace(/\/$/, '');
  return html
    .replace(/\b(href|src|poster|action)=(["'])\/(?!\/)([^"']*)\2/gi, `$1=$2${cleanOrigin}/$3$2`)
    .replace(/\b(srcset)=(["'])([^"']*)\2/gi, (match, attr, quote, value) => {
      const rewritten = value.split(',').map(part => {
        const trimmed = part.trim();
        if (!trimmed.startsWith('/')) return part;
        return part.replace(/^\s*\/(?!\/)/, `${cleanOrigin}/`);
      }).join(',');
      return `${attr}=${quote}${rewritten}${quote}`;
    })
    .replace(/url\((["']?)\/(?!\/)([^)"']+)\1\)/gi, `url($1${cleanOrigin}/$2$1)`);
}

function ensureFragmentTargets(html, ids) {
  let output = html;
  for (const id of ids || []) {
    const hasTarget = new RegExp(`\\bid=(["'])${id}\\1`, 'i').test(output);
    if (!hasTarget) {
      output = output.replace(/<body\b([^>]*)>/i, `$&\n<div id="${escAttr(id)}" tabindex="-1"></div>`);
    }
  }
  return output;
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
  html = html.replace('<!-- TITLE -->', escAttr(page.title));
  html = html.replace('<!-- DESCRIPTION -->', escAttr(page.description));
  html = html.replace('<!-- CANONICAL -->', escAttr(page.canonical));
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

  html = enhanceVideoAccessibility(html, page.slug);
  html = enhanceIframeLoading(html);
  html = enhanceInlineSvgAccessibility(html);

  return html;
}

// ─── Main ───────────────────────────────────────────────────────

function validateConfig(cfg) {
  const seen = new Set();
  for (const page of cfg.pages) {
    if (seen.has(page.slug)) throw new Error(`Duplicate slug: ${page.slug}`);
    seen.add(page.slug);
    if (!fs.existsSync(path.join(SRC, 'css', `${page.css}.css`))) {
      throw new Error(`CSS not found: src/css/${page.css}.css (required by ${page.slug})`);
    }
    for (const jsName of page.js) {
      if (!fs.existsSync(path.join(SRC, 'js', `${jsName}.js`))) {
        throw new Error(`JS not found: src/js/${jsName}.js (required by ${page.slug})`);
      }
    }
  }
  for (const entry of staticCopyEntries(cfg)) {
    if (!entry.file) throw new Error('staticCopy entry is missing file');
    if (!fs.existsSync(path.join(__dirname, entry.file))) {
      throw new Error(`Static copy not found: ${entry.file}`);
    }
  }
}

function main() {
  validateConfig(config);

  // Clean dist to avoid stale output (e.g. hero-*.html from old configs)
  cleanDir(DIST);
  ensureDir(DIST);

  let built = 0;
  const failed = [];
  const htmlOutputs = [];

  // Build templated pages
  for (const page of config.pages) {
    try {
      const html = buildPage(page);
      const outPath = path.join(DIST, `${page.slug}.html`);
      fs.writeFileSync(outPath, html, 'utf8');
      htmlOutputs.push(`${page.slug}.html`);
      built++;
      console.log(`  ✓ ${page.slug}.html`);
    } catch (err) {
      failed.push({ slug: page.slug, error: err.message });
      console.error(`  ✗ ${page.slug}.html — ${err.message}`);
    }
  }

  // Copy static files (external pages not using the layout system)
  let copied = 0;
  const copiedStatic = [];
  const staticEntries = staticCopyEntries(config);
  if (staticEntries.length) {
    for (const entry of staticEntries) {
      const src = path.join(__dirname, entry.file);
      const outName = path.basename(entry.file);
      const dest = path.join(DIST, outName);
      if (fs.existsSync(src)) {
        if (entry.rewriteRootRelativeTo || entry.ensureIds || path.extname(entry.file).toLowerCase() === '.html') {
          let html = read(src);
          if (entry.rewriteRootRelativeTo) {
            html = rewriteRootRelativeUrls(html, entry.rewriteRootRelativeTo);
          }
          html = ensureFragmentTargets(html, entry.ensureIds);
          html = enhanceIframeLoading(html);
          html = enhanceInlineSvgAccessibility(html);
          if (entry.noindex || entry.sitemap === false) {
            html = ensureNoindex(html);
          }
          fs.writeFileSync(dest, html, 'utf8');
        } else {
          fs.copyFileSync(src, dest);
        }
        copied++;
        copiedStatic.push({ ...entry, outName });
        htmlOutputs.push(outName);
        console.log(`  → ${outName} (copied)`);
      } else {
        throw new Error(`Static copy not found: ${entry.file}`);
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

  // Generate sitemap.xml — lastmod per page from git log of its source file
  const SITE_ORIGIN = new URL(config.pages[0].canonical).origin;
  const today = new Date().toISOString().slice(0, 10);
  const pageUrls = config.pages.map(p => {
    const priority = p.slug === 'index' ? '1.0' : '0.8';
    const pageGitDate = gitMtime(path.join('src', 'pages', `${p.slug}.html`));
    const lastmod = (pageGitDate || today + 'T00:00:00Z').slice(0, 10);
    return `  <url>\n    <loc>${escAttr(p.canonical)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  });
  const staticUrls = copiedStatic.filter(entry => entry.sitemap !== false).map(entry => {
    const outName = entry.outName;
    const loc = `${SITE_ORIGIN}/${outName}`;
    const gitDate = gitMtime(entry.file);
    const lastmod = (gitDate || today + 'T00:00:00Z').slice(0, 10);
    return `  <url>\n    <loc>${escAttr(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.5</priority>\n  </url>`;
  });
  const urls = pageUrls.concat(staticUrls).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
  console.log('  → sitemap.xml');

  // Generate robots.txt
  const disallows = copiedStatic
    .filter(entry => entry.noindex || entry.sitemap === false)
    .map(entry => `Disallow: /${entry.outName}`)
    .join('\n');
  const robots = `User-agent: *\nAllow: /\n${disallows ? `${disallows}\n` : ''}\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');
  console.log('  → robots.txt');

  // Single source of truth for root-level assets referenced by pages or ogImage.
  // The deploy workflow no longer copies these separately — it relies on this list.
  const rootAssets = [
    'audioqscreenshot.png',
    'transienticascreenshot.webm',
    'transienticascreenshot.png',
    'UnrealEngineDemo.mp4',
    'PythonPrototypeDemo.mp4',
    'szuniewicz-ai-audio-thesis-2026.pdf',
    'Igor_Szuniewicz_CV.pdf',
    'aithesiscover.png',
    'sounddesignreel.png',
  ];
  for (const f of rootAssets) {
    const src = path.join(__dirname, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, f));
    } else {
      throw new Error(`Root asset not found: ${f}`);
    }
  }

  if (generatedDescriptionTracks.length) {
    const descriptionDir = path.join(DIST, 'descriptions');
    ensureDir(descriptionDir);
    const seenDescriptions = new Set();
    for (const track of generatedDescriptionTracks) {
      if (seenDescriptions.has(track.file)) continue;
      seenDescriptions.add(track.file);
      const body = `WEBVTT\n\n00:00:00.000 --> 99:59:59.000\n${vttEscape(track.text)}\n`;
      fs.writeFileSync(path.join(DIST, track.file), body, 'utf8');
    }
    console.log(`  → video descriptions (${seenDescriptions.size} generated)`);
  }

  const localRefs = new Set();
  for (const file of htmlOutputs) {
    const html = read(path.join(DIST, file));
    for (const ref of collectLocalRefsFromHtml(html, SITE_ORIGIN)) localRefs.add(ref);
  }
  for (const f of rootAssets) localRefs.add(f);
  for (const page of config.pages) {
    if (!page.ogImage) continue;
    const ref = urlPathname(page.ogImage, SITE_ORIGIN);
    if (ref) localRefs.add(ref);
  }
  const copiedAssets = copyReferencedAssets(localRefs);
  console.log(`  → referenced assets (${copiedAssets.length} copied)`);

  validateLocalRefsInDist(htmlOutputs, SITE_ORIGIN);
  console.log('  → local asset references validated');

  const cnameHost = new URL(config.pages[0].canonical).hostname;
  if (cnameHost && !cnameHost.endsWith('.github.io')) {
    fs.writeFileSync(path.join(DIST, 'CNAME'), cnameHost + '\n', 'utf8');
    console.log('  → CNAME');
  }
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '', 'utf8');
  console.log('  → .nojekyll');

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
