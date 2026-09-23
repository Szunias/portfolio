'use strict';

// Optional real-browser QA. Reuses the isolated Playwright installation from
// home-layout.yml; npm test and the static build remain dependency-free.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const { chromium } = require('playwright');
const { pages } = require('../site.config.cjs');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'layout-results');
const origin = 'http://127.0.0.1:4174';
const results = [];
fs.mkdirSync(output, { recursive: true });

function address(page) {
  return origin + '/' + (page.slug === 'index' ? '' : page.slug + '.html');
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function ready(server) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Preview server exited before becoming ready');
    try {
      if ((await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch { /* The child has not bound its port yet. */ }
    await delay(100);
  }
  throw new Error('Preview server did not become ready');
}

async function record(check, run) {
  try {
    const detail = await run();
    results.push({ ...check, passed: true, ...detail });
  } catch (error) {
    results.push({ ...check, passed: false, error: error.stack || String(error) });
  }
}

async function smoke(context, entry, width) {
  const page = await context.newPage();
  const errors = [];
  const missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(origin + '/') && response.status() >= 400) {
      missing.push({ url: response.url(), status: response.status() });
    }
  });
  try {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(address(entry), { waitUntil: 'load' });
    assert.ok(response && response.ok(), 'The registered HTML route must load');
    await page.evaluate(() => {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
    });
    await page.waitForFunction(() => Array.from(document.images).every(img => img.complete));
    const broken = await page.evaluate(() => Array.from(document.images).filter(img => !img.naturalWidth).map(img => img.currentSrc || img.src));
    assert.deepEqual(broken, [], 'Every referenced image must load');
    await page.evaluate(async () => { await document.fonts.ready; });
    await settle(page);
    const geometry = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    assert.ok(geometry.document <= geometry.viewport + 1, 'The document overflows horizontally: ' + JSON.stringify(geometry));
    assert.deepEqual(missing, [], 'Local assets returned HTTP errors');
    assert.deepEqual(errors, [], 'Browser scripts emitted runtime errors');
    return geometry;
  } finally {
    await page.close();
  }
}

async function projectMotion(context, entry, width) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(address(entry), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    assert.ok(await page.locator('[data-reveal]').count(), 'The reveal check needs actual project media');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-reveal]')).every(el => el.classList.contains('is-in')));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await settle(page);
    assert.equal(await page.locator('[data-reveal]:not(.is-in)').count(), 0, 'Restoring motion must not hide revealed content');
    assert.deepEqual(errors, [], 'Motion preference changes emitted runtime errors');
    return { reducedMotion: true };
  } finally {
    await page.close();
  }
}

async function clockMotion(context, entry, width) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(address(entry), { waitUntil: 'load' });
    const second = page.locator('[data-hand="second"]');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-hand="second"]').getAttribute('visibility') === 'hidden');
    if (entry.js.includes('contact-clock')) {
      const dial = page.locator('.ck__dial');
      // contact.html's two-line caption; the contact-wind review page keeps [data-cap-preview].
      const where = page.locator('[data-cap-where]');
      const twoLine = await where.count() > 0;
      await dial.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await dial.getAttribute('aria-valuenow'), '1');
      assert.match(await dial.getAttribute('aria-valuetext'), / in Graz, in 1 hour, (day|dawn|dusk|night)$/);
      if (twoLine) assert.match(await where.textContent(), /^in 1 h · (day|dawn|dusk|night)$/);
      await page.keyboard.press('Home');
      assert.equal(await dial.getAttribute('aria-valuenow'), '0');
      assert.equal(await page.locator('[data-cap-preview]').isVisible(), false);
      if (twoLine) assert.equal(await where.textContent(), 'Graz, Austria');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !document.querySelector('[data-hand="second"]').hasAttribute('visibility'));
    assert.equal(await second.getAttribute('visibility'), null);
    assert.deepEqual(errors, [], 'Clock interaction emitted runtime errors');
    return { reducedMotion: true, keyboard: entry.js.includes('contact-clock') };
  } finally {
    await page.close();
  }
}

// A deterministic PCM fixture exercises decoding and the real Web Audio graph
// without depending on leading silence, track length or a particular MP3 codec.
function testTone() {
  const rate = 16000;
  const samples = rate * 20;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(4000 * Math.sin(2 * Math.PI * 440 * i / rate)), 44 + i * 2);
  return wav;
}

