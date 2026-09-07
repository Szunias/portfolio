const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { createPreviewServer } = require('../scripts/serve-dist.cjs');

async function fixture(t, configure = () => {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-preview-security-'));
  const root = path.join(directory, 'dist');
  const outside = path.join(directory, 'dist-neighbor');
  let server;
  t.after(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });
  fs.mkdirSync(root);
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Preview</h1>');
  fs.writeFileSync(path.join(root, '404.html'), '<h1>Missing</h1>');
  fs.writeFileSync(path.join(root, 'clip.mp4'), '0123456789');
  fs.writeFileSync(path.join(outside, 'private.html'), 'OUTSIDE_FIXTURE_DO_NOT_SERVE');
  fs.writeFileSync(path.join(outside, 'index.html'), 'OUTSIDE_FIXTURE_DO_NOT_SERVE');
  let servedRoot = root;
  try {
    servedRoot = configure({ root, outside, directory }) || root;
  } catch (error) {
    if (process.platform === 'win32' && ['EPERM', 'EACCES'].includes(error.code)) {
      t.skip('Creating symlinks requires Windows Developer Mode or elevated rights');
      return null;
    }
    throw error;
  }
  server = createPreviewServer(servedRoot).listen(0, '127.0.0.1');
  await once(server, 'listening');
  return `http://127.0.0.1:${server.address().port}`;
}

for (const [name, setup, route] of [
  ['file symlinks', ({ root, outside }) => {
    fs.symlinkSync(path.join(outside, 'private.html'), path.join(root, 'leak.html'), 'file');
  }, '/leak.html'],
  ['directory symlinks', ({ root, outside }) => {
    fs.symlinkSync(outside, path.join(root, 'linked'), 'junction');
  }, '/linked/'],
  ['extensionless symlink routes', ({ root, outside }) => {
    fs.symlinkSync(path.join(outside, 'private.html'), path.join(root, 'leak.html'), 'file');
  }, '/leak'],
  ['a symlinked 404 fallback', ({ root, outside }) => {
    fs.unlinkSync(path.join(root, '404.html'));
    fs.symlinkSync(path.join(outside, 'private.html'), path.join(root, '404.html'), 'file');
  }, '/missing'],
]) {
  test(`preview blocks ${name} outside its canonical root`, async t => {
    const origin = await fixture(t, setup);
    if (!origin) return;
    for (const options of [{}, { method: 'HEAD' }, { headers: { Range: 'bytes=0-6' } }]) {
      const response = await fetch(origin + route, options);
      assert.equal(response.status, 403);
      assert.ok(!(await response.text()).includes('OUTSIDE_FIXTURE'));
    }
    const healthy = await fetch(origin + '/');
    assert.equal(healthy.status, 200);
    await healthy.text();
  });
}

test('preview allows symlinks whose targets remain inside the root', async t => {
  const origin = await fixture(t, ({ root }) => {
    fs.symlinkSync(path.join(root, 'clip.mp4'), path.join(root, 'alias.mp4'), 'file');
    fs.mkdirSync(path.join(root, 'page'));
    fs.writeFileSync(path.join(root, 'page', 'index.html'), '<h1>Inside</h1>');
    fs.symlinkSync(path.join(root, 'page'), path.join(root, 'alias-page'), 'junction');
  });
  if (!origin) return;
  const media = await fetch(origin + '/alias.mp4', { headers: { Range: 'bytes=2-5' } });
  assert.equal(media.status, 206);
  assert.equal(await media.text(), '2345');
  const page = await fetch(origin + '/alias-page/');
  assert.equal(page.status, 200);
  assert.equal(await page.text(), '<h1>Inside</h1>');
});

test('preview canonicalizes a symlink used as its root', async t => {
  const origin = await fixture(t, ({ root, directory }) => {
    const alias = path.join(directory, 'root-alias');
    fs.symlinkSync(root, alias, 'junction');
    return alias;
  });
  if (!origin) return;
  const response = await fetch(origin + '/');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '<h1>Preview</h1>');
});

test('preview sends nosniff on files and error responses', async t => {
  const origin = await fixture(t);
  for (const route of ['/', '/clip.mp4', '/missing', '/%00']) {
    const response = await fetch(origin + route);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    await response.text();
  }
});
