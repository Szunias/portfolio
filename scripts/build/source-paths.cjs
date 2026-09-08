/* Publication inputs must be real files/directories inside the repository. */
const fs = require('node:fs');
const path = require('node:path');

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative));
}

function checkedSource(repoRoot, candidate, kind = 'file') {
  const lexicalRoot = path.resolve(repoRoot);
  const lexical = path.resolve(candidate);
  if (!inside(lexicalRoot, lexical)) throw new Error('Source path is outside the repository');
  const label = path.relative(lexicalRoot, lexical) || '.';
  if (fs.lstatSync(lexical).isSymbolicLink()) {
    throw new Error(`Source must not be a symbolic link: ${label}`);
  }
  const realRoot = fs.realpathSync.native(lexicalRoot);
  const real = fs.realpathSync.native(lexical);
  if (!inside(realRoot, real)) throw new Error(`Source resolves outside the repository: ${label}`);
  const stat = fs.statSync(real);
  if (kind === 'file' ? !stat.isFile() : kind !== 'directory' || !stat.isDirectory()) {
    throw new Error(`Source must be a ${kind}: ${label}`);
  }
  return real;
}

module.exports = { checkedSource };
