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

`npm run inspect` prints the complete route-to-file map from configuration,
including shared partials, catalog data and all CSS in loading order. It reports
missing inputs and unregistered page, layout, partial, data, CSS and JS sources.

```sh
npm run inspect -- --page music
npm run inspect -- --file src/js/music-player.js
npm run inspect -- --file src/partials/player-bar.html
node scripts/inspect-site.cjs --json
```

`--page` accepts a slug or route; `--file` finds every configured owner of a
repository-relative source path. They are mutually exclusive and can each be
combined with `--json`. Use `node` directly when another tool parses stdout.
JSON has `schemaVersion`, `routes`, `files`, `unregistered`, `missing` and `query`.
Only `routes` is filtered; the reverse index and diagnostics cover the whole site.
This maps entry inputs, not media references discovered by the full build.

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
- `home.css` owns work (with the tools desk and project track colours), tools
  and research, music, the about and contact closing band, plus the 404
  content. `home-hero.css` owns the Edition 03 editorial opening,
  one still frame from Shadow Frames, compact showreel preview and full player. The header uses `_chrome.css`.
  Homepage order is `home`, `portfolio`, `home-hero`.
- `cine.css` styles the public project pages. `case-plain.css` supports project
  review variants.
- `sidar.css` owns SIDAR's trailer-first layout and its Annex04 palette. It is
  loaded only on `sidar.html`; the shared project styles stay unchanged.
- Every other project page also owns a stylesheet named after its slug
  (`shadowframes.css`, `ray.css` and so on). It holds that page's motif and
  overrides colour tokens for that page only; `cine.css` and `portfolio.css`
  stay the shared base.
