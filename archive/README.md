# archive/ — active static pages

Standalone HTML pages that are **part of the live site** but do not use the template/layout system. They are copied verbatim into `dist/` by `build.cjs` via `staticCopy` in `../site.config.cjs`.

| File | Purpose |
|---|---|
| `dae-page.html` | Digital Arts & Entertainment overview page |
| `nuonsoft-becpp.html` | Nuonsoft BE C++ page |

Edit these files directly. They bypass the layout system because they pre-date it and would require rewriting to fit.
