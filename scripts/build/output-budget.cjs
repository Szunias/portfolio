/** Deployment size policy. These are repository budgets, not live provider limits.
 * Read-only: callers decide whether to publish the already validated directory.
 */
const fs = require('node:fs');
const path = require('node:path');

function byteSizeLabel(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function collectFileSizes(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFileSizes(fullPath, base));
    } else if (entry.isFile()) {
      const size = fs.statSync(fullPath).size;
      files.push({ path: path.relative(base, fullPath).replace(/\\/g, '/'), size });
    }
  }
  return files;
}

function enforceDistBudget(dist, logger = console) {
  const files = collectFileSizes(dist);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  // GitHub Pages hard limit is 1 GB; 700 MB keeps ~300 MB headroom
  // (raised from 650 MB when the 54-track Evolution section landed).
  const maxTotal = 700 * 1024 * 1024;
  // GitHub blocks individual files at 100 MB; 80 MB keeps real headroom below
  // that (raised from 65 MB when the 2026 showreel master reached 63.65 MB and
  // sat 1.35 MB under the old cap, one re-render away from blocking deploys).
  const maxFile = 80 * 1024 * 1024;
  const largestFiles = files.slice().sort((a, b) => b.size - a.size);
  const largest = largestFiles[0];
  if (total > maxTotal) {
    throw new Error(`dist is ${byteSizeLabel(total)}, above the ${byteSizeLabel(maxTotal)} deploy budget`);
  }
  if (largest && largest.size > maxFile) {
    throw new Error(`${largest.path} is ${byteSizeLabel(largest.size)}, above the ${byteSizeLabel(maxFile)} single-file budget`);
  }
  logger.log(`  → deploy size budget OK (${files.length} files, ${byteSizeLabel(total)}${largest ? `, largest ${byteSizeLabel(largest.size)}` : ''})`);
  // The hard failures above give no advance notice, so shout while there is
  // still room to act instead of on the first build that crosses the line.
  if (total > maxTotal * 0.9) {
    logger.warn(`  ! dist total ${byteSizeLabel(total)} is above 90% of the ${byteSizeLabel(maxTotal)} deploy budget`);
  }
  for (const file of largestFiles) {
    if (file.size <= maxFile * 0.9) break;
    logger.warn(`  ! ${file.path} ${byteSizeLabel(file.size)} is above 90% of the ${byteSizeLabel(maxFile)} single-file budget`);
  }
  const heavyFiles = largestFiles
    .filter(file => file.size >= 20 * 1024 * 1024)
    .slice(0, 5);
  if (heavyFiles.length) {
    logger.log(`  → largest assets: ${heavyFiles.map(file => `${file.path} ${byteSizeLabel(file.size)}`).join('; ')}`);
  }
}

module.exports = { enforceDistBudget };
