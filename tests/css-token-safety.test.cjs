const { test } = require('node:test');
const assert = require('node:assert/strict');
const { minifyCss, assertParsableJs } = require('../scripts/build/browser-assets.cjs');

for (const css of [String.raw`.a\> .b { color: red; }`, String.raw`.\31  .b { color: red; }`, String.raw`.x\; .y { color: red; }`, String.raw`.u\72l { color: red; }`]) {
  test(`unquoted CSS escapes are preserved: ${css}`, () => assert.equal(minifyCss(css), css));
}

test('comment-like text inside an unquoted URL is not removed', () => {
  const url = 'url(https://example.invalid/a/*keep*/b.png)';
  assert.ok(minifyCss(`.a { background-image: ${url}; }`).includes(url));
});

test('quoted URLs preserve content and spacing', () => {
  const url = 'url("assets/a  /* keep */b.png")';
  assert.ok(minifyCss(`.a { background-image: ${url}; }`).includes(url));
});

test('non-breaking spaces stay inside identifiers, not CSS combinators', () => {
  assert.match(minifyCss('.a\u00a0.b { color: red; }'), /^\.a\u00a0\.b\{/);
});

test('comments retain token boundaries without inventing descendant selectors', () => {
  assert.ok(minifyCss('.a/* keep compound */.b { color: red; }').includes('.a/**/.b'));
  assert.ok(minifyCss('.a/* keep separate tokens */b { color: red; }').includes('.a/**/b'));
});

test('custom-property blocks keep their inner semicolon', () => {
  assert.ok(minifyCss('.a { --tokens: {x;}; }').includes('{x;}'));
});

test('strings and math operators retain significant whitespace', () => {
  assert.ok(minifyCss('.a { content: "a  /* keep */  b"; }').includes('"a  /* keep */  b"'));
  assert.ok(minifyCss('.a { width: calc(100% - 40px); }').includes('calc(100% - 40px)'));
});

test('unfinished comments and complex URL syntax fall back to original input', () => {
  for (const css of ['.a { /* not closed', '.a { background: url(a(b)); }', '.a { background: url("abc)']) {
    assert.equal(minifyCss(css), css);
  }
});

test('ordinary styles still lose indentation and comment contents', () => {
  const css = '/* very long comment */\n.a {\n    color: red;\n}\n';
  assert.ok(minifyCss(css).length < css.length);
  assert.ok(!minifyCss(css).includes('very long comment'));
});

test('the classic-script syntax gate still rejects broken JavaScript', () => {
  assert.doesNotThrow(() => assertParsableJs('const x = `a\nb`;', 'valid.js'));
  assert.throws(() => assertParsableJs('const x = ;', 'invalid.js'), /invalid\.js/);
});
