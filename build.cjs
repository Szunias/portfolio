#!/usr/bin/env node
/**
 * build.cjs - Assembles static HTML pages from layouts, partials, CSS, JS, and page content.
 *
 * Usage:  node build.cjs
 * Output: dist/*.html
 *
 * Zero npm dependencies. Reads site.config.cjs for page definitions.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minifyCss, assertParsableJs } = require('./scripts/build/browser-assets.cjs');
const { schemaTags } = require('./scripts/build/seo.cjs');
const { execFileSync } = require('child_process');

const config = require('./site.config.cjs');
const { injectStaticTrackIndex } = require('./scripts/build/music-index.cjs');
const { injectMusicCatalog } = require('./scripts/build/music-catalog.cjs');
const { checkedSource } = require('./scripts/build/source-paths.cjs');
const { read, ensureDir, cleanDir, copySourceDirectory, publishDist } = require('./scripts/build/output-files.cjs');
const { enforceDistBudget } = require('./scripts/build/output-budget.cjs');
const { validateGeneratedHtml, validateSupportFiles } = require('./scripts/build/output-validation.cjs');
const { MUSIC_CATALOG_SOURCE, SHARED_STYLESHEETS, CHROME_PARTIALS, pageCssNames, pageSources, staticCopyEntries } = require('./scripts/build/site-inputs.cjs');
const { escAttr, attrValue, htmlFileSlug, decodeHtmlAttr,
  decodeBase64Attr } = require('./scripts/build/html-utils.cjs');
const {
  enhanceVideoAccessibility, enhanceGalleryItemLinks, enhanceExternalLinkSafety,
  enhanceIframeAccessibility, enhanceImageAccessibility, reserveImageAspectRatio,
  reserveFacadeAspectRatio, reserveVideoAspectRatio, enhanceDocumentBasics,
  sanitizeStaticSnapshot, enhanceInlineSvgAccessibility, neutralizeJavascriptHrefs,
  ensureNoindex, rewriteRootRelativeUrls, ensureFragmentTargets,
} = require('./scripts/build/document-transforms.cjs');

/** Git mtime (ISO date) for a file, or null if unavailable/untracked. */
function gitMtime(filePath) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], {
      cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso || null;
  } catch (_) { return null; }
}

function maxGitMtime(files) {
  // Compare chronologically (Date.parse), not lexicographically: ISO strings
  // with mixed UTC offsets (local commits vs GitHub web-UI "Z" commits) do not
  // sort correctly as plain strings.
  const times = files
    .map(gitMtime)
    .filter(Boolean)
    .sort((a, b) => Date.parse(a) - Date.parse(b));
  return times.length ? times[times.length - 1] : null;
}

function relPath(...parts) {
  return parts.join('/');
}

const SRC = path.join(__dirname, 'src');
const FINAL_DIST = path.join(__dirname, 'dist');
const CHECK_ONLY = process.argv.slice(2).includes('--check');
const BUILD_TOKEN = `${process.pid}-${Date.now()}`;
const DIST = path.join(__dirname, `.dist-tmp-${BUILD_TOKEN}`);
const DIST_BACKUP = path.join(__dirname, `.dist-backup-${BUILD_TOKEN}`);
const SAFE_PAGE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Copy repository-owned assets; keep the entry-point API used by fixtures. */
function copyDirContents(srcDir, destDir) {
  return copySourceDirectory(__dirname, srcDir, destDir);
}

