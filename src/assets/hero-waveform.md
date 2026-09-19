# Hero waveform

`hero-waveform.svg` adapts the mathematical signal
surface in the user-supplied **Igor-Szuniewicz-Edition-03.zip**, specifically
`igor-edition/make_art.py` and `igor-edition/motion.js`.

The surface is decorative artwork, not a game screenshot or an analysis of an
audio recording. It contains no raster images, external references or fonts.

The static SVG preserves the original resting projection: 120 parallel
curves, a 1040 × 760 view box, and a scale of 1.07 around the centre. Each curve
starts with 122 samples. Redundant points are removed with a maximum deviation
of 0.35 view-box units, and the remaining coordinates are rounded to one decimal
place. This keeps the artwork compact while retaining the shape and line density.

`../js/home-transition.js` gently translates and turns the entire `.hero-wave`
layer as projects cover the opening. It changes only transforms and hero opacity
on scroll, with no continuous render loop, canvas drawing or geometry updates.
Reduced motion keeps the normal document flow and disables these transforms.
The artwork is hidden while the showreel is open. It requests no audio access
and is not an audio visualizer.
