# Public CV

`cv.html` is the editable source for `Igor_Szuniewicz_CV.pdf` at the repository root.
The website build copies that PDF to the public download and its compatibility URLs;
it does not render the CV itself.

Generate it with Node.js 22+ and Firefox (no npm packages):

```sh
node scripts/build-cv.cjs --output /tmp/cv-preview.pdf
node scripts/build-cv.cjs
```

The first command writes a candidate for review; the second replaces the public PDF.
The script prints `cv.html` through headless Firefox and its built-in WebDriver BiDi,
at A4 with backgrounds and no margins. It refuses to write anything that is not exactly
one page. Firefox is found at `FIREFOX_BIN`, the default macOS or Windows install, or on
`PATH`. Open `cv.html` in Firefox to preview layout changes before printing.

After an edit, inspect the whole rendered page and the extracted text. Its order should
follow the page from top to bottom: name and role, contact, the featured frames
(each frame's title, meta and caption together), experience, projects, then tools,
education and languages. Two layout choices exist for text extraction: link cues are
borders rather than `text-decoration`, and the lines of a frame share one line pitch.
Keep all text at 8.5pt or larger.

Facts on the CV must match the project pages. Dates are explicit and must be reviewed,
not advanced automatically.

Assets:

- `fonts/` holds static Inter 400 and 600, generated from the site's
  `src/assets/fonts/inter-latin.woff2` with FontTools' variable-font instancer.
  Inter is licensed under the [SIL Open Font License](../assets/fonts/OFL-Inter.txt).
  IBM Plex Mono comes from `src/assets/fonts/`. The italic serif is the system
  Times New Roman Italic, the face the website uses for its accent word.
- `img/` holds the frames at the size they print (700 x 312 JPEG): HUSHABYE's
  nursery from `src/assets/hushabye/hushabye-film-1280.webp`, Shadow Frames and the
  XR Labs still, and a 300 px grayscale crop of `portrait.png`.
- `portrait.png` and `portfolio-qr.png` were extracted unchanged from the earlier
  public CV. The QR links to the portfolio.

The PDF embeds its fonts and keeps the links clickable. Firefox stamps a creation
date, so repeated builds are not byte-identical.
