# Browser code

The route registry in `site.config.cjs` lists every script in execution order.
The builder syntax-checks each file and concatenates each page's scripts into
one deferred classic-script bundle. These files are not ES modules. The complete
route and stylesheet map is in `docs/CODEBASE.md`; `npm run inspect` lists inputs.

## Music

| File | Owns |
| --- | --- |
| `music-library.js` | Date/label and display-name formatting; markup for the published spines and sketch notebook, and for the review pages' shelf and ledger. |
| `music-player.js` | The audio element, selection and its display roles, filters, queue, transport, sheet, covers, lock-screen artwork and saved settings. |
| `music-visualizer.js` | The meter-bridge analyser drawn from that audio element and the playing row's level meter. |

Load the library before the player and the visualizer afterwards. The music helper
API is the read-only `PortfolioMusicLibrary` lexical binding. Keep audio state
inside the player and preserve the existing DOM classes, attributes and order.
Metadata is inserted with `textContent`, not interpolated into HTML.

There are two independent asynchronous boundaries in the player: `sourceVersion`
invalidates work for a previous track, and `playbackRequestVersion` invalidates an
earlier play request for the same track. Both are needed when a listener quickly
pauses and resumes.

The queue is rendered only when its upcoming tracks, position or repeat mode
changes. Ordinary play/pause events must preserve its buttons and keyboard focus.
Seek and volume rails accept one active pointer until release, cancellation or
lost capture, including devices with both touch and mouse input.

## Contact clocks

`clock-face.js` supplies the read-only `PortfolioClockFace` lexical API. Load it
before `contact-clock.js` or `contact-time.js`. Controllers retain their own
timers, motion preferences, audio and winding state. Never load both controllers
on the same route.

## Editing and checking

- Keep DOM hooks with the module that handles them; use the route registry to
  find all affected pages, including public noindex review variants.
- Comment ownership, ordering and non-obvious browser behavior. Avoid restating
  each operation or adding historical commentary next to straightforward code.
- Run `npm test` and `npm run build`. The browser-interaction tests execute the
  configured music scripts, including the helper dependency, in DOM/event doubles.
  They cover async playback failures, queue updates and pointer ownership.
- Check changed interactions in a browser at 320 px and desktop widths. DOM
  doubles do not measure layout or establish audio-codec/browser compatibility.
