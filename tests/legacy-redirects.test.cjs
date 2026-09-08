const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config.cjs');
const { buildFixture } = require('./helpers/build-fixture.cjs');

const root = path.resolve(__dirname, '..');
const redirects = config.staticCopy.filter(entry => entry.file.startsWith('src/static/redirects/'));
const byOutput = new Map(redirects.map(entry => [entry.outName, entry]));
const publicPages = new Map(config.pages.filter(page => !page.noindex && page.sitemap !== false)
  .map(page => [page.canonical, page]));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Parse only the authored, quoted tags in these small redirect documents.
function redirectUrls(html) {
  const refreshes = [...html.matchAll(/<meta\s+http-equiv="refresh"\s+content="([^"]+)">/g)];
  const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)">/g)];
  const links = [...html.matchAll(/<a\s+href="([^"]+)"/g)];
  assert.equal(refreshes.length, 1, 'exactly one refresh');
  assert.equal(canonicals.length, 1, 'exactly one canonical');
  assert.equal(links.length, 1, 'one usable fallback link');
  assert.match(refreshes[0][1], /^0; url=https:\/\//, 'instant, not delayed or JS-only');
  const target = refreshes[0][1].slice('0; url='.length);
  assert.equal(links[0][1], target, 'fallback and refresh must agree');
  const url = new URL(target);
  const canonical = new URL(canonicals[0][1]);
  assert.equal(url.origin, new URL(config.pages[0].canonical).origin);
  assert.equal(url.username + url.password + url.search, '');
  assert.equal(canonical.hash, '', 'canonical URLs must not contain fragments');
  assert.equal(canonical.href, url.origin + url.pathname);
  return { target, canonical: canonical.href, hash: url.hash };
}

for (const file of new Set(redirects.map(entry => entry.file))) {
  test(`legacy redirect reaches an indexable destination without JavaScript: ${file}`, () => {
    const html = read(file);
    const { canonical, hash } = redirectUrls(html);
    const page = publicPages.get(canonical);
    assert.ok(page, `unregistered or noindex destination: ${canonical}`);
    assert.doesNotMatch(html, /<script\b|noindex|nofollow/i);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="viewport"/);
    if (hash) {
      const source = read(`src/pages/${page.slug}.html`);
      assert.ok(source.includes(`id="${decodeURIComponent(hash.slice(1))}"`), `missing fragment ${hash}`);
    }
  });
}

test('old sitemap paths have explicit aliases or documented unchanged/removed destinations', () => {
  const oldSitemap = read('old/public/sitemap.xml');
  const unchanged = new Set(['/', '/music', '/contact']);
  // These removed tools have no equivalent live project. Do not send visitors
  // to an unrelated tool or blanket-redirect them to the homepage.
  const removed = new Set(['/projects/wwise_unreal_fixer', '/projects/unreal_engine_rebuilder']);
  for (const [, location] of oldSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pathname = new URL(location).pathname;
    if (unchanged.has(pathname) || removed.has(pathname)) continue;
    const base = pathname.slice(1);
    assert.ok(byOutput.has(`${base}.html`), pathname);
    assert.ok(byOutput.has(`${base}/index.html`), pathname);
    assert.equal(byOutput.get(`${base}.html`).file, byOutput.get(`${base}/index.html`).file);
  }
  assert.ok(byOutput.has('gradwork.html'), 'also retain the archived root-level research URL');
});

test('renamed projects map to their equivalent content, not an unrelated landing page', () => {
  const expected = {
    'projects/shadow_frames.html': '/shadowframes.html',
    'projects/not_today_darling.html': '/nottoday.html',
    'projects/transientica_audiolab.html': '/transientica.html',
    'projects/ray_animation.html': '/ray.html',
    'projects/sound-design.html': '/sounddesign.html',
    'projects/middleware-optimization.html': '/wwiseprojects.html',
    'projects/pause_and_deserve.html': '/pausedeserve.html',
    'projects/gradwork.html': '/ai-audio-research.html',
    'projects/richter.html': '/richter.html',
    'projects.html': '/#work',
    'about.html': '/#about',
  };
  const origin = new URL(config.pages[0].canonical).origin;
  for (const [oldPath, target] of Object.entries(expected)) {
    assert.equal(redirectUrls(read(byOutput.get(oldPath).file)).target, origin + target);
  }
});

test('redirects are crawlable, excluded from sitemap and cannot overwrite current pages', () => {
  assert.ok(redirects.length > 0);
  assert.equal(byOutput.size, redirects.length);
  const currentOutputs = new Set(config.pages.map(page => `${page.slug}.html`));
  for (const entry of redirects) {
    assert.equal(entry.sitemap, false);
    assert.notEqual(entry.noindex, true);
    assert.notEqual(entry.robotsDisallow, true);
    assert.equal(currentOutputs.has(entry.outName), false);
  }
  for (const file of fs.readdirSync(path.join(root, 'src/static/redirects'))) {
    if (file.endsWith('.html')) assert.ok(redirects.some(entry => entry.file === `src/static/redirects/${file}`), file);
  }
});

test('the real staged builder preserves redirect metadata and omits aliases from sitemap', t => {
  const fixture = buildFixture(t);
  const target = fixture.config.pages.find(page => page.slug === 'alpha').canonical;
  const html = read('src/static/redirects/richter.html')
    .replaceAll('https://igorszuniewicz.com/richter.html', target);
  fixture.write('legacy-richter.html', html);
  for (const outName of ['projects/richter.html', 'projects/richter/index.html']) {
    fixture.config.staticCopy.push({ file: 'legacy-richter.html', outName, sitemap: false });
  }
  fixture.build.main();
  for (const outName of ['projects/richter.html', 'projects/richter/index.html']) {
    const output = fs.readFileSync(path.join(fixture.root, 'dist', outName), 'utf8');
    assert.ok(output.includes(`content="0; url=${target}"`));
    assert.ok(output.includes(`<link rel="canonical" href="${target}">`));
    assert.ok(output.includes(`<a href="${target}">`));
    assert.doesNotMatch(output, /noindex|<script\b/);
  }
  const sitemap = fs.readFileSync(path.join(fixture.root, 'dist/sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes(`<loc>${target}</loc>`));
  assert.doesNotMatch(sitemap, /projects\/richter/);
  assert.equal(fs.existsSync(path.join(fixture.root, 'dist/projects/not-a-real-project.html')), false);
});
