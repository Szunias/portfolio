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
      await dial.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await dial.getAttribute('aria-valuenow'), '1');
      await page.keyboard.press('Home');
      assert.equal(await dial.getAttribute('aria-valuenow'), '0');
      assert.equal(await page.locator('[data-cap-preview]').isVisible(), false);
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
    const context = await browser.newContext({ reducedMotion: 'reduce' });
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
    assert.ok(projects.length, 'No configured project with reveal markup was found');
    for (const width of [320, 1440]) {
      for (const entry of projects) {
        await record({ check: 'project motion', page: entry.slug, width }, () => projectMotion(context, entry, width));
      }
      for (const entry of pages.filter(entry => (entry.js || []).some(script => script === 'contact-clock' || script === 'contact-time'))) {
        await record({ check: 'clock motion', page: entry.slug, width }, () => clockMotion(context, entry, width));
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
