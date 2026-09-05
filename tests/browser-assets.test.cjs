const { test } = require('node:test');
const assert = require('node:assert/strict');
const { minifyCss, assertParsableJs } = require('../scripts/build/browser-assets.cjs');

test('CSS strings preserve spaces and comment-like text', () => {
  const result = minifyCss('/* remove */ .label { content: "a  /* keep */  b"; }');
  assert.ok(result.includes('"a  /* keep */  b"'));
  assert.ok(!result.includes('remove'));
});
test('CSS calculation operators retain required whitespace', () => {
  const result = minifyCss('.hero { width: calc(100% - 40px); transform: translateX(calc(1px + 2vw)); }');
  assert.ok(result.includes('calc(100% - 40px)'));
  assert.ok(result.includes('calc(1px + 2vw)'));
});
test('classic scripts accept multiline literals', () => {
  assert.doesNotThrow(() => assertParsableJs('const label = `first\n  indented\n\nlast`;', 'fixture.js'));
});
test('invalid classic scripts fail with the responsible filename', () => {
  assert.throws(() => assertParsableJs('const value = ;', 'broken.js'), /broken\.js/);
  assert.throws(() => assertParsableJs('export const value = 1;', 'module.js'), /module\.js/);
});
