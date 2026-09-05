# Igor Szuniewicz — portfolio

Static HTML portfolio for game audio, sound design and audio programming.
Live site: [igorszuniewicz.com](https://igorszuniewicz.com).

The active website lives in `src/`. `site.config.cjs` registers its pages and
their styles and scripts. `build.cjs` generates `dist/` with no npm dependencies.
GitHub Pages publishes that output when changes reach `main`.

## Local workflow

Use Node.js 22 or newer. No install step is required for the website.

```sh
npm test
npm run build
npm run preview
```

The preview opens at `http://127.0.0.1:4173`. Rebuild after editing source files;
the preview serves the latest `dist/`. It supports audio/video seeking and HEAD
requests. Set `PORT` to use a different port.

| Command | Purpose |
| --- | --- |
| `npm run build` | Validate a temporary build, then replace `dist/` on success. |
| `npm run check` | Run the same build and validation without replacing `dist/`. |
| `npm test` | Test browser asset handling and local preview behavior. |
| `npm run preview` | Serve the generated website locally. |
| `npm run inspect` | Print every route, its source files and any unregistered source files. |
| `npm run peaks` | Regenerate music waveform data after changing audio; requires FFmpeg. |
| `npm run showreel:preview` | Regenerate the silent hero background; requires FFmpeg and source media. |

## Where to edit

| Change | Source |
| --- | --- |
| Homepage content and project order | `src/pages/index.html` |
| Opening film, name, role and showreel button | `src/css/home-hero.css`, `src/js/home-showreel.js` |
| Project-card video previews | `src/js/project-previews.js`, `src/assets/previews/` |
| Homepage sections below the film | `src/css/home.css` |
| Shared public theme and motion styling | `src/css/portfolio.css` |
| Shared header, footer and metadata markup | `src/partials/` |
| Shared fonts, design tokens and page chrome | `src/css/_fonts.css`, `_tokens.css`, `_chrome.css` |
| Project content | `src/pages/<slug>.html` |
| Music tracks and their metadata | `src/pages/music.html`, in `#trackData` |
| Music playback and artwork visualization | `src/js/music-player.js`, `music-visualizer.js` |
| Email copying, contact actions and interactive clock | `src/js/copy-email.js`, `contact-actions.js`, `contact-clock.js` |
| Routes, metadata and asset loading order | `site.config.cjs` |
| Template assembly and output validation | `build.cjs`, `scripts/build/` |
| Deployment | `.github/workflows/deploy.yml` |

See [the codebase map](docs/CODEBASE.md) for layout responsibilities, CSS order,
JavaScript contracts, media tools and review pages. `npm run inspect` gives the
current file list directly from configuration.
The [search visibility notes](docs/SEO.md) cover metadata validation, Search
Console checks and the custom-domain audit.

## Adding a project

1. Add `src/pages/<slug>.html` containing page content only.
2. Register the route, layout, ordered CSS/JS and metadata in `site.config.cjs`.
3. Add its homepage card and update the project navigation cycle.
4. Follow the content rules in [AGENTS.md](AGENTS.md).
5. Run tests and the build, then check the page at 320 px and desktop widths.
   Exercise any changed interactions.

The build checks registration, project navigation, metadata, document structure,
local links and fragments, referenced media, JavaScript syntax, CSS variables
and output size budgets. A failed build preserves the previous `dist/`.

## Historical files and media

`old/`, `archive/`, `v2/`, `new-portfolio/` and `design-mockups/` contain previous
implementations or design studies. They are not the active website.
Only referenced media under `old/public/assets/` (and other explicitly linked
legacy asset paths) is copied into the deployment; the old React app is not built.
Do not edit historical application code to change the current site.

`src/assets/` contains current site assets. `showreel/` contains the editable
video timeline, renderer and selected delivery files; see its
[rendering guide](showreel/README.md). Generated `dist/` and local QA captures
are ignored by Git and should not be edited as source.
