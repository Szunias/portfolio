# Maintenance audit and known overlaps

Audit base: `3590f98e74303a225868a691de41a7b3344bd2e0`, after PRs #93, #97 and #98.
This is a scoped maintenance decision record, not a claim of zero duplication.
[CODEBASE.md](CODEBASE.md) remains the file ownership registry;
[../scripts/AGENTS.md](../scripts/AGENTS.md) owns build-module contracts.

## Finding the correct implementation

Start with [../AGENTS.md](../AGENTS.md), then query the registered page and all
owners of the file before editing. For example:

```sh
node scripts/inspect-site.cjs --page contact
node scripts/inspect-site.cjs --file src/js/contact-clock.js
node scripts/inspect-site.cjs --file src/partials/player-bar.html
node scripts/inspect-site.cjs --file music-preview.html
```

The first three queries describe configured inputs. The last identifies an
unregistered root study; it does not select the published music page.
The inspector scans the page/layout/partial/CSS/JS directories and top-level
HTML. It does not recursively classify archived applications, follow imports,
list functions, or discover media references. `--file build.cjs` is outside its
entry-input scope; use the build ownership table, not an empty result, to decide
whether a build helper is in use. The full builder owns referenced-media checks.

For browser changes, inspect the DOM hooks and named functions in the selected
script, then follow the CSS loading order from configuration. For build changes,
follow imports from `build.cjs` into the module identified by the build guide.
Tests and fixtures may repeat markup on purpose; they are not deployed code.

## Overlaps that still need a deliberate decision

| Family | Actual overlap | Safe next step |
| --- | --- | --- |
| Contact clock face | `src/js/contact-clock.js` and `src/js/contact-time.js` repeat time-part formatting, `phaseName`, `setHand` and SVG tick generation. | A focused shared face/time helper is a reasonable refactor. Keep winding, pointer ownership, audio, timers and rewind state in their own controller; test both configured variants before changing loading order. |
| Contact identity and time zone | The two clock scripts, `contact-actions.js` and `colophon-clock.js` repeat the Vienna zone. `contact-actions.js` also contains the mail destination while page HTML contains visible mail links. | A zone or email change is cross-file today. Compare the visible address, generated mailto target and all time labels; do not assume changing one HTML string updates the scripts. Avoid a generic global utility merely to remove a constant. |
| Music catalogue | `src/pages/music.html`, `music-alt.html`, `music-crate.html` and `music-reel.html` each author a `#trackData` block. | Public catalogue edits start in `music.html`. Decide whether review variants should receive that edit or remain snapshots. Compare complete records and featured-track references before introducing one shared catalogue. Their data has not been proved interchangeable by this audit. |
| Repeated page styling and markup | Review variants and responsive/theme overrides intentionally share selectors and some structure. | Distinguish a repeated rule from an intentional later override. Do not delete a selector because it appears twice, or replace different review bodies with one generic template. |

The clock duplication is real technical debt, not evidence that #97 was wrong:
that PR fixed runtime behavior in both controllers. The music controller/library
split and shared build composition already give those responsibilities clear
owners; they do not deduplicate every authored dataset or every clock helper.
This audit does not extract those runtime families or modify their output.

## Root references that can mislead a new contributor

`concept-*.html`, `preview-*.html`, `redesign-*.html`, `music-preview.html` and
`ifmc-preview.html` are root-level studies. Their familiar selectors are not
proof that they supply the current site. `READMEtra.md` describes the separate
Transientica project. `REDESIGN-PLAN.md` refers to an older Tailwind design.
Neither is the current website implementation guide.

Keep those references unless a separate archival change checks their consumers.
In particular, a root location alone does not make a file obsolete: root media
and the CV are still referenced, and `staticCopy` can explicitly publish root
inputs. Likewise, registered `noindex` review routes remain public build outputs.
The inspector's `unregistered` label means no registered entry owner was found,
not unused, private, safe to delete, or guaranteed absent from every tool output.

## Checks that protect navigation

`tests/architecture.test.cjs` checks that every registered browser script has
an ownership-table entry, that music dependencies precede their consumers and
that a route never loads both contact-clock controllers. These are structural
contracts, not a semantic clone detector or a proof that documentation is true.

`tests/site-map-scope.test.cjs` covers root-study discovery, bounded traversal,
standalone ownership and object-member names in reverse queries. Unknown input
names must yield the ordinary diagnostic, not an inherited-method TypeError.

The browser workflow includes build helpers and the preview server in its PR
path filters and also checks pushes to `main`. A successful old PR run is not a
substitute for checking the combined revision. Post-merge browser QA is a
separate job from deployment; this does not turn it into a deployment gate.
Keep test results tied to the exact commit and do not equate a green build with
all-browser, all-codec or pixel-perfect verification.

## Scope

The review covered repository entry instructions, the route/source mapper,
shared build composition and validation boundaries, the clock family, music
catalogue ownership, root-study classification and QA triggers. It was not a
line-by-line audit of every archived app, every CSS declaration, every media
file or every track record. Similarity findings are grounded in those inspected
families, not a claimed whole-repository clone percentage.
