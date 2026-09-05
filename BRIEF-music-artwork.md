# Brief: music page artwork and track titles

Task brief for an agent working in this repository. Read `AGENTS.md` and
`HUMANIZE-GUIDE.md` first — the portfolio copy rules there take precedence over
anything in this file.

## Context

`src/pages/music.html` lists 44 tracks in a `#trackData` block. Each is a
`div.track-card` carrying `data-title`, `data-year`, `data-kind`
(`release` | `sketch`), `data-duration`, `data-src-e` (base64 relative path),
`data-peaks` (120-step loudness envelope, base36) and, for 17 of them,
`data-thumb` / `data-art` / `data-art-size`.

Measured state today:

- 17 tracks (`data-kind="release"`) have cover art; 27 (`data-kind="sketch"`) have none and fall back to a CSS gradient in `data-gradient`.
- Of the 17 covers, 13 are square. Four are not: `IFMC-When-The-Clapping-Stops` 2.00:1, `IFMC-Walter` 1.85:1, `project5` (Ray) 0.71:1, `richter` 0.71:1.
- Three of those four sit in the six-tile "Selected work" grid at the top of the page, which forces `aspect-ratio: 1` with `object-fit: cover`. The 2:1 image loses half its width, the 1.85:1 loses 46%, the portrait loses 29% of its height.
- All 27 sketch titles are raw DAW export filenames: `electitrictydziwnymix6`, `kawalektestowy1`, `rocktdubstnowy3`, `nowymix4`, `metalzar2`, `goTTT`, `toto7`, `domm`, `noww`, `takieo3`, `mick(2)`, `Mixdown(2)`, `phonks2`, `house1`, `maxtechno`, `tecnorock`, `organ4`, `nowyrock5`, `fajnfin`, `horroruzyka`, `filmowy`, `metalek remaster`, `moj edm`, `egipski`, plus three that already read as titles: `TIME`, `Cinematic Game`, `state of shock`.

## Task A — Titles for the 27 sketches (highest value)

Raw export names read as a dumped project folder, and several are Polish or
contain typos. Replace them with short descriptive English titles.

**This needs the owner's input.** Do not invent what a piece is about. Tempo,
key and spectral character can be detected from the audio, but intent cannot.
Propose titles from audio analysis plus the existing filename hints, then have
them confirmed before writing anything into the page.

Rules for the new titles:

- English, sentence case, no numbers-as-versions (`nowyrock5` must not become `New Rock 5`).
- Say what the piece is, not what the file was: `horroruzyka` → `Horror cue`, `maxtechno` → `Techno sketch`, `organ4` → `Organ study`.
- Keep the date as the identifier; it is already shown next to every row and the archive is explicitly presented as dated sketches.
- Leave `TIME`, `Cinematic Game` and `state of shock` alone unless the owner asks otherwise.
- Update `data-title` only. `data-src-e` must keep pointing at the existing audio file — do not rename files on disk.

Anything referencing a title by string must be updated with it: `src/js/music-player.js` matches `data-featured-track` / `data-catalog-track` against `data-title`, and `localStorage` restores by title (key `music-player-v2`, stale entries degrade gracefully).

## Task B — Cover art for the 27 sketches

**Do not use an image generator for this.** On a sound designer's portfolio,
27 AI-generated sleeves read as generated, introduce a visual language that is
not the site's, and compete with the craft actually on display.

Build a deterministic cover system instead, driven by the track's own data:

- Input: `data-peaks` (already present, 120 values, produced by `npm run peaks` → `scripts/generate-peaks.cjs`), the date, and the title.
- Render a 1024×1024 plate: the track's own loudness envelope as the mark, the date in IBM Plex Mono, on the site's neutral background with the ice accent `#aac6de`.
- Every cover is then unique because the audio is unique, and the set reads as one deliberate system.
- Emit as real files under `old/public/assets/audio/covers/generated/`, plus 520×520 WebP thumbs alongside the existing ones in `covers/thumbs/`.
- Wire them through `data-thumb` / `data-art` / `data-art-size` exactly like the existing 17.

Run it as an offline script (`npm run covers`), the same pattern as `npm run peaks`. The build must stay zero-dependency and CI must not need extra tooling.

## Task C — The six featured tiles

Three of the six top tiles are centre-cropped film stills and posters sitting
next to three real album covers. Pick one approach and apply it consistently:

1. Commission or crop a deliberate square image for `When The Clapping Stops`, `Walter` and `Ray` — art direction, not an automatic centre crop; or
2. Change `.featured__grid` in `src/css/music.css` to a non-square aspect that suits the film-derived images, accepting that the three square album covers then get cropped instead; or
3. Give the three film-scored pieces the generated plate from Task B and keep the real release covers for the released singles.

Option 3 is the cheapest and keeps every tile in one visual language. Option 1 is the best-looking if someone is willing to do the cropping by eye.

## Explicitly out of scope

**Do not replace project screenshots on the case-study pages with generated
images.** The screenshots on `shadowframes`, `xrlabs`, `autotrim`, `audioq`,
`mowik`, `transientica` and the rest are evidence of real work. Replacing them
with generated pictures would misrepresent the projects. If a screenshot is
poor quality, retake it from the actual application.

## Repository constraints

- Live site is the static build in `src/`, assembled by `build.cjs`, pages registered in `site.config.cjs`. Never edit `old/`, `v2/`, `new-portfolio/` or `design-mockups/` as live code; `old/public/assets/**` is the exception and holds the media.
- **Any new `data-*` attribute that holds a file path must be added to the attribute allowlist in `collectLocalRefsFromHtml` in `build.cjs`.** It currently reads `href|src|poster|action|data-src|data-cover|data-thumb|data-art|data-autoplay-src`. An attribute missing from that regex is never copied into `dist/` and never validated — the build stays green and the file 404s in production.
- `build.cjs` also validates `url()` references in emitted CSS and parses every JS bundle with `vm.Script`; a syntax error fails the build.
- Run `npm run build` after any change. It must end with `local asset references validated`, `generated HTML validated` and a green size budget.
- The deploy budget is generous but finite: currently 214 files, 488.90 MB. Generated covers should be small — the existing 520 px WebP thumbs are 4–42 KB each.

## Acceptance criteria

- `npm run build` passes and every referenced cover lands in `dist/`.
- All 44 tracks have a thumb and full-size art; no track falls back to a bare gradient.
- No sketch title is a raw export filename, and no title contains a typo or a version number.
- Contrast on the music page stays at or above 4.5:1 for text and there is no horizontal overflow at 320 px.
- The six featured tiles read as one set rather than a mix of cropped stills and album covers.
