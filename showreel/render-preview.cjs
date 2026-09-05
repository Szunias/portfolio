/* Rebuild the silent home cover from existing, credited portfolio footage. */
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const clips = [
  ['74', 'old/public/assets/videos/ray-animation-h264.mp4'],
  ['312.77', 'showreel/assets/source/shadow-frames-gameplay.webm'],
  ['10.33', 'showreel/assets/source/akantilado-film.mp4'],
];
const normalize = 'fps=24,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,settb=AVTB,setpts=PTS-STARTPTS';
const filter = clips.map((_, i) => `[${i}:v]${normalize}[v${i}]`).join(';') +
  ';[v0][v1]xfade=transition=fade:duration=0.6:offset=4.4[ab]' +
  ';[ab][v2]xfade=transition=fade:duration=0.6:offset=8.8,format=yuv420p[out]';
execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  ...clips.flatMap(([start, source]) => ['-ss', start, '-t', '5', '-i', source]),
  '-filter_complex', filter, '-map', '[out]', '-an',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '26',
  '-movflags', '+faststart', 'src/assets/hero-motion.mp4',
], { cwd: root, stdio: 'inherit' });
