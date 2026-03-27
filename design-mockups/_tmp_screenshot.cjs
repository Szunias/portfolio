
const pw = require(require('path').join(process.env.LOCALAPPDATA, 'npm/node_modules/playwright'));
(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file:///C:/Users/iszun/Documents/GitHub/igorszuniewicz/index.html');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const el = document.querySelector('.sidebar__logos');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/iszun/Documents/GitHub/igorszuniewicz/design-mockups/logos-check.png' });
  await browser.close();
})();
