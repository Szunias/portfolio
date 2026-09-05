const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { createPreviewServer } = require('../scripts/serve-dist.cjs');

let server, root, origin;
before(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-preview-test-'));
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Preview</h1>');
  fs.writeFileSync(path.join(root, '404.html'), '<h1>Missing</h1>');
  fs.writeFileSync(path.join(root, 'clip.mp4'), '0123456789');
  server = createPreviewServer(root).listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
  for (const file of ['index.html', '404.html', 'clip.mp4']) fs.unlinkSync(path.join(root, file));
  fs.rmdirSync(root);
});

test('serves the entry point and extensionless HTML routes', async () => {
  for (const route of ['/', '/index?preview=1']) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '<h1>Preview</h1>');
  }
});
test('HEAD reports media size without streaming a body', async () => {
  const response = await fetch(origin + '/clip.mp4', { method: 'HEAD' });
  assert.equal(response.headers.get('content-length'), '10');
  assert.equal(response.headers.get('accept-ranges'), 'bytes');
  assert.equal(await response.text(), '');
});
test('media seeking supports bounded, open-ended and suffix ranges', async () => {
  for (const [range, expected, contentRange] of [
    ['bytes=2-5', '2345', 'bytes 2-5/10'], ['bytes=7-', '789', 'bytes 7-9/10'],
    ['bytes=-3', '789', 'bytes 7-9/10'], ['bytes=8-99', '89', 'bytes 8-9/10'],
  ]) {
    const response = await fetch(origin + '/clip.mp4', { headers: { Range: range } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-range'), contentRange);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(await response.text(), expected);
  }
});
test('invalid media ranges return 416', async () => {
  for (const range of ['bytes=20-', 'bytes=5-2', 'bytes=-0', 'bytes=-', 'bytes=0-2,4-6']) {
    const response = await fetch(origin + '/clip.mp4', { headers: { Range: range } });
    assert.equal(response.status, 416, range);
    assert.equal(response.headers.get('content-range'), 'bytes */10');
  }
});
test('missing paths serve the real 404 page', async () => {
  const response = await fetch(origin + '/missing.html');
  assert.equal(response.status, 404);
  assert.equal(await response.text(), '<h1>Missing</h1>');
});
test('bad encodings and NUL paths cannot crash the server', async () => {
  for (const route of ['/%E0%A4%A', '/%00']) assert.equal((await fetch(origin + route)).status, 400);
  assert.equal((await fetch(origin + '/')).status, 200);
});
test('encoded traversal cannot leave the preview root', async () => {
  assert.equal((await fetch(origin + '/%2e%2e%2foutside.txt')).status, 403);
});
test('unsupported request methods are rejected', async () => {
  assert.equal((await fetch(origin + '/', { method: 'POST' })).status, 405);
});
