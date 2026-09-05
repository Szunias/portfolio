# Hero waveform

`hero-waveform.svg` and `../js/home-waveform.js` adapt the mathematical signal
surface in the user-supplied **Igor-Szuniewicz-Edition-03.zip**, specifically
`igor-edition/make_art.py` and `igor-edition/motion.js`.

The surface is decorative artwork, not a game screenshot or an analysis of an
audio recording. It contains no raster images, external references or fonts.

The static SVG uses the same resting projection as the canvas: 120 parallel
curves, a 1040 × 760 view box, and a scale of 1.07 around the centre. Each curve
starts with 122 samples. Redundant points are removed with a maximum deviation
of 0.35 view-box units, and the remaining coordinates are rounded to one decimal
place. This keeps the fallback compact while retaining the shape and line density.

The canvas runs a gentle 3.9-second introduction, then draws only while pointer
movement is settling. It pauses while the showreel is open, offscreen, or in a
hidden tab. Reduced motion uses the static SVG. The surface requests no audio
access and is not an audio visualizer.

The controller expects a `[data-hero-wave]` element inside `.hero`, containing a
canvas and an image with class `.hero-wave__still`. It adds `is-ready` to the
stage after a successful paint. The showreel controller dispatches
`hero:playback` on `.hero` with `detail: { playing: true }` when opening and
`detail: { playing: false }` after closing.
