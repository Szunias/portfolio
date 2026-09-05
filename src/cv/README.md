# Public CV

`content.json` is the editable source for `Igor_Szuniewicz_CV.pdf` at the repository root.
The website build copies that PDF to the public download and its compatibility URLs.

Generate it with Python 3 and ReportLab:

```powershell
python -m pip install -r src/cv/requirements.txt
python scripts/build-cv.py
```

Use `--output path/to/preview.pdf` to review a candidate without replacing the public PDF.
Render the result with `pdftoppm -png -scale-to 1800` and inspect the complete page after edits.
Also check extracted text with `pdftotext -raw`; its order should follow the page from top to bottom.

The dark layout retains the original portrait header, blue surname and sidebar.
The main experience, projects and education column is emitted before the sidebar
so extracted text keeps a deliberate reading order. Both columns use embedded
fonts and clickable contact/project links.
The generator refuses overflow rather than silently adding a page or reducing type size.
Fixed PDF metadata makes repeated builds from unchanged inputs reproducible.
Dates in the content are explicit; they must be reviewed, not advanced automatically.

`portrait.png` and `portfolio-qr.png` were extracted unchanged from the earlier
public CV. The portrait is clipped to rounded corners when drawing the PDF;
its pixels are not retouched. The QR links to the portfolio.

`fonts/` contains static weights 400 and 600 generated from the site's
`src/assets/fonts/inter-latin.woff2` using FontTools' variable-font instancer.
Their internal family is named Portfolio Inter, with distinct PostScript names
for each weight so PDF embedding cannot conflate the regular and semibold fonts.
Inter is licensed under the [SIL Open Font License](../assets/fonts/OFL-Inter.txt).
