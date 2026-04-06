/**
 * Compress all screenshot images to reduce PDF size.
 * PNGs -> JPGs, max 1200px wide, quality ~82.
 * Skips signature.png (keeps transparency).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'screenshots');
const OUT = path.join(__dirname, 'screenshots-compressed');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
console.log(`Processing ${files.length} files...\n`);

let totalBefore = 0, totalAfter = 0;

for (const file of files) {
  const srcPath = path.join(SRC, file);
  const srcSize = fs.statSync(srcPath).size;
  totalBefore += srcSize;

  // Keep signature as-is (needs transparency)
  if (file === 'signature.png') {
    const outPath = path.join(OUT, file);
    fs.copyFileSync(srcPath, outPath);
    totalAfter += srcSize;
    console.log(`[KEEP] ${file} (${(srcSize/1024).toFixed(0)}KB)`);
    continue;
  }

  // Convert to compressed JPG
  const outName = file.replace(/\.(png|jpeg)$/i, '.jpg');
  const outPath = path.join(OUT, outName);

  try {
    execSync(
      `ffmpeg -y -i "${srcPath}" -vf "scale='min(1200,iw)':-2" -q:v 4 "${outPath}"`,
      { stdio: 'pipe' }
    );
    const outSize = fs.statSync(outPath).size;
    totalAfter += outSize;
    const ratio = ((1 - outSize/srcSize) * 100).toFixed(0);
    console.log(`[${ratio}%] ${file} -> ${outName} (${(srcSize/1024).toFixed(0)}KB -> ${(outSize/1024).toFixed(0)}KB)`);
  } catch (e) {
    console.log(`[FAIL] ${file}: ${e.message.slice(0, 60)}`);
  }
}

console.log(`\nTotal: ${(totalBefore/1024/1024).toFixed(1)}MB -> ${(totalAfter/1024/1024).toFixed(1)}MB`);
console.log(`Saved: ${((totalBefore-totalAfter)/1024/1024).toFixed(1)}MB (${((1-totalAfter/totalBefore)*100).toFixed(0)}%)`);
