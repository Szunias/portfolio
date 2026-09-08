# Codebase map

## From source to a page

`site.config.cjs` is the route registry. Each entry explicitly lists a layout,
ordered CSS and JavaScript files, and metadata. There is no later pass that
silently appends assets. A `noindex` entry is still built and accessible; it is
not a private page. Review variants retain their existing URLs.

The build combines `src/pages/<slug>.html` with `src/layouts/<layout>.html` and
shared partials. It emits HTML plus content-hashed CSS and JS under `dist/assets/`.
CSS is conservatively compressed; JavaScript is syntax-checked and concatenated
without rewriting its contents. Browser scripts are classic scripts, not ES modules.

`npm run inspect` prints the complete route-to-file map from configuration. It also
reports page, layout, CSS or JS files that are not registered. Use it when tracing
which stylesheet or interaction a page actually loads.

## Layouts and partials

| File under `src/` | Responsibility |
| --- | --- |
| `layouts/home.html` | Homepage shell, `home-page` body class and no-JavaScript showreel fallback. |
| `layouts/page.html` | General content shell, including contact pages. |
| `layouts/project.html` | Project content and shared page chrome. |
| `layouts/music.html` | Music content and the shared player bar. |
| `layouts/error.html` | 404 shell. |
| `partials/head.html` | Document metadata, security policy, icons and asset placeholders. |
| `partials/site-header.html` | Main navigation. |
| `partials/colophon.html` | Footer and local-time display. |
| `partials/player-bar.html` | Music controls and the single `[data-music-audio]` element. |

Page HTML should contain content, not a second document shell. Build placeholders
are resolved by `build.cjs`; unresolved placeholders fail validation.

## CSS ownership and order

All templated pages load `_fonts.css`, `_tokens.css`, then `_chrome.css`.
The files in the page's `css` array follow in exactly that order.

- `_fonts.css` registers local fonts; `_tokens.css` defines shared values and
  foundational rules; `_chrome.css` owns the header and footer.
- `portfolio.css` applies the current public theme and shared motion styles.
  Review variants keep their own configured styles. An override belongs to the
  component's owner unless it is intentionally part of the shared theme.
- `home.css` owns work, tools and research, music, about and closing sections,
  plus the 404 content. `home-hero.css` owns the Edition 03 editorial opening,
  decorative waveform, compact showreel preview and full player. The header uses `_chrome.css`.
  Homepage order is `home`, `portfolio`, `home-hero`.
- `cine.css` styles the public project pages. `case-plain.css` supports project
  review variants.
- `sidar.css` owns SIDAR's trailer-first layout and its Annex04 palette. It is
  loaded only on `sidar.html`; the shared project styles stay unchanged.
- `music.css` owns the library and player. `music-stage.css` owns the listening
  stage; `music-crate.css` and `music-reel.css` are review layouts.
- `contact.css`, `contact-time.css` and `contact-wind.css` compose the public
  contact page. Other `contact-*` styles belong to their registered review pages.

Keep component selectors scoped. Do not append a second historical version of
the same component at the end of another file. Test responsive changes at 320 px,
an intermediate width and desktop, including long titles and player controls.

## JavaScript ownership

| File under `src/js/` | Responsibility |
| --- | --- |
| `home-showreel.js` | Compact silent preview, full showreel, close and focus restoration. |
| `home-waveform.js` | Decorative canvas waveform, entrance motion and pointer response. |
| `project-previews.js` | Lazy, silent previews on project-card hover or keyboard focus. |
| `copy-email.js` | Copies the visible address on the homepage and contact pages. |
| `page-motion.js` | Shared entrance effects and header state. |
| `music-library.js` | Track dates and labels, artwork styles, finished-piece shelf and sketch ledger markup. |
| `music-player.js` | Track selection, queue, transport, seek, volume, filters, artwork transitions and player state. |
| `music-visualizer.js` | Cover proportions, sampled artwork brightness and audio spectrum. |
| `contact-actions.js` | Contact-page actions and progressive enhancement. |
| `contact-clock.js` | Windable contact clock and its interaction state. |
| `contact-time.js` | Clock treatment on the separate contact-time review page. |
| `colophon-clock.js` | Time display in the shared footer. |
| `cine.js` | Project reveal effects, scroll-driven stages and reading progress. |
| `local-video.js` | Local-video enhancement on configured project pages. |
| `video-facade.js` | Lazy embedded-video activation on configured review pages. |
| `prefetch.js` | Same-origin navigation prefetch. |

