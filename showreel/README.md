# Igor Szuniewicz — 2026 showreel

This folder contains the complete editable source for the portfolio showreel.
The edit is intentionally code-driven so every source cut, caption, colour,
transition and gain decision remains visible and reproducible.

## Files

- `timeline.json` — edit order, source in/out points, captions, transitions and clip gain.
- `render.cjs` — deterministic FFmpeg renderer, caption generator, loudness pass and QA outputs.
- `sources.json` — exact public source URLs, yt-dlp formats and local filenames.
- `fetch-sources.cjs` — reproducibly fetches the six high-resolution public demos.
- `assets/fonts/` — locally vendored OFL fonts used by the portfolio.
- `assets/branding/igor-wordmark.svg` — editable vector reference for the
  active name-first identity.
- `assets/branding/` — active wordmark source plus retained rejected ident
  explorations and their generation prompts.
- `assets/source/` — local high-resolution source mirrors; ignored by Git because of their size.
- `output/igor-szuniewicz-showreel-2026.mp4` — final website-ready H.264/AAC delivery.
- `output/poster.jpg` — website poster regenerated from the stable intro hold.
- `output/contact-sheet.jpg` — quick visual overview of the current render.
- `output/render-report.json` — resolved timeline, source metadata and final loudness measurements.

The renderer reads existing portfolio media in place and uses local mirrors of
Igor's public Shadow Frames, Not Today, Pause & Deserve, Transientica, AudioQ
and Akantilado videos. Those mirrors stay in the editable project locally,
while `sources.json` and the fetch command make them reproducible without
committing the large gameplay files to Git.

## Fetch high-resolution sources

Requirements:

- yt-dlp
- FFmpeg

From the repository root:

```powershell
npm run showreel:sources
```

Existing files are left untouched. Missing files are downloaded in the exact
formats recorded in `sources.json`.

## Render

Requirements:

- Node.js 22 or newer
- FFmpeg and FFprobe available on `PATH`

From the repository root:

```powershell
npm run showreel:render
```

To rebuild only captions, final loudness processing and the H.264/AAC delivery
from the existing lossless timeline:

```powershell
npm run showreel:master
```

To refresh the contact sheet, probe metadata and loudness report without
re-rendering the edit:

```powershell
npm run showreel:qa
```

To remove only rebuildable intermediates:

```powershell
npm run showreel:clean
```

The clean command is constrained to `showreel/build/`; it never removes source
media or final deliveries.

## Delivery specification

- 1920 × 1080
- 60 fps CFR
- H.264 High Profile, yuv420p
- AAC-LC stereo, 48 kHz, 320 kb/s
- lossless FFV1 + 24-bit PCM intermediates
- one lossy video encode, at x264 CRF 16.1 / slower
- BT.709 colour metadata
- target loudness: -16 LUFS integrated
- true-peak ceiling: -2.4 dBTP before AAC, leaving headroom for codec overshoot
- fast-start metadata for web playback

The final encode is measured again after AAC. Check `render-report.json` before
publishing.

## Editing notes

Change cuts, crops and copy in `timeline.json`. `transitionIn.duration` is
included in both the video xfade and equal-power audio crossfade. For source
audio, use small manual `gainDb` corrections; the final two-pass loudness stage
handles the programme as a whole without flattening every project independently.
`postMasterGainDb` is reserved for a final local trim after programme
normalization; its ramp duration is controlled by `postMasterFade`.

`audio.mode: "bed"` remains available for visuals that cannot honestly carry
their source soundtrack. It generates a deliberately quiet, high-passed neutral
tone rather than implying that unrelated audio is Igor's work. The current edit
does not use it.

The current reel uses original audio for Shadow Frames, Not Today, the two Wwise
implementation exercises, Transientica, AudioQ, the AI research prototype, Ray,
Akantilado and Pause & Deserve. Ray is labelled as Igor's score and credits the
film's sound designers; Akantilado credits Noah Bots' score.

The active intro borrows the reveal discipline of the SIDAR NULL teaser without
copying its project identity: a scan wave assembles `SZUNIEWICZ` from vertical
signal samples, followed by one restrained displacement and a readable hold.
There is no separate symbol. The name and its repeatable motion are the
trademark. The complete animation is procedural in `render.cjs`, while
`assets/branding/igor-wordmark.svg` preserves the editable static composition.
The band-limited audio signature uses a D/A/D harmonic body, audible midrange
transients and a 44 Hz high-pass instead of a sub-frequency bed.

Earlier AI plates and the rejected `Signal Syntax` mark remain in
`assets/branding/` only as provenance. They are not read by the active renderer.
