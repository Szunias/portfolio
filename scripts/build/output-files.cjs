/** Build filesystem operations. No paths are captured from the process cwd.
 * Publishing must happen only after all validation has passed. Assets precede
 * entry points in the Windows locked-directory fallback; stale files go last.
 */
const fs = require('node:fs');
const path = require('node:path');
const { checkedSource } = require('./source-paths.cjs');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function listRelativeFiles(root, current = root) {
  if (!fs.existsSync(current)) return [];
  const files = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...listRelativeFiles(root, absolute));
    } else if (entry.isFile()) {
      files.push(path.relative(root, absolute));
    }
  }
  return files;
}

function pruneEmptyDirectories(root, current = root) {
  if (!fs.existsSync(current)) return;
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmptyDirectories(root, path.join(current, entry.name));
  }
  if (current !== root && fs.readdirSync(current).length === 0) fs.rmdirSync(current);
}

function filesHaveSameContent(left, right) {
  if (!fs.existsSync(right)) return false;
  const leftStat = fs.statSync(left);
  const rightStat = fs.statSync(right);
  if (!leftStat.isFile() || !rightStat.isFile() || leftStat.size !== rightStat.size) return false;

  const chunkSize = 64 * 1024;
  const leftBuffer = Buffer.allocUnsafe(chunkSize);
  const rightBuffer = Buffer.allocUnsafe(chunkSize);
  const leftFd = fs.openSync(left, 'r');
  let rightFd;
  try {
    rightFd = fs.openSync(right, 'r');
    let position = 0;
    while (position < leftStat.size) {
      const length = Math.min(chunkSize, leftStat.size - position);
      const leftRead = fs.readSync(leftFd, leftBuffer, 0, length, position);
      const rightRead = fs.readSync(rightFd, rightBuffer, 0, length, position);
      if (leftRead === 0 || rightRead === 0) return false;
      if (leftRead !== rightRead || Buffer.compare(leftBuffer.subarray(0, leftRead), rightBuffer.subarray(0, rightRead)) !== 0) return false;
      position += leftRead;
    }
    return true;
  } finally {
    fs.closeSync(leftFd);
    if (rightFd !== undefined) fs.closeSync(rightFd);
  }
}

function publishDistInPlace(stagingDir, outputDir, logger) {
  ensureDir(outputDir);
  const stagedFiles = listRelativeFiles(stagingDir);
  const isEntryPoint = rel => /(?:\.html|\.xml|\.txt)$/i.test(rel) || ['CNAME', '.nojekyll'].includes(rel);
  stagedFiles.sort((left, right) => Number(isEntryPoint(left)) - Number(isEntryPoint(right)) || left.localeCompare(right));

  // Assets are copied first and entry points last, so a failed copy leaves the
  // previous HTML pointing at the previous, still-present assets.
  for (const rel of stagedFiles) {
    const source = path.join(stagingDir, rel);
    const target = path.join(outputDir, rel);
    ensureDir(path.dirname(target));
    if (!filesHaveSameContent(source, target)) fs.copyFileSync(source, target);
  }

  const stagedSet = new Set(stagedFiles.map(rel => rel.replace(/\\/g, '/')));
  for (const rel of listRelativeFiles(outputDir)) {
    if (!stagedSet.has(rel.replace(/\\/g, '/'))) fs.rmSync(path.join(outputDir, rel), { force: true });
  }
  pruneEmptyDirectories(outputDir);
  cleanDir(stagingDir);
  logger.warn('  ! dist directory was locked; published the validated build in place');
}

function publishDist({ stagingDir, outputDir, backupDir, platform = process.platform, logger = console }) {
  const hadPreviousDist = fs.existsSync(outputDir);
  if (hadPreviousDist) {
    try {
      fs.renameSync(outputDir, backupDir);
    } catch (moveError) {
      if (platform === 'win32' && ['EBUSY', 'EPERM', 'EACCES'].includes(moveError.code)) {
        publishDistInPlace(stagingDir, outputDir, logger);
        return;
      }
      throw moveError;
    }
  }

  try {
    fs.renameSync(stagingDir, outputDir);
  } catch (publishError) {
    if (hadPreviousDist && fs.existsSync(backupDir) && !fs.existsSync(outputDir)) {
      try {
        fs.renameSync(backupDir, outputDir);
      } catch (restoreError) {
        throw new Error(
          `Could not publish the staged build (${publishError.message}) or restore the previous dist (${restoreError.message}); previous output remains at ${path.basename(backupDir)}`
        );
      }
    }
    throw publishError;
  }

  if (hadPreviousDist) {
    try {
      cleanDir(backupDir);
    } catch (cleanupError) {
      logger.warn(`  ! published dist, but could not remove ${path.basename(backupDir)}: ${cleanupError.message}`);
    }
  }
}

function copySourceDirectory(repoRoot, srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  srcDir = checkedSource(repoRoot, srcDir, 'directory');
  ensureDir(destDir);
  let copied = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copied += copySourceDirectory(repoRoot, src, dest);
    } else if (entry.isFile()) {
      fs.copyFileSync(checkedSource(repoRoot, src), dest);
      copied++;
    } else {
      throw new Error(`Unsupported source asset: ${path.relative(repoRoot, src)}`);
    }
  }
  return copied;
}

module.exports = { read, ensureDir, cleanDir, listRelativeFiles, filesHaveSameContent, copySourceDirectory, publishDist };
