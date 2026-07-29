# CV variants

This folder contains three editable HTML sources:

- `Igor_Szuniewicz_Technical_Sound_Designer.html` - for technical sound design, implementation and game audio roles.
- `Igor_Szuniewicz_Audio_Programmer.html` - for audio programming, tools and technical prototyping roles.
- `Igor_Szuniewicz_ATS.html` - a broad, single-column version for recruitment portals and ATS parsing.

The first two are the primary, visually designed CVs. They use a portrait, a compact sidebar and short evidence-led project summaries. The ATS file is intentionally plainer and more detailed.

Shared styles:

- `cv-visual.css` - the two role-specific versions.
- `cv-ats.css` - the plain ATS version.
- `cvsmile.jpg` - portrait used by the two role-specific versions.
- `AUDIT_PL.md` - Polish claim-by-claim audit against the published portfolio and current local source.

Generate all PDFs:

```powershell
node .\generate-pdfs.cjs
```

The script writes the PDF files to `..\pdf`.

All project titles in the PDFs link to the matching portfolio case study. Contact links are also active.