- `music.css` owns the library (the published shelf of spines and sketch
  notebook, and the review pages' cover shelf) and the player. `music-stage.css`
  owns the listening stage: the meter bridge stage of `music.html` and the cover
  stage of the music-alt review page. `music-crate.css` and `music-reel.css` are
  review layouts.
- `contact.css`, `contact-time.css` and `contact-wind.css` compose the public
  contact page. Other `contact-*` styles belong to their registered review pages.

Keep component selectors scoped. Do not append a second historical version of
the same component at the end of another file. Test responsive changes at 320 px,
an intermediate width and desktop, including long titles and player controls.

## JavaScript ownership

| File under `src/js/` | Responsibility |
| --- | --- |
| `home-showreel.js` | Compact silent preview, full showreel, close and focus restoration. |
| `home-transition.js` | Scroll-driven hero exit, whole-wave transforms and showreel coverage state. |
| `home-solo.js` | Solo keys on the homepage tools desk: dims the projects made without the soloed tool and names the lit ones in a status line. |
| `image-viewer.js` | Original-image dialog, zoom and focus restoration on project screenshots. |
| `project-previews.js` | Lazy, silent previews on project-card hover or keyboard focus. |
| `copy-email.js` | Copies the visible address on the homepage and contact pages and marks the clicked button and the status with `data-copy-state` for 4 s. |
| `page-motion.js` | Shared entrance effects and header state. |
| `music-library.js` | Track dates, display names and labels; the published shelf of spines and sketch notebook (`data-layout="spines"`), and the cover shelf and sketch ledger of the review pages. |
| `music-player.js` | Track selection and the display roles it fills (name, note, facts, film link, set position), queue, transport, seek, volume, filters, review-page covers, lock-screen artwork and player state. |
| `music-visualizer.js` | The meter-bridge audio analyser and the level meter of the playing list row. |
| `contact-actions.js` | Contact-page actions and progressive enhancement. |
| `clock-face.js` | Shared Vienna time parts and UTC offset, the sun over Graz (altitude and phase of the day), hand transforms and SVG ticks for contact clocks. |
| `contact-clock.js` | Windable contact clock: daylight face, crown, caption (with the visitor's own clock), hold after release, ratchet click and interaction state. |
| `contact-time.js` | Clock treatment on the separate contact-time review page. |
| `colophon-clock.js` | Time display in the shared footer. |
| `cine.js` | One-shot project reveals, including live reduced-motion changes. |
| `local-video.js` | Local-video enhancement on configured project pages. |
| `video-facade.js` | Click-to-load YouTube embeds on the pages that configure it: the poster button is replaced by the player (`autoplay=1&rel=0&enablejsapi=1`), so a page script can pause it through postMessage. |
| `prefetch.js` | Same-origin navigation prefetch. |
| `shadowframes.js` | Drives the ten-slot investigation board: the range input (native keyboard support) and its two buttons toggle .is-pinned on the photo slots, develop each newly pinned photo from black, and rewrite the aria-live ProgressiveAmbience stage/layers readout from a static Wwise stage table copied off SC_AMB_Progressive; the slots themselves are a pointer/touch shortcut only, staying aria-hidden. |
| `sidar.js` | SIDAR NULL: Scanner console: Scan key, frame reveal and the prototype recording on one screen. |
| `xrlabs.js` | XR Labs: Floor-plan positions that draw the shot path to each trainee position. |
| `transientica.js` | Transientica: Practice lane played with K, S and H keys or touch pads, with timing feedback, and a button that jumps the 2025 prototype video straight to its live-demo timestamp. |
| `nottoday.js` | Not Today, Darling!: Stage tiles on the rack and inline time cues in the sections below it that play the one run recording, defaulting to the race stage. |
| `autotrim.js` | AutoTrim Exporter: Tool window whose pages follow the chapters, plus the Select across tracks demo. |
| `audioq.js` | AudioQ: Signal-chain rack of working knobs that show what the code does with each value. |
| `mowik.js` | Mówik: Hold F8 or F7 to run the dictation indicator and the RAM buffer strip. |
| `ai-audio-research.js` | AI Audio Research: Frame ruler that replays the measured latencies and plays each method’s sample. |
| `sounddesign.js` | Three sound redesigns: Spotting-sheet players: timecode marks that cue each sound in the clip. |
| `ifmc.js` | Drives both IFMC score reels: play/pause, drag- or keyboard-scrub via a range input synced to the audio, and cue buttons on the Clapping reel that seek 3s ahead of an annotated moment; paints the playhead and lights the current cue against a static, pre-measured loudness trace of each published track. Keeps the reels and the two embedded films from playing together: a reel that starts pauses the films, and a film that opens or reports playing (the YouTube player's postMessage state after a "listening" handshake) pauses the reels and the other film. |
| `richter.js` | Richter: Seismograph drum of the low end that scrubs the film and follows playback. |
| `pausedeserve.js` | Pause & Deserve: The P Pauses Death sign as a five-second pause toy. |
| `amorak.js` | Amorak: Ear-to-ear balance strip that scrubs the film and lights the louder ear. |
| `ray.js` | Ray: Colour strip of the whole film with light-shaft marks that cue the film. |

Scripts use local scopes and DOM hooks. Keep their loading order in configuration
and preserve accessible markup when JavaScript is unavailable.

Each contact clock loads `clock-face.js` before its controller. The read-only
`PortfolioClockFace` lexical API owns only face/time helpers; controllers keep
all timers, audio and interaction state. The contact clocks observe live motion
preferences and keep one refresh timer.
The windable clock's sound is optional: Web Audio failures must not interrupt
pointer, keyboard or ARIA state. Temporary click nodes disconnect when finished.

Music has one explicit audio element in `player-bar.html`. `music-player.js` owns
it; `music-visualizer.js` observes it after player initialization. Do not replace
`window.Audio` or use a hidden global to exchange the player instance. Track data
is authored once in `src/data/music-tracks.json`. The `musicCatalog` setting
selects an artwork variant; `scripts/build/music-catalog.cjs` fills the page’s
`<!-- MUSIC_TRACKS -->` marker before the static index and media checks run.
The browser still reads `#trackData .track-card`. The `data-src-e` values encode
local media paths, not secrets. Catalog edits also update sitemap lastmod.

`default` serves music and music-alt. `review` preserves the gradient-only
Electronic sketch and Miss You artwork in music-crate and music-reel. Overrides
may change artwork only; titles, dates and audio paths stay shared. Featured
selections and their order remain authored in each page.

A record's `title` is its key: selection, saved state and the lock screen use
it unchanged. The optional `name`, `note`, `about` (the stage sentence) and
`page` (the film page behind "Watch it with the film") are what the page,
player bar and sheet show. `art-kind` classifies the cover art as `genuine`,
`genuine?`, `ai?` or `ai`; music.html shows no cover, and a lock screen shows
one only when its kind starts with `genuine`, otherwise the track's gradient. Use
`npm run inspect -- --file src/data/music-tracks.json` to find all consumers.

Every music route loads `music-library.js` before `music-player.js`. Its explicit
`PortfolioMusicLibrary` API is a classic-script lexical binding, not a player
instance on `window`. It creates the existing library markup and formats track
metadata; selection, filtering and event handlers stay in the player. Keep this
order in `site.config.cjs`; the interaction tests execute each configured bundle.
See [browser maintenance notes](../src/js/README.md) for state and async boundaries.

The homepage's `[data-preview-video]` loops `assets/showreel-preview-editorial-v2.mp4` inside
the showreel button at every viewport size. It observes reduced motion, data
saving and page visibility, and pauses while the separate `.hero__film` plays.
The full showreel starts only from its launch button. Keep the close control and
return keyboard focus to the launch button after closing.

The hero's picture is one still frame from Shadow Frames (the bar,
`22_ShadowFrames_01` in 640/1200/1920 webp), faded into the page with CSS masks;
nothing in it moves or takes input. `home-transition.js` changes only whole-layer
transforms and hero opacity as projects cover the opening. It has no continuous
drawing loop. Reduced motion uses normal document flow without the transforms.
Coverage changes pause the thumbnail or close a completely covered full player.

The music analyser spans the stage under the selected piece and reads the
existing audio element. It draws only during playback while the bridge or the
playing row's level meter is visible, with reduced motion disabled; at rest it
shows its unlit segments. Stopping the drawing loop must not interrupt audio output.

Project-card videos use `[data-card-preview]` with a validated `data-src` path.
Only one runs at a time; its source loads on deliberate hover or keyboard focus.
Touch, reduced motion and data-saving preferences retain the still images.
Every homepage project link carries a `track-<slug>` class whose colour is copied
from that project's stylesheet, and a `data-tools` list taken from that page's
meta for the solo keys. Update both when a project's palette or tools change.

## Build and validation

`build.cjs` owns orchestration, configuration/source validation, template and
bundle assembly, referenced asset discovery and support-file generation.
It clears per-run caches, builds in staging, validates, then publishes.
Focused helpers under `scripts/build/` own document transforms, HTML utilities,
source composition, filesystem publication, output validation and size budgets.
The [build ownership table and contracts](../scripts/AGENTS.md) identify each
module and the relevant tests; start there instead of searching the runner.

`site-inputs.cjs` shares CSS/partial composition and standalone-entry normalization
with the inspector. `browser-assets.cjs` owns the isolated CSS transform and
JavaScript syntax gate; `seo.cjs` generates and validates structured data;
`music-catalog.cjs` renders shared track data; `music-index.cjs` builds the static
track index; `source-paths.cjs` enforces source
containment. Deployment and Search Console checks remain in `docs/SEO.md`.

`tests/build-output.test.cjs` checks a deterministic mix of pages, markup
transforms, media placeholders and support files against pre-refactor output.
It also checks repeated builds and source-cache invalidation. It does not render
a browser or replace a full-site build. Publication rollback and the Windows
locked-directory fallback have separate tests in `tests/output-files.test.cjs`.

`npm run check` validates without replacing `dist/`. `npm run build` publishes
the validated output locally. Neither renders video nor downloads source media.
The deployment workflow runs tests and a full build; only `main` publishes to
GitHub Pages. Pull requests run the checks without deploying.

`scripts/serve-dist.cjs` serves the built files on localhost, including byte ranges
for native media seeking, HEAD responses and the real 404 page. Tests exercise
those HTTP behaviors. It is a local development tool, not a deployment server.

`tests/browser-motion.test.cjs` uses the existing DOM/event doubles to cover
clock audio failures and live motion preferences. It runs with `npm test`.
The isolated Playwright workflow additionally runs `scripts/check-site-interactions.cjs`
after the homepage layout checks: every configured route at 320 px and desktop,
image loading, horizontal document overflow, script errors, project reveals and
contact-clock interactions and real Web Audio music playback with motion enabled.
`tests/music-visualizer.test.cjs` covers graph failures, drawing gates and context
resumption using deterministic audio doubles. Reports are saved under `layout-results/`.
These checks do not certify third-party embeds, all codecs or Safari/iOS behavior.

## Media and supporting tools

| Location | Purpose |
| --- | --- |
| `src/assets/` | Current website assets, including the compact showreel preview. |
| `old/public/assets/` | Images, audio, videos and other media retained from the earlier site. |
| `showreel/timeline.json` | Full showreel cuts, titles, transitions and gains. |
| `showreel/render.cjs` | Full renderer, mastering and media QA; documented in `showreel/README.md`. |
| `showreel/render-preview.cjs` | Retained large silent encodes and project-card previews. |
| `showreel/render-thumbnail.cjs` | Compact showreel preview, derived from `src/assets/hero-motion.mp4`. |
| `showreel/render-web.cjs` | Current extended-cut website delivery and eight-second silent preview. |
| `showreel/editions/editorial-v2/` | Current showreel edit, render report, poster and verification. |
| `showreel/sources.json`, `fetch-sources.cjs` | Public media source manifest and restoration tool. |
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
