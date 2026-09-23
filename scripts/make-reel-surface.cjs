'use strict';

/*
 * Draws the homepage hero surface from the showreel's own sound and checks the
 * chapter list under it. Offline media preparation: the website build only
 * copies the SVG. Rerun after `node showreel/render-web.cjs` whenever the reel
 * is re-cut, and paste any chapter list it prints into src/pages/index.html.
 *
 *   node scripts/make-reel-surface.cjs [output.svg]
 *
 * Needs ffmpeg (or FFMPEG_BIN). The delivered reel is decoded to mono 32 kHz.
 * Each of the 120 lines is one log-spaced band from 45 Hz to 14 kHz over the
 * whole reel: time runs left to right, low bands in front, and each band sits
 * 1.75 units right of and 2.15 units above the one in front of it. The front
 * edge runs from x 16 to 836 at y 712 of the 1040 x 760 view box;
 * home-hero.css and home-reel-chapters.js place the chapters and the playhead
 * on that edge. Smoothing, a spectral tilt, a partial per-band normalisation
 * and the dB-to-height mapping are the only shaping; nothing is drawn by hand.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const edition = 'editorial-v2';
const reel = `showreel/output/igor-szuniewicz-showreel-2026-${edition}.mp4`;
const report = `showreel/editions/${edition}/output/render-report.json`;
const timeline = `showreel/editions/${edition}/timeline.json`;
const page = 'src/pages/index.html';
const args = process.argv.slice(2);
if (args.length > 1) throw new Error('Usage: node scripts/make-reel-surface.cjs [output.svg]');
const output = path.resolve(root, args[0] || 'src/assets/home/reel-surface.svg');

// The approved round-3 surface. Larger T_SIGMA or B_SIGMA values calm it
// without changing the data.
const SR = 32000;
const N = 8192;             // STFT window, Hann
const HOP = 1600;           // 50 ms
const BANDS = 120;
const F_LO = 45;
const F_HI = 14000;
const TILT = 4.5;           // dB per octave around 1 kHz
const POINTS = 150;         // samples along each line
const T_SIGMA = 1.6;        // Gaussian smoothing in seconds
const B_SIGMA = 3;          // and in bands, over +-4 bands
const REL = 0.7;            // share of each level measured against its band's median
const REL_BASE = -40;       // dB given to that median
const FLOOR = -70;          // dB at zero height
const RANGE = 40;           // dB from zero to full height
const GAMMA = 1.35;
const HEIGHT = 250;         // full height in view-box units
const X0 = 16;
const WIDTH = 820;
const Y0 = 712;
const DX = 1.75;
const DY = 2.15;
const EPS = 0.45;           // Douglas-Peucker tolerance in view-box units

// Timeline segment id to the project whose track colour its chapter wears.
const PROJECTS = {
  'shadow-sequence': 'shadowframes',
  'not-today-sequence': 'nottoday',
  'pause-full-chase': 'pausedeserve',
  transientica: 'transientica',
  audioq: 'audioq',
  'akantilado-sequence': 'akantilado',
  ray: 'ray',
};

function decode() {
  const bytes = execFileSync(process.env.FFMPEG_BIN || 'ffmpeg', [
    '-v', 'error', '-i', reel, '-vn', '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-',
  ], { cwd: root, maxBuffer: 1 << 28 });
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

// Radix-2 FFT in place.
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

// Band levels in dB, with the tilt, for every STFT frame.
function analyse(pcm) {
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
  const edges = [];
  for (let b = 0; b <= BANDS; b++) edges.push(F_LO * Math.pow(F_HI / F_LO, b / BANDS));
  const binHz = SR / N;
  const re = new Float64Array(N), im = new Float64Array(N);
  const frames = [];
  for (let s = 0; s + N <= pcm.length; s += HOP) {
    for (let i = 0; i < N; i++) { re[i] = pcm[s + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const pow = new Float64Array(N / 2);
    for (let k = 0; k < N / 2; k++) pow[k] = re[k] * re[k] + im[k] * im[k];
    const lv = new Float64Array(BANDS);
    for (let b = 0; b < BANDS; b++) {
      const lo = edges[b] / binHz, hi = edges[b + 1] / binHz;
      let sum = 0, cnt = 0;
      for (let k = Math.floor(lo); k <= Math.ceil(hi); k++) {
        if (k < 1 || k >= N / 2) continue;
        sum += pow[k];
        cnt++;
      }
      const fc = Math.sqrt(edges[b] * edges[b + 1]);
      lv[b] = 10 * Math.log10(sum / Math.max(1, cnt) / (N * N / 4) + 1e-14) + TILT * Math.log2(fc / 1000);
    }
    frames.push({ t: (s + N / 2) / SR, lv });
  }
  return frames;
}

// POINTS rows of BANDS levels, smoothed in time and across bands, then
// partly measured against each band's median.
function surface(frames, duration) {
  const grid = [];
  for (let p = 0; p < POINTS; p++) {
    const t = duration * p / (POINTS - 1);
    const row = new Float64Array(BANDS);
    let wsum = 0;
    for (const f of frames) {
      const d = (f.t - t) / T_SIGMA;
      if (Math.abs(d) > 3) continue;
      const w = Math.exp(-0.5 * d * d);
      wsum += w;
      for (let b = 0; b < BANDS; b++) row[b] += w * f.lv[b];
    }
    for (let b = 0; b < BANDS; b++) row[b] /= Math.max(wsum, 1e-9);
    grid.push(row);
  }
  for (const row of grid) {
    const src = Float64Array.from(row);
    for (let b = 0; b < BANDS; b++) {
      let s = 0, w = 0;
      for (let k = -4; k <= 4; k++) {
        const j = b + k;
        if (j < 0 || j >= BANDS) continue;
        const g = Math.exp(-0.5 * (k / B_SIGMA) ** 2);
        s += g * src[j];
        w += g;
      }
      row[b] = s / w;
    }
  }
  for (let b = 0; b < BANDS; b++) {
    const column = grid.map((row) => row[b]).sort((x, y) => x - y);
    const median = column[Math.floor(column.length / 2)];
    for (const row of grid) row[b] = (1 - REL) * row[b] + REL * (row[b] - median + REL_BASE);
  }
  return grid;
}

function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  let index = 0, max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const d = Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / Math.hypot(by - ay, bx - ax);
    if (d > max) { max = d; index = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return simplify(pts.slice(0, index + 1), eps).slice(0, -1).concat(simplify(pts.slice(index), eps));
}

// One stroked line per band, back to front, fading from grey to paper.
function svg(grid) {
  const r1 = (v) => (Math.round(v * 10) / 10).toString();
  const hex = (v) => Math.round(v).toString(16).padStart(2, '0');
  const paths = [];
  for (let b = BANDS - 1; b >= 0; b--) {
    const depth = b / (BANDS - 1);
    const pts = grid.map((row, p) => {
      const level = Math.max(0, Math.min(1, (row[b] - FLOOR) / RANGE)) ** GAMMA;
      return [X0 + b * DX + WIDTH * p / (POINTS - 1), Y0 - b * DY - level * HEIGHT];
    });
    const s = simplify(pts, EPS);
    let d = 'M' + r1(s[0][0]) + ' ' + r1(s[0][1]);
    for (let i = 1; i < s.length; i++) d += ' ' + r1(s[i][0]) + ' ' + r1(s[i][1]);
    const g = 0x73 + (0xd7 - 0x73) * (1 - depth);
    const opacity = (0.32 + (0.89 - 0.32) * (1 - depth)).toFixed(2);
    paths.push(`<path d="${d}" stroke="#${hex(g)}${hex(g + 2)}${hex(g)}" opacity="${opacity}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 760" fill="none" stroke-width=".8" stroke-linejoin="round">${paths.join('')}</svg>`;
}

// The chapter list for the page: every project segment of the resolved
// timeline (the ones with a caption title), at its start, with the reel's
// delivered length on the list.
function chapters() {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const { delivery, resolvedTimeline } = read(report);
  const titles = new Map(read(timeline).segments.map((segment) => [segment.id, segment.caption && segment.caption.title]));
  const number = (value) => String(+value.toFixed(3));
  const clock = (value) => Math.floor(Math.round(value) / 60) + ':' + String(Math.round(value) % 60).padStart(2, '0');
  const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const items = resolvedTimeline.filter((segment) => titles.get(segment.id)).map((segment, index) => {
    const slug = PROJECTS[segment.id];
    if (!slug) throw new Error(`Add the project page for timeline segment "${segment.id}" to PROJECTS.`);
    const start = number(segment.timelineStart);
    return `          <li class="track-${slug}" style="--start:${start};--len:${number(segment.duration)}">` +
      `<button type="button" data-reel-at="${start}"${index ? ' tabindex="-1"' : ''}>` +
      `<span class="reel-chapters__time">${clock(segment.timelineStart)}</span> ` +
      `<span class="reel-chapters__name">${escape(titles.get(segment.id))}</span></button></li>`;
  });
  return [
    `        <ol class="reel-chapters" aria-label="Showreel chapters" data-reel-chapters style="--reel-length:${number(delivery.duration)}">`,
    ...items,
    '        </ol>',
  ].join('\n');
}

const pcm = decode();
const duration = pcm.length / SR;
const drawing = svg(surface(analyse(pcm), duration));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, drawing);
console.log(`Wrote ${output} (${drawing.length} bytes) from ${duration.toFixed(2)} s of ${reel}`);

const list = chapters();
const authored = (fs.readFileSync(path.join(root, page), 'utf8').match(/^[ \t]*<ol class="reel-chapters"[\s\S]*?<\/ol>/m) || [''])[0];
const lines = (text) => text.split(/\r?\n/).map((line) => line.trim()).join('\n');
if (lines(authored) === lines(list)) {
  console.log(`The chapters in ${page} match ${report}.`);
} else {
  console.log(`Replace the chapter list in ${page} with:\n${list}`);
  process.exitCode = 1;
}
