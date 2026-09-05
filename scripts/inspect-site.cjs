/* Print the configured route-to-source map without building or changing files. */
const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config.cjs');

console.log('Paths below are relative to src/. CSS and JS run in the listed order.');
console.log('Every page also receives css/_fonts.css, css/_tokens.css and css/_chrome.css.\n');

for (const page of config.pages) {
  const route = page.slug === 'index' ? '/' : `/${page.slug}.html`;
  console.log(`${route}${page.noindex ? ' [noindex]' : ''}`);
  console.log(`  HTML  pages/${page.slug}.html + layouts/${page.layout}.html`);
  console.log(`  CSS   ${page.css.map(name => `css/${name}.css`).join(', ')}`);
  console.log(`  JS    ${page.js.map(name => `js/${name}.js`).join(', ') || '(none)'}`);
}
for (const entry of config.staticCopy || []) {
  console.log(`/${entry.outName} <- ${entry.file} [standalone${entry.noindex ? ', noindex' : ''}]`);
}

const sources = {
  pages: { extension: '.html', used: new Set(config.pages.map(page => page.slug)) },
  layouts: { extension: '.html', used: new Set(config.pages.map(page => page.layout)) },
  css: { extension: '.css', used: new Set(['_fonts', '_tokens', '_chrome', ...config.pages.flatMap(page => page.css)]) },
  js: { extension: '.js', used: new Set(config.pages.flatMap(page => page.js)) },
};
const unused = [];
for (const [directory, { extension, used }] of Object.entries(sources)) {
  for (const file of fs.readdirSync(path.join(__dirname, '..', 'src', directory)).sort()) {
    if (file.endsWith(extension) && !used.has(path.basename(file, extension))) unused.push(`src/${directory}/${file}`);
  }
}
console.log(`\nUnregistered page, layout, CSS or JS files: ${unused.length ? '\n' + unused.join('\n') : 'none'}`);
