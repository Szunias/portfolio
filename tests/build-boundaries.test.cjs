const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildFixture } = require('./helpers/build-fixture.cjs');

function previousDist(fixture) {
  fixture.write('dist/previous.txt', 'last successful build');
}
function preserved(fixture) {
  assert.equal(fs.readFileSync(path.join(fixture.root, 'dist/previous.txt'), 'utf8'), 'last successful build');
}

test('importing the builder has no publication side effects', t => {
  const fixture = buildFixture(t);
  assert.equal(typeof fixture.build.buildPage, 'function');
  assert.equal(fs.existsSync(path.join(fixture.root, 'dist')), false);
  assert.deepEqual(fixture.logs, []);
});

test('404 scripts and styles resolve from the site root at any missing URL', t => {
  const {build,config} = buildFixture(t);
  const html = build.buildPage(config.pages.find(page => page.slug === '404'));
  const script = html.match(/<script src="([^"]+)"/)[1];
  const css = html.match(/<link rel="stylesheet" href="([^"]+)"/)[1];
  for (const url of ['https://portfolio.example/missing','https://portfolio.example/a/b/missing/']) {
    for (const asset of [script, css]) assert.match(new URL(asset, url).pathname, /^\/assets\//);
  }
});

test('ordinary pages keep relative browser asset URLs', t => {
  const {build,config} = buildFixture(t);
  const html = build.buildPage(config.pages[0]);
  assert.match(html, /<script src="assets\//);
  assert.match(html, /<link rel="stylesheet" href="assets\//);
});

test('the complete fixture build validates and publishes pages and static files', t => {
  const f = buildFixture(t);
  f.build.main();
  for (const file of ['index.html','404.html','music.html','notes/index.html','favicon.ico','sitemap.xml','robots.txt']) {
    assert.ok(fs.existsSync(path.join(f.root, 'dist', file)), file);
  }
  assert.match(f.logs.join('\n'), /generated HTML validated/);
});

test('check-only validates without replacing the previous output', t => {
  const f = buildFixture(t, {check:true});
  previousDist(f);
  f.build.main();
  preserved(f);
  assert.deepEqual(fs.readdirSync(path.join(f.root, 'dist')), ['previous.txt']);
  assert.equal(fs.readdirSync(f.root).some(name => name.startsWith('.dist-tmp-')), false);
});

test('staticCopy cannot publish a symlink to a file outside the repository', t => {
  const f = buildFixture(t);
  previousDist(f);
  const external = path.join(f.parent, 'private.html');
  fs.writeFileSync(external, '<p>private fixture canary</p>');
  fs.unlinkSync(path.join(f.root, 'snapshot.html'));
  fs.symlinkSync(external, path.join(f.root, 'snapshot.html'));
  assert.throws(() => f.build.main(), /symbolic link|outside the repository/);
  preserved(f);
});

test('staticCopy checks symlinked parent directories, not only the final file', t => {
  const f = buildFixture(t);
  previousDist(f);
  const external = path.join(f.parent, 'private');
  fs.mkdirSync(external);
  fs.writeFileSync(path.join(external, 'page.html'), '<p>private fixture canary</p>');
  fs.symlinkSync(external, path.join(f.root, 'linked'), 'junction');
  f.config.staticCopy[0].file = 'linked/page.html';
  assert.throws(() => f.build.main(), /outside the repository/);
  preserved(f);
});

test('the asset-tree root cannot be a symlink to an external directory', t => {
  const f = buildFixture(t);
  previousDist(f);
  fs.rmSync(path.join(f.root, 'src/assets'), {recursive:true});
  const external = path.join(f.parent, 'private');
  fs.mkdirSync(external);
  fs.writeFileSync(path.join(external, 'canary.txt'), 'private fixture canary');
  fs.writeFileSync(path.join(external, 'favicon-mark.ico'), 'fixture');
  fs.symlinkSync(external, path.join(f.root, 'src/assets'), 'junction');
  assert.throws(() => f.build.main(), /symbolic link|outside the repository/);
  preserved(f);
});

test('nested asset symlinks fail explicitly rather than being silently omitted', t => {
  const f = buildFixture(t);
  const real = f.write('src/assets/real.txt', 'safe fixture');
  fs.symlinkSync(real, path.join(f.root, 'src/assets/link.txt'));
  assert.throws(() => f.build.main(), /Unsupported source asset|symbolic link/);
});

test('normal nested assets are copied byte-for-byte', t => {
  const f = buildFixture(t);
  const bytes = Buffer.from([0, 1, 128, 255]);
  f.write('src/assets/nested/sample.bin', bytes);
  f.build.main();
  assert.deepEqual(fs.readFileSync(path.join(f.root, 'dist/assets/nested/sample.bin')), bytes);
});

test('non-file staticCopy sources fail before publication', t => {
  const f = buildFixture(t);
  previousDist(f);
  f.config.staticCopy[0].file = 'src/assets';
  assert.throws(() => f.build.main(), /must be a file/);
  preserved(f);
});

test('music metadata remains text through the complete page transformation pipeline', t => {
  const f = buildFixture(t);
  const title = '<details open ontoggle=window.__audit=1//';
  f.write('src/pages/music.html', `<h1>Music</h1><div class="library__list" id="musicLibrary"></div><div id="trackData" hidden><div class="track-card" data-title="${title}" data-year="2026"></div></div>`);
  const html = f.build.buildPage(f.config.pages.find(page => page.slug === 'music'));
  assert.doesNotMatch(html, /<details\b/);
  assert.match(html, /<li>&lt;details open ontoggle=window\.__audit=1\/\/ \(2026\)<\/li>/);
  assert.match(html, /data-title="&lt;details open ontoggle=window\.__audit=1\/\/"/);
});

test('Windows launcher uses the same dependency-free preview server', () => {
  const bat = fs.readFileSync(path.resolve(__dirname, '../serve.bat'), 'utf8');
  assert.doesNotMatch(bat, /\bnpx\b|\bhttp-server\b/);
  assert.match(bat, /call node scripts[\\/]serve-dist\.cjs/);
  assert.match(bat, /set "PORT=8080"/);
});

test('video descriptions reference the authored caption ID', t => {
  const f = buildFixture(t);
  f.write('src/pages/404.html', '<h1>Missing</h1><div><video controls></video></div><p class="video-caption" id="authored-caption">Caption</p>');
  const html = f.build.buildPage(f.config.pages.find(page => page.slug === '404'));
  assert.match(html, /<video aria-describedby="authored-caption"/);
  assert.equal((html.match(/id="authored-caption"/g) || []).length, 1);
});

test('generated video caption IDs do not collide with existing IDs', t => {
  const f = buildFixture(t);
  f.write('src/pages/404.html', '<h1 id="video-caption-1">Missing</h1><div><video controls></video></div><p class="video-caption">Caption</p>');
  const html = f.build.buildPage(f.config.pages.find(page => page.slug === '404'));
  assert.match(html, /<video aria-describedby="video-caption-2"/);
  assert.equal((html.match(/id="video-caption-1"/g) || []).length, 1);
  assert.equal((html.match(/id="video-caption-2"/g) || []).length, 1);
});
