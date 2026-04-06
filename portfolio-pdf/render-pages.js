/**
 * Render each .page div of portfolio.html as a separate PNG at A4 scale.
 * Output: page-01.png ... page-20.png
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'rendered-pages');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas']
  });
  const page = await browser.newPage();
  // A4 at 96dpi = 794 x 1123
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  const url = 'file:///' + path.join(__dirname, 'portfolio.html').replace(/\\/g, '/');
  console.log('Loading:', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`Found ${pageCount} pages\n`);

  for (let i = 0; i < pageCount; i++) {
    const handle = await page.evaluateHandle((idx) => {
      const el = document.querySelectorAll('.page')[idx];
      el.scrollIntoView();
      return el;
    }, i);
    const element = handle.asElement();
    const n = String(i + 1).padStart(2, '0');
    const outPath = path.join(OUT, `page-${n}.png`);
    await element.screenshot({ path: outPath });
    const size = (fs.statSync(outPath).size / 1024).toFixed(0);
    console.log(`page-${n}.png (${size} KB)`);
    await handle.dispose();
  }

  await browser.close();
  console.log('\nDone. Rendered pages in:', OUT);
})();
