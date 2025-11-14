/**
 * Test script to diagnose i18n issues on /projects/ page
 * Run with: node test-projects-i18n.js
 */

import puppeteer from 'puppeteer';

async function testProjectsPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Collect console messages
    const consoleLogs = [];
    const consoleErrors = [];

    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Collect network requests
    const networkRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('locales') || request.url().includes('.json')) {
        networkRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Collect network responses
    const networkResponses = [];
    page.on('response', (response) => {
      if (response.url().includes('locales') || response.url().includes('.json')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    console.log('\n=== TESTING PROJECTS PAGE i18n ===\n');
    console.log('1. Loading page: http://localhost:8000/projects/');

    await page.goto('http://localhost:8000/projects/', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // Wait a bit for i18n to initialize
    await page.waitForTimeout(2000);

    console.log('\n2. Checking window.i18n object...');
    const i18nState = await page.evaluate(() => {
      return {
        exists: typeof window.i18n !== 'undefined',
        lang: window.i18n ? window.i18n.lang : null,
        translationsKeys:
          window.i18n && window.i18n.translations ? Object.keys(window.i18n.translations) : [],
        currentLangTranslations:
          window.i18n && window.i18n.translations && window.i18n.lang
            ? Object.keys(window.i18n.translations[window.i18n.lang] || {})
            : [],
        supportedLanguages: window.i18n ? window.i18n.supportedLanguages : null
      };
    });

    console.log('   - window.i18n exists:', i18nState.exists);
    console.log('   - Current language:', i18nState.lang);
    console.log('   - Loaded translation languages:', i18nState.translationsKeys);
    console.log('   - Supported languages:', i18nState.supportedLanguages);
    console.log(
      '   - Translation keys for current lang:',
      i18nState.currentLangTranslations.length
    );

    console.log('\n3. Network requests for JSON files:');
    networkRequests.forEach((req) => {
      console.log(`   - ${req.method} ${req.url}`);
    });

    console.log('\n4. Network responses for JSON files:');
    networkResponses.forEach((res) => {
      console.log(`   - ${res.status} ${res.statusText} - ${res.url}`);
    });

    console.log('\n5. Checking if data-i18n elements are translated...');
    const dataI18nElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-i18n]');
      return Array.from(elements)
        .slice(0, 10)
        .map((el) => ({
          key: el.getAttribute('data-i18n'),
          content: el.textContent.trim(),
          translated: el.textContent.trim() !== el.getAttribute('data-i18n')
        }));
    });

    console.log(`   Found ${dataI18nElements.length} data-i18n elements (showing first 10):`);
    dataI18nElements.forEach((el) => {
      const status = el.translated ? '✓ TRANSLATED' : '✗ NOT TRANSLATED';
      console.log(`   ${status}: [data-i18n="${el.key}"] = "${el.content}"`);
    });

    console.log('\n6. Checking tech tags (data-tech)...');
    const techElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-tech]');
      return Array.from(elements)
        .slice(0, 5)
        .map((el) => ({
          key: el.getAttribute('data-tech'),
          innerHTML: el.innerHTML.substring(0, 100),
          hasContent: el.innerHTML.trim().length > 0
        }));
    });

    console.log(`   Found ${techElements.length} data-tech elements (showing first 5):`);
    techElements.forEach((el) => {
      const status = el.hasContent ? '✓ HAS CONTENT' : '✗ EMPTY';
      console.log(`   ${status}: [data-tech="${el.key}"]`);
      if (el.hasContent) {
        console.log(`      Content: ${el.innerHTML}`);
      }
    });

    console.log('\n7. Testing language switcher...');

    // Click on PL button
    console.log('   - Clicking PL language button...');
    await page.evaluate(() => {
      const plButton = document.querySelector('.lang-btn[data-lang="pl"]');
      if (plButton) plButton.click();
    });

    await page.waitForTimeout(1500);

    const langAfterPL = await page.evaluate(() => (window.i18n ? window.i18n.lang : null));
    console.log(`   - Language after clicking PL: ${langAfterPL}`);

    // Check if translations changed
    const dataI18nAfterPL = await page.evaluate(() => {
      const titleElement = document.querySelector('[data-i18n="projects_page_title"]');
      return {
        key: titleElement ? titleElement.getAttribute('data-i18n') : null,
        content: titleElement ? titleElement.textContent.trim() : null
      };
    });
    console.log(`   - Title content after PL: "${dataI18nAfterPL.content}"`);

    console.log('\n8. Console Logs (BulletproofI18n):');
    const i18nLogs = consoleLogs.filter(
      (log) => log.includes('BulletproofI18n') || log.includes('i18n')
    );
    if (i18nLogs.length === 0) {
      console.log('   (none)');
    } else {
      i18nLogs.forEach((log) => console.log(`   ${log}`));
    }

    console.log('\n9. Console Errors:');
    if (consoleErrors.length === 0) {
      console.log('   ✓ No errors');
    } else {
      consoleErrors.forEach((err) => console.log(`   ✗ ${err}`));
    }

    console.log('\n10. LocalStorage language setting:');
    const localStorageLang = await page.evaluate(() => localStorage.getItem('language'));
    console.log(`   - localStorage.language = ${localStorageLang}`);

    console.log('\n=== TEST COMPLETE ===\n');
  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Run the test
testProjectsPage().catch(console.error);
