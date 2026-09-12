/** Validate emitted documents and support files without modifying them.
 * Source/configuration checks remain in build.cjs. These checks run only after
 * every referenced asset has been copied into the staged output directory.
 */
const fs = require('node:fs');
const path = require('node:path');
const { read } = require('./output-files.cjs');
const { structuredDataIssues } = require('./seo.cjs');
const { EMPTY_INLINE_SCRIPT_PATTERN, escapeRegExp, stripTags, attrValue,
  hasAttr, decodeHtmlAttr, decodeBase64Attr, collectFragmentTargets,
  decodeFragment } = require('./html-utils.cjs');

function validateGeneratedHtml(htmlFiles, { dist, config }) {
  const issues = [];
  const htmlFileSet = new Set(htmlFiles);
  const pageByFile = new Map(config.pages.map(page => [`${page.slug}.html`, page]));
  const htmlByFile = new Map(htmlFiles.map(file => [file, read(path.join(dist, file))]));
  const fragmentTargetsByFile = new Map(
    [...htmlByFile.entries()].map(([file, html]) => [file, collectFragmentTargets(html)])
  );
  for (const file of htmlFiles) {
    const html = htmlByFile.get(file);
    if (!/<html\b[^>]*\blang=(["'])[^"']+\1/i.test(html)) issues.push(`${file}: html missing lang`);
    if (!/<meta\b(?=[^>]*(?<![\w-])name=(["'])viewport\1)/i.test(html)) issues.push(`${file}: missing viewport meta`);
    if (new RegExp(EMPTY_INLINE_SCRIPT_PATTERN, 'i').test(html)) issues.push(`${file}: empty inline script block`);
    if (/<!--\s*(?:TITLE|DESCRIPTION|CANONICAL|OG_TAGS|CSS|CONTENT|JS|SCHEMA|PLAYER|LIGHTBOX|FOOTER)\s*-->/.test(html)) {
      issues.push(`${file}: unresolved build placeholder`);
    }
    for (const issue of structuredDataIssues(html, pageByFile.get(file), new URL(config.pages[0].canonical).origin)) {
      issues.push(`${file}: ${issue}`);
    }
    const ids = [...html.matchAll(/(?<![\w-])id=(["'])(.*?)\1/gi)].map(match => match[2]);
    const fragmentTargets = fragmentTargetsByFile.get(file);
    const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicateId) issues.push(`${file}: duplicate id "${duplicateId}"`);
    const isNoindex = /<meta\b(?=[^>]*(?<![\w-])name=(["'])robots\1)(?=[^>]*\bcontent=(["'])[^"']*\bnoindex\b[^"']*\2)/i.test(html);
    const pageConfig = pageByFile.get(file);

    if (pageConfig) {
      if (Boolean(pageConfig.noindex) !== isNoindex) {
        issues.push(`${file}: robots directive does not match site.config.cjs`);
      }
      const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(match => stripTags(match[1]));
      if (titles.length !== 1 || !titles[0]) issues.push(`${file}: expected exactly one non-empty title`);
      const descriptions = [...html.matchAll(/<meta\b(?=[^>]*(?<![\w-])name=(["'])description\1)[^>]*>/gi)];
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

    if (pageConfig || !isNoindex) {
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
      if ((pageConfig || !isNoindex) && /^http:\/\//i.test(value)) issues.push(`${file}: insecure http URL ${value}`);
    }
    for (const match of html.matchAll(/\bdata-src-e=["']([^"']+)["']/gi)) {
      const value = decodeBase64Attr(match[1]).trim();
      if (!value) issues.push(`${file}: invalid data-src-e value`);
      if (/^javascript:/i.test(value)) issues.push(`${file}: disallowed encoded javascript: URL`);
      if ((pageConfig || !isNoindex) && /^http:\/\//i.test(value)) issues.push(`${file}: insecure encoded http URL ${value}`);
    }

    for (const match of html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)) {
      const href = decodeHtmlAttr(match[2]).trim();
      if (href === '#') {
        issues.push(`${file}: placeholder href="#"`);
        continue;
      }
      if (/^(https?:|mailto:|tel:|data:|feed:)/i.test(href) || href.startsWith('//')) continue;
      const localPath = href.split('#')[0].split('?')[0];
      const localFile = localPath === '/'
        ? 'index.html'
        : localPath.replace(/^\/+/, '');
      const hash = href.includes('#') ? href.split('#')[1] : '';
      if (localFile.endsWith('.html') && !htmlFileSet.has(localFile)) {
        issues.push(`${file}: broken local page link ${href}`);
      }
      if (hash) {
        const targetId = decodeFragment(hash);
        if ((!localFile || localFile === file) && !fragmentTargets.has(targetId)) {
          issues.push(`${file}: missing same-page fragment ${href}`);
        } else if (localFile.endsWith('.html') && htmlFileSet.has(localFile)) {
          const targetFragments = fragmentTargetsByFile.get(localFile);
          if (targetFragments && !targetFragments.has(targetId)) {
            issues.push(`${file}: missing cross-page fragment ${href}`);
          }
        }
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
      if (!/\btype=(["'])(?:button|submit|reset)\1/i.test(tag)) {
        issues.push(`${file}: button missing explicit type`);
      }
      if (!text && !/\baria-label=(["'])[^"']+\1/i.test(tag) && !/\btitle=(["'])[^"']+\1/i.test(tag)) {
        issues.push(`${file}: button missing accessible name`);
      }
    }

    if (pageConfig || !isNoindex) {
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
    }

    for (const match of html.matchAll(/<audio\b[^>]*>/gi)) {
      const tag = match[0];
      // The music player selects a source from validated data-src-e track data.
      const managedByMusicPlayer = hasAttr(tag, 'data-music-audio') &&
        pageConfig?.layout === 'music' && pageConfig.js.includes('music-player') && !hasAttr(tag, 'controls');
      if (!attrValue(tag, 'src') && !managedByMusicPlayer) issues.push(`${file}: audio element missing src`);
      if (!/\bpreload=(["'])none\1/i.test(tag)) issues.push(`${file}: audio element must use preload="none"`);
    }
  }

  if (issues.length) {
    throw new Error(`Generated HTML validation failed:\n  - ${issues.slice(0, 30).join('\n  - ')}${issues.length > 30 ? `\n  ...and ${issues.length - 30} more` : ''}`);
  }
}

function validateSupportFiles(siteOrigin, copiedStatic, { dist, config }) {
  const issues = [];
  const sitemapPath = path.join(dist, 'sitemap.xml');
  const robotsPath = path.join(dist, 'robots.txt');
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
  const expectedLocs = config.pages
    .filter(page => page.sitemap !== false && !page.noindex)
    .map(page => page.canonical)
    .concat(
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

  if (robots && !new RegExp(`^Sitemap:\\s*${escapeRegExp(siteOrigin)}\\/sitemap\\.xml\\s*$`, 'm').test(robots)) {
    issues.push('robots.txt missing canonical sitemap URL');
  }

  const cnameHost = new URL(config.pages[0].canonical).hostname;
  const cnamePath = path.join(dist, 'CNAME');
  if (cnameHost && !cnameHost.endsWith('.github.io')) {
    const cname = fs.existsSync(cnamePath) ? read(cnamePath).trim() : '';
    if (cname !== cnameHost) issues.push(`CNAME mismatch: expected ${cnameHost}, got ${cname || 'missing'}`);
  }

  if (issues.length) {
    throw new Error(`Support file validation failed:\n  - ${issues.join('\n  - ')}`);
  }
}

module.exports = { validateGeneratedHtml, validateSupportFiles };
