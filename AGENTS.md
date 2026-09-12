# Project Guidelines

## Start here

Read this file first, then [the codebase map](docs/CODEBASE.md). Do not search
historical implementations to infer how the current site works.

| Task | First stop |
| --- | --- |
| Find the inputs for a page | `npm run inspect -- --page <slug>` |
| Find which pages load a file | `npm run inspect -- --file src/js/<name>.js` (also accepts CSS, layouts and partials) |
| Review duplication or unfamiliar root files | [Maintenance audit](docs/MAINTENANCE.md), then the ownership map |
| Change website content or interactions | `src/`; use the ownership map in `docs/CODEBASE.md` |
| Change build, validation or developer tooling | [scripts/AGENTS.md](scripts/AGENTS.md) |
| Change portfolio wording | Copy rules below and `HUMANIZE-GUIDE.md` |
| Change CV or render media | `src/cv/README.md` or `showreel/README.md` |

`node scripts/inspect-site.cjs --json` produces a machine-readable input map
without npm's command banner. It reports missing inputs and unregistered
sources, including shared partials and top-level HTML studies. This is not a
dead-code detector or an import graph. Media referenced inside HTML/CSS is still
resolved by the full build, not by this entry-input map.

## Live architecture

The deployed portfolio is a static HTML build. Its source of truth is:

- `src/pages/*.html` for page content
- `src/layouts/*.html` for home, project and music shells
- `src/partials/*.html` for shared fragments
- `src/css/*.css` and `src/js/*.js`, bundled into content-hashed assets by the build
- `site.config.cjs` for page registration and metadata
- `build.cjs` for orchestration; `scripts/build/` for focused build helpers
- `.github/workflows/deploy.yml` for GitHub Pages

`old/`, `archive/`, `v2/`, `new-portfolio/`, `design-mockups/` and `.claude/agent-team-*.md` are legacy references. Do not edit them as live-site code. Changes under `old/` are limited to assets in `old/public/assets/`.

A registered `noindex` review route is still built and publicly accessible.
It is not an archived implementation or private content. Do not remove it or
rename media paths as a side effect of cleanup.

## Maintenance boundaries

Start searches in the registered inputs, not across every historical copy.
Root `concept-*.html`, `preview-*.html`, `redesign-*.html`, `music-preview.html`
and `ifmc-preview.html` are studies, not the page sources. `READMEtra.md` is a
Transientica reference; `REDESIGN-PLAN.md` describes an older Tailwind design.
Neither overrides the current build. An unregistered result is not permission
to delete a file: check standalone registrations, references and offline tools.

For cleanup-only work, preserve page copy, markup, selectors, media URLs,
CSS cascade and classic-script order. Do not change the design while moving
build responsibilities. Keep generated `dist/` out of source edits.

Comments should explain ownership, ordering, constraints or a non-obvious
reason. Do not narrate obvious statements or paste task history into source.
Update the ownership map when moving a responsibility; keep detailed build
rules in `scripts/AGENTS.md` rather than copying them into every agent file.

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

Run `npm test` and `npm run build` after live-site changes. Verify generated HTML, referenced assets, the narrowest supported viewport and any interaction that was changed.

For build-only refactors, `tests/build-output.test.cjs` checks deterministic
output against the pre-refactor builder and verifies repeated builds. This does
not replace a full build or browser checks when changing frontend behavior.

`tests/architecture.test.cjs` checks browser ownership documentation, music
script order and exclusive clock writers. These guards do not detect all code
duplication; review the known overlaps before proposing a shared abstraction.