Scripts use local scopes and DOM hooks. Keep their loading order in configuration
and preserve accessible markup when JavaScript is unavailable.

Music has one explicit audio element in `player-bar.html`. `music-player.js` owns
it; `music-visualizer.js` observes it after player initialization. Do not replace
`window.Audio` or use a hidden global to exchange the player instance. Track data
lives in `#trackData .track-card` on the music page; the build also turns it into
a static track index. The `data-src-e` values encode local media paths, not secrets.

Every music route loads `music-library.js` before `music-player.js`. Its explicit
`PortfolioMusicLibrary` API is a classic-script lexical binding, not a player
instance on `window`. It creates the existing library markup and formats track
metadata; selection, filtering and event handlers stay in the player. Keep this
order in `site.config.cjs`; the interaction tests execute each configured bundle.
See [browser maintenance notes](../src/js/README.md) for state and async boundaries.

The homepage's `[data-preview-video]` loops `assets/showreel-preview.mp4` inside
the showreel button at every viewport size. It observes reduced motion, data
saving and page visibility, and pauses while the separate `.hero__film` plays.
The full showreel starts only from its launch button. Keep the close control and
return keyboard focus to the launch button after closing.

The waveform is decorative, not an audio analyser. `home-waveform.js` animates
its entrance and responds to a fine pointer; it stops drawing once settled or
when hidden or covered by the full player. `assets/hero-waveform.svg` provides
the static fallback without JavaScript and with reduced motion.

The music spectrum sits below the cover and reads the existing audio element.
It draws only during playback while visible, with reduced motion disabled.
Stopping the drawing loop must not interrupt audio output.

Project-card videos use `[data-card-preview]` with a validated `data-src` path.
Only one runs at a time; its source loads on deliberate hover or keyboard focus.
Touch, reduced motion and data-saving preferences retain the still images.
Software-card crops use the original application screenshots and CSS variables
on `.tool-art`; the full screenshots remain available on their project pages.

## Build and validation

`build.cjs` handles configuration validation, template assembly, metadata and
accessibility enhancements, referenced asset copying, generated-document checks,
support files, size budgets and publishing the successful temporary output.
`scripts/build/browser-assets.cjs` contains the isolated CSS transform and
JavaScript syntax gate. `scripts/build/seo.cjs` generates and validates structured
data, including page identities and project credits. Tests for these helpers live
in `tests/`; deployment and Search Console checks are documented in `docs/SEO.md`.

`npm run check` validates without replacing `dist/`. `npm run build` publishes
the validated output locally. Neither renders video nor downloads source media.
The deployment workflow runs tests and a full build; only `main` publishes to
GitHub Pages. Pull requests run the checks without deploying.

`scripts/serve-dist.cjs` serves the built files on localhost, including byte ranges
for native media seeking, HEAD responses and the real 404 page. Tests exercise
those HTTP behaviors. It is a local development tool, not a deployment server.

## Media and supporting tools

| Location | Purpose |
| --- | --- |
| `src/assets/` | Current website assets, including the waveform fallback and compact showreel preview. |
| `old/public/assets/` | Images, audio, videos and other media retained from the earlier site. |
| `showreel/timeline.json` | Full showreel cuts, titles, transitions and gains. |
| `showreel/render.cjs` | Full renderer, mastering and media QA; documented in `showreel/README.md`. |
| `showreel/render-preview.cjs` | Retained large silent encodes and project-card previews. |
| `showreel/render-thumbnail.cjs` | Compact showreel preview, derived from `src/assets/hero-motion.mp4`. |
| `showreel/sources.json`, `fetch-sources.cjs` | Public media source manifest and restoration tool. |
| `scripts/generate-peaks.cjs` | Music waveform generation; run after replacing audio. |
| `scripts/build-fonts.py` | Offline font preparation. |
| `scripts/make-*-cover*.py`, `replace-ai-covers.py` | Manual artwork preparation, outside the website build. |
| `src/static/trip.html` | Standalone page explicitly copied by configuration. |

Media renderers and preparation scripts have their own external requirements;
the website build itself only needs Node. Some original source recordings are
local-only; the showreel guide explains what can be restored from public URLs.

Legacy application directories, archived designs, local experiments and QA
captures are separate from this pipeline. Their presence does not mean they
are built or deployed. Use the route registry and referenced asset checks to
determine what reaches the live site.
