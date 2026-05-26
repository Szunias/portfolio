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
const { execFileSync } = require('child_process');

const config = require('./site.config.cjs');

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
  const times = files
    .map(gitMtime)
    .filter(Boolean)
    .sort();
  return times.length ? times[times.length - 1] : null;
}

function relPath(...parts) {
  return parts.join('/');
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

function copyDirContents(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  ensureDir(destDir);
  let copied = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copied += copyDirContents(src, dest);
    } else if (entry.isFile()) {
      fs.copyFileSync(src, dest);
      copied++;
    }
  }
  return copied;
}

function byteSizeLabel(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function collectFileSizes(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFileSizes(fullPath, base));
    } else if (entry.isFile()) {
      const size = fs.statSync(fullPath).size;
      files.push({ path: path.relative(base, fullPath).replace(/\\/g, '/'), size });
    }
  }
  return files;
}

function enforceDistBudget() {
  const files = collectFileSizes(DIST);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotal = 650 * 1024 * 1024;
  const maxFile = 65 * 1024 * 1024;
  const largest = files.slice().sort((a, b) => b.size - a.size)[0];
  if (total > maxTotal) {
    throw new Error(`dist is ${byteSizeLabel(total)}, above the ${byteSizeLabel(maxTotal)} deploy budget`);
  }
  if (largest && largest.size > maxFile) {
    throw new Error(`${largest.path} is ${byteSizeLabel(largest.size)}, above the ${byteSizeLabel(maxFile)} single-file budget`);
  }
  console.log(`  → deploy size budget OK (${files.length} files, ${byteSizeLabel(total)}${largest ? `, largest ${byteSizeLabel(largest.size)}` : ''})`);
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
  const imageAlt = page.ogImageAlt || `${ogTitle} preview image`;
  const lines = [
    `<meta property="og:title" content="${escAttr(ogTitle)}">`,
    `<meta property="og:description" content="${escAttr(page.description)}">`,
    `<meta property="og:type" content="${escAttr(page.ogType || (page.slug === 'index' ? 'website' : 'article'))}">`,
    `<meta property="og:url" content="${escAttr(page.canonical)}">`,
    `<meta property="og:site_name" content="Igor Szuniewicz">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escAttr(ogTitle)}">`,
    `<meta name="twitter:description" content="${escAttr(page.description)}">`,
  ];
  if (page.ogImage) {
    lines.splice(4, 0, `<meta property="og:image" content="${escAttr(page.ogImage)}">`);
    lines.splice(5, 0, `<meta property="og:image:alt" content="${escAttr(imageAlt)}">`);
    lines.push(`<meta name="twitter:image" content="${escAttr(page.ogImage)}">`);
    lines.push(`<meta name="twitter:image:alt" content="${escAttr(imageAlt)}">`);
  }
  return lines.join('\n');
}

function jsonLdTag(graph) {
  return `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}\n</script>`;
}

