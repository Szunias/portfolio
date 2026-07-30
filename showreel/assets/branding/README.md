# Cinematic showreel identity assets

The active identity is the name itself: **IGOR SZUNIEWICZ**. There is no
separate symbol. Its recognisable device is a repeatable motion system: a single
scan crosses the frame and leaves the surname, its rule and a faint signal field
behind it, holds, then dissolves into the first project without a white flash.
The scan is the only motion in the ident, and everything it deposits is revealed
by the same animated clip on the same easing curve.

## Assets

- `igor-wordmark.svg` — active editable vector composition and palette
  reference. It is not imported automatically by the renderer.
- `render.cjs` — source of truth for the animated version, signal samples,
  timings, compositing and audio signature.
- `igor-signal-syntax.svg` and `.png` — rejected symbol study, retained only
  to document the iteration.
- `igor-ident-background-v1.png` and `igor-ident-cinematic-v1.png` — rejected
  generated art-direction studies, retained only as provenance.

The active SVG uses a `1920 × 1080` viewBox and live text so typography,
spacing, colour and supporting copy remain straightforward to edit. The
renderer recreates the composition with bundled static Inter Tight and IBM Plex
Mono instances and animates it at 60 fps. The wordmark is set in a real Inter
Tight Bold face rather than a synthetically emboldened variable default, and the
ident's rule and scan extents are measured against that face. Changes to the SVG should be mirrored in
`renderWordmarkIntro` and `renderWordmarkOutro`. The outro resolves to the same centred
wordmark, so identity stays consistent without inventing another glyph.

The generated background images remain at their original 1672 × 941
resolution, but the current render does not load them.

## Earlier key-visual prompt

```text
Use case: style-transfer
Asset type: 16:9 cinematic showreel title-ident key visual, intended for animation in a professional audio-programming portfolio reel
Input image: the supplied square logo is the edit target and identity reference; preserve the exact recognizable hand-drawn circular IS monogram geometry and proportions
Primary request: extend the canvas to a wide cinematic composition and turn the existing mark into an elegant film-ident hero image
Scene/backdrop: near-black graphite space with subtle paper/film texture, deep cool-blue falloff and restrained atmospheric haze
Subject: the original circular IS monogram centered, clean and isolated, rendered as pale brushed-silver/ice-white strokes with tactile handmade edges; a very faint larger echo ring and sparse spectral particles may sit behind it
Composition/framing: 1920x1080-style landscape, centered mark occupying about one third of frame height, generous negative space below for later typography added in code
Lighting/mood: controlled cool rim light, a narrow horizontal light sweep crossing the mark, soft bloom only around the brightest edges, premium cinematic studio ident, mysterious but not horror
Color palette: black, graphite, silver-white, muted ice blue #AAC6DE
Constraints: preserve the logo silhouette exactly; no words, no letters outside the logo, no watermark; background must remain dark enough for later white typography; keep the mark sharply readable
Avoid: red palette, horror blood/grunge, flames, gold, glossy 3D emblem, excessive lens flare, busy scenery, extra symbols, altered logo anatomy
```

The prompt above documents an earlier direction. Its generated monogram is not
used in the current ident.

## Active clean-plate prompt

```text
Use case: precise-object-edit
Asset type: clean 16:9 background plate for a cinematic logo ident
Input image: the supplied cinematic logo key visual is the edit target
Primary request: remove only the entire central circular IS monogram, including every white/silver stroke, its bright bloom and the faint large echo-ring outlines behind it
Scene/backdrop: reconstruct the removed area as seamless near-black graphite texture with the same restrained deep cool-blue haze and sparse tiny spectral particles already present
Lighting/mood: preserve the premium cinematic darkness; keep only a very subtle low-intensity horizontal atmospheric light band through the center, with no bright hotspot shaped like the old logo
Composition/framing: preserve the exact wide canvas, vignette, negative space and overall exposure
Constraints: change only what is needed to remove the logo and ring echoes; no text, no symbols, no replacement object, no watermark; the center must be clean enough for the original logo to be composited later
Avoid: visible inpainting seams, circular outlines, leftover white fragments, added scenery, red tones, excessive fog or lens flare
```
