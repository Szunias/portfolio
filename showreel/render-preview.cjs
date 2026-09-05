/* Silent website previews cut from existing portfolio recordings. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const clips = [
  { start: 74, source: 'old/public/assets/videos/ray-animation-h264.mp4', focus: 0.64 },
  { start: 312.77, source: 'showreel/assets/source/shadow-frames-gameplay.webm', focus: 0.53 },
  { start: 10.33, source: 'showreel/assets/source/akantilado-film.mp4', focus: 0.88 },
];

function render(args, output) {
  fs.mkdirSync(path.dirname(path.join(root, output)), { recursive: true });
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', ...args, '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '26',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
  ], { cwd: root, stdio: 'inherit' });
  console.log(`Rendered ${output}`);
}

for (const mobile of [false, true]) {
  const width = mobile ? 540 : 1280;
  const height = mobile ? 960 : 720;
  const filter = clips.map((clip, i) =>
    `[${i}:v]fps=24,scale=${width}:${height}:force_original_aspect_ratio=increase,` +
    `crop=${width}:${height}:(iw-ow)*${mobile ? clip.focus : 0.5}:(ih-oh)/2,` +
    `setsar=1,settb=AVTB,setpts=PTS-STARTPTS[v${i}]`
  ).join(';') +
    ';[v0][v1]xfade=transition=fade:duration=0.6:offset=4.4[ab]' +
    ';[ab][v2]xfade=transition=fade:duration=0.6:offset=8.8,format=yuv420p[out]';
  render([
    ...clips.flatMap(clip => ['-ss', String(clip.start), '-t', '5', '-i', clip.source]),
    '-filter_complex', filter, '-map', '[out]',
  ], `src/assets/hero-motion${mobile ? '-mobile' : ''}.mp4`);
}

for (const clip of [
  { name: 'shadowframes', start: 312.77, source: clips[1].source },
  { name: 'transientica', start: 30.07, source: 'showreel/assets/source/transientica-gameplay.webm' },
]) {
  render([
    '-ss', String(clip.start), '-t', '6', '-i', clip.source,
    '-vf', 'fps=24,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,setsar=1',
  ], `src/assets/previews/${clip.name}.mp4`);
}
