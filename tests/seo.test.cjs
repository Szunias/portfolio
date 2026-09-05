const { test } = require('node:test');
const assert = require('node:assert/strict');
const { schemaTags, structuredDataIssues } = require('../scripts/build/seo.cjs');
const config = require('../site.config.cjs');

const origin = 'https://igorszuniewicz.com';
const page = slug => config.pages.find(entry => entry.slug === slug);
const graph = html => JSON.parse(html.match(/<script[^>]*>([\s\S]*)<\/script>/)[1])['@graph'];

test('homepage structured data identifies Igor rather than a featured game as its main entity', () => {
  const html = schemaTags(page('index'), origin);
  const profile = graph(html).find(node => node['@type'] === 'ProfilePage');
  assert.equal(profile.mainEntity['@id'], `${origin}/#igor`);
  assert.equal(profile.url, `${origin}/`);
  assert.deepEqual(structuredDataIssues(html, page('index'), origin), []);
});

test('team game credit is contribution, with a separate canonical portfolio page', () => {
  const html = schemaTags(page('shadowframes'), origin);
  const nodes = graph(html);
  const game = nodes.find(node => node['@type'] === 'VideoGame');
  const webPage = nodes.find(node => node['@type'] === 'WebPage');
  assert.equal(game.contributor['@id'], `${origin}/#igor`);
  assert.equal(game.author, undefined);
  assert.equal(game.mainEntityOfPage['@id'], webPage['@id']);
  assert.equal(webPage.breadcrumb['@id'], `${origin}/shadowframes.html#breadcrumb`);
  assert.deepEqual(structuredDataIssues(html, page('shadowframes'), origin), []);
});

test('review layouts and errors publish no structured data', () => {
  for (const entry of config.pages.filter(entry => entry.noindex)) {
    assert.equal(schemaTags(entry, origin), '', entry.slug);
  }
});

test('missing structured data and a canonical mismatch fail validation', () => {
  const entry = page('contact');
  assert.ok(structuredDataIssues('<html></html>', entry, origin).length);
  const html = schemaTags(entry, origin).replace('"url": "https://igorszuniewicz.com/contact.html"', '"url": "https://example.com/wrong"');
  assert.match(structuredDataIssues(html, entry, origin).join('\n'), /canonical URL/);
});

test('wrong team attribution is rejected even if the rest of the graph is valid', () => {
  const entry = page('shadowframes');
  const html = schemaTags(entry, origin).replace('"contributor":', '"author":');
  assert.match(structuredDataIssues(html, entry, origin).join('\n'), /project credit/);
});

test('JSON-LD safely preserves names containing markup without closing its script', () => {
  const name = 'An </script><script>example & "title"';
  const html = schemaTags({ ...page('index'), title: name, ogTitle: name }, origin);
  assert.equal((html.match(/<\/script>/g) || []).length, 1);
  assert.equal(graph(html).find(node => node['@type'] === 'ProfilePage').name, name);
});

test('historical CV addresses use the current PDF and stay out of the sitemap', () => {
  for (const address of ['old/public/cv/Igor_Szuniewicz_CV.pdf', 'cv/Igor_Szuniewicz_CV.pdf']) {
    const alias = config.staticCopy.find(entry => entry.outName === address);
    assert.equal(alias?.file, 'Igor_Szuniewicz_CV.pdf', address);
    assert.equal(alias.sitemap, false, address);
  }
});
