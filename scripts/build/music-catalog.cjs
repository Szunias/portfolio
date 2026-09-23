/* Build-time track data; browser controllers continue to read #trackData.
   `title` is the key (selection, saved state, lock screen). The optional
   `name`, `note`, `about` and `page` fields are what the page, player bar and
   sheet display; `art-kind` classifies the cover art for the lock screen. */
const { escAttr } = require('./html-utils.cjs');

const FIELDS = ['title', 'name', 'note', 'about', 'page', 'artist', 'duration', 'year', 'kind', 'src-e',
  'thumb', 'art', 'art-size', 'art-kind', 'gradient'];
const REQUIRED = ['title', 'artist', 'duration', 'year', 'kind', 'src-e'];
const ARTWORK = ['thumb', 'art', 'art-size', 'gradient'];
// "genuine?" and "ai?" are covers Igor has not confirmed yet. Only a cover
// whose kind starts with "genuine" may be shown on a lock screen.
const ART_KINDS = ['genuine', 'genuine?', 'ai?', 'ai'];
// A film page on this site, linked as "Watch it with the film".
const PAGE = /^[a-z0-9-]+\.html$/;
const MARKER = '<!-- MUSIC_TRACKS -->';

function renderMusicCatalog(catalog, variant) {
  if (!Array.isArray(catalog.tracks) || !catalog.tracks.length) {
    throw new Error('Music catalog must contain tracks');
  }
  if (!catalog.artworkVariants || !Object.hasOwn(catalog.artworkVariants, variant)) {
    throw new Error(`Unknown music catalog artwork variant: ${variant}`);
  }
  const titles = new Set();
  for (const track of catalog.tracks) {
    if (!track || REQUIRED.some(field => typeof track[field] !== 'string' || !track[field].trim()) ||
        Object.entries(track).some(([field, value]) => !FIELDS.includes(field) || typeof value !== 'string')) {
      throw new Error('Music catalog records must contain supported string fields and required metadata');
    }
    if (titles.has(track.title)) throw new Error(`Duplicate music catalog title: ${track.title}`);
    if (track['art-kind'] !== undefined && !ART_KINDS.includes(track['art-kind'])) {
      throw new Error(`Unknown music art-kind for ${track.title}: ${track['art-kind']}`);
    }
    if (track.page !== undefined && !PAGE.test(track.page)) {
      throw new Error(`Music page link must name a local .html page: ${track.title}`);
    }
    titles.add(track.title);
  }
  const overrides = catalog.artworkVariants[variant];
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    throw new Error(`Invalid music catalog artwork variant: ${variant}`);
  }
  for (const [title, artwork] of Object.entries(overrides)) {
    if (!titles.has(title)) throw new Error(`Music artwork override refers to an unknown track: ${title}`);
    if (!artwork || typeof artwork !== 'object' || Array.isArray(artwork) ||
        Object.entries(artwork).some(([field, value]) => !ARTWORK.includes(field) || (value !== null && typeof value !== 'string'))) {
      throw new Error(`Music catalog overrides may only change artwork: ${title}`);
    }
  }
  return catalog.tracks.map(track => {
    const values = { ...track, ...(Object.hasOwn(overrides, track.title) ? overrides[track.title] : {}) };
    const attributes = FIELDS.filter(field => values[field] != null)
      .map(field => `data-${field}="${escAttr(values[field])}"`).join(' ');
    return `  <div class="track-card" ${attributes}></div>`;
  }).join('\n');
}

function injectMusicCatalog(content, catalog, variant) {
  if (content.split(MARKER).length !== 2) {
    throw new Error('Music catalog requires exactly one <!-- MUSIC_TRACKS --> marker');
  }
  return content.replace(MARKER, () => renderMusicCatalog(catalog, variant));
}

module.exports = { injectMusicCatalog, renderMusicCatalog };
