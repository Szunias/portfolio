const { test } = require('node:test');
const assert = require('node:assert/strict');
const { decodeBase64Attr } = require('../build.cjs');

// Exercise the decoder used by the real build, not a separate test copy.
for (const encoded of ['aW52YWxpZA===', '!!!!Y2xpcC5tcDM=', 'Y2xpcC5tcDM=!!', 'a', '____']) {
  test(`build rejects base64 that browser playback rejects: ${encoded}`, () => {
    assert.throws(() => atob(encoded));
    assert.equal(decodeBase64Attr(encoded), '');
  });
}

test('build accepts browser-compatible padded, unpadded and whitespace base64', () => {
  for (const encoded of ['Y2xpcC5tcDM=', 'Y2xpcC5tcDM', ' Y2xp\ncC5t\tcDM= ']) {
    assert.equal(decodeBase64Attr(encoded), 'clip.mp3');
    assert.equal(decodeBase64Attr(encoded), atob(encoded).trim());
  }
});

test('build source decoding preserves the same byte string as browser atob', () => {
  assert.equal(decodeBase64Attr('w6k='), atob('w6k='));
  assert.notEqual(decodeBase64Attr('w6k='), Buffer.from('w6k=', 'base64').toString('utf8'));
});

test('HTML character references are decoded before interpreting base64', () => {
  assert.equal(decodeBase64Attr('Y2xpcC5tcDM&#61;'), 'clip.mp3');
  assert.equal(decodeBase64Attr('Y2xpcC5tcDM&#x3d;'), 'clip.mp3');
});

test('empty and whitespace-only audio sources stay invalid', () => {
  for (const encoded of ['', ' \n\t ', 'ICAg', 'Cgk=']) {
    assert.equal(decodeBase64Attr(encoded), '');
  }
});
