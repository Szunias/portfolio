---
description: Run the site audit team (build, SEO, accessibility, performance, copy, visual) and merge the results into one prioritised report.
argument-hint: "[all | build seo a11y perf copy visual] [optional page or area to focus on]"
---

Run an audit of the live static site with the specialised audit agents in `.claude/agents/`.

Arguments: $ARGUMENTS

## What to run

If the arguments name specific areas, launch only those agents. If they are empty or say `all`, launch all six:

| area | agent |
| --- | --- |
| build | `audit-build` |
| seo | `audit-seo` |
| a11y | `audit-a11y` |
| perf | `audit-perf` |
| copy | `audit-copy` |
| visual | `audit-visual` |

If the arguments name a page or area to focus on (for example `music` or `project pages`), pass that focus into every agent prompt and tell them to limit their audit to it.

## How to run it

1. Run `node build.cjs` once yourself first, so every agent audits the same build and they do not race each other rebuilding `dist/`. If the build fails, stop and report that instead — the rest of the audit would be meaningless.
2. Launch the selected agents concurrently, in a single message with one Agent tool call each. Each agent already carries its own scope and method; the prompt only needs the focus area, plus a note that `dist/` is already built and must not be rebuilt.
3. Wait for all of them. Never fabricate or predict a pending agent's findings.

## How to report

Merge the reports into one document, deduplicated — the same defect often surfaces in two audits (a missing `alt` is both SEO and accessibility; a huge hero image is both perf and visual). Merge those into a single entry that names both areas.

```
# Site audit — <date>

## Blockers
## High
## Medium
## Low
## Verified clean
## Not verified
```

Within each severity band, order by how cheap the fix is relative to its impact. Every entry keeps its file:line and its evidence. Keep the agents' measured numbers verbatim — do not round or restate them.

Finish with a short recommendation of what to fix first and roughly how much work each cluster is. Do not fix anything in this command; the audit is read-only. Ask whether to proceed with fixes.
