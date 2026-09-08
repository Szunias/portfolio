const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

function libraryFixture() {
  const staticIndex = new Element();
  const mount = new Element();
  mount.append(staticIndex);
  const fixture = browser({ '#musicStaticIndex': [staticIndex] });
  fixture.run('music-library.js');
  const library = vm.runInNewContext('PortfolioMusicLibrary', fixture.context);
  return { library, mount, staticIndex };
}

test('the music library keeps finished pieces on the shelf and sketches grouped by year', () => {
  const { library, mount, staticIndex } = libraryFixture();
  const tracks = [
    new Element('div', { 'data-title': 'Finished piece', 'data-kind': 'release', 'data-year': '2026-08-12', 'data-duration': '2:30' }),
    new Element('div', { 'data-title': 'Dated sketch', 'data-kind': 'sketch', 'data-year': '2026-01-04', 'data-duration': '0:25' }),
    new Element('div', { 'data-title': 'Older sketch', 'data-kind': 'sketch', 'data-year': '2025' }),
  ];
  const rows = library.build(mount, tracks, 'all');
  assert.equal(staticIndex.parentElement, null);
  assert.deepEqual(Array.from(rows, row => row.dataset.catalogTrack), ['Finished piece', 'Dated sketch', 'Older sketch']);
  assert.equal(mount.querySelectorAll('.library-group--shelf').length, 1);
  assert.deepEqual(mount.querySelectorAll('h3').map(node => node.textContent), ['Finished', '2026', '2025']);
  assert.equal(rows[0].getAttribute('aria-label'), 'Play Finished piece, 12 Aug 2026, Finished');
  assert.equal(rows[1].querySelector('.library-row__detail').textContent, 'Sketch · 04 Jan');
  assert.equal(rows[1].querySelector('time').dateTime, '2026-01-04');
  assert.equal(rows[2].querySelector('time').textContent, '');
});

test('track titles containing markup stay text and keep their accessible labels', () => {
  const { library, mount } = libraryFixture();
  const title = '<img src=x onerror=alert(1)> & "demo"';
  const rows = library.build(mount, [new Element('div', { 'data-title': title, 'data-kind': 'release', 'data-year': '2026' })], 'release');
  assert.equal(rows[0].querySelector('.shelf-tile__name').textContent, title);
  assert.equal(rows[0].dataset.catalogTrack, title);
  assert.equal(rows[0].getAttribute('aria-label'), 'Play ' + title + ', 2026, Finished');
  assert.equal(mount.querySelectorAll('img').length, 0);
});

test('a missing interactive mount leaves the static track index available', () => {
  const { library, mount, staticIndex } = libraryFixture();
  assert.equal(library.build(null, [], 'release').length, 0);
  assert.equal(staticIndex.parentElement, mount);
});
