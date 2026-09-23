# Igor Szuniewicz — 2026 showreel

This folder contains the complete editable source for the portfolio showreel.
The edit is intentionally code-driven so every source cut, caption, colour,
transition and gain decision remains visible and reproducible.

## Files

- `timeline.json` — edit order, source in/out points, captions, transitions and clip gain.
- `render.cjs` — deterministic FFmpeg renderer, caption generator, loudness pass and QA outputs.
- `render-preview.cjs` — large silent encodes and project-card previews.
- `render-thumbnail.cjs` — retained thumbnail exporter for the earlier three-clip preview.
- `render-web.cjs` — current extended-cut website film and compact silent preview.
- `editions/editorial-v2/` — current 1:59 edit, render report, poster and verification.
- `sources.json` — exact public source URLs, yt-dlp formats and local filenames.
- `fetch-sources.cjs` — reproducibly fetches the six high-resolution public demos.
- `assets/fonts/` — locally vendored OFL fonts, shipped as static instances.
- `assets/branding/igor-wordmark.svg` — editable vector reference for the
  active name-first identity.
- `assets/branding/` — active wordmark source plus retained rejected ident
  explorations and their generation prompts.
- `assets/source/` — local high-resolution source mirrors; ignored by Git because of their size.
- `output/igor-szuniewicz-showreel-2026-editorial-v2.mp4` — current website H.264/AAC delivery.
- `output/igor-szuniewicz-showreel-2026.mp4` — retained earlier delivery.
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

`assets/source/not-today-gameplay-round2.mp4` is the one source that is not
fetchable. It is minutes 2:43-3:45 of Igor's own 1920x1080 60 fps capture from
2 April 2026, kept because the published trailer is marketing footage while the
reel needs real gameplay and its real mix. Re-cut it from the original capture
rather than expecting `showreel:sources` to restore it.

## Website previews

The homepage hero shows one still frame from Shadow Frames and the compact silent
preview of this reel inside the Watch showreel button. The full showreel,
with audio and project credits, plays only after the visitor launches it.

The thumbnail is `src/assets/showreel-preview-editorial-v2.mp4`: 480×270, 24 fps,
eight seconds from the approved extended cut, H.264 CRF 24 and fast-start metadata.
It has no audio stream and is shared across viewport sizes. It pauses offscreen
or while the full player is open; reduced motion and data saving retain a still.
Rebuild it from the repository root with:

```powershell
node showreel/render-web.cjs
```

The older preview source, `src/assets/hero-motion.mp4`, retains three five-second cuts:
Ray at 74 seconds, Shadow Frames at 312.77 seconds and Akantilado at 10.33 seconds,
with 0.6-second crossfades. The large 1920×1080 encode and retained 720×1280
portrait variant use H.264 CRF 21/slow at 24 fps. They are no longer fullscreen
homepage backgrounds. Ray comes from the original 720p AV1 recording, which
limits its detail. After restoring the source mirrors, use
`npm run showreel:preview -- --hero-only` to rebuild both large encodes, then
rerun the thumbnail command. `--hero-mobile` rebuilds only the retained portrait.

Without a flag, `npm run showreel:preview` also writes two six-second silent
card previews to `src/assets/previews/`:
Shadow Frames at 312.77 seconds and Transientica at 30.07 seconds in the source
recordings. They are 960×540 at 24 fps and load only when a card is hovered or
focused with a keyboard. These assets and the thumbnail are versioned for
clean-checkout builds; the website build does not run the media renderers.

## Render the full showreel

Requirements:

- Node.js 22 or newer
- FFmpeg and FFprobe available on `PATH`

FFmpeg 4.4 and newer are both supported. The renderer probes once for
`-fps_mode` and falls back to `-vsync` on builds that predate the rename.

From the repository root:

```powershell
npm run showreel:render
```

To rebuild captions, final loudness processing and the H.264/AAC delivery from
the existing lossless timeline:

```powershell
npm run showreel:master
```

This fast path verifies a composition fingerprint before it runs. If cuts,
transitions, source processing, intro/outro composition or render dimensions
changed, it refuses the stale intermediate and asks for a full
`showreel:render`. Caption copy, post-master trims, loudness targets and delivery
encode settings can be changed with `showreel:master`.

To refresh the contact sheet, probe metadata and loudness report without
re-rendering the edit:

```powershell
npm run showreel:qa
```

If the working copy sits on a filesystem that permits writes but refuses
`unlink`, add `--keep-build` to reuse `showreel/build/` instead of clearing it.
Intermediates are overwritten in place under the same deterministic names.

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
- AAC-LC stereo, 48 kHz, 256 kb/s
- lossless FFV1 + 24-bit PCM intermediates
- one lossy video encode, at x264 CRF 17.2 / slower
- BT.709 colour metadata
- target loudness: -16 LUFS integrated
- true-peak ceiling: -2.4 dBTP before AAC, leaving headroom for codec overshoot
- fast-start metadata for web playback

The final encode is measured again after AAC. Check `render-report.json` before
publishing.

## Transition grammar

The reel uses one transition vocabulary and nothing else. Mixing wipes, pushes
and dips to black reads as a template, so `timeline.json` is restricted to three
moves with a stated meaning:

