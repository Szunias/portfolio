const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

function libraryFixture(selectors = {}) {
  const staticIndex = new Element();
  const mount = new Element();
  mount.append(staticIndex);
  const fixture = browser({ '#musicStaticIndex': [staticIndex], ...selectors });
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

test('the published archive stands finished pieces on spines and keeps sketches in a year notebook', () => {
  const spotify = new Element('a', { class: 'library__spotify' });
  const { library, mount, staticIndex } = libraryFixture({ '.library__spotify': [spotify] });
  mount.setAttribute('data-layout', 'spines');
  const tracks = [
    new Element('div', { 'data-title': 'Ray - Credits Theme', 'data-name': 'Ray', 'data-note': 'Credits theme',
      'data-kind': 'release', 'data-year': '2024', 'data-duration': '0:22', 'data-thumb': 'cover.webp' }),
    new Element('div', { 'data-title': 'Dated sketch', 'data-kind': 'sketch', 'data-year': '2026-01-04', 'data-duration': '0:25' }),
    new Element('div', { 'data-title': 'Older sketch', 'data-kind': 'sketch', 'data-year': '2025' }),
  ];
  const rows = library.build(mount, tracks, 'all');
  assert.equal(staticIndex.parentElement, null);
  assert.deepEqual(Array.from(rows, row => row.className), ['spine', 'sketch-row', 'sketch-row']);
  assert.deepEqual(Array.from(rows, row => row.dataset.catalogTrack), ['Ray - Credits Theme', 'Dated sketch', 'Older sketch']);
  assert.deepEqual(mount.querySelectorAll('h3').map(node => node.textContent), ['Finished', 'Sketches']);
  assert.deepEqual(mount.querySelectorAll('h4').map(node => node.textContent), ['2026', '2025']);
  assert.equal(spotify.parentElement, mount.querySelector('.library-group__head'), 'Spotify belongs to the finished pieces');
  assert.equal(rows[0].querySelector('.spine__title').textContent, 'Ray');
  assert.equal(rows[0].querySelector('.spine__note').textContent, 'Credits theme');
  assert.equal(rows[0].querySelector('.spine__year').textContent, '2024');
  assert.equal(rows[0].getAttribute('aria-label'), 'Play Ray, Credits theme, 2024, Finished');
  assert.equal(rows[1].querySelector('.sketch-row__date').textContent, '04 Jan');
  assert.equal(rows[1].querySelector('.sketch-row__name').textContent, 'Dated sketch');
  assert.equal(rows[1].querySelector('.library-row__detail'), null);
  assert.equal(rows[2].querySelector('time').textContent, '');
  assert.ok(rows.every(row => row.querySelector('.vu')), 'Every row carries a level meter');
  assert.equal(mount.querySelectorAll('img').length, 0);
  assert.equal(mount.querySelectorAll('.shelf-tile__art').length + mount.querySelectorAll('.library-row__art').length, 0,
    'The published archive paints no cover art');
});

test('track titles containing markup stay text and keep their accessible labels', () => {
  const { library, mount } = libraryFixture();
  const title = '<img src=x onerror=alert(1)> & "demo"';
  const rows = library.build(mount, [new Element('div', { 'data-title': title, 'data-kind': 'release', 'data-year': '2026' })], 'release');
  assert.equal(rows[0].querySelector('.shelf-tile__name').textContent, title);
  assert.equal(rows[0].dataset.catalogTrack, title);
  assert.equal(rows[0].getAttribute('aria-label'), 'Play ' + title + ', 2026, Finished');
  assert.equal(mount.querySelectorAll('img').length, 0);

  const spines = libraryFixture();
  spines.mount.setAttribute('data-layout', 'spines');
  const name = '<b onmouseover=alert(1)>Name</b> & "x"';
  const [spine] = spines.library.build(spines.mount, [new Element('div', {
    'data-title': title, 'data-name': name, 'data-note': '<i>note</i>', 'data-kind': 'release', 'data-year': '2026' })], 'all');
  assert.equal(spine.querySelector('.spine__title').textContent, name);
  assert.equal(spine.querySelector('.spine__note').textContent, '<i>note</i>');
  assert.equal(spine.dataset.catalogTrack, title, 'The catalogue title stays the key');
  assert.equal(spines.mount.querySelectorAll('img').length, 0);
});

test('a missing interactive mount leaves the static track index available', () => {
  const { library, mount, staticIndex } = libraryFixture();
  assert.equal(library.build(null, [], 'release').length, 0);
  assert.equal(staticIndex.parentElement, mount);
});
