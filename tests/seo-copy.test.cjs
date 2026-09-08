const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config.cjs');
const { schemaTags, structuredDataIssues } = require('../scripts/build/seo.cjs');

const readPage = slug => fs.readFileSync(path.join(__dirname, '../src/pages', `${slug}.html`), 'utf8');

test('public pages have distinct titles and descriptions', () => {
  const pages = config.pages.filter(page => !page.noindex && page.sitemap !== false);
  for (const field of ['title', 'description']) {
    const seen = new Set();
    for (const page of pages) {
      assert.ok(page[field].trim(), `${page.slug}: empty ${field}`);
      assert.equal(seen.has(page[field]), false, `${page.slug}: duplicate ${field}`);
      seen.add(page[field]);
    }
  }
});

test('homepage and contact describe freelance work in visible copy as well as metadata', () => {
  for (const slug of ['index', 'contact']) {
    const page = config.pages.find(entry => entry.slug === slug);
    const html = readPage(slug);
    assert.match(page.description, /freelance/i);
    assert.match(html, /<p(?:\s[^>]*)?>[^<]*freelance[^<]*<\/p>/i);
    assert.ok(html.includes('mailto:igorszuniewiczwork@gmail.com'));
    const schema = schemaTags(page, new URL(page.canonical).origin);
    assert.deepEqual(structuredDataIssues(schema, page, new URL(page.canonical).origin), []);
    const graph = JSON.parse(schema.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
    assert.equal(graph.find(node => node['@id'] === `${page.canonical}#webpage`).description, page.description);
  }
});

test('contact requests enough context without claiming a fixed response time or immediate availability', () => {
  const html = readPage('contact');
  assert.match(html, /project, scope and timeline/i);
  assert.match(html, /English or Polish/);
  assert.doesNotMatch(html, /reply within|response within|available immediately|guaranteed/i);
});
