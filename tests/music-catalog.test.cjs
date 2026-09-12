const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { injectMusicCatalog, renderMusicCatalog } = require('../scripts/build/music-catalog.cjs');
const { createSiteMap, selectRoutes } = require('../scripts/site-map.cjs');
const { buildFixture } = require('./helpers/build-fixture.cjs');
const config = require('../site.config.cjs');
const catalog = require('../src/data/music-tracks.json');

function sample() {
  return {
    tracks: [{ title: 'A < B & "C" $&', artist: 'Artist', duration: '0:02', year: '2026-09-12',
      kind: 'release', 'src-e': btoa('assets/tone.wav'), thumb: 'assets/cover.webp', gradient: 'black' }],
    artworkVariants: { default: {}, review: { 'A < B & "C" $&': { thumb: null, gradient: 'gray' } } },
  };
}

test('catalog escaping preserves literal metadata and artwork-only variants', () => {
  const data = sample();
  const original = structuredClone(data);
  const normal = injectMusicCatalog('before\n<!-- MUSIC_TRACKS -->\nafter', data, 'default');
  assert.match(normal, /data-title="A &lt; B &amp; &quot;C&quot; \$&amp;"/);
  assert.match(normal, /data-thumb="assets\/cover.webp"/);
  assert.ok(normal.endsWith('\nafter'));
  const review = renderMusicCatalog(data, 'review');
  assert.doesNotMatch(review, /data-thumb/);
  assert.match(review, /data-gradient="gray"/);
  assert.deepEqual(data, original, 'Rendering a review must not mutate the next page’s catalog');
});

test('all music pages consume shared data and preserve their explicit artwork variants', () => {
  const root = path.resolve(__dirname, '..');
  const map = createSiteMap(config, root);
  const routes = selectRoutes(map, { file: 'src/data/music-tracks.json' });
  const music = config.pages.filter(page => page.layout === 'music');
  assert.deepEqual(routes.map(route => route.slug), music.map(page => page.slug));
  for (const page of music) {
    const source = fs.readFileSync(path.join(root, 'src/pages', page.slug + '.html'), 'utf8');
    assert.doesNotMatch(source, /class="track-card"/, 'Track records must not be duplicated in page sources');
    const rendered = injectMusicCatalog(source, catalog, page.musicCatalog);
    assert.equal((rendered.match(/class="track-card"/g) || []).length, catalog.tracks.length);
    const before = source.match(/data-featured-track="[^"]*"/g);
    assert.deepEqual(rendered.match(/data-featured-track="[^"]*"/g), before);
  }
  const normal = renderMusicCatalog(catalog, 'default');
  const review = renderMusicCatalog(catalog, 'review');
  assert.match(normal, /data-thumb="[^"]*ElectronicSketch.webp"/);
  assert.match(normal, /data-thumb="[^"]*MissYouCover.webp"/);
  assert.doesNotMatch(review, /data-thumb="[^"]*(ElectronicSketch|MissYouCover).webp"/);
});

test('build expands the catalog before static indexing and media discovery, and rereads edits', t => {
  const f = buildFixture(t);
  const music = f.config.pages.find(page => page.slug === 'music');
  music.musicCatalog = 'default';
  const data = sample();
  f.write('src/data/music-tracks.json', JSON.stringify(data));
  f.write('src/assets/tone.wav', 'audio fixture');
  f.write('src/assets/cover.webp', 'image fixture');
  f.write('src/pages/music.html', '<h1>Music</h1><div id="musicLibrary"></div><div id="trackData" hidden><!-- MUSIC_TRACKS --></div>');
  f.build.main();
  const html = fs.readFileSync(path.join(f.root, 'dist/music.html'), 'utf8');
  assert.match(html, /<li>A &lt; B &amp; &quot;C&quot; \$&amp; \(2026\)<\/li>/);
  assert.ok(fs.existsSync(path.join(f.root, 'dist/assets/tone.wav')));
  assert.doesNotMatch(html, /MUSIC_TRACKS/);
  data.tracks[0].title = 'Edited track';
  f.write('src/data/music-tracks.json', JSON.stringify(data));
  f.build.main();
  assert.match(fs.readFileSync(path.join(f.root, 'dist/music.html'), 'utf8'), /<li>Edited track \(2026\)<\/li>/);
  fs.unlinkSync(path.join(f.root, 'src/assets/tone.wav'));
  assert.throws(() => f.build.main(), /Missing local asset|not found|ENOENT/);
});

test('catalog rejects duplicate titles, broken variants and misplaced markers', () => {
  const data = sample();
  assert.throws(() => renderMusicCatalog(data, 'typo'), /Unknown music catalog/);
  assert.throws(() => renderMusicCatalog(data, 'toString'), /Unknown music catalog/);
  assert.throws(() => injectMusicCatalog('no marker', data, 'default'), /exactly one/);
  assert.throws(() => injectMusicCatalog('<!-- MUSIC_TRACKS --><!-- MUSIC_TRACKS -->', data, 'default'), /exactly one/);
  data.tracks.push({ ...data.tracks[0] });
  assert.throws(() => renderMusicCatalog(data, 'default'), /Duplicate music catalog title/);
  data.tracks.pop();
  data.artworkVariants.review.Unknown = { thumb: null };
  assert.throws(() => renderMusicCatalog(data, 'review'), /unknown track/);
  delete data.artworkVariants.review.Unknown;
  data.artworkVariants.review[data.tracks[0].title].title = 'Different title';
  assert.throws(() => renderMusicCatalog(data, 'review'), /only change artwork/);
});

test('inspector reports missing and unregistered catalog data', t => {
  const f = buildFixture(t);
  f.config.pages.find(page => page.slug === 'music').musicCatalog = 'default';
  f.write('src/data/unused.json', '{}');
  const map = createSiteMap(f.config, f.root);
  assert.deepEqual(map.missing, ['src/data/music-tracks.json']);
  assert.deepEqual(map.unregistered, ['src/data/unused.json']);
});
