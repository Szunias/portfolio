const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { createPreviewServer } = require('../scripts/serve-dist.cjs');

async function fixture(t, setup = () => {}) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-path-test-'));
  let server;
  t.after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    fs.rmSync(parent, { recursive: true, force: true });
  });
  const root = path.join(parent, 'dist');
  const outside = path.join(parent, 'outside');
  fs.mkdirSync(root);
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(root, 'index.html'), 'inside');
  fs.writeFileSync(path.join(root, '404.html'), 'missing');
  fs.writeFileSync(path.join(root, 'clip.mp4'), '0123456789');
  fs.writeFileSync(path.join(outside, 'secret.html'), 'outside-preview-root');
  try { setup({ root, outside, parent }); }
  catch (error) {
    if (process.platform === 'win32' && error.code === 'EPERM') {
      t.skip('Creating symlinks requires Windows Developer Mode or elevated permissions');
      return null;
    }
    throw error;
  }
  server = createPreviewServer(root).listen(0, '127.0.0.1');
  await once(server, 'listening');
  return `http://127.0.0.1:${server.address().port}`;
}

test('GET and HEAD cannot follow a file symlink outside the preview root', async t => {
  const origin = await fixture(t, ({ root, outside }) => {
    fs.symlinkSync(path.join(outside, 'secret.html'), path.join(root, 'leak.html'));
  });
  if (!origin) return;
  for (const method of ['GET', 'HEAD']) {
    const response = await fetch(origin + '/leak.html', { method });
    assert.equal(response.status, 403);
    assert.ok(!(await response.text()).includes('outside-preview-root'));
  }
});

test('extensionless HTML aliases cannot follow an external symlink', async t => {
  const origin = await fixture(t, ({ root, outside }) => {
    fs.symlinkSync(path.join(outside, 'secret.html'), path.join(root, 'leak.html'));
  });
  if (!origin) return;
  assert.equal((await fetch(origin + '/leak')).status, 403);
});

test('directory symlinks cannot expose files or directory indexes outside dist', async t => {
  const origin = await fixture(t, ({ root, outside }) => {
    fs.writeFileSync(path.join(outside, 'index.html'), 'outside-preview-root');
    fs.symlinkSync(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  });
  if (!origin) return;
  for (const route of ['/linked/', '/linked/secret.html']) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 403);
    assert.ok(!(await response.text()).includes('outside-preview-root'));
  }
});

test('the 404 fallback is subject to the same canonical path boundary', async t => {
  const origin = await fixture(t, ({ root, outside }) => {
    fs.unlinkSync(path.join(root, '404.html'));
    fs.symlinkSync(path.join(outside, 'secret.html'), path.join(root, '404.html'));
  });
  if (!origin) return;
  const response = await fetch(origin + '/missing');
  assert.equal(response.status, 403);
  assert.ok(!(await response.text()).includes('outside-preview-root'));
});

test('internal symlinks still work, including media range requests', async t => {
  const origin = await fixture(t, ({ root }) => {
    fs.symlinkSync(path.join(root, 'clip.mp4'), path.join(root, 'alias.mp4'));
  });
  if (!origin) return;
  const response = await fetch(origin + '/alias.mp4', { headers: { Range: 'bytes=2-5' } });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), 'bytes 2-5/10');
  assert.equal(await response.text(), '2345');
});

test('HEAD ignores Range and still describes the full representation', async t => {
  const origin = await fixture(t);
  const response = await fetch(origin + '/clip.mp4', { method: 'HEAD', headers: { Range: 'bytes=2-5' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-length'), '10');
  assert.equal(await response.text(), '');
});

test('a missing or non-file 404 fallback returns a plain 404 instead of crashing', async t => {
  const origin = await fixture(t, ({ root }) => {
    fs.unlinkSync(path.join(root, '404.html'));
    fs.mkdirSync(path.join(root, '404.html'));
  });
  const response = await fetch(origin + '/missing');
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not found');
});
