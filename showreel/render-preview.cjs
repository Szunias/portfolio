/* Silent website previews cut from existing portfolio recordings. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && !['--hero-mobile', '--hero-only'].includes(args[0]))) {
  throw new Error('Usage: node showreel/render-preview.cjs [--hero-only | --hero-mobile]');
}
const mobileOnly = args[0] === '--hero-mobile';
const heroOnly = mobileOnly || args[0] === '--hero-only';
const clips = [
  // Use the original AV1 file rather than its additional H.264 transcode.
  { start: 74, source: 'old/public/assets/videos/ray-animation.mp4', mobileFocus: 0.55 },
  { start: 312.77, source: 'showreel/assets/source/shadow-frames-gameplay.webm', mobileFocus: 0.5 },
  { start: 10.33, source: 'showreel/assets/source/akantilado-film.mp4', mobileFocus: 1 },
];

function render(args, output, { crf = 26, preset = 'medium' } = {}) {
  fs.mkdirSync(path.dirname(path.join(root, output)), { recursive: true });
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', ...args, '-an',
    '-c:v', 'libx264', '-preset', preset, '-crf', String(crf),
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
  ], { cwd: root, stdio: 'inherit' });
  console.log(`Rendered ${output}`);
}

for (const mobile of mobileOnly ? [true] : [false, true]) {
  const width = mobile ? 720 : 1920;
  const height = mobile ? 1280 : 1080;
  const filter = clips.map((clip, i) =>
    `[${i}:v]fps=24,scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,` +
    `crop=${width}:${height}:(iw-ow)*${mobile ? clip.mobileFocus : 0.5}:(ih-oh)/2,` +
    `setsar=1,settb=AVTB,setpts=PTS-STARTPTS[v${i}]`
  ).join(';') +
    ';[v0][v1]xfade=transition=fade:duration=0.6:offset=4.4[ab]' +
    ';[ab][v2]xfade=transition=fade:duration=0.6:offset=8.8,format=yuv420p[out]';
  render([
    ...clips.flatMap(clip => ['-ss', String(clip.start), '-t', '5', '-i', clip.source]),
    '-filter_complex', filter, '-map', '[out]',
  ], `src/assets/hero-motion${mobile ? '-mobile' : ''}.mp4`, { crf: 21, preset: 'slow' });
}

for (const clip of heroOnly ? [] : [
  { name: 'shadowframes', start: 312.77, source: clips[1].source },
  { name: 'transientica', start: 30.07, source: 'showreel/assets/source/transientica-gameplay.webm' },
]) {
  render([
    '-ss', String(clip.start), '-t', '6', '-i', clip.source,
    '-vf', 'fps=24,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,setsar=1',
  ], `src/assets/previews/${clip.name}.mp4`);
}
