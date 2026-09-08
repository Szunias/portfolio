const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');
const { outputFixture } = require('./helpers/output-fixture.cjs');
const { listRelativeFiles } = require('../scripts/build/output-files.cjs');
const ORIGINAL_COMMIT = 'b3e5aecefa956fa52f95617d52b399ca9b05662c';
const buildFile = path.resolve(__dirname, '../build.cjs');

function manifest(dist) {
  return Object.fromEntries(listRelativeFiles(dist).map(file => [
    file.replace(/\\/g, '/'),
    crypto.createHash('sha256').update(fs.readFileSync(path.join(dist, file))).digest('hex'),
  ]));
}

// Capture the baseline from the actual pre-refactor builder, never from the new
// implementation. This one-time comparison will be retained as fixed hashes.
test('complete build preserves pre-refactor document and asset bytes', t => {
  const fixture = outputFixture(t);
  const source = execFileSync('git', ['show', `${ORIGINAL_COMMIT}:build.cjs`], {
    cwd: path.dirname(buildFile), encoding: 'utf8', maxBuffer: 1024 * 1024,
  });
  const originalModule = { exports: {} };
  const realRequire = createRequire(buildFile);
  const localRequire = name => name === './site.config.cjs' ? fixture.config : realRequire(name);
  localRequire.main = {};
  vm.runInNewContext(source, {
    module: originalModule, require: localRequire, __dirname: fixture.root,
    __filename: buildFile, URL, Buffer, atob,
    process: { pid: process.pid, platform: process.platform, argv: ['node', buildFile] },
    console: { log() {}, warn() {}, error() {} },
  }, { filename: buildFile });
  originalModule.exports.main();
  const before = manifest(path.join(fixture.root, 'dist'));
  fixture.build.main();
  assert.deepEqual(manifest(path.join(fixture.root, 'dist')), before);
  t.diagnostic('BASELINE_MANIFEST:' + JSON.stringify({ commit: ORIGINAL_COMMIT, files: before }));
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
