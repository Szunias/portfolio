# Site audit team

Read-only auditors for the live static site (`src/` → `build.cjs` → `dist/`). They report; they never edit.

| agent | covers |
| --- | --- |
| `audit-build` | page registration, placeholder substitution, broken asset paths and internal links, dist size, deploy budget |
| `audit-seo` | titles, descriptions, canonicals, OG/Twitter cards, JSON-LD, robots, sitemap, heading structure |
| `audit-a11y` | alt text, keyboard paths, focus visibility, measured contrast, media controls, reduced motion |
| `audit-perf` | asset weight, responsive images, lazy video and audio, font strategy, render blocking, caching |
| `audit-copy` | the Portfolio Copy Rules in `AGENTS.md` and `HUMANIZE-GUIDE.md`: banned headings, AI phrasing, metric hygiene, claim verification, page length |
| `audit-visual` | rendered layout via headless Chrome over CDP at 360/768/1440px: overflow, typography scale, palette drift, spacing rhythm, layout shift |

Run the whole team with `/audit-site`, or a subset with `/audit-site seo a11y`. Add a focus argument to narrow it: `/audit-site copy music`.

Shared rules baked into every agent:

- Live site only. `old/`, `archive/`, `v2/`, `new-portfolio/`, `design-mockups/`, `tmp/` and the root `redesign-*.html` / `preview-*.html` mockups are legacy and are never audited.
- Every finding cites a file:line, a measured number or a captured screenshot. Nothing is reported from impression.
- An empty findings list is a valid result. Agents do not pad reports.

These files are current tooling. The `agent-team-*.md` files one directory up are archived planning notes from the earlier React iterations and are not instructions.
