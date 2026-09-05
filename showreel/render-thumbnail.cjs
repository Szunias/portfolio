/*
 * Render the silent loop used by the compact home-page showreel button.
 * Run `node showreel/render-thumbnail.cjs` after updating hero-motion.mp4.
 * Keeps the complete three-clip edit at 480 x 270; the full showreel is separate.
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');

if (process.argv.length > 2) {
  throw new Error('Usage: node showreel/render-thumbnail.cjs');
}

const root = path.resolve(__dirname, '..');
const output = 'src/assets/showreel-preview.mp4';

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', 'src/assets/hero-motion.mp4', '-map', '0:v:0', '-an',
  '-vf', 'fps=24,scale=480:270:flags=lanczos,setsar=1',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
], { cwd: root, stdio: 'inherit' });

console.log(`Rendered ${output}`);
