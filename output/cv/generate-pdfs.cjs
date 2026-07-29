const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer");

const sourceDir = __dirname;
const outputDir = path.resolve(sourceDir, "..", "pdf");

const documents = [
  "Igor_Szuniewicz_Technical_Sound_Designer",
  "Igor_Szuniewicz_Audio_Programmer",
  "Igor_Szuniewicz_ATS",
];

async function build() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--allow-file-access-from-files"],
  });

  try {
    for (const name of documents) {
      const page = await browser.newPage();
      const sourcePath = path.join(sourceDir, `${name}.html`);
      const outputPath = path.join(outputDir, `${name}.pdf`);

      page.setDefaultNavigationTimeout(15000);
      await page.goto(pathToFileURL(sourcePath).href, {
        waitUntil: "load",
        timeout: 15000,
      });
      await page.emulateMediaType("print");
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({
        path: outputPath,
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        tagged: true,
        displayHeaderFooter: false,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      });

      await page.close();
      console.log(`Built ${outputPath}`);
    }
  } finally {
    await browser.close();
  }
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
