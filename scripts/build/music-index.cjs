/* A no-JS track index built from the same metadata as the music player. */

// These are authored opening tags, not arbitrary HTML. Respect quotes so a
// literal > in a track title cannot terminate its <div> early.
const DIV_TAG = /<div\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
const ATTRIBUTE = /\s+([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function attributes(tag) {
  const values = new Map();
  for (const match of tag.matchAll(ATTRIBUTE)) {
    const name = match[1].toLowerCase();
    // HTML uses the first occurrence of a duplicated attribute.
    if (!values.has(name)) values.set(name, match[2] ?? match[3] ?? match[4] ?? '');
  }
  return values;
}

function textFromAttribute(value) {
  // Values already contain HTML character references. Keep those intact:
  // &lt; becomes text, not a new tag, and &amp; must not become &amp;amp;.
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectStaticTrackIndex(content) {
  const cards = [];
  content = content.replace(DIV_TAG, tag => {
    const values = attributes(tag);
    if (!(values.get('class') || '').split(/\s+/).includes('track-card')) return tag;
    cards.push(values);
    // Later build passes also scan markup. Keep metadata out of their tag
    // matching, without changing the attribute value a browser will read.
    return tag.replace(ATTRIBUTE, (match, name, double, single) => {
      if (!['data-title', 'data-year'].includes(name.toLowerCase())) return match;
      if (double === undefined && single === undefined) return match;
      const quote = double !== undefined ? '"' : "'";
      return ` ${name}=${quote}${textFromAttribute(double ?? single)}${quote}`;
    });
  });
  if (!cards.length) return content;

  const sketches = cards.filter(card => card.get('data-kind') === 'sketch').length;
  const counts = { all: cards.length, release: cards.length - sketches, sketch: sketches };
  content = content.replace(
    /(<button[^>]*\bdata-filter="(all|release|sketch)"[^>]*>[^<]*<span class="filter-chip__count">)\d*(<\/span>)/g,
    (_, open, filter, close) => `${open}${counts[filter]}${close}`
  );

  const items = cards.map(card => {
    const title = card.get('data-title');
    if (!title) return '';
    // A year is metadata, never markup. Do not slice a character reference.
    const year = (card.get('data-year') || '').match(/^\d{4}(?=-|$)/)?.[0] || '';
    return `<li>${textFromAttribute(title)}${year ? ` (${year})` : ''}</li>`;
  }).filter(Boolean).join('');
  if (!items) return content;
  const list = `<ol class="music-static-index" id="musicStaticIndex" aria-label="All tracks in the archive">${items}</ol>`;
  let inserted = false;
  content = content.replace(DIV_TAG, tag => {
    if (inserted || attributes(tag).get('id') !== 'musicLibrary') return tag;
    inserted = true;
    // A function replacement preserves literal $&, $1, $' and $` in titles.
    return tag + list;
  });
  if (!inserted) throw new Error('music: #musicLibrary container not found for the static track index');
  return content;
}

module.exports = { injectStaticTrackIndex };
