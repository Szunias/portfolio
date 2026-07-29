const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SHOWREEL_DIR = __dirname;
const manifest = JSON.parse(
  fs.readFileSync(path.join(SHOWREEL_DIR, 'sources.json'), 'utf8'),
);

function fail(message) {
  console.error(message);
  process.exit(1);
}

const versionCheck = spawnSync('yt-dlp', ['--version'], {
  encoding: 'utf8',
  windowsHide: true,
});
if (versionCheck.error || versionCheck.status !== 0) {
  fail('yt-dlp is required to fetch the high-resolution showreel sources.');
}

for (const source of manifest.sources) {
  const expectedPath = path.join(SHOWREEL_DIR, source.expected);
  if (fs.existsSync(expectedPath)) {
    console.log(`[skip] ${source.id}: ${source.expected}`);
    continue;
  }

  fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
  console.log(`[fetch] ${source.id}`);
  const result = spawnSync(
    'yt-dlp',
    [
      '--no-update',
      '--no-playlist',
      '--extractor-args',
      'youtube:player_client=android_vr',
      '-f',
      source.format,
      '--merge-output-format',
      source.mergeOutputFormat,
      '-o',
      path.join(SHOWREEL_DIR, source.output),
      source.url,
    ],
    {
      cwd: SHOWREEL_DIR,
      stdio: 'inherit',
      windowsHide: true,
    },
  );
  if (result.error || result.status !== 0) {
    fail(`Failed to fetch ${source.id}.`);
  }
}

console.log('All showreel sources are available.');
