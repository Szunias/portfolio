const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { filesHaveSameContent, publishDist } = require('../scripts/build/output-files.cjs');

function outputFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-output-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const options = { stagingDir: path.join(root, 'staging'), outputDir: path.join(root, 'dist'),
    backupDir: path.join(root, 'backup'), logger: { warn() {} } };
  function write(directory, name, content) {
    const target = path.join(directory, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
    return target;
  }
  return { ...options, write };
}

test('content comparison covers empty, multi-chunk, different and missing files', t => {
  const f = outputFixture(t);
  const left = f.write(f.stagingDir, 'left', Buffer.alloc(150000, 65));
  const right = f.write(f.stagingDir, 'right', Buffer.alloc(150000, 65));
  assert.equal(filesHaveSameContent(left, right), true);
  fs.writeFileSync(right, Buffer.alloc(150000, 66));
  assert.equal(filesHaveSameContent(left, right), false);
  fs.writeFileSync(left, ''); fs.writeFileSync(right, '');
  assert.equal(filesHaveSameContent(left, right), true);
  fs.unlinkSync(right);
  assert.equal(filesHaveSameContent(left, right), false);
});

test('the first descriptor closes when opening the comparison file fails', t => {
  const f = outputFixture(t);
  const left = f.write(f.stagingDir, 'left', 'same');
  const right = f.write(f.stagingDir, 'right', 'same');
  const open = fs.openSync;
  const close = fs.closeSync;
  let firstDescriptor;
  const closed = [];
  t.mock.method(fs, 'openSync', (file, ...args) => {
    if (file === right) throw Object.assign(new Error('fixture denied'), { code: 'EACCES' });
    const descriptor = open(file, ...args);
    if (file === left) firstDescriptor = descriptor;
    return descriptor;
  });
  t.mock.method(fs, 'closeSync', descriptor => { closed.push(descriptor); return close(descriptor); });
  assert.throws(() => filesHaveSameContent(left, right), /fixture denied/);
  assert.ok(closed.includes(firstDescriptor));
});

test('successful publication replaces old output and removes its backup', t => {
  const f = outputFixture(t);
  f.write(f.outputDir, 'old.txt', 'old');
  f.write(f.stagingDir, 'index.html', 'new');
  publishDist(f);
  assert.equal(fs.readFileSync(path.join(f.outputDir, 'index.html'), 'utf8'), 'new');
  assert.equal(fs.existsSync(path.join(f.outputDir, 'old.txt')), false);
  assert.equal(fs.existsSync(f.backupDir), false);
});

test('failed staging rename restores the previous output', t => {
  const f = outputFixture(t);
  f.write(f.outputDir, 'index.html', 'old');
  f.write(f.stagingDir, 'index.html', 'new');
  const rename = fs.renameSync;
  t.mock.method(fs, 'renameSync', (source, target) => {
    if (source === f.stagingDir) throw Object.assign(new Error('fixture rename failed'), { code: 'EIO' });
    return rename(source, target);
  });
  assert.throws(() => publishDist(f), /fixture rename failed/);
  assert.equal(fs.readFileSync(path.join(f.outputDir, 'index.html'), 'utf8'), 'old');
});

test('Windows fallback copies assets before HTML, skips equal files and prunes stale files', t => {
  const f = outputFixture(t);
  f.write(f.outputDir, 'index.html', 'old');
  f.write(f.outputDir, 'assets/unchanged.bin', 'same');
  f.write(f.outputDir, 'stale/deep/file.txt', 'stale');
  f.write(f.stagingDir, 'index.html', 'new');
  f.write(f.stagingDir, 'assets/new.bin', 'asset');
  f.write(f.stagingDir, 'assets/unchanged.bin', 'same');
  const rename = fs.renameSync;
  const copy = fs.copyFileSync;
  const copied = [];
  t.mock.method(fs, 'renameSync', (source, target) => {
    if (source === f.outputDir) throw Object.assign(new Error('fixture locked'), { code: 'EPERM' });
    return rename(source, target);
  });
  t.mock.method(fs, 'copyFileSync', (source, target, ...args) => {
    copied.push(path.relative(f.stagingDir, source).replace(/\\/g, '/'));
    return copy(source, target, ...args);
  });
  publishDist({ ...f, platform: 'win32' });
  assert.deepEqual(copied, ['assets/new.bin', 'index.html']);
  assert.equal(fs.existsSync(path.join(f.outputDir, 'stale')), false);
  assert.equal(fs.existsSync(f.stagingDir), false);
});
