const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { outputFixture } = require('./helpers/output-fixture.cjs');
const { listRelativeFiles } = require('../scripts/build/output-files.cjs');
const baseline = require('./build-output-baseline.json');

function manifest(dist) {
  return Object.fromEntries(listRelativeFiles(dist).map(file => [
    file.replace(/\\/g, '/'),
    crypto.createHash('sha256').update(fs.readFileSync(path.join(dist, file))).digest('hex'),
  ]));
}

// Captured from the original builder at baseline.commit, then compared against
// the refactor in CI. The fixed hashes keep ordinary tests independent of Git
// history. Update only for an intentional output change, not to pass a refactor.
test('complete build preserves pre-refactor document and asset bytes', t => {
  const fixture = outputFixture(t);
  fixture.build.main();
  assert.deepEqual(manifest(path.join(fixture.root, 'dist')), baseline.files,
    `Output changed from ${baseline.commit}`);
});

test('repeated builds remain byte-identical and replace stale output', t => {
  const fixture = outputFixture(t);
  fixture.build.main();
  const before = manifest(path.join(fixture.root, 'dist'));
  fixture.write('dist/stale.txt', 'old output');
  fixture.build.main();
  assert.deepEqual(manifest(path.join(fixture.root, 'dist')), before);
});

test('a second build reads edited source rather than reusing cached text', t => {
  const fixture = outputFixture(t);
  fixture.build.main();
  fixture.write('src/css/fixture.css', '.fixture { color: blue; }');
  fixture.write('src/js/fixture.js', 'window.fixtureLoaded = "updated";');
  fixture.write('src/partials/colophon.html', '<footer>Updated footer</footer>');
  fixture.build.main();
  const dist = path.join(fixture.root, 'dist');
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, /Updated footer/);
  const css = html.match(/<link rel="stylesheet" href="([^"]+)"/)[1];
  const js = html.match(/<script src="([^"]+)"/)[1];
  assert.match(fs.readFileSync(path.join(dist, css), 'utf8'), /color: blue/);
  assert.match(fs.readFileSync(path.join(dist, js), 'utf8'), /"updated"/);
});
