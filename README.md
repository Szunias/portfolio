# Igor Szuniewicz - Portfolio

Personal portfolio site for Igor Szuniewicz — game audio designer and audio programmer.
Sound design, middleware integration (Wwise / FMOD), and interactive audio systems.

Live: https://igorszuniewicz.com

## Stack

Static HTML, built from small templates by a single Node script. Zero npm dependencies, zero framework.

- **Source:** `src/pages/*.html` (content) + `src/layouts/*.html` (shell) + `src/partials/*.html` (lightbox, player bar) + `src/css/*.css` + `src/js/*.js`
- **Build:** `build.cjs` inlines CSS/JS into each layout and emits static HTML to `dist/`
- **Config:** `site.config.cjs` defines every page (slug, layout, title, OG meta, etc.)
- **Deployment:** GitHub Pages via `.github/workflows/deploy.yml`

## Build

```bash
node build.cjs
```

Outputs to `dist/`. The script clears `dist/` on each run, so there is no stale output.

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
3. Run `node build.cjs` to verify it builds.

## Writing project descriptions

See `CLAUDE.md` for the project description writing guidelines used across this portfolio.
