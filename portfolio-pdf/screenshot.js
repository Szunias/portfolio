/**
 * Full-page screenshot automation for igorszuniewicz.com
 * Handles the "black screen" issue by:
 * 1. Disabling GPU acceleration (--disable-gpu)
 * 2. Scrolling through the entire page to trigger lazy-loading
 * 3. Pausing for all images/videos to load
 * 4. Pausing all animations/videos before capture
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'https://igorszuniewicz.com';
const OUT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Pages to capture: [url path, output filename]
const PAGES = [
  ['/', 'site-home.png'],
  ['/about.html', 'site-about.png'],
  ['/music.html', 'site-music.png'],
  ['/contact.html', 'site-contact.png'],
  ['/shadowframes.html', 'site-shadowframes.png'],
  ['/nottoday.html', 'site-nottoday.png'],
  ['/transientica.html', 'site-transientica.png'],
  ['/ray.html', 'site-ray.png'],
  ['/audioq.html', 'site-audioq.png'],
  ['/amorak.html', 'site-amorak.png'],
  ['/akantilado.html', 'site-akantilado.png'],
  ['/richter.html', 'site-richter.png'],
  ['/sounddesign.html', 'site-sounddesign.png'],
  ['/xrlabs.html', 'site-xrlabs.png'],
  ['/wwiseprojects.html', 'site-wwiseprojects.png'],
  ['/pausedeserve.html', 'site-pausedeserve.png'],
  ['/ai-audio-research.html', 'site-aiaudio.png'],
];

async function autoScroll(page) {
  // Scroll from top to bottom to trigger lazy-load, then back to top
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight + 500) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });
}

async function pauseAllMedia(page) {
  await page.evaluate(() => {
    // Pause all videos
    document.querySelectorAll('video').forEach(v => {
      try { v.pause(); v.currentTime = 0.5; } catch (e) {}
    });
    // Disable CSS animations
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
  });
}

async function capturePage(browser, urlPath, filename) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const url = BASE + urlPath;
  console.log(`[${filename}] Loading ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    // Wait for fonts and late-loading resources
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to trigger lazy-loading
    await autoScroll(page);
    await new Promise(r => setTimeout(r, 1000));

    // Scroll again (some elements need two passes)
    await autoScroll(page);
    await new Promise(r => setTimeout(r, 800));

    // Pause videos and disable animations
    await pauseAllMedia(page);
    await new Promise(r => setTimeout(r, 500));

    // Full-page screenshot
    const outPath = path.join(OUT_DIR, filename);
    await page.screenshot({
      path: outPath,
      fullPage: true,
      type: 'png'
    });

    const size = fs.statSync(outPath).size;
    console.log(`[${filename}] OK (${(size / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`[${filename}] FAILED: ${err.message}`);
  } finally {
    await page.close();
  }
}

(async () => {
  console.log('Launching Chrome (headless)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-web-security'
    ]
  });

  console.log(`Capturing ${PAGES.length} pages...\n`);
  for (const [urlPath, filename] of PAGES) {
    await capturePage(browser, urlPath, filename);
  }

  await browser.close();
  console.log('\nAll screenshots saved to: ' + OUT_DIR);
})();
