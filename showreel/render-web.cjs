/* Create the website delivery from the approved extended cut; copy audio unchanged. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const edition = 'editorial-v2';
const master = `showreel/editions/${edition}/output/igor-szuniewicz-showreel-2026-${edition}.mp4`;
const delivery = `showreel/output/igor-szuniewicz-showreel-2026-${edition}.mp4`;
const preview = `src/assets/showreel-preview-${edition}.mp4`;

function render(args) {
  execFileSync(process.env.FFMPEG_BIN || 'ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', ...args,
  ], { cwd: root, stdio: 'inherit' });
}

render([
  '-i', master, '-map', '0:v:0', '-map', '0:a:0',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-threads', '6',
  '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', delivery,
]);
if (fs.statSync(path.join(root, delivery)).size > 80 * 1024 * 1024) {
  throw new Error('Website delivery exceeds the 80 MiB per-file build budget.');
}
render([
  '-ss', '4', '-i', master, '-t', '8', '-map', '0:v:0', '-an',
  '-vf', 'fps=24,scale=480:270:flags=lanczos,setsar=1',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '24',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', preview,
]);
console.log(`Rendered ${delivery} and ${preview}`);
