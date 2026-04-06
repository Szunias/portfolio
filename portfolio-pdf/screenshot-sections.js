/**
 * Capture home page sections (About/Contact are anchors on home, not separate pages)
 */
const puppeteer = require('puppeteer');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'screenshots');

const SECTIONS = [
  ['#bio', 'site-about.png', 'About / Bio section'],
  ['#contact', 'site-contact.png', 'Contact section'],
];

async function disableAnimations(page) {
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
    document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch(e){} });
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const h = document.body.scrollHeight;
        window.scrollBy(0, distance);
        total += distance;
        if (total >= h + 500) { clearInterval(timer); window.scrollTo(0,0); resolve(); }
      }, 80);
    });
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas']
  });

  for (const [anchor, filename, label] of SECTIONS) {
    console.log(`[${filename}] ${label}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('https://igorszuniewicz.com/' + anchor, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 1500));
    await autoScroll(page);
    await new Promise(r => setTimeout(r, 1000));
    await disableAnimations(page);

    // Scroll to the target section
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, anchor);
    await new Promise(r => setTimeout(r, 800));

    // Capture just the viewport at this scroll position (not full page)
    await page.screenshot({
      path: path.join(OUT_DIR, filename),
      fullPage: false,
      type: 'png'
    });
    console.log(`[${filename}] OK`);
    await page.close();
  }

  await browser.close();
  console.log('Done.');
})();
