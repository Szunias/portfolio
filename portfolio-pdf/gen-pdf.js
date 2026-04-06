/**
 * Generate PDF from portfolio.html using headless Chrome via Puppeteer.
 * A4 portrait, no margins (HTML has embedded page sizing).
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  const htmlPath = 'file:///' + path.join(__dirname, 'portfolio.html').replace(/\\/g, '/');
  console.log('Loading:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  const outPath = path.join(__dirname, 'Igor_Szuniewicz_Portfolio.pdf');
  console.log('Generating PDF...');

  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true
  });

  await browser.close();

  const size = fs.statSync(outPath).size;
  console.log(`\nPDF generated: ${outPath}`);
  console.log(`Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
})();
