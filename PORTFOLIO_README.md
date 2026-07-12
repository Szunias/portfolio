# Igor Szuniewicz — Portfolio

Personal portfolio site for Igor Szuniewicz — game audio designer and audio programmer.
Sound design, middleware integration (Wwise / FMOD), and interactive audio systems.

Live: https://igorszuniewicz.com

> **Current version: static HTML (`src/` + `build.cjs`).**
> The `old/`, `v2/`, `new-portfolio/`, and `design-mockups/` directories are earlier iterations kept as backup — they are **not** the live site. See [Legacy / backup](#legacy--backup) below.

## Stack

Static HTML, built from small templates by a single Node script. Zero npm dependencies, zero framework.

- **Source:** `src/pages/*.html` (content) + `src/layouts/*.html` (shell) + `src/partials/*.html` (lightbox, player bar) + `src/css/*.css` + `src/js/*.js`
- **Build:** `build.cjs` inlines CSS/JS into each layout and emits static HTML to `dist/`
- **Config:** `site.config.cjs` defines every page (slug, layout, title, OG meta, etc.)
- **Deployment:** GitHub Pages via `.github/workflows/deploy.yml`

## Build

```bash
npm run build
```

Outputs to `dist/`. The script clears `dist/` on each run, so there is no stale output. `npm run check` runs the same build and validation gate used by GitHub Pages.

The build also validates the live site before deploy:

- every `src/pages/*.html` file is registered in `site.config.cjs`
- project cards and "Next Project" links cover every project exactly once
- local assets, local page links, and same-page fragments resolve in `dist/`
- generated HTML has required document basics, accessible buttons/iframes/videos, and no unresolved build placeholders
- page metadata has canonical URLs, social images, alt text, and reasonable title/description lengths
- deploy output stays within the configured total and single-file size budgets

For local preview, serve `dist/` with any static server (e.g. `npx serve dist`).

## Project Structure

```
build.cjs              # Build script (Node, zero deps)
site.config.cjs        # Page definitions (slug, layout, meta)
src/
  layouts/             # home.html, project.html, music.html
  partials/            # lightbox, player-bar
  pages/               # page content (one .html per page)
  css/                 # home.css, project.css, music.css
  js/                  # theme-toggle, lightbox, scroll-progress, scroll-reveal, music
  assets/              # favicon
old/                   # legacy assets (images, videos, audio, CV) — referenced by pages
archive/               # static archive pages (dae-page.html, nuonsoft-becpp.html)
dist/                  # build output (gitignored)
.github/workflows/     # GitHub Pages deploy
```

## Adding a new project page

1. Create `src/pages/<slug>.html` (content only — no `<html>`, `<head>`, or `<body>`).
2. Add an entry to `site.config.cjs` under `pages`.
3. Add a homepage project card and a `next-project-btn` link that keeps the project cycle complete.
4. Run `npm run check` to verify the page, metadata, assets, links, and generated HTML.

## Writing project descriptions

See `CLAUDE.md` for the project description writing guidelines used across this portfolio.

## Legacy / backup

The following directories are **not** part of the live site. They are kept in the repo as reference / asset source only:

| Directory | What it is | Why it's still here |
|---|---|---|
| `old/` | Previous portfolio built with React 18 + TypeScript + Vite + Tailwind + react-i18next | Its `old/public/assets/` (images, videos, audio tracks, CV PDFs) is still referenced by the current HTML pages. The React app itself is no longer deployed. |
| `archive/` | Standalone HTML pages (`dae-page.html`, `nuonsoft-becpp.html`) | Copied verbatim into `dist/` by the build via `site.config.cjs` `staticCopy`. |
| `v2/` | Earlier experimental rebuild | Not deployed, not referenced. |
| `new-portfolio/` | Another earlier experiment | Not deployed, not referenced. |
| `design-mockups/` | HTML/PNG mockups used to explore layouts | Not deployed, not referenced. |

**When editing the live site, touch only `src/`, `build.cjs`, `site.config.cjs`, and `.github/workflows/`.** Interacting with `old/` should be limited to adding or removing asset files under `old/public/assets/`.
