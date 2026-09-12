# Build and tooling ownership

These instructions supplement [../AGENTS.md](../AGENTS.md). The website build
requires Node.js 22+ and no npm packages. Media/CV tools have separate external
requirements and are not part of the website build.

## Find the right file

| Responsibility | Owner |
| --- | --- |
| Route registration, metadata, ordered page assets | `../site.config.cjs` |
| CLI orchestration, source/config checks, page assembly, asset discovery | `../build.cjs` |
| Shared CSS/partial composition and standalone normalization | `build/site-inputs.cjs` |
| Attribute/entity/base64 helpers for authored HTML | `build/html-utils.cjs` |
| Markup enhancement passes, aspect ratios and snapshot cleanup | `build/document-transforms.cjs` |
| CSS transform and classic JavaScript syntax gate | `build/browser-assets.cjs` |
| Structured data generation and validation | `build/seo.cjs` |
| No-JavaScript track index | `build/music-index.cjs` |
| Source containment and symlink checks | `build/source-paths.cjs` |
| Copying, comparing, publishing and restoring output | `build/output-files.cjs` |
| Read-only generated HTML and support-file validation | `build/output-validation.cjs` |
| Output size policy and warnings | `build/output-budget.cjs` |
| Route/source ownership and reverse queries | `site-map.cjs` |
| Human/JSON inspector CLI | `inspect-site.cjs` |
| Local preview HTTP behavior | `serve-dist.cjs` |

Paths in this table are relative to `scripts/`. Browser behavior belongs in
`src/js/`, not here. `../docs/CODEBASE.md` maps frontend and media responsibilities.

## Contracts to preserve

The builder owns **the order** of document transforms. A later pass may consume
attributes written by an earlier one. Extraction must preserve generated HTML
and CSS/JS bytes, not merely produce valid syntax.

`build/site-inputs.cjs` is the shared composition contract. The inspector must
not maintain a separate list of shared styles or partials. CSS supports both
one name and an ordered array; standalone entries support strings and objects
with optional output names. `noindex` routes are still deployed.

Pass repository/output paths explicitly to helpers. Do not make their behavior
depend on `process.cwd()` or move root-relative `__dirname` assumptions into
nested modules. Importing helpers must not build, publish or print CLI output.
Each call to exported `main()` must start with fresh source and emitted-asset
caches.

Build into a temporary directory, validate everything, then publish. Preserve
rollback and the Windows locked-directory fallback. That fallback copies assets
before entry points and removes stale files only after successful copying.
Close every opened descriptor even when a later open fails.

HTML utilities handle this repository's authored markup, not arbitrary HTML.
Keep `atob` semantics for encoded music paths: permissive Buffer decoding does
not match browser rejection or byte-string behavior. Do not treat base64 as
access control. Keep source containment checks at publication boundaries.

The source inspector is read-only and maps **entry inputs**, not every media
reference. JSON `files`, `unregistered` and `missing` cover the whole site even
when `routes` is filtered. Use `node scripts/inspect-site.cjs --json` for scripts;
`npm run inspect` adds an npm banner.

## Tests by concern

| Change | Tests under `tests/` |
| --- | --- |
| Extraction, transform order, output bytes or cache lifetime | `build-output.test.cjs`, `build-boundaries.test.cjs` |
| Publication, rollback, file comparisons | `output-files.test.cjs`, `build-boundaries.test.cjs` |
| Inspector queries and composition | `site-map.test.cjs` |
| CSS handling | `browser-assets.test.cjs`, `css-token-safety.test.cjs` |
| HTML/base64/music metadata | `browser-base64.test.cjs`, `music-index.test.cjs` |
| Structured data | `seo.test.cjs` |
| Preview HTTP server | `preview-server.test.cjs`, `preview-security.test.cjs` |

Run `npm test` and `npm run build` from the repository root. Tests use temporary
fixtures, not production media. Investigate any output-baseline mismatch rather
than changing expected results merely to make a refactor pass. Full-site build
validation is still required; fixture hashes do not replace browser checks for
changed frontend behavior.
