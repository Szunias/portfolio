/** Markup enhancement passes. build.cjs owns their order and page/static scope.
 * Preserve that order: later passes consume attributes introduced by earlier ones.
 * Only video ratio reservation reads disk; its repository root is explicit.
 */
const fs = require('node:fs');
const path = require('node:path');
const { EMPTY_INLINE_SCRIPT_PATTERN, escAttr, escapeRegExp, stripTags,
  attrValue, hasAttr, decodeHtmlAttr } = require('./html-utils.cjs');

function videoLabelFromContext(prefix) {
  const headings = [...prefix.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)];
  if (headings.length) {
    const text = stripTags(headings[headings.length - 1][1]);
    if (text) return `Video: ${text}`;
  }
  return 'Project video';
}

function enhanceVideoAccessibility(html) {
  let counter = 0;
  const usedIds = new Set([...html.matchAll(/(?<![\w-])id=(["'])(.*?)\1/gi)]
    .map(match => decodeHtmlAttr(match[2])));
  let output = html.replace(
    /(<video\b(?=[^>]*\bcontrols\b)(?![^>]*\baria-describedby=)([^>]*)>[\s\S]*?<\/video>)(\s*<\/div>\s*<p\s+class="video-caption")([^>]*>)/gi,
    (match, videoHtml, attrs, captionStart, captionAttrs) => {
      const existingId = decodeHtmlAttr(attrValue(captionAttrs, 'id'));
      let id = existingId;
      if (!id) {
        do { id = `video-caption-${++counter}`; } while (usedIds.has(id));
        usedIds.add(id);
      }
      const describedVideo = videoHtml.replace(/<video\b/i, () => `<video aria-describedby="${escAttr(id)}"`);
      const describedCaptionStart = existingId
        ? captionStart
        : `${captionStart} id="${escAttr(id)}"`;
      const remainingAttrs = existingId ? captionAttrs : captionAttrs.replace(/\s+id=(["'])\1/i, '');
      return describedVideo + describedCaptionStart + remainingAttrs;
    }
  );

  output = output.replace(/<video\b(?=[^>]*\bcontrols\b)(?![^>]*\baria-label=)(?![^>]*\baria-labelledby=)(?![^>]*\baria-describedby=)([^>]*)>/gi, (match, attrs, offset) => {
    const context = output.slice(Math.max(0, offset - 2500), offset);
    return `<video aria-label="${escAttr(videoLabelFromContext(context))}"${attrs}>`;
  });

  return output;
}

function assertGalleryItemMarkup(html) {
  const stack = [];
  const tagPattern = /<\/?div\b[^>]*>/gi;
  let match;
  while ((match = tagPattern.exec(html))) {
    const tag = match[0];
    const isClosing = /^<\//.test(tag);
    if (isClosing) {
      stack.pop();
      continue;
    }

    const className = decodeHtmlAttr(attrValue(tag, 'class'));
    const isGalleryItem = /\bgallery-item\b/.test(className);
    const parentGalleryItem = stack.find(entry => entry.isGalleryItem);
    if (parentGalleryItem) {
      throw new Error(
        `gallery-item markup must not contain nested <div> elements; use span/figure-safe inline markup near offset ${match.index}`
      );
    }
    stack.push({ isGalleryItem });
  }
}

function enhanceGalleryItemLinks(html) {
  assertGalleryItemMarkup(html);
  return html.replace(/<div\b([^>]*\bclass=(["'])[^"']*\bgallery-item\b[^"']*\2[^>]*)>([\s\S]*?)<\/div>/gi, (match, attrs, quote, inner) => {
    const linkAttrs = attrs
      .replace(/\s+role=(["'])button\1/gi, '')
      .replace(/\s+tabindex=(["'])0\1/gi, '');
    const image = inner.match(/<img\b[^>]*>/i);
    const href = image ? attrValue(image[0], 'src') : '';
    if (!href) throw new Error('gallery-item is missing an image source');
    return `<a${linkAttrs} href="${escAttr(href)}">${inner}</a>`;
  });
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
  let imageIndex = 0;
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    let next = attrs;
    const isFirstImage = imageIndex === 0;
    imageIndex += 1;
    if (!hasAttr(next, 'alt')) next = ` alt=""${next}`;
    if (!hasAttr(next, 'decoding')) next = ` decoding="async"${next}`;
    if (!isFirstImage && !hasAttr(next, 'loading')) next = ` loading="lazy"${next}`;
    return `<img${next}>`;
  });
}

/* Preserve the authored image ratio when component CSS overrides the tile ratio.
   The stylesheet consumes --shot-ar to reserve space before lazy images load.
   Images without dimensions retain the per-component fallback. */
function reserveImageAspectRatio(html) {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    if (/--shot-ar\s*:/i.test(attrs)) return match;
    const width = Number(attrValue(match, 'width'));
    const height = Number(attrValue(match, 'height'));
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return match;
    // --shot-w caps small captures at their source width instead of upscaling.
    const ratio = `--shot-ar:${width}/${height};--shot-w:${width}px`;
    if (hasAttr(attrs, 'style')) {
      return `<img${attrs.replace(/\bstyle=(["'])([\s\S]*?)\1/i, (styleMatch, quote, value) => (
        `style=${quote}${ratio};${value}${quote}`
      ))}>`;
    }
    return `<img style="${ratio}"${attrs}>`;
  });
}

/* A click-to-load facade has no intrinsic ratio. Give it the poster's ratio
   so the preview does not crop or resize when the real player mounts. */
function reserveFacadeAspectRatio(html) {
  return html.replace(/<div\b([^>]*\bdata-yt-facade\b[^>]*)>([\s\S]*?)(<img\b[^>]*>)/gi, (match, attrs, between, img) => {
    if (/--shot-ar\s*:/i.test(attrs)) return match;
    // The first image after the opening tag has to still be inside the facade.
    if (/<\/div>|<div\b/i.test(between)) return match;
    const width = Number(attrValue(img, 'width'));
    const height = Number(attrValue(img, 'height'));
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return match;
    const ratio = `--shot-ar:${width}/${height}`;
    const nextAttrs = hasAttr(attrs, 'style')
      ? attrs.replace(/\bstyle=(["'])([\s\S]*?)\1/i, (styleMatch, quote, value) => (
        `style=${quote}${ratio};${value}${quote}`
      ))
      : ` style="${ratio}"${attrs}`;
    return `<div${nextAttrs}>${between}${img}`;
  });
}

/* Minimal header readers for the three raster formats posters use. Returns
   { width, height } or null when the file is missing or not recognised. */
function readImageSize(absPath) {
  let buf;
  try {
    buf = fs.readFileSync(absPath);
  } catch (_) {
    return null;
  }
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xff) { i++; continue; }
      // SOF0-SOF15 minus the non-frame markers DHT (C4), JPG (C8), DAC (CC).
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === 'VP8L') {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
      };
    }
    if (chunk === 'VP8X') {
      return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    }
  }
  return null;
}

/* Reserve video space from the local poster before metadata loads. Keep an
   explicitly authored ratio when video frame dimensions differ from its poster. */
function reserveVideoAspectRatio(html, repoRoot) {
  return html.replace(/<video\b([^>]*)>/gi, (match, attrs) => {
    if (/--shot-ar\s*:/i.test(attrs)) return match;
    const poster = attrValue(match, 'poster');
    if (!poster || /^(data:|https?:|\/\/)/i.test(poster)) return match;
    const size = readImageSize(path.join(repoRoot, poster.replace(/^\/+/, '').split('?')[0]));
    if (!size || !size.width || !size.height) return match;
    const ratio = `--shot-ar:${size.width}/${size.height}`;
    if (hasAttr(attrs, 'style')) {
      return `<video${attrs.replace(/\bstyle=(["'])([\s\S]*?)\1/i, (styleMatch, quote, value) => (
        `style=${quote}${ratio};${value}${quote}`
      ))}>`;
    }
    return `<video style="${ratio}"${attrs}>`;
  });
}

function enhanceDocumentBasics(html) {
  let output = html;
  output = output.replace(new RegExp(EMPTY_INLINE_SCRIPT_PATTERN, 'gi'), '');
  output = output.replace(/<html\b([^>]*)>/i, (match, attrs) => (
    hasAttr(attrs, 'lang') ? match : `<html lang="en"${attrs}>`
  ));
  if (!/<meta\b(?=[^>]*(?<![\w-])name=(["'])viewport\1)/i.test(output) && /<\/head>/i.test(output)) {
    output = output.replace(/<\/head>/i, '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>');
  }
  return output;
}

function sanitizeStaticSnapshot(html) {
  return html
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/\u2500/g, '-')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<form\b[\s\S]*?<\/form>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(["'])[\s\S]*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');
}

function enhanceInlineSvgAccessibility(html) {
  // Preserve an authored focusable attribute instead of duplicating it.
  return html.replace(/<svg\b(?![^>]*\baria-hidden=)(?![^>]*\brole=)([^>]*)>/gi, (match, attrs) => {
    const focusable = /\bfocusable=/i.test(attrs) ? '' : ' focusable="false"';
    return `<svg aria-hidden="true"${focusable}${attrs}>`;
  });
}

function neutralizeJavascriptHrefs(html) {
  if (!/\bhref=(["'])javascript:[^"']*\1/i.test(html)) return html;
  let output = html;
  if (!/(?<![\w-])id=(["'])top\1/i.test(output)) {
    output = output.replace(/<body\b[^>]*>/i, '$&\n<span id="top" hidden></span>');
  }
  return output.replace(/\bhref=(["'])javascript:[^"']*\1/gi, 'href="#top"');
}

function ensureNoindex(html) {
  const cleaned = html.replace(/<meta\b(?=[^>]*(?<![\w-])name=["']robots["'])[^>]*>\s*/gi, '');
  if (/<\/head>/i.test(html)) {
    return cleaned.replace(/<\/head>/i, '  <meta name="robots" content="noindex, nofollow">\n</head>');
  }
  return cleaned;
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
    const hasTarget = new RegExp(`(?<![\\w-])id=(["'])${escapeRegExp(id)}\\1`, 'i').test(output);
    if (!hasTarget) {
      output = output.replace(/<body\b([^>]*)>/i, `$&\n<div id="${escAttr(id)}" tabindex="-1"></div>`);
    }
  }
  return output;
}

module.exports = {
  enhanceVideoAccessibility, enhanceGalleryItemLinks, enhanceExternalLinkSafety,
  enhanceIframeAccessibility, enhanceImageAccessibility, reserveImageAspectRatio,
  reserveFacadeAspectRatio, reserveVideoAspectRatio, enhanceDocumentBasics,
  sanitizeStaticSnapshot, enhanceInlineSvgAccessibility, neutralizeJavascriptHrefs,
  ensureNoindex, rewriteRootRelativeUrls, ensureFragmentTargets,
};
