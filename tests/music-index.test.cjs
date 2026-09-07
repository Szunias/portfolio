const { test } = require('node:test');
const assert = require('node:assert/strict');
const { injectStaticTrackIndex } = require('../scripts/build/music-index.cjs');

const page = title => `<div class="library__list" id="musicLibrary"></div><div id="trackData" hidden><div class="track-card" data-title="${title}" data-year="2026-09-08"></div></div>`;
const index = html => html.match(/<ol class="music-static-index"[^>]*>([\s\S]*?)<\/ol>/)[1];

for (const token of ['$&', '$1', "\u0024'", '$`', '$$']) {
  test(`track index preserves literal replacement sequence ${token}`, () => {
    const html = injectStaticTrackIndex(page(`Track ${token}`));
    assert.equal(index(html), `<li>Track ${token} (2026)</li>`);
    assert.equal((html.match(/id="musicLibrary"/g) || []).length, 1);
  });
}

test('literal HTML in metadata is escaped, including an unterminated tag', () => {
  for (const title of ['<svg onload=window.__audit=1//', '<em>Track</em>', 'A < B > C']) {
    assert.equal(index(injectStaticTrackIndex(page(title))), `<li>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')} (2026)</li>`);
  }
});

test('existing entities are not decoded twice or double-escaped', () => {
  for (const title of ['A &amp; B', '&lt;b&gt;Track&lt;/b&gt;', '&eacute; &#x1f3b5;', '&amp;lt;', '&#38;lt;']) {
    assert.equal(index(injectStaticTrackIndex(page(title))), `<li>${title} (2026)</li>`);
  }
});

test('single quotes, reordered attributes and additional classes preserve tracks', () => {
  const html = "<div id='musicLibrary' class='library__list'></div><div data-title='A > B' data-year='2024' class='extra track-card'></div>";
  assert.equal(index(injectStaticTrackIndex(html)), '<li>A &gt; B (2024)</li>');
});

test('filter counts come from actual release and sketch metadata', () => {
  const chips = ['all','release','sketch'].map(key => `<button data-filter="${key}">Filter<span class="filter-chip__count">99</span></button>`).join('');
  const html = page('First') + '<div class="track-card" data-kind="sketch" data-title="Second" data-year="2025"></div>' + chips;
  const result = injectStaticTrackIndex(html);
  for (const [key, count] of [['all',2],['release',1],['sketch',1]]) {
    assert.ok(result.includes(`data-filter="${key}">Filter<span class="filter-chip__count">${count}</span>`));
  }
});

test('malformed year metadata is not emitted as markup or a partial entity', () => {
  const html = page('Track').replace('2026-09-08', '&lt;svg');
  assert.equal(index(injectStaticTrackIndex(html)), '<li>Track</li>');
});

test('a missing mount point fails explicitly when tracks exist', () => {
  assert.throws(() => injectStaticTrackIndex('<div class="track-card" data-title="Track"></div>'), /musicLibrary/);
});

test('pages without tracks are unchanged', () => {
  const html = '<h1>Music</h1><div id="musicLibrary"></div>';
  assert.equal(injectStaticTrackIndex(html), html);
});
