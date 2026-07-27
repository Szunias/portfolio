#!/usr/bin/env node
/**
 * Writes a loudness envelope into every track on the music page.
 *
 * Run manually after adding or replacing audio:  npm run peaks
 *
 * This is deliberately NOT part of `npm run build`. The build stays
 * zero-dependency and CI never needs ffmpeg installed; the envelopes are
 * committed as plain text in the page instead.
 *
 * Each track gets data-peaks: 120 characters, one per bucket, base36
 * (0-9a-z = 36 levels). Roughly 120 bytes per track, so the whole archive
 * costs about 5 KB inline and no extra network requests at all.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PAGE = path.join(__dirname, '..', 'src', 'pages', 'music.html');
const ROOT = path.join(__dirname, '..');
const BUCKETS = 120;
const LEVELS = 36;
const SAMPLE_RATE = 8000;
// Anything this far below the track's own peak reads as silence in the drawing.
// Mastered music mostly sits within 20 dB of its own peak, so a deeper floor
// would spend most of the 36 levels on near-silence and flatten the shape.
// At -30 dB one level is about 0.83 dB, which keeps real structure visible.
const FLOOR_DB = -30;

function decodeSource(encoded) {
  let raw = '';
  try {
    raw = Buffer.from(encoded, 'base64').toString('utf8').trim();
  } catch (_) {
    return '';
  }
  try {
    return decodeURIComponent(raw);
  } catch (_) {
    return raw;
  }
}

function decodeToPcm(file) {
  return execFileSync('ffmpeg', [
    '-v', 'error',
    '-i', file,
    '-ac', '1',
    '-ar', String(SAMPLE_RATE),
    '-f', 's16le',
    '-'
  ], { maxBuffer: 512 * 1024 * 1024 });
}

function envelope(pcm) {
  const total = Math.floor(pcm.length / 2);
  if (total < BUCKETS) return null;
  const perBucket = Math.floor(total / BUCKETS);
  const rms = new Array(BUCKETS).fill(0);

  for (let bucket = 0; bucket < BUCKETS; bucket++) {
    const start = bucket * perBucket;
    let sum = 0;
    for (let i = 0; i < perBucket; i++) {
      const sample = pcm.readInt16LE((start + i) * 2) / 32768;
      sum += sample * sample;
    }
    rms[bucket] = Math.sqrt(sum / perBucket);
  }

  const loudest = Math.max(...rms);
  if (!(loudest > 0)) return null;

  // A linear amplitude scale renders quiet passages as almost nothing, so map
  // onto dB relative to the track's own peak. The shape stays readable.
  return rms.map(value => {
    if (value <= 0) return 0;
    const db = 20 * Math.log10(value / loudest);
    const normalised = (db - FLOOR_DB) / -FLOOR_DB;
    const clamped = Math.max(0, Math.min(1, normalised));
    return Math.min(LEVELS - 1, Math.round(clamped * (LEVELS - 1)));
  });
}

function encodePeaks(levels) {
  return levels.map(level => level.toString(36)).join('');
}

function main() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  } catch (_) {
    console.error('ffmpeg not found on PATH. Install it, then run npm run peaks again.');
    process.exit(1);
  }

  let html = fs.readFileSync(PAGE, 'utf8');
  const cards = [...html.matchAll(/<div class="track-card"[^>]*><\/div>/g)].map(m => m[0]);
  if (!cards.length) {
    console.error('No track-card elements found in src/pages/music.html.');
    process.exit(1);
  }

  let done = 0;
  const skipped = [];

  cards.forEach(card => {
    const srcMatch = card.match(/data-src-e="([^"]+)"/);
    const titleMatch = card.match(/data-title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : '(untitled)';
    if (!srcMatch) {
      skipped.push(title + ' — no data-src-e');
      return;
    }

    const rel = decodeSource(srcMatch[1]);
    const file = path.join(ROOT, rel);
    if (!rel || !fs.existsSync(file)) {
      skipped.push(title + ' — missing file ' + rel);
      return;
    }

    let levels = null;
    try {
      levels = envelope(decodeToPcm(file));
    } catch (error) {
      skipped.push(title + ' — ffmpeg failed: ' + (error.message || '').split('\n')[0]);
      return;
    }
    if (!levels) {
      skipped.push(title + ' — silent or too short to measure');
      return;
    }

    const peaks = encodePeaks(levels);
    const updated = /data-peaks="[^"]*"/.test(card)
      ? card.replace(/data-peaks="[^"]*"/, 'data-peaks="' + peaks + '"')
      : card.replace(/><\/div>$/, ' data-peaks="' + peaks + '"></div>');

    html = html.replace(card, updated);
    done += 1;
    process.stdout.write('  ✓ ' + title + '\n');
  });

  fs.writeFileSync(PAGE, html);
  console.log('\nWrote envelopes for ' + done + ' of ' + cards.length + ' tracks (' +
    BUCKETS + ' buckets each).');
  if (skipped.length) {
    console.log('Skipped ' + skipped.length + ':');
    skipped.forEach(line => console.log('  - ' + line));
  }
}

main();
