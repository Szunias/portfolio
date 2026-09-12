/** Helpers for the repository's authored HTML, not a general-purpose HTML parser.
 * Keep entity decoding and browser-compatible base64 semantics consistent across
 * document transforms and validation. Attribute readers expect quoted values.
 */

const EMPTY_INLINE_SCRIPT_PATTERN = String.raw`<script\b(?![^>]*\ssrc\s*=)[^>]*>\s*<\/script>`;

/** Escape characters that break HTML attribute values. Order matters: & first. */
function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripTags(html) {
  return decodeHtmlAttr(html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function attrValue(tag, name) {
  // (?<![\w-]) keeps e.g. name="src" from matching data-src= (\b matches after "-").
  const match = tag.match(new RegExp(`(?<![\\w-])${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function hasAttr(attrs, name) {
  return new RegExp(`(?:^|\\s)${escapeRegExp(name)}(?=\\s|=|/?>|$)`, 'i').test(attrs);
}

function htmlFileSlug(href) {
  return href.replace(/[?#].*$/, '').replace(/\.html$/i, '');
}

function decodeHtmlAttr(value) {
  return String(value)
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (entity, hex, decimal) => {
      const codePoint = Number.parseInt(hex || decimal, hex ? 16 : 10);
      try { return String.fromCodePoint(codePoint); } catch (_) { return entity; }
    })
    .replace(/&(amp|quot|apos|lt|gt|nbsp|ndash|mdash|lsquo|rsquo|ldquo|rdquo|hellip|middot);/gi, (entity, name) => ({
      amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
      ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
      hellip: '…', middot: '·',
    })[name.toLowerCase()] || entity);
}

function decodeBase64Attr(value) {
  const raw = decodeHtmlAttr(value).trim();
  if (!raw) return '';
  try {
    // Match music-player.js: Buffer.from(base64) accepts corrupt encodings
    // that the browser rejects, and UTF-8 decoding changes atob's byte string.
    return atob(raw).trim();
  } catch (_) {
    return '';
  }
}

function collectFragmentTargets(html) {
  const ids = [...html.matchAll(/(?<![\w-])id=(["'])(.*?)\1/gi)].map(match => match[2]);
  return new Set(ids.concat(
    [...html.matchAll(/(?<![\w-])name=(["'])(.*?)\1/gi)].map(match => match[2])
  ));
}

function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch (_) {
    return fragment;
  }
}

module.exports = { EMPTY_INLINE_SCRIPT_PATTERN, escAttr, escapeRegExp, stripTags, attrValue, hasAttr, htmlFileSlug, decodeHtmlAttr, decodeBase64Attr, collectFragmentTargets, decodeFragment };
