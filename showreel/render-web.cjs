/* Create the website delivery from the approved extended cut; copy audio unchanged. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const edition = 'editorial-v2';
const master = `showreel/editions/${edition}/output/igor-szuniewicz-showreel-2026-${edition}.mp4`;
const delivery = `showreel/output/igor-szuniewicz-showreel-2026-${edition}.mp4`;
const preview = 'src/assets/showreel-preview-hero.mp4';
const poster = 'src/assets/showreel-preview-hero.webp';

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
// The homepage opening loops this beside its cue list: 2.5 seconds from each
// project in the cut, in the film's order, starting on Shadow Frames. The frame
// is at most about 700 CSS pixels wide, so 854 x 480 keeps the lazy download
// near 0.8 MB. The first frame is also the poster, so the loop starts in place.
const heroCuts = [5, 19, 45, 58, 70, 84, 104]
  .map(start => `between(t,${start},${start + 2.5})`).join('+');
render([
  '-i', master, '-map', '0:v:0', '-an',
  '-vf', `select='${heroCuts}',setpts=N/FRAME_RATE/TB,fps=24,scale=854:480:flags=lanczos,setsar=1`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '31',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', preview,
]);
render([
  '-i', preview, '-frames:v', '1', '-vf', 'scale=960:540:flags=lanczos',
  '-c:v', 'libwebp', '-quality', '80', poster,
]);
console.log(`Rendered ${delivery}, ${preview} and ${poster}`);
