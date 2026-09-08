const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const buildFile = path.resolve(__dirname, '../../build.cjs');
const realRequire = createRequire(buildFile);

function buildFixture(t, options = {}) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-build-test-'));
  const root = path.join(parent, 'repo');
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  function write(relative, content) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    return file;
  }
  const origin = 'https://portfolio.example';
  const pages = [['index', 'home'], ['alpha', 'project'], ['beta', 'project'], ['gamma', 'project'], ['404', 'error'], ['music', 'music']]
    .map(([slug, layout]) => ({
      slug, layout, css: ['fixture'], js: ['fixture'], title: `Fixture ${slug}`,
      description: 'A deterministic test page for the static portfolio build, with local assets and no external requests.',
      canonical: slug === 'index' ? `${origin}/` : `${origin}/${slug}.html`,
      ogImage: `${origin}/aithesiscover.png`, ogImageAlt: 'Fixture image',
      ...(slug === '404' ? { noindex: true, sitemap: false } : {}),
    }));
  const config = { pages, staticCopy: [{file:'snapshot.html', outName:'notes/index.html', noindex:true, sitemap:false}] };
  const shell = '<!doctype html><html lang="en"><head><!-- HEAD --></head><body><!-- SITE_HEADER --><main id="main"><!-- CONTENT --></main><!-- COLOPHON --><!-- PLAYER --><!-- JS --></body></html>';
  for (const layout of new Set(pages.map(page => page.layout))) write(`src/layouts/${layout}.html`, layout === 'music' ? shell : shell.replace('<!-- PLAYER -->', ''));
  write('src/partials/head.html', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title><!-- TITLE --></title><meta name="description" content="<!-- DESCRIPTION -->"><link rel="canonical" href="<!-- CANONICAL -->"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><!-- OG_TAGS --><!-- CSS --><!-- SCHEMA -->');
  for (const partial of ['site-header','colophon','player-bar']) write(`src/partials/${partial}.html`, '');
  for (const css of ['_fonts','_tokens','_chrome','fixture']) write(`src/css/${css}.css`, '');
  write('src/js/fixture.js', 'window.fixtureLoaded = true;');
  write('src/pages/index.html', '<h1>Fixture</h1><a class="prow prow--featured" href="alpha.html">Alpha</a><a class="prow prow--tool" href="beta.html">Beta</a><a class="archive-project-link" href="gamma.html">Gamma</a>');
  for (const slug of ['alpha','beta','gamma']) write(`src/pages/${slug}.html`, `<h1>${slug}</h1><a class="next-project-btn" href="${slug}.html">Next</a>`);
  write('src/pages/404.html', '<h1>Missing</h1>');
  write('src/pages/music.html', '<h1>Music</h1><div class="library__list" id="musicLibrary"></div><div id="trackData" hidden><div class="track-card" data-title="Fixture" data-year="2026"></div></div>');
  write('snapshot.html', '<!doctype html><html lang="en"><head><title>Snapshot</title></head><body><h1>Snapshot</h1></body></html>');
  for (const asset of ['src/assets/favicon-mark.ico','audioqscreenshot.png','transienticascreenshot.png','UnrealEngineDemo.mp4','PythonPrototypeDemo.mp4','szuniewicz-ai-audio-thesis-2026.pdf','Igor_Szuniewicz_CV.pdf','aithesiscover.png']) write(asset, 'fixture');

  const module = { exports: {} };
  const localRequire = name => name === './site.config.cjs' ? config : realRequire(name);
  localRequire.main = {}; // Import the real builder; do not run its CLI entry point.
  const logs = [];
  const context = {
    module, require: localRequire, __dirname: root, __filename: buildFile, URL, Buffer,
    process: { pid: process.pid, platform: process.platform, argv: ['node', buildFile, ...(options.check ? ['--check'] : [])] },
    console: Object.fromEntries(['log','warn','error'].map(level => [level, (...args) => logs.push(args.join(' '))])),
  };
  vm.runInNewContext(fs.readFileSync(buildFile, 'utf8'), context, {filename:buildFile});
  return { root, parent, config, write, logs, build: module.exports };
}

module.exports = { buildFixture };
