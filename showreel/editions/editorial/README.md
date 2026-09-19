# Showreel — editorial cut

A separate 63.95-second edit for review. The original 75-second website film,
its timeline and its media outputs are retained unchanged.

The new edit opens directly on Shadow Frames. It follows with Not Today,
Pause & Deserve, Transientica, AudioQ, Akantilado and Ray. Direct picture cuts
replace the repeated dissolves; a single 0.4-second dissolve leads to the
closing card. The original Ray soundtrack continues without an audio splice
under that card and fades over its final 1.4 seconds.

The captions name Igor's role and contribution. The film credits Noah Bots'
score in Akantilado, the sound design by Tijn Valcke and Charlie Vervaecke in
Ray, and the library music in Pause & Deserve. XR Labs public client footage
and the short AI editor demonstration are omitted from this focused cut.
AudioQ shows its actual recorded interface, with space below for the credit.

## Edit and render

Edit `timeline.json` beside this file. Source paths remain relative to the
repository root. Typography is in `showreel/editorial-captions.cjs`.

From the repository root:

```powershell
node showreel/render.cjs --edition editorial
```

To update only captions and mastering after an existing render:

```powershell
node showreel/render.cjs --edition editorial --master-only
```

Outputs are in this edition's `output/`, and intermediates in its `build/`.
Neither command changes the original film in `showreel/output/` or publishes
the new cut to the website. The render report records timings and loudness.

## Audio edit

Original project sound stays in sync with the picture. Crossfades use matching
60 ms handles / 120 ms fades inside projects and 120 ms handles / 240 ms fades
between projects. The first shot has no incoming handle. The existing limiter
now compensates its lookahead delay. There is no added music bed.

Not Today is raised by 1.5 dB compared with the previous input gain;
Transientica is reduced from +4.6 to +2 dB. Akantilado's action excerpt is
reduced by 1 dB. Overall loudness targets -16 LUFS with pre-AAC headroom of
-2.4 dBTP; the encoded result must be checked in the render report.

The render is 1920 x 1080, 60 fps, H.264 with stereo AAC at 48 kHz / 320 kb/s.
Intermediate picture and audio are lossless. The original source recordings
set the available image and sound quality; no interpolation or replacement
sound is used.

## Verification

The export has 3,837 picture frames and a 63.950-second duration. The finished
H.264 and AAC streams pass a complete decode. Measured encoded loudness is
-16.21 LUFS with a -2.20 dBTP peak. Selected full-resolution frames were checked
for caption legibility, safe margins and accurate role/credit copy against the
current portfolio pages. The 24 repository tests pass, including synthetic
frame-accurate cut checks.

In the lossless composite, the interior of each source segment matches its
placed audio stem sample for sample. Ray continues as a single stem through
the closing card. Audio review is numerical; it does not include a perceptual
listening test. `output/validation.json` records the final file checksum, stream
checks, audio measurements and the unchanged original film's checksum.
