# Project Guidelines

## Live architecture

The deployed portfolio is a static HTML build. Its source of truth is:

- `src/pages/*.html` for page content
- `src/layouts/*.html` for home, project and music shells
- `src/partials/*.html` for shared fragments
- `src/css/*.css` and `src/js/*.js`, inlined by the build
- `site.config.cjs` for page registration and metadata
- `build.cjs` for the zero-dependency build into `dist/`
- `.github/workflows/deploy.yml` for GitHub Pages

`old/`, `archive/`, `v2/`, `new-portfolio/`, `design-mockups/` and `.claude/agent-team-*.md` are legacy references. Do not edit them as live-site code. Changes under `old/` are limited to assets in `old/public/assets/`.

## Portfolio copy rules

1. Open with what the project is, Igor's exact role and one concrete contribution.
2. Use a structure that fits the project. Never force every page into the same case-study template.
3. Keep featured pages to 3–6 meaningful sections. Archive pages should be shorter.
4. Do not add snapshots, stats grids, fact sidebars or challenge cards by default.
5. State each metric once, with its version, scope and measurement context.
6. Use direct, understated English. Avoid rhetorical questions, fragments, hype and generic AI phrasing.
7. Put proof beside the claim: gameplay, profiler, diagram, code, before/after audio or a comparison table.
8. Headings must name their actual content. Avoid generic labels such as Overview, Challenges, Solution, Features, What I learned, The core system and The short version.
9. Use borders and backgrounds for media, data, code, interaction or warnings—not ordinary prose.
10. Describe limitations plainly. Never invent dates, metrics, credits, collaborators or technical claims.
11. Keep technical terms such as Wwise, FMOD, MetaSounds, RTPC, SVM and FFT in English.
12. Before publishing, compare claims with the public code, CV and other project pages.

## Validation

Run `npm run build` after live-site changes. Verify generated HTML, referenced assets, the narrowest supported viewport and any interaction that was changed.
