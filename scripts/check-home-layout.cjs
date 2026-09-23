'use strict';

// Optional browser QA, separate from the zero-dependency site build.
// After npm run build, install playwright@1.63.0 in a temporary prefix and set
// NODE_PATH to that prefix's node_modules. The CI workflow shows the commands.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'layout-results');
const origin = 'http://127.0.0.1:4173';
const widths = [320, 375, 640, 768, 899, 900, 1024, 1199, 1200, 1440, 1920];
// The tools desk links into each project's evidence section; keep the anchors exact.
const deskLinks = ['shadowframes.html#sf-mix-title', 'nottoday.html#nt-engines-title', 'transientica.html#tr-path-title', 'autotrim.html#at-flow-title'];
const results = [];
fs.mkdirSync(output, { recursive: true });

// A section refresh leaves the opening as it was: the hero markup with its
// still frame, and the styles and script that run the player.
function checkPreservedHero() {
  const base = process.env.REFRESH_BASE;
  if (!base) return;
  assert.match(base, /^[a-f0-9]{40}$/i, 'REFRESH_BASE must be a commit SHA');
  const old = (file) => execFileSync('git', ['show', `${base}:${file}`], { cwd: root });
  const current = (file) => fs.readFileSync(path.join(root, file));
  const hero = (buffer) => buffer.toString('utf8').split('</section>')[0];
  assert.equal(hero(current('src/pages/index.html')), hero(old('src/pages/index.html')));
  for (const file of ['src/css/home-hero.css', 'src/js/home-showreel.js']) {
    assert.ok(current(file).equals(old(file)), `${file} changed during the section refresh`);
  }
  results.push({ check: 'hero source preservation', passed: true, base });
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

async function loadImages(page) {
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, { timeout: 15000 });
  const broken = await page.evaluate(() => Array.from(document.images).filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src));
  assert.deepEqual(broken, [], 'Every referenced image must load');
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images, (img) => img.decode()));
    await document.fonts.ready;
  });
}

async function assertTextFits(page, selector) {
  const overflow = await page.locator(selector).evaluateAll((roots) => {
    const issues = [];
    for (const root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || !node.parentElement.checkVisibility()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1)) {
            issues.push(node.textContent.trim().slice(0, 100));
            break;
          }
        }
      }
    }
    return issues;
  });
  assert.deepEqual(overflow, [], 'Text extends beyond the viewport');
}

async function recordEvidence(page, name) {
  // Visit media before capture: full-page screenshots alone can omit decoded
  // offscreen images, and capture a sticky header at the previous scroll offset.
  const cards = page.locator('.wcard__media');
  for (let i = 0; i < await cards.count(); i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const media = await card.locator('img').evaluate((img) => {
      const box = img.getBoundingClientRect();
      const css = getComputedStyle(img);
      return { width: box.width, height: box.height, opacity: css.opacity, visibility: css.visibility };
    });
    assert.ok(media.width > 100 && media.height > 100, 'Project image must fill a real frame');
    assert.equal(media.opacity, '1');
    assert.equal(media.visibility, 'visible');
    await card.screenshot({ path: path.join(output, `${name}-project-${i + 1}.png`), animations: 'disabled' });
  }
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, behavior: 'instant' });
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true, animations: 'disabled' });
}

