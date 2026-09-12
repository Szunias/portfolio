const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { buildFixture } = require('./helpers/build-fixture.cjs');
const { createSiteMap, selectRoutes, normalizeFile } = require('../scripts/site-map.cjs');
const { inspect, parseArgs } = require('../scripts/inspect-site.cjs');
const { listRelativeFiles } = require('../scripts/build/output-files.cjs');

test('map includes shared partials and exact stylesheet/script loading order', t => {
  const f = buildFixture(t);
  const map = createSiteMap(f.config, f.root);
  const music = selectRoutes(map, { page: 'music' })[0];
  assert.deepEqual(music.css, ['src/css/_fonts.css', 'src/css/_tokens.css', 'src/css/_chrome.css', 'src/css/fixture.css']);
  assert.deepEqual(music.js, ['src/js/fixture.js']);
  assert.deepEqual(music.partials, ['src/partials/head.html', 'src/partials/site-header.html', 'src/partials/colophon.html', 'src/partials/player-bar.html']);
  assert.deepEqual(map.files['src/partials/player-bar.html'], ['/music.html']);
  assert.equal(map.files['src/partials/head.html'].length, 6);
  assert.deepEqual(map.unregistered, []);
  assert.deepEqual(map.missing, []);
});

test('inspector supports CSS string and standalone shorthand contracts', t => {
  const f = buildFixture(t);
  f.config.pages[0].css = 'fixture';
  f.config.staticCopy = ['snapshot.html', { file: 'aithesiscover.png' }];
  const map = createSiteMap(f.config, f.root);
  assert.equal(map.routes[0].css.at(-1), 'src/css/fixture.css');
  assert.equal(map.routes.at(-2).route, '/snapshot.html');
  assert.equal(map.routes.at(-1).route, '/aithesiscover.png');
});

test('reverse lookup normalizes paths and retains every owner', t => {
  const f = buildFixture(t);
  const map = createSiteMap(f.config, f.root);
  assert.equal(selectRoutes(map, { file: '.\\src\\css\\_tokens.css' }).length, 6);
  assert.equal(selectRoutes(map, { file: 'snapshot.html' })[0].route, '/notes/index.html');
  assert.equal(selectRoutes(map, { page: '/' })[0].slug, 'index');
  assert.equal(selectRoutes(map, { page: 'index.html' })[0].slug, 'index');
  assert.equal(selectRoutes(map, { page: '/music.html' })[0].slug, 'music');
  assert.equal(selectRoutes(map, { page: '/notes/index.html' })[0].kind, 'static');
});

test('unregistered partials and nested sources are visible; documentation is not runtime code', t => {
  const f = buildFixture(t);
  f.write('src/partials/unused.html', '<p>Not loaded</p>');
  f.write('src/js/unused/nested.js', '');
  f.write('src/js/README.md', '# Guide');
  const map = createSiteMap(f.config, f.root);
  assert.deepEqual(map.unregistered, ['src/js/unused/nested.js', 'src/partials/unused.html']);
  assert.deepEqual(selectRoutes(map, { file: 'src/partials/unused.html' }), []);
});

test('missing inputs are reported without creating or editing files', t => {
  const f = buildFixture(t);
  fs.unlinkSync(f.root + '/src/partials/colophon.html');
  const before = listRelativeFiles(f.root);
  const map = createSiteMap(f.config, f.root);
  assert.deepEqual(map.missing, ['src/partials/colophon.html']);
  assert.deepEqual(listRelativeFiles(f.root), before);
});

test('JSON preserves whole-site diagnostics and reverse index when filtering a page', t => {
  const f = buildFixture(t);
  f.write('src/partials/unused.html', '');
  const report = JSON.parse(inspect(['--page', '404', '--json'], { config: f.config, repoRoot: f.root }));
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.routes.length, 1);
  assert.equal(report.routes[0].noindex, true);
  assert.equal(report.files['src/css/_tokens.css'].length, 6);
  assert.deepEqual(report.unregistered, ['src/partials/unused.html']);
});

test('text output identifies standalone and noindex routes and shared inputs', t => {
  const f = buildFixture(t);
  const text = inspect([], { config: f.config, repoRoot: f.root });
  assert.match(text, /src\/partials\/head\.html/);
  assert.match(text, /\/404\.html \[noindex\]/);
  assert.match(text, /\/notes\/index\.html \[noindex\] \[standalone\]/);
  assert.match(text, /Missing inputs \(whole site\): none/);
});

test('help does not need valid site configuration or a source tree', () => {
  assert.match(inspect(['--help'], { config: null, repoRoot: '/not-a-repo' }), /Usage:/);
});

for (const args of [['--unknown'], ['--page'], ['--file', '--json'], ['--page', 'music', '--file', 'x'], ['--file', 'a', '--file', 'b']]) {
  test(`CLI rejects invalid arguments: ${args.join(' ')}`, () => assert.throws(() => parseArgs(args)));
}

test('unknown queries fail rather than quietly returning an empty map', t => {
  const f = buildFixture(t);
  const map = createSiteMap(f.config, f.root);
  assert.throws(() => selectRoutes(map, { page: 'not-a-page' }), /No configured route/);
  assert.throws(() => selectRoutes(map, { file: 'not-a-file' }), /No configured input/);
});

for (const file of ['../outside', '/etc/passwd', 'C:\\outside', '', '\0']) {
  test(`reject non-repository query path ${JSON.stringify(file)}`, () => assert.throws(() => normalizeFile(file)));
}
