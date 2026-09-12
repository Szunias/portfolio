const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createSiteMap, selectRoutes } = require('../scripts/site-map.cjs');

// The inspector only needs input names. Do not pull the build/media pipeline
// into these tests of read-only discovery and reverse lookup.
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-map-scope-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const config = {
    pages: [{ slug: 'index', layout: 'home', css: ['theme'], js: ['page-motion'] }],
    staticCopy: [{ file: 'snapshot.html', outName: 'notes/index.html' }],
  };
  function write(file, content = '') {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  for (const file of [
    'src/pages/index.html', 'src/layouts/home.html', 'src/partials/head.html',
    'src/partials/site-header.html', 'src/partials/colophon.html',
    'src/css/_fonts.css', 'src/css/_tokens.css', 'src/css/_chrome.css',
    'src/css/theme.css', 'src/js/page-motion.js', 'snapshot.html',
  ]) write(file);
  return { root, config, write, map: () => createSiteMap(config, root) };
}

test('inspector exposes unregistered root HTML alongside unused src inputs', t => {
  const f = fixture(t);
  f.write('music-preview.html', '<p>Study, not a registered page</p>');
  f.write('concept-a.html', '<p>Study</p>');
  f.write('src/js/unused/nested.js');
  const map = f.map();
  assert.deepEqual(map.unregistered, ['concept-a.html', 'music-preview.html', 'src/js/unused/nested.js']);
  assert.deepEqual(map.missing, []);
});

test('a root HTML study is a known unregistered input, not a missing file', t => {
  const f = fixture(t);
  f.write('music-preview.html');
  assert.deepEqual(selectRoutes(f.map(), { file: './music-preview.html' }), []);
});

test('root discovery neither registers studies nor crawls legacy applications', t => {
  const f = fixture(t);
  f.write('concept-a.html');
  f.write('old/public/index.html');
  f.write('archive/copy.html');
  f.write('node_modules/package/example.html');
  f.write('src/cv/example.html');
  f.write('build.cjs');
  f.write('README.md');
  const map = f.map();
  assert.deepEqual(map.unregistered, ['concept-a.html']);
  assert.deepEqual(map.routes.map(route => route.route), ['/', '/notes/index.html']);
  assert.equal(fs.readFileSync(path.join(f.root, 'concept-a.html'), 'utf8'), '');
});

test('explicit root standalone inputs retain their owners and are not listed as unregistered', t => {
  const f = fixture(t);
  const map = f.map();
  assert.deepEqual(map.unregistered, []);
  assert.deepEqual(selectRoutes(map, { file: 'snapshot.html' }).map(route => route.route), ['/notes/index.html']);
});

for (const name of ['constructor', 'hasOwnProperty', 'propertyIsEnumerable', '__defineGetter__', '__defineSetter__']) {
  test('inherited object member is not a configured source: ' + name, t => {
    const f = fixture(t);
    assert.throws(() => selectRoutes(f.map(), { file: name }), {
      name: 'Error', message: 'No configured input or unregistered source matches ' + name,
    });
  });
}

for (const name of ['constructor', '__proto__']) {
  test('an explicitly registered file can use an object-member name: ' + name, t => {
    const f = fixture(t);
    f.write(name);
    f.config.staticCopy.push({ file: name, outName: 'special.html' });
    const map = f.map();
    assert.ok(Object.hasOwn(map.files, name));
    assert.deepEqual(selectRoutes(map, { file: name }).map(route => route.route), ['/special.html']);
    // The JSON form must carry the same own-property lookup semantics.
    assert.deepEqual(selectRoutes(JSON.parse(JSON.stringify(map)), { file: name }).map(route => route.route), ['/special.html']);
  });
}

test('a missing source tree remains a diagnostic rather than a discovery crash', t => {
  const f = fixture(t);
  const map = createSiteMap(f.config, path.join(f.root, 'missing'));
  assert.deepEqual(map.unregistered, []);
  assert.ok(map.missing.includes('src/pages/index.html'));
});