/** Generate OG + Twitter meta tags from page config. */
function ogTags(page) {
  const ogTitle = page.ogTitle || page.title;
  const imageAlt = page.ogImageAlt || `${ogTitle} preview image`;
  // 'website' everywhere unless a page says otherwise. The old default of
  // 'article' for project pages promised article:published_time and
  // article:author that no page emits, and consumers that read og:type
  // (Facebook's debugger in particular) flag the missing pair. A project page
  // is a page about a work, not a dated post; the tool pages already said so
  // explicitly, so this brings the other fourteen in line with them.
  const defaultOgType = 'website';
  const lines = [
    `<meta property="og:title" content="${escAttr(ogTitle)}">`,
    `<meta property="og:description" content="${escAttr(page.description)}">`,
    `<meta property="og:type" content="${escAttr(page.ogType || defaultOgType)}">`,
    `<meta property="og:url" content="${escAttr(page.canonical)}">`,
    `<meta property="og:site_name" content="Igor Szuniewicz">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escAttr(ogTitle)}">`,
    `<meta name="twitter:description" content="${escAttr(page.description)}">`,
  ];
  if (page.ogImage) {
    lines.splice(4, 0, `<meta property="og:image" content="${escAttr(page.ogImage)}">`);
    lines.splice(5, 0, `<meta property="og:image:alt" content="${escAttr(imageAlt)}">`);
    if (page.ogImageWidth) lines.splice(6, 0, `<meta property="og:image:width" content="${escAttr(page.ogImageWidth)}">`);
    if (page.ogImageHeight) lines.splice(7, 0, `<meta property="og:image:height" content="${escAttr(page.ogImageHeight)}">`);
    if (page.ogImageType) lines.splice(8, 0, `<meta property="og:image:type" content="${escAttr(page.ogImageType)}">`);
    lines.push(`<meta name="twitter:image" content="${escAttr(page.ogImage)}">`);
    lines.push(`<meta name="twitter:image:alt" content="${escAttr(imageAlt)}">`);
  }
  return lines.join('\n');
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
  const attrRe = /\b(?:href|src|poster|action|data-src|data-cover|data-thumb|data-art|data-autoplay-src)=["']([^"']+)["']/gi;
  const encodedAttrRe = /\bdata-src-e=["']([^"']+)["']/gi;
  const metaImageRe = /<meta\b(?=[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'])[^>]*\bcontent=["']([^"']+)["'][^>]*>/gi;
  const urlRe = /url\((["']?)([^)"']+)\1\)/gi;
  const srcsetRe = /\bsrcset=["']([^"']+)["']/gi;

  for (const match of html.matchAll(attrRe)) {
    const ref = urlPathname(match[1], siteOrigin);
    if (ref) refs.add(ref);
  }
  for (const match of html.matchAll(encodedAttrRe)) {
    const ref = urlPathname(decodeBase64Attr(match[1]), siteOrigin);
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

function safeRepoPath(rel) {
  const normalized = rel.replace(/\\/g, '/');
  if (
    !normalized ||
    normalized.includes('\0') ||
    normalized.startsWith('/') ||
    normalized.startsWith('../') ||
    normalized.includes('/../') ||
    normalized.split('/').some(part => part.startsWith('.'))
  ) {
    return null;
  }

  const resolved = path.resolve(__dirname, normalized);
  const repoRoot = path.resolve(__dirname);
  if (resolved !== repoRoot && !resolved.startsWith(repoRoot + path.sep)) return null;
  return resolved;
}

function safeDistPath(rel) {
  if (typeof rel !== 'string') return null;
  const normalized = rel.replace(/\\/g, '/');
  if (normalized.includes('\0')) return null;
  const resolved = path.resolve(DIST, normalized);
  const distRoot = path.resolve(DIST);
  if (resolved !== distRoot && !resolved.startsWith(distRoot + path.sep)) return null;
  return resolved;
}

function distOutputKey(dest) {
  return path.relative(DIST, dest).replace(/\\/g, '/');
}

function isReservedDistOutput(outKey, reservedOutputs) {
  return [...reservedOutputs].some(reserved => outKey === reserved || outKey.startsWith(`${reserved}/`));
}

function copyReferencedAssets(refs) {
  const copied = [];
  for (const rel of refs) {
    if (!rel || rel.endsWith('.html') || rel === 'sitemap.xml' || rel === 'robots.txt' || rel === 'CNAME') continue;
    if (rel.startsWith('assets/')) continue;
    const src = safeRepoPath(rel);
    const dest = safeDistPath(rel);
    if (!src || !dest) {
      throw new Error(`Unsafe local asset reference: ${rel}`);
    }
    if (!fs.existsSync(src)) {
      throw new Error(`Referenced asset not found: ${rel}`);
    }
    const realSrc = checkedSource(__dirname, src);
    ensureDir(path.dirname(dest));
    fs.copyFileSync(realSrc, dest);
    copied.push(rel);
  }
  return copied;
}

function validateLocalRefsInDist(htmlFiles, siteOrigin) {
  const missing = [];
  for (const file of htmlFiles) {
    const html = read(path.join(DIST, file));
    for (const rel of collectLocalRefsFromHtml(html, siteOrigin)) {
      if (!rel) continue;
      const target = safeDistPath(rel);
      if (!target) {
        missing.push(`${file}: unsafe path ${rel}`);
        continue;
      }
      if (!fs.existsSync(target)) missing.push(`${file}: ${rel}`);
    }
  }
  if (missing.length) {
    throw new Error(`Missing local asset(s) after build:\n  - ${missing.slice(0, 30).join('\n  - ')}${missing.length > 30 ? `\n  ...and ${missing.length - 30} more` : ''}`);
  }
}

function pageContentInputs(page) {
  return [
    relPath('src', 'pages', `${page.slug}.html`),
    ...pageSources(page).data,
    ...(page.lastmodInputs || []),
  ];
}

function sitemapUrl(loc, lastmod, priority) {
  return [
    '  <url>',
    `    <loc>${escAttr(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].filter(Boolean).join('\n');
}

// Template loading and shared chrome

const partials = {};
function getPartial(name) {
  if (!partials[name]) {
    partials[name] = read(path.join(SRC, 'partials', `${name}.html`));
  }
  return partials[name];
}

/**
 * Partials with {{TOKEN}} holes. The document chrome (head, header, colophon)
 * used to be pasted into all four layouts, and the copies had drifted: three
 * different ways to shorten the wordmark, three different aria-labels on the
 * same link, and nav pills that measured 69/99/102px on the same viewport.
 * One source with tokens for the handful of genuine per-layout differences
 * removes the drift and the class of bug that produced it.
 *
 * Throws on an unreplaced token so a typo cannot ship a literal {{ROOT}}.
 */
function renderPartial(name, tokens) {
  let html = getPartial(name);
  for (const [key, value] of Object.entries(tokens)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  const leftover = html.match(/\{\{[A-Z_]+\}\}/);
  if (leftover) {
    throw new Error(`Unreplaced token ${leftover[0]} in partial src/partials/${name}.html`);
  }
  return html;
}

/**
 * Per-layout chrome tokens.
 *   ROOT  - prefix for same-site asset paths. 404.html can be served from any
 *           path, so it needs absolute ones; every other page is at the root.
 *   HOME  - prefix for the in-page #work / #contact anchors. Empty on the home
 *           page keeps them same-document fragment navigations; elsewhere they
 *           have to travel to "/" first.
 */
function chromeTokens(page) {
  const root = page.layout === 'error' ? '/' : '';
  return {
    ROOT: root,
    HOME: page.slug === 'index' ? '' : '/',
    CURRENT_MUSIC: page.layout === 'music' ? ' aria-current="page"' : '',
    // Contact shares the generic page shell with review routes; match the slug.
    CURRENT_CONTACT: page.slug.startsWith('contact') ? ' aria-current="page"' : '',
    YEAR: String(new Date().getFullYear()),
  };
}

// Cache CSS / JS and emit immutable, content-hashed browser assets.

const cssCache = {};
function getCSS(name) {
  if (!cssCache[name]) {
    cssCache[name] = read(path.join(SRC, 'css', `${name}.css`));
  }
  return cssCache[name];
}

// Every page needs the same @font-face set and the same design tokens.
//
// The four layout stylesheets have incompatible token vocabularies (home's
// --ink is light text, music's is dark), so _tokens.css deliberately uses a
// prefixed namespace that collides with none of them; each layout aliases its
// own vocabulary onto those values in its :root. That keeps this prepend safe
// while giving the site one palette, one type ladder and one spacing scale.
//
// _fonts first (order-independent, cannot interact with the cascade), then
// _tokens, then _chrome (the shared header and colophon, which no layout
// stylesheet re-declares), then the layout stylesheets which may override any
// token.
function pageStylesheet(names) {
  return SHARED_STYLESHEETS.map(getCSS).concat(names.map(getCSS)).join('\n');
}

const jsCache = {};
function getJS(name) {
  if (!jsCache[name]) {
    const source = read(path.join(SRC, 'js', `${name}.js`));
    assertParsableJs(source, `src/js/${name}.js`);
    jsCache[name] = source;
  }
  return jsCache[name];
}

const emittedBrowserAssets = new Map();
function emitBrowserAsset(kind, label, content) {
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  const rel = `assets/${label}.${hash}.${kind}`;
  if (!emittedBrowserAssets.has(rel)) {
    const dest = safeDistPath(rel);
    if (!dest) throw new Error(`Unsafe generated browser asset path: ${rel}`);
    ensureDir(path.dirname(dest));
    fs.writeFileSync(dest, content, 'utf8');
    emittedBrowserAssets.set(rel, true);
  }
  return rel;
}

// url() references inside the emitted CSS. Only HTML was scanned before, so a
// cover added in CSS alone would 404 on a green build unless its path was also
// duplicated by hand in site.config.cjs. Feeding these into localRefs makes the
// build copy them and fail loudly when one is missing.
function collectCssRefs(siteOrigin) {
  const refs = new Set();
  const urlRe = /url\((["']?)([^)"']+)\1\)/gi;
  for (const rel of emittedBrowserAssets.keys()) {
    if (!rel.endsWith('.css')) continue;
    const css = read(path.join(DIST, rel));
    const base = `${siteOrigin}/${path.posix.dirname(rel)}/`;
    for (const match of css.matchAll(urlRe)) {
      const raw = match[2].trim();
      if (!raw || raw.startsWith('#') || /^(data:|https?:|\/\/)/i.test(raw)) continue;
      try {
        const parsed = new URL(raw, base);
        if (parsed.origin !== siteOrigin) continue;
        refs.add(decodeURIComponent(parsed.pathname.replace(/^\/+/, '')));
      } catch (_) {
        throw new Error(`Unparsable url() in ${rel}: ${raw}`);
      }
    }
  }
  return refs;
}

// Page assembly: preserve transform order and browser asset bytes

function buildPage(page) {
  // 1. Read layout
  const layoutPath = path.join(SRC, 'layouts', `${page.layout}.html`);
  if (!fs.existsSync(layoutPath)) {
    throw new Error(`Layout not found: src/layouts/${page.layout}.html (required by ${page.slug})`);
  }
  // Chrome partials go in first, so every later step (the robots rewrite, the
  // OG/CSS/SCHEMA placeholders, the accessibility passes) sees one document
  // rather than a layout with holes in it.
  const tokens = chromeTokens(page);
  let html = read(layoutPath);
  for (const [marker, partial] of CHROME_PARTIALS) {
    const occurrences = html.split(marker).length - 1;
    if (occurrences !== 1) {
      throw new Error(`Layout src/layouts/${page.layout}.html must contain ${marker} exactly once (found ${occurrences})`);
    }
    html = html.replace(marker, () => renderPartial(partial, tokens));
  }
  html = enhanceInlineSvgAccessibility(reserveImageAspectRatio(enhanceImageAccessibility(html)));

  // 2. Read page content
  const pagePath = path.join(SRC, 'pages', `${page.slug}.html`);
  if (!fs.existsSync(pagePath)) {
    throw new Error(`Page content not found: src/pages/${page.slug}.html`);
  }
  let content = read(pagePath);
  if (page.musicCatalog !== undefined) {
    const catalog = JSON.parse(read(checkedSource(__dirname, path.join(__dirname, MUSIC_CATALOG_SOURCE))));
    content = injectMusicCatalog(content, catalog, page.musicCatalog);
  } else if (content.includes('<!-- MUSIC_TRACKS -->')) {
    throw new Error(`${page.slug} must register a musicCatalog artwork variant`);
  }
  if (page.layout === 'music') content = injectStaticTrackIndex(content);
  content = enhanceVideoAccessibility(content);
  content = enhanceExternalLinkSafety(content);
  content = enhanceIframeAccessibility(content);
  content = enhanceImageAccessibility(content);
  content = reserveImageAspectRatio(content);
  content = reserveFacadeAspectRatio(content);
  content = reserveVideoAspectRatio(content, __dirname);
  content = enhanceInlineSvgAccessibility(content);
  content = enhanceGalleryItemLinks(content);

  // 3. Assemble shared, cacheable CSS and the page's progressive enhancement.
  //    `css` may be a single name or a list. The list form exists so project
  //    pages load the shared case chrome plus only their own block, instead of
  //    one 147 KB stylesheet holding every project's rules.
  const cssNames = pageCssNames(page);
  const css = minifyCss(pageStylesheet(cssNames));
  const cssHref = emitBrowserAsset('css', cssNames.join('-'), css);
  const pageCssHref = page.layout === 'error' ? `/${cssHref}` : cssHref;

  // 4. Assemble JS (concatenate files with the same composition into one asset)
  const js = page.js.map(name => getJS(name)).join('\n\n');
  if (js.trim()) assertParsableJs(js, `${page.slug} bundle [${page.js.join(', ')}]`);
  const jsSrc = js.trim() ? emitBrowserAsset('js', 'site', js) : null;

  // 5. Replace placeholders. Values are passed as replacer functions so that
  //    literal "$" sequences in CSS/JS/content (e.g. $&, $', $`) are not
  //    interpreted as String.replace special patterns and corrupted.
  html = html.replace('<!-- TITLE -->', () => escAttr(page.title));
  html = html.replace('<!-- DESCRIPTION -->', () => escAttr(page.description));
  html = html.replace('<!-- CANONICAL -->', () => escAttr(page.canonical));
  html = html.replace(
    /<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">/,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">`
  );
  html = html.replace('<!-- OG_TAGS -->', () => ogTags(page));
  html = html.replace('<!-- CSS -->', () => `<link rel="stylesheet" href="${escAttr(pageCssHref)}">`);
  html = html.replace('<!-- CONTENT -->', () => content);
  html = html.replace('<!-- JS -->', () => jsSrc
    ? `<script src="${escAttr(page.layout === 'error' ? `/${jsSrc}` : jsSrc)}" defer></script>`
    : '');

  // 6. Optional partials
  if (page.layout === 'music') {
    html = html.replace('<!-- PLAYER -->', () => enhanceInlineSvgAccessibility(getPartial('player-bar')));
  }

  // 7. Schema (home page)
  const schema = [schemaTags(page, new URL(config.pages[0].canonical).origin), page.schema || ''].filter(Boolean).join('\n');
  html = html.replace('<!-- SCHEMA -->', () => schema);

  return html;
}

// Source registration and project-navigation validation

function validateConfig(cfg) {
  if (!cfg.pages || !Array.isArray(cfg.pages) || !cfg.pages.length) {
    throw new Error('site.config.cjs must define a non-empty pages array');
  }
  const seen = new Set();
  const siteOrigin = new URL(cfg.pages[0].canonical).origin;
  const configuredSlugs = new Set(cfg.pages.map(page => page.slug));
  const sourceSlugs = fs.readdirSync(path.join(SRC, 'pages'))
    .filter(file => file.endsWith('.html'))
    .map(file => path.basename(file, '.html'))
    .sort();
  const unregisteredPages = sourceSlugs.filter(slug => !configuredSlugs.has(slug));
  if (unregisteredPages.length) {
    throw new Error(`Page source file(s) missing from site.config.cjs: ${unregisteredPages.map(slug => `src/pages/${slug}.html`).join(', ')}`);
  }
  for (const slug of sourceSlugs) {
    const source = read(path.join(SRC, 'pages', `${slug}.html`));
    if (/<\/?(?:html|head|body)\b/i.test(source)) {
      throw new Error(`Page content must not include document shell tags: src/pages/${slug}.html`);
    }
    const ids = [...source.matchAll(/(?<![\w-])id=(["'])(.*?)\1/gi)].map(match => match[2]);
    const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicateId) throw new Error(`Duplicate id "${duplicateId}" in src/pages/${slug}.html`);
  }
  for (const page of cfg.pages) {
    if (typeof page.slug !== 'string' || !SAFE_PAGE_SLUG.test(page.slug)) {
      throw new Error(`Invalid page slug "${page.slug || ''}": use lowercase letters, numbers, and single hyphens only`);
    }
    if (seen.has(page.slug)) throw new Error(`Duplicate slug: ${page.slug}`);
    seen.add(page.slug);
    if (!['home', 'page', 'project', 'music', 'error'].includes(page.layout)) {
      throw new Error(`Unknown layout "${page.layout}" for ${page.slug}`);
    }
    if (page.musicCatalog !== undefined && (page.layout !== 'music' || typeof page.musicCatalog !== 'string')) {
      throw new Error(`${page.slug}: musicCatalog requires a music layout and an artwork variant name`);
    }
    if (page.noindex && page.sitemap !== false) {
      throw new Error(`${page.slug} is noindex and must set sitemap: false`);
    }
    if (!Array.isArray(page.js)) {
      throw new Error(`JS list for ${page.slug} must be an array`);
    }
    const cssNames = pageCssNames(page);
    if (!cssNames.length || cssNames.some(name => typeof name !== 'string' || !name)) {
      throw new Error(`CSS entry for ${page.slug} must be a stylesheet name or a non-empty array of names`);
    }
    for (const name of cssNames) {
      if (name.startsWith('_')) {
        throw new Error(`${page.slug} must not list the shared chunk "${name}": build.cjs prepends it already`);
      }
      if (!fs.existsSync(path.join(SRC, 'css', `${name}.css`))) {
        throw new Error(`Stylesheet not found: src/css/${name}.css (required by ${page.slug})`);
      }
    }
    const duplicateCss = cssNames.find((name, index) => cssNames.indexOf(name) !== index);
    if (duplicateCss) {
      throw new Error(`Duplicate CSS entry "${duplicateCss}" for ${page.slug}`);
    }
    if (page.assets && !Array.isArray(page.assets)) {
      throw new Error(`Asset list for ${page.slug} must be an array`);
    }
    if (page.schemaRole && !['author', 'contributor'].includes(page.schemaRole)) {
      throw new Error(`Unknown schemaRole "${page.schemaRole}" for ${page.slug}: use author or contributor`);
    }
    if (page.schemaRole && !page.schemaType) {
      throw new Error(`${page.slug} sets schemaRole without schemaType, so it would have no effect`);
    }
    const duplicateJs = page.js.find((name, index) => page.js.indexOf(name) !== index);
    if (duplicateJs) {
      throw new Error(`Duplicate JS entry "${duplicateJs}" for ${page.slug}`);
    }
    const expectedCanonical = page.slug === 'index' ? `${siteOrigin}/` : `${siteOrigin}/${page.slug}.html`;
    if (page.canonical !== expectedCanonical) {
      throw new Error(`Canonical mismatch for ${page.slug}: expected ${expectedCanonical}, got ${page.canonical}`);
    }
    if (!page.title || page.title.length > 70) {
      throw new Error(`Title for ${page.slug} must be 1-70 characters`);
    }
    if (!page.description || page.description.length < 80 || page.description.length > 220) {
      throw new Error(`Description for ${page.slug} must be 80-220 characters`);
    }
    if (!page.ogImage || !page.ogImageAlt) {
      throw new Error(`OG image and alt text are required for ${page.slug}`);
    }
    const pageSource = read(path.join(SRC, 'pages', `${page.slug}.html`));
    const h1Count = (pageSource.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) {
      throw new Error(`src/pages/${page.slug}.html must contain exactly one h1, found ${h1Count}`);
    }
    const galleryItemTags = [...pageSource.matchAll(/<([a-z][\w:-]*)\b(?=[^>]*\bclass=(["'])[^"']*\bgallery-item\b[^"']*\2)[^>]*>/gi)];
    if (page.lightbox) {
      // The lightbox partial and script were removed once no page used them;
      // .gallery-item images now ship as plain links via enhanceGalleryItemLinks.
      throw new Error(`${page.slug} sets lightbox, but the lightbox feature was removed from the build`);
    }
    for (const match of galleryItemTags) {
      const afterTag = pageSource.slice(match.index, match.index + 1200);
      const image = afterTag.match(/<img\b[^>]*>/i);
      if (!image || !attrValue(image[0], 'src') || !attrValue(image[0], 'alt')) {
        throw new Error(`${page.slug} gallery item is missing an image with src and alt`);
      }
    }
    // Viewport units in font-size are only allowed inside clamp() (rem bounds keep zoom working).
    // Tracking must be 0 or a relative em value. A var() is allowed after the
    // reference is resolved against _tokens.css and every stylesheet on the page.
    const pageCssSources = cssNames.map(name => read(path.join(SRC, 'css', `${name}.css`)));
    const trackingProps = new Map();
    for (const source of [getCSS('_tokens'), getCSS('_chrome')].concat(pageCssSources)) {
      for (const decl of source.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
        trackingProps.set(decl[1], decl[2].trim());
      }
    }
    const resolveTracking = (raw, depth) => {
      const value = raw.replace(/\s*!important/i, '').trim();
      if (depth > 4) return value;
      const reference = value.match(/^var\(\s*(--[\w-]+)\s*(?:,([\s\S]+))?\)$/);
      if (!reference) return value;
      const declared = trackingProps.get(reference[1]);
      if (declared !== undefined) return resolveTracking(declared, depth + 1);
      if (reference[2]) return resolveTracking(reference[2], depth + 1);
      return value;
    };
    cssNames.forEach((name, index) => {
      const css = pageCssSources[index];
      const viewportFontSize = css.match(/font-size\s*:(?![^;]*clamp\()[^;]*(?:vw|vh|vmin|vmax)[^;]*;/i);
      if (viewportFontSize) {
        throw new Error(`Viewport-based font-size outside clamp() is not allowed in src/css/${name}.css: ${viewportFontSize[0]}`);
      }
      for (const match of css.matchAll(/letter-spacing\s*:\s*([^;]+);/gi)) {
        const value = resolveTracking(match[1], 0);
        if (value !== '0' && !/^-?(?:\d+)?\.?\d+em$/.test(value)) {
          throw new Error(`letter-spacing must be 0 or an em value in src/css/${name}.css: ${match[0]}`);
        }
      }
    });
    for (const jsName of page.js) {
      if (!fs.existsSync(path.join(SRC, 'js', `${jsName}.js`))) {
        throw new Error(`JS not found: src/js/${jsName}.js (required by ${page.slug})`);
      }
    }
  }
  const projectSlugs = cfg.pages
    .filter(page => page.layout === 'project')
    .map(page => page.slug);
  const projectSlugSet = new Set(projectSlugs);
  const homeSource = read(path.join(SRC, 'pages', 'index.html'));
  const homeProjectTags = [...homeSource.matchAll(/<a\b(?=[^>]*\bclass=(["'])[^"']*\b(?:project-card|prow|archive-project-link)\b[^"']*\1)[^>]*>/gi)]
    .map(match => match[0]);
  const cardSlugs = homeProjectTags.map(tag => htmlFileSlug(attrValue(tag, 'href'))).filter(Boolean);
  const duplicateCard = cardSlugs.find((slug, index) => cardSlugs.indexOf(slug) !== index);
  const missingCards = projectSlugs.filter(slug => !cardSlugs.includes(slug));
  const deadCards = cardSlugs.filter(slug => !projectSlugSet.has(slug));
  if (duplicateCard || missingCards.length || deadCards.length || cardSlugs.length !== projectSlugs.length) {
    throw new Error(`Homepage project cards out of sync. Missing: ${missingCards.join(', ') || 'none'}; unknown: ${deadCards.join(', ') || 'none'}; duplicate: ${duplicateCard || 'none'}`);
  }
  const nextProject = new Map();
  for (const slug of projectSlugs) {
    const source = read(path.join(SRC, 'pages', `${slug}.html`));
    const nextTag = source.match(/<a\b(?=[^>]*\bclass=(["'])[^"']*\bnext-project-btn\b[^"']*\1)[^>]*>/i);
    const nextSlug = nextTag ? htmlFileSlug(attrValue(nextTag[0], 'href')) : '';
    if (!nextSlug || !projectSlugSet.has(nextSlug)) {
      throw new Error(`Invalid next-project link in src/pages/${slug}.html: ${nextSlug || 'missing'}`);
    }
    nextProject.set(slug, nextSlug);
  }
  const projectGroups = new Map([
    ['featured', []],
    ['tools', []],
    ['archive', []],
  ]);
  for (const tag of homeProjectTags) {
    const slug = htmlFileSlug(attrValue(tag, 'href'));
    const classes = attrValue(tag, 'class').split(/\s+/);
    const group = classes.includes('prow--featured') ? 'featured'
      : classes.includes('prow--tool') ? 'tools'
      : classes.includes('archive-project-link') ? 'archive'
      : '';
    if (!group) throw new Error(`Homepage project ${slug || '(missing slug)'} has no work group class`);
    projectGroups.get(group).push(slug);
  }
  for (const [group, slugs] of projectGroups) {
    if (!slugs.length) throw new Error(`Homepage work group ${group} is empty`);
    const visited = [];
    let cursor = slugs[0];
    for (let i = 0; i < slugs.length + 1 && cursor; i++) {
      if (visited.includes(cursor)) break;
      visited.push(cursor);
      cursor = nextProject.get(cursor);
    }
    const missedByCycle = slugs.filter(slug => !visited.includes(slug));
    const escaped = visited.filter(slug => !slugs.includes(slug));
    if (missedByCycle.length || escaped.length || cursor !== slugs[0]) {
      throw new Error(`Next-project links for ${group} must form one cycle from ${slugs[0]}. Missed: ${missedByCycle.join(', ') || 'none'}; escaped: ${escaped.join(', ') || 'none'}; ended at: ${cursor || 'missing'}`);
    }
  }
  const staticOutNames = new Map();
  const reservedOutputs = new Set(cfg.pages.map(page => `${page.slug}.html`).concat([
    'assets',
    'sitemap.xml',
    'robots.txt',
    'CNAME',
    '.nojekyll'
  ]));
  for (const entry of staticCopyEntries(cfg)) {
    if (!entry.file) throw new Error('staticCopy entry is missing file');
    const src = safeRepoPath(entry.file);
    if (!src) {
      throw new Error(`Unsafe staticCopy source path: ${entry.file}`);
    }
    const dest = safeDistPath(entry.outName);
    if (!dest) {
      throw new Error(`Unsafe staticCopy output path: ${entry.outName || '(missing)'}`);
    }
    const outKey = distOutputKey(dest);
    if (!outKey) {
      throw new Error(`staticCopy output "${entry.outName || '(missing)'}" must name a file or directory inside dist`);
    }
    if (isReservedDistOutput(outKey, reservedOutputs) || outKey.startsWith('assets/')) {
      throw new Error(`staticCopy output "${entry.outName}" conflicts with generated output ${outKey}`);
    }
    if (!fs.existsSync(src)) {
      throw new Error(`Static copy not found: ${entry.file}`);
    }
    checkedSource(__dirname, src);
    if (staticOutNames.has(outKey)) {
      throw new Error(`Duplicate staticCopy output "${outKey}" for ${staticOutNames.get(outKey)} and ${entry.file}`);
    }
    staticOutNames.set(outKey, entry.file);
  }
}

// Staged build orchestration; publication is the final step.
function main() {
  // Exported main() may be called again in the same process. A new staging
  // directory must not inherit cached source text or previously emitted paths.
  for (const cache of [partials, cssCache, jsCache]) {
    for (const key of Object.keys(cache)) delete cache[key];
  }
  emittedBrowserAssets.clear();
  validateConfig(config);

  // Always assemble and validate away from dist. The last successful output is
  // replaced only after every page, asset, and support file has passed.
  cleanDir(DIST);
  cleanDir(DIST_BACKUP);
  ensureDir(DIST);

  let built = 0;
  const failed = [];
  const htmlOutputs = [];

  // Build templated pages
  for (const page of config.pages) {
    try {
      const html = buildPage(page);
      const outPath = safeDistPath(`${page.slug}.html`);
      if (!outPath) throw new Error(`Unsafe page output path for slug: ${page.slug}`);
      fs.writeFileSync(outPath, html, 'utf8');
      htmlOutputs.push(`${page.slug}.html`);
      built++;
      console.log(`  ✓ ${page.slug}.html`);
    } catch (err) {
      failed.push({ slug: page.slug, error: err.message });
      console.error(`  ✗ ${page.slug}.html - ${err.message}`);
    }
  }

  if (failed.length) {
    throw new Error(
      `${failed.length} page(s) failed:\n  - ${failed.map(failure => `${failure.slug}: ${failure.error}`).join('\n  - ')}`
    );
  }

  // Copy static files (external pages not using the layout system)
  let copied = 0;
  const copiedStatic = [];
  const staticEntries = staticCopyEntries(config);
  if (staticEntries.length) {
    for (const entry of staticEntries) {
      const outName = entry.outName;
      const candidate = safeRepoPath(entry.file);
      const src = candidate && checkedSource(__dirname, candidate);
      const dest = safeDistPath(outName);
      if (!src || !dest) {
        throw new Error(`Unsafe static copy path: ${entry.file} -> ${outName}`);
      }
      const outKey = distOutputKey(dest);
      if (!outKey) {
        throw new Error(`staticCopy output "${outName || '(missing)'}" must name a file or directory inside dist`);
      }
      if (fs.existsSync(src)) {
        ensureDir(path.dirname(dest));
        if (entry.rewriteRootRelativeTo || entry.ensureIds || path.extname(entry.file).toLowerCase() === '.html') {
          let html = read(src);
          if (entry.sanitize) {
            html = sanitizeStaticSnapshot(html);
          }
          if (entry.rewriteRootRelativeTo) {
            html = rewriteRootRelativeUrls(html, entry.rewriteRootRelativeTo);
          }
          html = enhanceDocumentBasics(html);
          html = ensureFragmentTargets(html, entry.ensureIds);
          html = enhanceExternalLinkSafety(html);
          html = enhanceIframeAccessibility(html);
          html = enhanceImageAccessibility(html);
          html = enhanceInlineSvgAccessibility(html);
          html = neutralizeJavascriptHrefs(html);
          if (entry.noindex) {
            html = ensureNoindex(html);
          }
          fs.writeFileSync(dest, html, 'utf8');
        } else {
          fs.copyFileSync(src, dest);
        }
        copied++;
        copiedStatic.push({ ...entry, outName: outKey });
        if (path.extname(outKey).toLowerCase() === '.html') htmlOutputs.push(outKey);
        console.log(`  → ${outKey} (copied)`);
      } else {
        throw new Error(`Static copy not found: ${entry.file}`);
      }
    }
  }

  // Copy first-party assets referenced as assets/... in layouts.
  const copiedSrcAssets = copyDirContents(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
  console.log(`  → assets/ (${copiedSrcAssets} copied)`);

  // Old crawlers and some tools request /favicon.ico unconditionally, so the
  // mark also ships at the root even though every page links assets/ icons.
  fs.copyFileSync(checkedSource(__dirname, path.join(SRC, 'assets', 'favicon-mark.ico')), path.join(DIST, 'favicon.ico'));

  // Generate sitemap.xml - lastmod follows content files, not every shared build/config change.
  const SITE_ORIGIN = new URL(config.pages[0].canonical).origin;
  const pageUrls = config.pages.filter(p => p.sitemap !== false && !p.noindex).map(p => {
    const priority = p.slug === 'index' ? '1.0' : '0.8';
    return sitemapUrl(p.canonical, maxGitMtime(pageContentInputs(p)), priority);
  });
  const staticUrls = copiedStatic.filter(entry => entry.sitemap !== false).map(entry => {
    const outName = entry.outName;
    const loc = `${SITE_ORIGIN}/${outName}`;
    return sitemapUrl(loc, maxGitMtime([entry.file]), '0.5');
  });
  const urls = pageUrls.concat(staticUrls).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
  console.log('  → sitemap.xml');

  // Generate robots.txt
  const disallows = copiedStatic
    .filter(entry => entry.robotsDisallow === true)
    .map(entry => `Disallow: /${entry.outName}`)
    .join('\n');
  const robots = `User-agent: *\nAllow: /\n${disallows ? `${disallows}\n` : ''}\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');
  console.log('  → robots.txt');

  // Single source of truth for root-level assets referenced by pages or ogImage.
  // The deploy workflow no longer copies these separately - it relies on this list.
  const rootAssets = [
    'audioqscreenshot.png',
    'transienticascreenshot.png',
    'UnrealEngineDemo.mp4',
    'PythonPrototypeDemo.mp4',
    'szuniewicz-ai-audio-thesis-2026.pdf',
    'Igor_Szuniewicz_CV.pdf',
    'aithesiscover.png',
  ];
  for (const f of rootAssets) {
    const src = path.join(__dirname, f);
    if (!fs.existsSync(src)) throw new Error(`Root asset not found: ${f}`);
  }

  const localRefs = new Set();
  for (const file of htmlOutputs) {
    const html = read(path.join(DIST, file));
    for (const ref of collectLocalRefsFromHtml(html, SITE_ORIGIN)) localRefs.add(ref);
  }
  for (const ref of collectCssRefs(SITE_ORIGIN)) localRefs.add(ref);
  for (const f of rootAssets) localRefs.add(f);
  for (const page of config.pages) {
    if (page.ogImage) {
      const ref = urlPathname(page.ogImage, SITE_ORIGIN);
      if (ref) localRefs.add(ref);
    }
    for (const asset of page.assets || []) localRefs.add(asset);
  }
  const copiedAssets = copyReferencedAssets(localRefs);
  console.log(`  → referenced assets (${copiedAssets.length} copied)`);

  validateLocalRefsInDist(htmlOutputs, SITE_ORIGIN);
  console.log('  → local asset references validated');
  validateGeneratedHtml(htmlOutputs, { dist: DIST, config });
  console.log('  → generated HTML validated');

  const cnameHost = new URL(config.pages[0].canonical).hostname;
  if (cnameHost && !cnameHost.endsWith('.github.io')) {
    fs.writeFileSync(path.join(DIST, 'CNAME'), cnameHost + '\n', 'utf8');
    console.log('  → CNAME');
  }
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '', 'utf8');
  console.log('  → .nojekyll');
  validateSupportFiles(SITE_ORIGIN, copiedStatic, { dist: DIST, config });
  console.log('  → support files validated');

  enforceDistBudget(DIST, console);

  if (CHECK_ONLY) {
    cleanDir(DIST);
    console.log(`\nCheck passed: ${built} pages built, ${copied} files copied in staging; dist/ unchanged`);
    return;
  }

  publishDist({ stagingDir: DIST, outputDir: FINAL_DIST, backupDir: DIST_BACKUP,
    platform: process.platform, logger: console });
  console.log(`\nDone: ${built} pages built, ${copied} files copied → dist/`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    try {
      cleanDir(DIST);
      if (fs.existsSync(DIST_BACKUP) && !fs.existsSync(FINAL_DIST)) {
        fs.renameSync(DIST_BACKUP, FINAL_DIST);
      }
    } catch (cleanupError) {
      console.error(`\nBuild cleanup failed: ${cleanupError.message}`);
    }
    console.error(`\nBuild failed: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { buildPage, validateConfig, copyDirContents, main, decodeBase64Attr };