| move | duration | when |
| --- | --- | --- |
| cut | `0.034` (two frames at 60 fps) | another angle inside the same project |
| dissolve | `0.28` | a new project begins |
| dip to black | `0.5` | only where the programme hands over to the outro |

The one exception is the ident handing off to the first shot, which dissolves
over `0.4` so the wordmark resolves into the footage rather than disappearing
behind a cut. A cut is expressed as the shortest transition the frame rate
allows rather than as zero, because the composer crossfades audio over the same
window; anything shorter risks a click, anything longer stops reading as a cut.

## Audio layout

Audio is laid out independently of the picture, and this is deliberate.

The renderer used to chain `acrossfade` with the same duration as the video
`xfade`, which meant a two-frame picture cut got a two-frame audio crossfade.
Sounds cut mid-event simply stopped, and that is what reads as chopped. The
durations could not just be lengthened either: `acrossfade` shortens the audio
timeline by each overlap, so any mismatch with the video overlap accumulates
into drift across the programme.

So each segment gets its own audio render with handles - `AUDIO_HANDLE_IN`
before the picture in-point and `AUDIO_HANDLE_OUT` after the out-point - and the
handled renders are placed on a common timeline with `adelay` and summed with
`amix`. Fades live on the handles rather than on the cut, using equal-power
`qsin` curves, so a 440 ms audio fade can sit under a two-frame picture cut and
the incoming sound arrives before its picture. That pre-lap is what actually
stitches an edit together.

Head handles are clamped to the segment's in-point, so a clip that starts near
the beginning of its source simply gets a shorter handle rather than failing.
The handle lengths are part of the composition fingerprint, because they are
baked into `build/timeline.mkv`.

Measured on the current cut, this took the average level dip at a cut from
18.8 dB to 7.0 dB and removed a full dropout to silence at the Pause & Deserve
chase cut. The AI Audio Research entry still dips further than the rest; its
source is roughly 11 dB quieter than its neighbours and carries near-silence at
the join, which is a choice of in-point rather than a mix problem.

## Fonts

libass cannot instance variable fonts. Asking a variable Inter Tight for bold
gets synthetic emboldening, which smears the stems at display sizes and was the
main reason the old wordmark looked soft. `assets/fonts/` therefore ships static
instances generated from the upstream variable sources — `InterTight.ttf` (400),
`InterTight-SemiBold.ttf` (600), `InterTight-Bold.ttf` (700) and `Inter.ttf`
(400, `opsz` 18). Styles that ask for bold now resolve to a real bold face.

Ident geometry is measured against these files. Inter Tight Bold at the size set
in the `IntroWordmark` style renders `SZUNIEWICZ` 978 px wide; the constants at
the top of `buildAss` depend on that. Changing the wordmark size or tracking
means re-measuring the rule and scan extents alongside it.

## Per-segment grade

`segment.grade` accepts `brightness`, `contrast`, `saturation` and `gamma` and maps
to a single `eq` filter. It exists for one honest reason: two sources in this reel
are lit so far down that on a laptop they read as black, and a reel where a project
shows nothing is worse than a reel that lifts that project slightly.

Pause & Deserve is the case in point. It is lit only by a flashlight cone, so an
additive `brightness` lift does almost nothing except raise the black floor into
grey murk. A gamma lift is what actually recovers the vegetation. Measured on the
current cut, `gamma: 2.0` with `contrast: 1.1` makes the bushes and ground readable;
`gamma: 2.35` and above turns the blacks milky and the frame stops reading as an
unlit game. The grade is deliberately per-segment and never global.

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

The ident is one gesture. A scan crosses the frame and leaves the wordmark, its
rule and a faint signal field behind it; everything it leaves is revealed by the
same animated clip rectangle on the same easing curve, so the reveal cannot
drift out of step with the bar that is supposed to be causing it. The scan bar
is the same plate seen through a travelling slit, which means bar position and
reveal edge are the same edge by construction rather than by matched timings.

There is no separate symbol, no displacement glitch and no full-frame noise
overlay. The plate carries only a controlled dark gradient, corner falloff and
enough grain to keep 8-bit yuv420p from banding across a near-flat dark field;
every graphic element lives in the caption pass. The name and its repeatable
motion are the trademark.

Both audio sources are anchored to `IDENT_LAND`, the moment the scan reaches the
end of the name, so the low body transient and the rule's single brightening
happen on the same frame. Transients before that are spaced across the scan's
travel rather than on an arbitrary grid. The band-limited signature uses a D/A/D
harmonic body, audible midrange transients and a 44 Hz high-pass instead of a
sub-frequency bed.

`assets/branding/igor-wordmark.svg` preserves the editable static composition.
The SVG is an explicit layout and palette reference, not an imported render
dependency; edit `renderWordmarkIntro`, `renderWordmarkOutro` and the ident
constants in `buildAss` alongside it when changing the animated identity.

To iterate on the ident without a full programme render:

```powershell
node showreel/render.cjs --ident-only
node showreel/render.cjs --outro-only
```

Each writes a short preview and a frame grid into `showreel/output/`.

Earlier AI plates and the rejected `Signal Syntax` mark remain in
`assets/branding/` only as provenance. They are not read by the active renderer.