function schemaTags(page) {
  const siteOrigin = new URL(config.pages[0].canonical).origin;
  const siteId = `${siteOrigin}/#website`;
  const personId = `${siteOrigin}/#igor`;
  const pageId = `${page.canonical}#webpage`;
  const pageName = page.ogTitle || page.title;
  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Igor Szuniewicz',
    url: `${siteOrigin}/`,
    jobTitle: 'Game Audio & Technical Sound Designer',
    description: 'Game audio designer and programmer focused on Wwise, FMOD, Unreal Engine, Unity, spatial audio, sound design, and C++ audio tools.',
    knowsAbout: [
      'Game audio',
      'Technical sound design',
      'Wwise',
      'FMOD',
      'Unreal Engine',
      'Unity',
      'MetaSounds',
      'Spatial audio',
      'C++ audio tools',
      'JUCE'
    ],
    sameAs: [
      'https://www.linkedin.com/in/igorszuniewicz',
      'https://github.com/Szunias',
      'https://igorszuniewicz.itch.io',
      'https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6'
    ]
  };
  const website = {
    '@type': 'WebSite',
    '@id': siteId,
    url: `${siteOrigin}/`,
    name: 'Igor Szuniewicz',
    description: 'Game audio and technical sound design portfolio by Igor Szuniewicz.',
    publisher: { '@id': personId }
  };
  const webPage = {
    '@type': page.slug === 'index' ? 'ProfilePage' : (page.layout === 'music' ? 'CollectionPage' : 'CreativeWork'),
    '@id': pageId,
    url: page.canonical,
    name: pageName,
    description: page.description,
    isPartOf: { '@id': siteId }
  };
  if (page.ogImage) webPage.image = page.ogImage;
  if (page.slug === 'index') {
    webPage.mainEntity = { '@id': personId };
  } else {
    webPage.author = { '@id': personId };
    webPage.creator = { '@id': personId };
    webPage.mainEntityOfPage = page.canonical;
  }
  const graph = [person, website, webPage];
  if (page.slug !== 'index') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${page.canonical}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteOrigin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageName.replace(/\s+\|\s+.*$/, '').replace(/\s+-\s+Igor Szuniewicz$/, ''),
          item: page.canonical
        }
      ]
    });
  }
  return jsonLdTag(graph);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attrValue(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function hasAttr(attrs, name) {
  return new RegExp(`(?:^|\\s)${name}\\s*=`, 'i').test(attrs);
}

function htmlFileSlug(href) {
  return href.replace(/[?#].*$/, '').replace(/\.html$/i, '');
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

function enhanceExternalLinkSafety(html) {
  return html.replace(/<a\b([^>]*\btarget=(["'])_blank\2[^>]*)>/gi, (match, attrs) => {
    const rel = attrs.match(/\brel=(["'])(.*?)\1/i);
    if (!rel) return `<a${attrs} rel="noopener noreferrer">`;

    const tokens = rel[2].split(/\s+/).filter(Boolean);
    for (const token of ['noopener', 'noreferrer']) {
      if (!tokens.some(existing => existing.toLowerCase() === token)) tokens.push(token);
    }
    const nextRel = `rel=${rel[1]}${tokens.join(' ')}${rel[1]}`;
    return `<a${attrs.replace(rel[0], nextRel)}>`;
  });
}

function enhanceIframeAccessibility(html) {
  return html.replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
    let next = attrs;
    if (!hasAttr(next, 'loading')) next = ` loading="lazy"${next}`;
    if (!hasAttr(next, 'title')) next = ` title="Embedded content"${next}`;
    return `<iframe${next}>`;
  });
}

function enhanceImageAccessibility(html) {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs) => (
    hasAttr(attrs, 'alt') ? match : `<img alt=""${attrs}>`
  ));
}

function enhanceDocumentBasics(html) {
  let output = html;
  output = output.replace(/<script\b([^>]*)>\s*<\/script>/gi, '');
  output = output.replace(/<html\b([^>]*)>/i, (match, attrs) => (
    hasAttr(attrs, 'lang') ? match : `<html lang="en"${attrs}>`
  ));
  if (!/<meta\b(?=[^>]*\bname=(["'])viewport\1)/i.test(output) && /<\/head>/i.test(output)) {
    output = output.replace(/<\/head>/i, '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>');
  }
  return output;
}

function enhanceInlineSvgAccessibility(html) {
  return html.replace(/<svg\b(?![^>]*\baria-hidden=)(?![^>]*\brole=)([^>]*)>/gi, '<svg aria-hidden="true" focusable="false"$1>');
}

function neutralizeJavascriptHrefs(html) {
  if (!/\bhref=(["'])javascript:[^"']*\1/i.test(html)) return html;
  let output = html;
  if (!/\bid=(["'])top\1/i.test(output)) {
    output = output.replace(/<body\b[^>]*>/i, '$&\n<span id="top" hidden></span>');
  }
  return output.replace(/\bhref=(["'])javascript:[^"']*\1/gi, 'href="#top"');
}

function ensureNoindex(html) {
  const cleaned = html.replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>\s*/gi, '');
  if (/<\/head>/i.test(html)) {
    return cleaned.replace(/<\/head>/i, '  <meta name="robots" content="noindex, nofollow">\n</head>');
  }
  return cleaned;
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
  const normalized = rel.replace(/\\/g, '/');
  const resolved = path.resolve(DIST, normalized);
  const distRoot = path.resolve(DIST);
  if (resolved !== distRoot && !resolved.startsWith(distRoot + path.sep)) return null;
  return resolved;
}

function copyReferencedAssets(refs) {
  const copied = [];
  for (const rel of refs) {
    if (!rel || rel.endsWith('.html') || rel === 'sitemap.xml' || rel === 'robots.txt') continue;
    if (rel.startsWith('assets/')) continue;
    const src = safeRepoPath(rel);
    const dest = safeDistPath(rel);
    if (!src || !dest) {
      throw new Error(`Unsafe local asset reference: ${rel}`);
    }
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

function validateGeneratedHtml(htmlFiles) {
  const issues = [];
  const htmlFileSet = new Set(htmlFiles);
  const pageByFile = new Map(config.pages.map(page => [`${page.slug}.html`, page]));
  for (const file of htmlFiles) {
    const html = read(path.join(DIST, file));
    if (!/<html\b[^>]*\blang=(["'])[^"']+\1/i.test(html)) issues.push(`${file}: html missing lang`);
    if (!/<meta\b(?=[^>]*\bname=(["'])viewport\1)/i.test(html)) issues.push(`${file}: missing viewport meta`);
    if (/<script\b[^>]*>\s*<\/script>/i.test(html)) issues.push(`${file}: empty script block`);
    if (/<!--\s*(?:TITLE|DESCRIPTION|CANONICAL|OG_TAGS|CSS|CONTENT|JS|SCHEMA|PLAYER|LIGHTBOX)\s*-->/.test(html)) {
      issues.push(`${file}: unresolved build placeholder`);
    }
    for (const match of html.matchAll(/<script\b(?=[^>]*\btype=(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const schema = JSON.parse(match[2]);
        if (schema['@context'] !== 'https://schema.org') {
          issues.push(`${file}: JSON-LD missing schema.org context`);
        }
        if (!Array.isArray(schema['@graph']) || !schema['@graph'].length) {
          issues.push(`${file}: JSON-LD graph is empty or missing`);
        }
      } catch (err) {
        issues.push(`${file}: invalid JSON-LD (${err.message})`);
      }
    }
    const ids = [...html.matchAll(/\bid=(["'])(.*?)\1/gi)].map(match => match[2]);
    const fragmentTargets = new Set(ids.concat(
      [...html.matchAll(/\bname=(["'])(.*?)\1/gi)].map(match => match[2])
    ));
    const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicateId) issues.push(`${file}: duplicate id "${duplicateId}"`);
    const isNoindex = /<meta\b(?=[^>]*\bname=(["'])robots\1)(?=[^>]*\bcontent=(["'])[^"']*\bnoindex\b[^"']*\2)/i.test(html);
    const pageConfig = pageByFile.get(file);

    if (pageConfig) {
      if (isNoindex) issues.push(`${file}: live page must not be noindex`);
      const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(match => stripTags(match[1]));
      if (titles.length !== 1 || !titles[0]) issues.push(`${file}: expected exactly one non-empty title`);
      const descriptions = [...html.matchAll(/<meta\b(?=[^>]*\bname=(["'])description\1)[^>]*>/gi)];
      if (descriptions.length !== 1 || !attrValue(descriptions[0][0], 'content')) {
        issues.push(`${file}: expected exactly one non-empty meta description`);
      }
      const canonicals = [...html.matchAll(/<link\b(?=[^>]*\brel=(["'])canonical\1)[^>]*>/gi)];
      const canonical = canonicals.length === 1 ? decodeHtmlAttr(attrValue(canonicals[0][0], 'href')) : '';
      if (canonicals.length !== 1 || canonical !== pageConfig.canonical) {
        issues.push(`${file}: canonical mismatch in generated HTML`);
      }
      const ogUrls = [...html.matchAll(/<meta\b(?=[^>]*\bproperty=(["'])og:url\1)[^>]*>/gi)]
        .map(match => decodeHtmlAttr(attrValue(match[0], 'content')));
      if (ogUrls.length !== 1 || ogUrls[0] !== pageConfig.canonical) {
        issues.push(`${file}: og:url mismatch in generated HTML`);
      }
    }

    if (!isNoindex) {
      for (const match of html.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi)) {
        const tag = match[0];
        for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant', 'for']) {
          const value = attrValue(tag, attr);
          if (!value) continue;
          for (const idRef of decodeHtmlAttr(value).trim().split(/\s+/).filter(Boolean)) {
            if (!fragmentTargets.has(idRef)) {
              issues.push(`${file}: ${attr} references missing id "${idRef}"`);
            }
          }
        }
      }
    }

    for (const match of html.matchAll(/\b(?:href|src|poster|action|data-src|data-cover)=["']([^"']+)["']/gi)) {
      const value = decodeHtmlAttr(match[1]).trim();
      if (/^javascript:/i.test(value)) issues.push(`${file}: disallowed javascript: URL`);
      if (!isNoindex && /^http:\/\//i.test(value)) issues.push(`${file}: insecure http URL ${value}`);
    }

    for (const match of html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)) {
      const href = decodeHtmlAttr(match[2]).trim();
      if (href === '#') {
        issues.push(`${file}: placeholder href="#"`);
        continue;
      }
      if (/^(https?:|mailto:|tel:|data:|feed:)/i.test(href) || href.startsWith('//')) continue;
      const localFile = href.split('#')[0].split('?')[0];
      const hash = href.includes('#') ? href.split('#')[1] : '';
      if (localFile.endsWith('.html') && !htmlFileSet.has(localFile)) {
        issues.push(`${file}: broken local page link ${href}`);
      }
      if (hash && (!localFile || localFile === file) && !fragmentTargets.has(decodeURIComponent(hash))) {
        issues.push(`${file}: missing same-page fragment ${href}`);
      }
    }

    for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
      const tag = match[0];
      if (/\btarget=(["'])_blank\1/i.test(tag) && !/\brel=(["'])[^"']*\bnoopener\b/i.test(tag)) {
        issues.push(`${file}: target="_blank" link missing noopener`);
      }
    }

    for (const match of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
      const tag = match[0];
      const text = stripTags(match[1]);
      if (!text && !/\baria-label=(["'])[^"']+\1/i.test(tag) && !/\btitle=(["'])[^"']+\1/i.test(tag)) {
        issues.push(`${file}: button missing accessible name`);
      }
    }

    if (!isNoindex) {
      for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
        const tag = match[0];
        const isLightboxImage = /\bdata-lightbox-image\b/i.test(tag);
        const isAriaHidden = /\baria-hidden=(["'])true\1/i.test(tag);
        if (!/\bsrc=(["'])[^"']+\1/i.test(tag) && !isLightboxImage) {
          issues.push(`${file}: image missing src`);
        }
        if (/\balt=(["'])\1/i.test(tag) && !isAriaHidden && !isLightboxImage) {
          issues.push(`${file}: empty image alt without aria-hidden`);
        }
      }
    }

    for (const match of html.matchAll(/<iframe\b[^>]*>/gi)) {
      const tag = match[0];
      if (!/\btitle=(["'])[^"']+\1/i.test(tag)) issues.push(`${file}: iframe missing title`);
      if (!/\bloading=(["'])lazy\1/i.test(tag)) issues.push(`${file}: iframe missing lazy loading`);
    }

    for (const match of html.matchAll(/<video\b[^>]*\bcontrols\b[^>]*>[\s\S]*?<\/video>/gi)) {
      const tag = match[0];
      const openTag = tag.match(/<video\b[^>]*>/i)?.[0] || '';
      const sources = [...tag.matchAll(/<source\b[^>]*>/gi)].map(source => source[0]);
      if (!attrValue(openTag, 'poster')) {
        issues.push(`${file}: controls video missing poster`);
      }
      if (!/\bpreload=(["'])none\1/i.test(openTag)) {
        issues.push(`${file}: controls video must use preload="none"`);
      }
      if (!sources.length && !attrValue(openTag, 'src')) {
        issues.push(`${file}: controls video missing source`);
      }
      for (const source of sources) {
        if (!attrValue(source, 'src')) issues.push(`${file}: video source missing src`);
        if (!/^video\//i.test(attrValue(source, 'type'))) issues.push(`${file}: video source missing video/* type`);
      }
      if (!/\baria-(?:label|labelledby|describedby)=/i.test(tag)) {
        issues.push(`${file}: controls video missing accessible label or description`);
      }
      if (!/<track\b[^>]*\bkind=(["'])descriptions\1/i.test(tag)) {
        issues.push(`${file}: controls video missing descriptions track`);
      }
    }

    for (const match of html.matchAll(/<audio\b[^>]*>/gi)) {
      const tag = match[0];
      if (!attrValue(tag, 'src')) issues.push(`${file}: audio element missing src`);
      if (!/\bpreload=(["'])none\1/i.test(tag)) issues.push(`${file}: audio element must use preload="none"`);
    }
  }

  if (issues.length) {
    throw new Error(`Generated HTML validation failed:\n  - ${issues.slice(0, 30).join('\n  - ')}${issues.length > 30 ? `\n  ...and ${issues.length - 30} more` : ''}`);
  }
}

function validateSupportFiles(siteOrigin, copiedStatic) {
  const issues = [];
  const sitemapPath = path.join(DIST, 'sitemap.xml');
  const robotsPath = path.join(DIST, 'robots.txt');
  const sitemap = fs.existsSync(sitemapPath) ? read(sitemapPath) : '';
  const robots = fs.existsSync(robotsPath) ? read(robotsPath) : '';

  if (!sitemap) issues.push('sitemap.xml is missing');
  if (!robots) issues.push('robots.txt is missing');
  if (sitemap && !/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(sitemap)) {
    issues.push('sitemap.xml missing XML declaration');
  }
  if (sitemap && !/<urlset\b[^>]*xmlns=(["'])http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9\1/i.test(sitemap)) {
    issues.push('sitemap.xml missing sitemap namespace');
  }

  const sitemapLocs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decodeHtmlAttr(match[1]));
  const expectedLocs = config.pages.map(page => page.canonical).concat(
    copiedStatic
      .filter(entry => entry.sitemap !== false)
      .map(entry => `${siteOrigin}/${entry.outName}`)
  );
  const duplicateLoc = sitemapLocs.find((loc, index) => sitemapLocs.indexOf(loc) !== index);
  const missingLocs = expectedLocs.filter(loc => !sitemapLocs.includes(loc));
  const extraLocs = sitemapLocs.filter(loc => !expectedLocs.includes(loc));
  if (duplicateLoc) issues.push(`sitemap.xml duplicate URL ${duplicateLoc}`);
  if (missingLocs.length) issues.push(`sitemap.xml missing URL(s): ${missingLocs.join(', ')}`);
  if (extraLocs.length) issues.push(`sitemap.xml has unexpected URL(s): ${extraLocs.join(', ')}`);

  if (robots && !new RegExp(`^Sitemap:\\s*${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/sitemap\\.xml\\s*$`, 'm').test(robots)) {
    issues.push('robots.txt missing canonical sitemap URL');
  }

  const cnameHost = new URL(config.pages[0].canonical).hostname;
  const cnamePath = path.join(DIST, 'CNAME');
  if (cnameHost && !cnameHost.endsWith('.github.io')) {
    const cname = fs.existsSync(cnamePath) ? read(cnamePath).trim() : '';
    if (cname !== cnameHost) issues.push(`CNAME mismatch: expected ${cnameHost}, got ${cname || 'missing'}`);
  }

  if (issues.length) {
    throw new Error(`Support file validation failed:\n  - ${issues.join('\n  - ')}`);
  }
}

function staticCopyEntries(cfg) {
  return (cfg.staticCopy || []).map(entry => (
    typeof entry === 'string'
      ? { file: entry, outName: path.basename(entry), sitemap: true }
      : { ...entry, outName: entry.outName || path.basename(entry.file) }
  ));
}

function pageContentInputs(page) {
  return [relPath('src', 'pages', `${page.slug}.html`)];
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
  let html = enhanceInlineSvgAccessibility(enhanceImageAccessibility(read(layoutPath)));

  // 2. Read page content
  const pagePath = path.join(SRC, 'pages', `${page.slug}.html`);
  if (!fs.existsSync(pagePath)) {
    throw new Error(`Page content not found: src/pages/${page.slug}.html`);
  }
  let content = read(pagePath);
  content = enhanceVideoAccessibility(content, page.slug);
  content = enhanceExternalLinkSafety(content);
  content = enhanceIframeAccessibility(content);
  content = enhanceImageAccessibility(content);
  content = enhanceInlineSvgAccessibility(content);

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
    html = html.replace('<!-- LIGHTBOX -->', enhanceInlineSvgAccessibility(getPartial('lightbox')));
  } else {
    html = html.replace('<!-- LIGHTBOX -->', '');
  }

  if (page.layout === 'music') {
    html = html.replace('<!-- PLAYER -->', enhanceInlineSvgAccessibility(getPartial('player-bar')));
  }

  // 7. Schema (home page)
  const schema = [schemaTags(page), page.schema || ''].filter(Boolean).join('\n');
  html = html.replace('<!-- SCHEMA -->', schema);

  return html;
}

// ─── Main ───────────────────────────────────────────────────────

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
    const ids = [...source.matchAll(/\bid=(["'])(.*?)\1/gi)].map(match => match[2]);
    const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicateId) throw new Error(`Duplicate id "${duplicateId}" in src/pages/${slug}.html`);
  }
  for (const page of cfg.pages) {
    if (seen.has(page.slug)) throw new Error(`Duplicate slug: ${page.slug}`);
    seen.add(page.slug);
    if (!['home', 'project', 'music'].includes(page.layout)) {
      throw new Error(`Unknown layout "${page.layout}" for ${page.slug}`);
    }
    if (!Array.isArray(page.js)) {
      throw new Error(`JS list for ${page.slug} must be an array`);
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
    if (!fs.existsSync(path.join(SRC, 'css', `${page.css}.css`))) {
      throw new Error(`CSS not found: src/css/${page.css}.css (required by ${page.slug})`);
    }
    const pageSource = read(path.join(SRC, 'pages', `${page.slug}.html`));
    const h1Count = (pageSource.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) {
      throw new Error(`src/pages/${page.slug}.html must contain exactly one h1, found ${h1Count}`);
    }
    const galleryItemTags = [...pageSource.matchAll(/<([a-z][\w:-]*)\b(?=[^>]*\bclass=(["'])[^"']*\bgallery-item\b[^"']*\2)[^>]*>/gi)];
    if (page.lightbox && !page.js.includes('lightbox')) {
      throw new Error(`${page.slug} has lightbox enabled but does not include src/js/lightbox.js`);
    }
    if (page.lightbox && !galleryItemTags.length) {
      throw new Error(`${page.slug} has lightbox enabled but no .gallery-item elements`);
    }
    if (!page.lightbox && galleryItemTags.length) {
      throw new Error(`${page.slug} has .gallery-item elements but lightbox is not enabled`);
    }
    for (const match of galleryItemTags) {
      const afterTag = pageSource.slice(match.index, match.index + 1200);
      const image = afterTag.match(/<img\b[^>]*>/i);
      if (!image || !attrValue(image[0], 'src') || !attrValue(image[0], 'alt')) {
        throw new Error(`${page.slug} gallery item is missing an image with src and alt`);
      }
    }
    const css = read(path.join(SRC, 'css', `${page.css}.css`));
    const viewportFontSize = css.match(/font-size\s*:[^;]*(?:vw|vh|vmin|vmax)[^;]*;/i);
    if (viewportFontSize) {
      throw new Error(`Viewport-based font-size is not allowed in src/css/${page.css}.css: ${viewportFontSize[0]}`);
    }
    for (const match of css.matchAll(/letter-spacing\s*:\s*([^;]+);/gi)) {
      const value = match[1].replace(/\s*!important/i, '').trim();
      if (value !== '0') {
        throw new Error(`letter-spacing must be 0 in src/css/${page.css}.css: ${match[0]}`);
      }
    }
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
  const cardSlugs = [...homeSource.matchAll(/<a\b(?=[^>]*\bclass=(["'])[^"']*\bproject-card\b[^"']*\1)[^>]*>/gi)]
    .map(match => htmlFileSlug(attrValue(match[0], 'href')))
    .filter(Boolean);
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
  const visited = [];
  let cursor = projectSlugs[0];
  for (let i = 0; i < projectSlugs.length + 1 && cursor; i++) {
    if (visited.includes(cursor)) break;
    visited.push(cursor);
    cursor = nextProject.get(cursor);
  }
  const missedByCycle = projectSlugs.filter(slug => !visited.includes(slug));
  if (missedByCycle.length || cursor !== projectSlugs[0]) {
    throw new Error(`Next-project links must form one complete cycle from ${projectSlugs[0]}. Missed: ${missedByCycle.join(', ') || 'none'}; ended at: ${cursor || 'missing'}`);
  }
  const staticOutNames = new Map();
  for (const entry of staticCopyEntries(cfg)) {
    if (!entry.file) throw new Error('staticCopy entry is missing file');
    if (!fs.existsSync(path.join(__dirname, entry.file))) {
      throw new Error(`Static copy not found: ${entry.file}`);
    }
    if (staticOutNames.has(entry.outName)) {
      throw new Error(`Duplicate staticCopy output "${entry.outName}" for ${staticOutNames.get(entry.outName)} and ${entry.file}`);
    }
    staticOutNames.set(entry.outName, entry.file);
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
      const outName = entry.outName;
      const dest = path.join(DIST, outName);
      if (fs.existsSync(src)) {
        if (entry.rewriteRootRelativeTo || entry.ensureIds || path.extname(entry.file).toLowerCase() === '.html') {
          let html = read(src);
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
        copiedStatic.push({ ...entry, outName });
        htmlOutputs.push(outName);
        console.log(`  → ${outName} (copied)`);
      } else {
        throw new Error(`Static copy not found: ${entry.file}`);
      }
    }
  }

  // Copy first-party assets referenced as assets/... in layouts.
  const copiedSrcAssets = copyDirContents(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
  console.log(`  → assets/ (${copiedSrcAssets} copied)`);

  // Generate sitemap.xml — lastmod follows content files, not every shared build/config change.
  const SITE_ORIGIN = new URL(config.pages[0].canonical).origin;
  const pageUrls = config.pages.map(p => {
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
    if (!fs.existsSync(src)) throw new Error(`Root asset not found: ${f}`);
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
  validateGeneratedHtml(htmlOutputs);
  console.log('  → generated HTML validated');

  const cnameHost = new URL(config.pages[0].canonical).hostname;
  if (cnameHost && !cnameHost.endsWith('.github.io')) {
    fs.writeFileSync(path.join(DIST, 'CNAME'), cnameHost + '\n', 'utf8');
    console.log('  → CNAME');
  }
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '', 'utf8');
  console.log('  → .nojekyll');
  validateSupportFiles(SITE_ORIGIN, copiedStatic);
  console.log('  → support files validated');

  enforceDistBudget();

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
