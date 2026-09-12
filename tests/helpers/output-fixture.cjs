/** Deterministic page mix for byte-level output regression checks.
 * No real media, network, git history or date-dependent chrome is required.
 */
const fs = require('node:fs');
const path = require('node:path');
const { buildFixture } = require('./build-fixture.cjs');

function outputFixture(t) {
  const fixture = buildFixture(t);
  const { write, root, config } = fixture;
  const append = (file, content) => write(file, fs.readFileSync(path.join(root, file), 'utf8') + content);
  write('src/css/_fonts.css', '/* shared fonts */\n.fixture-font { font-family: serif; }');
  write('src/css/_tokens.css', ':root { --fixture-gap: 1rem; }');
  write('src/css/_chrome.css', '.fixture-nav { display: flex; gap: var(--fixture-gap); }');
  write('src/css/fixture.css', '.fixture { color: red; margin: 0; }');
  write('src/partials/site-header.html', '<header><a class="fixture-nav" href="{{HOME}}#work">Work</a></header>');
  write('src/partials/colophon.html', '<footer><a href="{{ROOT}}music.html">Music</a></footer>');
  append('src/pages/index.html', '<section id="work"><h2>Work</h2></section>');
  // Minimal PNG header exercises poster dimensions without a binary fixture.
  const png = Buffer.alloc(32);
  png.writeUInt32BE(0x89504e47, 0);
  png.writeUInt32BE(640, 16);
  png.writeUInt32BE(360, 20);
  write('aithesiscover.png', png);
  append('src/pages/alpha.html', `
<h2 id="media">Media</h2>
<div><video controls preload="none" poster="aithesiscover.png"><source src="UnrealEngineDemo.mp4" type="video/mp4"></video></div>
<p class="video-caption">Original recording</p>
<div class="gallery-item" role="button" tabindex="0"><img src="aithesiscover.png" width="640" height="360" alt="Fixture capture"></div>
<div data-yt-facade><img src="aithesiscover.png" width="640" height="360" alt="Fixture poster"></div>
<svg focusable="false" viewBox="0 0 10 10"><path d="M0 0"/></svg>
<a href="https://example.com/" target="_blank" rel="external">External</a>
<iframe src="https://example.com/embed"></iframe>
`);
  append('src/pages/beta.html', '<img style="color:red" src="aithesiscover.png" width="640" height="360" alt="Inline styled image">');
  write('src/pages/music.html', `<h1>Music</h1><div class="library__list" id="musicLibrary"></div>
<div id="trackData" hidden><div class="track-card" data-title="Notes &amp; $1 &gt; silence" data-year="2026-05-01"></div></div>`);
  config.staticCopy[0].sanitize = true;
  config.staticCopy[0].ensureIds = ['snapshot-top'];
  write('snapshot.html', '<!doctype html><html><head><title>Snapshot</title><script>alert(1)</script></head><body><h1 onclick="alert(1)">Snapshot</h1><a href="javascript:void(0)">Top</a></body></html>');
  return fixture;
}

module.exports = { outputFixture };