async function musicPlayback(context, entry, width) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const tone = testTone();
    await page.route('**/old/public/assets/audio/**/*.mp3', route => route.fulfill({ contentType: 'audio/wav', body: tone }));
    await page.addInitScript(() => {
      const NativeAudioContext = window.AudioContext;
      const qa = window.__musicAudioQA = { contexts: [], sources: 0, destinationConnections: 0, reads: 0, nonzero: false };
      window.AudioContext = class extends NativeAudioContext {
        constructor(options) { super(options); qa.contexts.push(this); }
        createMediaElementSource(audio) {
          const source = super.createMediaElementSource(audio);
          qa.sources++;
          const connect = source.connect.bind(source);
          source.connect = (...args) => {
            const result = connect(...args);
            if (args[0] === this.destination) qa.destinationConnections++;
            return result;
          };
          return source;
        }
        createAnalyser() {
          const analyser = super.createAnalyser();
          const read = analyser.getByteFrequencyData.bind(analyser);
          analyser.getByteFrequencyData = bins => {
            read(bins);
            qa.reads++;
            qa.nonzero ||= bins.some(value => value > 0);
          };
          return analyser;
        }
      };
    });
    await page.goto(address(entry), { waitUntil: 'load' });
    await page.locator('[data-featured-track]').first().click();
    const spectrum = page.locator('.stage__spectrum');
    await spectrum.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const audio = document.querySelector('[data-music-audio]');
      return !audio.paused && audio.currentTime > 0 && window.__musicAudioQA.nonzero;
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settle(page);
    const stoppedAt = await page.evaluate(() => ({ reads: window.__musicAudioQA.reads, time: document.querySelector('[data-music-audio]').currentTime }));
    await page.waitForFunction(time => document.querySelector('[data-music-audio]').currentTime > time + 0.1, stoppedAt.time);
    assert.equal(await page.evaluate(() => window.__musicAudioQA.reads), stoppedAt.reads, 'Reduced motion stops drawing while audio advances');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(reads => window.__musicAudioQA.reads > reads, stoppedAt.reads);
    const transport = page.locator('#playerBar [data-player="play"]');
    await transport.click();
    await page.waitForFunction(() => document.querySelector('[data-music-audio]').paused);
    // Model a context suspended by the browser while keeping native Web Audio.
    await page.evaluate(() => window.__musicAudioQA.contexts[0].suspend());
    await transport.click();
    await page.waitForFunction(() => !document.querySelector('[data-music-audio]').paused && window.__musicAudioQA.contexts[0].state === 'running');
    const graph = await page.evaluate(() => ({ sources: window.__musicAudioQA.sources,
      destinationConnections: window.__musicAudioQA.destinationConnections, nonzero: window.__musicAudioQA.nonzero }));
    assert.deepEqual(graph, { sources: 1, destinationConnections: 1, nonzero: true });
    assert.deepEqual(errors, [], 'Music playback emitted runtime errors');
    return graph;
  } finally {
    await page.close();
  }
}

async function main() {
  const server = spawn(process.execPath, ['scripts/serve-dist.cjs'], {
    cwd: root, env: { ...process.env, PORT: '4174' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverError;
  server.on('error', error => { serverError = error; });
  const log = fs.createWriteStream(path.join(output, 'site-interactions-preview.log'));
  server.stdout.pipe(log, { end: false });
  server.stderr.pipe(log, { end: false });
  let browser;
  try {
    await ready(server);
    if (serverError) throw serverError;
    browser = await chromium.launch();
    // Graz time: contact.html adds the visitor's own clock to the dial's text
    // on any other zone (a UTC runner), and the clock checks read Graz only.
    const context = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'Europe/Vienna' });
    context.setDefaultTimeout(10000);
    // A local regression check must not depend on third-party availability.
    // Deliberately launched external embeds are outside this smoke test.
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === origin || url.protocol === 'data:' ? route.continue() : route.abort();
    });
    for (const entry of pages) {
      for (const width of [320, 1440]) {
        await record({ check: 'route smoke', page: entry.slug, width }, () => smoke(context, entry, width));
      }
    }
    // Exercise only features that are actually present in registered pages.
    const projects = pages.filter(entry => (entry.js || []).includes('cine') &&
      /\bdata-reveal\b/.test(fs.readFileSync(path.join(root, 'src/pages', entry.slug + '.html'), 'utf8')));
    // Project pages now own their motion; skip the reveal check, visibly, once no page uses it.
    if (!projects.length) results.push({ check: 'project motion', passed: true, skipped: 'no registered page uses data-reveal' });
    for (const width of [320, 1440]) {
      for (const entry of projects) {
        await record({ check: 'project motion', page: entry.slug, width }, () => projectMotion(context, entry, width));
      }
      for (const entry of pages.filter(entry => (entry.js || []).some(script => script === 'contact-clock' || script === 'contact-time'))) {
        await record({ check: 'clock motion', page: entry.slug, width }, () => clockMotion(context, entry, width));
      }
      for (const entry of pages.filter(entry => entry.js.includes('music-visualizer'))) {
        await record({ check: 'music playback', page: entry.slug, width }, () => musicPlayback(context, entry, width));
      }
    }
    assert.equal(results.filter(result => !result.passed).length, 0, 'Browser checks failed; see site-interactions-report.json');
  } finally {
    if (browser) await browser.close();
    server.kill();
    log.end();
    fs.writeFileSync(path.join(output, 'site-interactions-report.json'), JSON.stringify(results, null, 2));
  }
}

main().then(() => console.log(JSON.stringify(results, null, 2))).catch(error => {
  fs.writeFileSync(path.join(output, 'site-interactions-failure.txt'), error.stack || String(error));
  console.error(error);
  console.error(JSON.stringify(results.filter(result => !result.passed), null, 2));
  process.exitCode = 1;
});
