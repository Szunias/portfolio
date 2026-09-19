# Showreel revision — original exposure and longer scenes

This revision responds to the request to remove the brightened Pause & Deserve
image and let each excerpt run longer. It preserves the original exposure and
colour of every source. No `grade`, gamma, brightness or contrast adjustment is
applied. The earlier cut remains in `../editorial/` for comparison.

The new edit lasts 119.25 seconds. Each project is one continuous excerpt:

| Project | Source in–out | Picture duration |
| --- | --- | --- |
| Shadow Frames | 180.500–196.500 | 16.000 s |
| Not Today, Darling! | 13.967–32.000 | 18.033 s |
| Pause & Deserve | 65.000–86.750 | 21.750 s |
| Transientica | 30.067–42.067 | 12.000 s |
| AudioQ | 54.000–68.000 | 14.000 s |
| Akantilado | 10.333–29.800 | 19.467 s |
| Ray | 74.000–89.000 | 15.000 s |

Pause & Deserve now includes the doorway, pause instruction, timer, chase and
death event, ending before the menu. Akantilado keeps the source film's native
cuts and a complete action sequence. Ray's original sound continues through
the closing card to source time 92.000, before the next film scene.

## Render

From the repository root:

```powershell
node showreel/render.cjs --edition editorial-v2
```

The editable source is `timeline.json`. The renderer writes only this edition's
`build/` and `output/`. The delivery is 1920 x 1080 at 60 fps, H.264 / AAC stereo,
using lossless picture/audio intermediates. The original film on the website
and the earlier 64-second cut are retained.

Audio remains synchronous with the original footage. Between projects it uses
120 ms handles with complementary 240 ms fades. There are no internal audio
edits within a project. Ray uses one uninterrupted audio stem into the endcard.
Authorship credits and the original recordings' music are retained.

`output/render-report.json` records exact timings and measured encoded
loudness. `output/validation.json` records completed verification, including
the check that Pause & Deserve retains the source exposure. Visual review and
numerical audio checks do not constitute a perceptual listening test.

The actual lossless Pause & Deserve render was compared with the original
at source times 72, 78 and 83 seconds. All three complete YUV frames match
pixel for pixel after the same frame-rate/sizing operation, confirming that
the earlier gamma 2.0 / contrast 1.1 correction is gone. This check is performed
before adding captions and encoding the final H.264 delivery.

## Website delivery

Run `node showreel/render-web.cjs` after rendering this edition. It creates the
versioned website film in `showreel/output/` at 1080p60, H.264 CRF 20, and copies
the mastered AAC audio without re-encoding. The smaller video fits the website's
80 MiB per-file budget. It also exports an eight-second silent button preview.
The homepage links to this delivery, displays 01:59 and uses this edition's poster.
The original website film remains available in the repository history and files.