async function main() {
  checkPreservedHero();
  const server = spawn(process.execPath, ['scripts/serve-dist.cjs'], {
    cwd: root, env: { ...process.env, PORT: '4173' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverError;
  server.on('error', (error) => { serverError = error; });
  const log = fs.createWriteStream(path.join(output, 'preview.log'));
  server.stdout.pipe(log, { end: false });
  server.stderr.pipe(log, { end: false });
  let browser;
  try {
    await ready(server);
    if (serverError) throw serverError;
    browser = await chromium.launch();
    const context = await browser.newContext({ reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(origin, { waitUntil: 'load' });
      await loadImages(page);
      await assertTextFits(page, '#work, #about, #contact');
      assert.equal(await page.locator('a.prow--featured').count(), 5);
      assert.equal(await page.locator('a.prow--tool').count(), 4);
      // The music card shows no cover art, only the first three pieces of the set list.
      assert.equal(await page.locator('.music-cta img').count(), 0);
      assert.deepEqual(await page.locator('.music-cta__list li').evaluateAll((items) => items.map((item) => item.textContent.replace(/\s+/g, ' ').trim())),
        ['01 Ray 0:22', '02 Cage 1:50', '03 Electronic sketch 2:30']);
      assert.equal(await page.locator('.earlier-work nav a').count(), 8);
      assert.deepEqual(await page.locator('[data-solo-desk] a').evaluateAll((links) => links.map((link) => link.getAttribute('href'))), deskLinks, 'Tools desk proof links changed');
      assert.equal(await page.locator('.tool-feature a, .tool-feature button, .music-cta__link a, .music-cta__link button').count(), 0, 'Feature links must not contain interactive descendants');
      const geometry = await page.evaluate(() => {
        const style = (s) => getComputedStyle(document.querySelector(s));
        const columns = (s) => style(s).gridTemplateColumns.split(' ').length;
        return {
          toolColumns: columns('.plist__rows'), featureColumns: columns('.tool-feature'),
          musicColumns: columns('.music-cta__link'),
          panelBottomPadding: style('.panel__inner').paddingBottom,
          sidarFit: style('.wcard--sidar img').objectFit,
        };
      });
      assert.equal(geometry.toolColumns, width >= 1200 ? 3 : 1);
      assert.equal(geometry.featureColumns, width >= 900 ? 2 : 1);
      assert.equal(geometry.musicColumns, width >= 640 ? 2 : 1);
      assert.equal(geometry.panelBottomPadding, '0px');
      assert.equal(geometry.sidarFit, 'contain');
      const summary = page.locator('.earlier-work summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.earlier-work').evaluate((el) => el.open), true);
      await assertTextFits(page, '.earlier-work');
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.earlier-work').evaluate((el) => el.open), false);
      const copy = page.locator('[data-copy-mail]');
      await copy.click();
      const mail = await page.locator('[data-mail-link]').getAttribute('href');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), mail.slice(7));
      if ([375, 768, 1440].includes(width)) await recordEvidence(page, `home-${width}`);
      results.push({ page: 'home', width, passed: true, ...geometry });
    }
    for (const route of ['autotrim.html', '404.html']) {
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${origin}/${route}`, { waitUntil: 'load' });
        await loadImages(page);
        await assertTextFits(page, route === 'autotrim.html' ? '.cine' : '.error-page');
        if (route === 'autotrim.html') {
          assert.match(await page.locator('#at-development-title').textContent(), /queues/i);
          await recordEvidence(page, `autotrim-${width}`);
        }
        results.push({ page: route, width, passed: true });
      }
    }
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 1000 } });
    const fallback = await noJS.newPage();
    await fallback.goto(origin);
    assert.equal(await fallback.locator('.tool-feature').isVisible(), true);
    assert.equal(await fallback.locator('.music-cta__link').isVisible(), true);
    assert.equal(await fallback.locator('[data-mail-link]').isVisible(), true);
    assert.equal(await fallback.locator('[data-copy-mail]').isVisible(), false);
    assert.deepEqual(await fallback.locator('[data-solo-desk] a').evaluateAll((links) => links.map((link) => link.getAttribute('href'))), deskLinks);
    assert.deepEqual(await fallback.locator('[data-solo]').evaluateAll((keys) => keys.map((key) => key.checkVisibility())), [false, false, false, false], 'Solo keys must stay hidden without JavaScript');
    await fallback.locator('.earlier-work summary').click();
    assert.equal(await fallback.locator('.earlier-work nav').isVisible(), true);
    results.push({ check: 'no-JavaScript navigation and archive', passed: true });
    assert.deepEqual(errors, [], 'Browser scripts emitted runtime errors');
    results.push({ check: 'runtime errors', passed: true });
  } finally {
    if (browser) await browser.close();
    server.kill();
    log.end();
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(results, null, 2));
  }
}

main().then(() => console.log(JSON.stringify(results, null, 2))).catch((error) => {
  fs.writeFileSync(path.join(output, 'failure.txt'), error.stack || String(error));
  console.error(error);
  process.exitCode = 1;
});
