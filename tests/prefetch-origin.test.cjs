const test = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

function fixture() {
  const env = browser();
  env.context.Element = Element;
  env.window.location = new URL('https://example.test/index.html');
  env.document.head = new Element('head');
  env.document.createElement = tag => {
    const element = new Element(tag);
    if (tag === 'link') element.relList = { supports: value => value === 'prefetch' };
    return element;
  };
  function anchor(href) {
    const link = new Element('a', { href });
    const url = new URL(href, env.window.location);
    Object.assign(link, { origin: url.origin, pathname: url.pathname, search: url.search, target: '' });
    link.matches = selector => selector === 'a[href]';
    return link;
  }
  env.run('prefetch.js');
  return { ...env, anchor };
}

for (const path of ['//other.test/project.html', '///other.test/', '//other.test/project.html?view=1']) {
  test(`prefetch does not reinterpret same-origin path ${path} as a foreign host`, async () => {
    const f = fixture();
    const target = f.anchor(f.window.location.origin + path);
    assert.equal(target.origin, f.window.location.origin);
    await f.document.emit('mouseover', { target });
    assert.equal(f.document.head.children.length, 0);
  });
}

test('ordinary local documents still prefetch once across hover and keyboard focus', async () => {
  const f = fixture();
  const target = f.anchor('/music.html?view=1#library');
  await f.document.emit('mouseover', { target });
  await f.document.emit('focusin', { target });
  assert.equal(f.document.head.children.length, 1);
  const url = new URL(f.document.head.children[0].href, f.window.location);
  assert.equal(url.href, 'https://example.test/music.html?view=1');
});
