# Copy Audit — Full Translation Inventory

Generated: 2026-02-27

## 1. Key Counts Per Namespace

All three languages (EN, PL, NL) have **identical key counts** — 0 missing keys anywhere.

| Namespace              | EN   | PL   | NL   |
|------------------------|------|------|------|
| about                  | 15   | 15   | 15   |
| akantilado             | 77   | 77   | 77   |
| amorak                 | 107  | 107  | 107  |
| audioq                 | 150  | 150  | 150  |
| common                 | 48   | 48   | 48   |
| contact                | 69   | 69   | 69   |
| gradwork               | 63   | 63   | 63   |
| home                   | 213  | 213  | 213  |
| middlewareOptimization  | 60   | 60   | 60   |
| music                  | 28   | 28   | 28   |
| notFound               | 3    | 3    | 3    |
| notTodayDarling        | 49   | 49   | 49   |
| pauseAndDeserve        | 54   | 54   | 54   |
| projectDetail          | 440  | 440  | 440  |
| projects               | 146  | 146  | 146  |
| rayAnimation           | 28   | 28   | 28   |
| richter                | 26   | 26   | 26   |
| shadowFrames           | 227  | 227  | 227  |
| soundDesign            | 22   | 22   | 22   |
| transientica           | 33   | 33   | 33   |
| unrealEngineRebuilder  | 37   | 37   | 37   |
| wwiseUnrealFixer       | 48   | 48   | 48   |
| **TOTAL**              | **1943** | **1943** | **1943** |

## 2. En-Dash Inventory (U+2013: –)

Every instance of the en-dash character `–` (Unicode U+2013) in translation files and .tsx source:

### In Translation JSON Files

| # | File | Key | Context |
|---|------|-----|---------|
| 1 | `en/contact.json` | `contact_info_response_value` | `"24–48 hours"` |
| 2 | `pl/contact.json` | `contact_info_response_value` | `"24–48 godzin"` |
| 3 | `nl/contact.json` | `contact_info_response_value` | `"24–48 uur"` |
| 4 | `en/home.json` | `tech_fabfilter_desc` | `"Pro-Q 3, Pro-L 2, Pro-MB – mixing, mastering, frequency sculpting"` |
| 5 | `pl/home.json` | `tech_fabfilter_desc` | `"Pro-Q 3, Pro-L 2, Pro-MB – miksowanie, mastering, rzeźbienie częstotliwości"` |
| 6 | `nl/home.json` | `tech_fabfilter_desc` | `"Pro-Q 3, Pro-L 2, Pro-MB – mixing, mastering, frequentie sculpting"` |
| 7 | `pl/amorak.json` | `technical.description` | `"...audio binauralnym – tworząc scenę 3D..."` |
| 8 | `pl/projectDetail.json` | `sf.footstep.desc` | `"Drewno, płytki, beton – słyszysz różnicę..."` |
| 9 | `pl/projectDetail.json` | `sf.footstep.what` | `"...Mapuje na Switch w Wwise – Płytki, Drewno..."` |
| 10 | `pl/projectDetail.json` | `sf.player_audio.desc` | `"Zrób zdjęcie, przybliż, otwórz tablicę – każda akcja..."` |
| 11 | `pl/projects.json` | `projects.cards.amorak.description` | `"...od zera – 4 warstwy zwierząt..."` |
| 12 | `nl/projectDetail.json` | `sf.footstep.what` | `"...Mapt naar Wwise Switch – Tegels, Hout..."` |
| 13 | `nl/projects.json` | `projects.cards.amorak.description` | `"...van nul gebouwd – 4 dierenlagen..."` |

**Total: 13 en-dashes across JSON files**

### In .tsx Source Files

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `src/components/ui/IntroAnimation.tsx` | Line 90 | `// draw: 0–800ms, pause 100ms...` (code comment only, not user-visible) |

**Total: 1 en-dash in source code (comment only, not visible to users)**

### Recommendation
- Items 1-3 (`24–48 hours`): The en-dash is typographically correct for number ranges. **Keep or replace with hyphen for consistency** — your choice.
- Items 4-6 (`Pro-MB – mixing`): Acts as a separator dash. Should use em-dash (—) or just a hyphen-minus (-).
- Items 7-13 (PL/NL only): Used as a separator dash in descriptions. Should be standardized to either em-dash (—) or hyphen-minus (-) depending on desired style.

---

## 3. Text That Sounds AI-Generated or Corporate

### Flagged as potentially AI-toned (overly polished, marketing-speak, or corporate phrasing)

| File | Key | Text | Why it's flagged |
|------|-----|------|-----------------|
| `en/contact.json` | `contact_title` | `"Start a Conversation"` | Generic corporate CTA. Could be any SaaS landing page. |
| `en/contact.json` | `contact_value_docs` | `"Audio files, sound list, tech notes, and implementation docs."` | Reads like a bullet-point from a proposal template. |
| `en/home.json` | `value_systems_title` | `"Interactive Systems"` | Vague category header, not descriptive. |
| `en/home.json` | `value_technical_title` | `"Technical Work"` | Same — too generic. |
| `en/home.json` | `value_tools_title` | `"Tools I Built"` | Fine but bland. |
| `en/home.json` | `demo_reel.description` | `"Wwise implementation, interactive music, sound design, and real-time DSP from recent projects."` | Reads like a keyword-stuffed LinkedIn bio. |
| `en/home.json` | `skills.subtitle` | `"What I work with"` | Generic. Every portfolio says this. |
| `en/home.json` | `stats.title` | `"Experience"` | Meaningless standalone. |
| `en/projects.json` | `projects_page_subtitle` | `"Game audio, sound design, interactive music, and development tools."` | Comma-separated keyword list. Not a real sentence. |
| `en/projects.json` | `projects.description` | `"Game audio. Sound design. Systems that respond to gameplay."` | Staccato fragments feel artificially punchy. |
| `en/projectDetail.json` | `details.tech` | `"How It's Built"` | Generic section header. |
| `en/projectDetail.json` | `details.technical_dive` | `"Code Deep Dive"` | Buzzwordy. |
| `en/projectDetail.json` | `details.technical_dive_hint` | `"For programmers who want the details"` | Sounds like a marketing tooltip. |
| `en/contact.json` | `contact_faq_subtitle` | `"A few things people usually ask upfront."` | OK but slightly corporate FAQ tone. |
| `en/home.json` | `hero.title` | `"Game Audio Design & Implementation"` | Resume headline, not a tagline. |
| `en/projectDetail.json` | `project.achievements` | `"What Worked"` | Good. |
| `en/projectDetail.json` | `project.challenges_title` | `"Problems I Hit"` | Good — sounds human. |

### Verdict
Most of the copy is actually **quite good and natural** — especially the project descriptions, the About page, and Shadow Frames. The main issues are:
- Generic section titles that could say more (`"Experience"`, `"Interactive Systems"`, `"Technical Work"`)
- The contact page has some corporate polish
- A few keyword-list descriptions that aren't real sentences

---

## 4. Vague or Generic Text

| File | Key | Text | Issue |
|------|-----|------|-------|
| `en/home.json` | `tech_desc_default` | `"Audio tool"` | Fallback text — too minimal. |
| `en/home.json` | `stats.title` | `"Experience"` | Says nothing on its own. |
| `en/home.json` | `stats.label` | `"The Numbers"` | Cliche section heading. |
| `en/home.json` | `skills.subtitle` | `"What I work with"` | Every portfolio. |
| `en/home.json` | `core_tech.label` | `"Main Tools"` | Generic. |
| `en/projects.json` | `projects.label` | `"Work"` | Single word, zero information. |
| `en/projects.json` | `projects.select_prompt` | `"Select a project to preview"` | Fine as UI hint, just generic. |
| `en/music.json` | `music.subtitle` | `"Original compositions and game soundtracks."` | Generic subtitle. |
| `en/music.json` | `music_subtitle` | `"Original compositions and sound design for electronic, film, and game audio."` | Keyword list. |
| `en/common.json` | `footer.built_with_tech` | `"Made with React, TypeScript & too much coffee"` | Overused joke. Every dev portfolio has this. |
| `en/common.json` | `footer.cta` | `"Let's create something together →"` | Extremely generic CTA. |
| `en/contact.json` | `contact_badge` | `"Open for work"` | Fine, just common. |
| `en/projectDetail.json` | `project.tech_stack` | `"Tools & Tech"` | Generic label. |
| `en/home.json` | `hero.status` | `"Open to Work"` | LinkedIn badge phrasing. |
| `en/home.json` | `projects.subtitle` | `"Audio systems, interactive music, and tools for games."` | Keyword list pattern again. |

---

## 5. Missing Translations

**Zero missing keys.** All 1943 keys exist in all three languages (EN, PL, NL).

This was verified by extracting every leaf key path from all 66 JSON files and comparing sets.

---

## 6. Duplicate/Redundant Content

### Shadow Frames has TWO JSON files per language
- `projectDetail.json` contains Shadow Frames content under the `sf.*` prefix (within the shared projectDetail namespace)
- `shadowFrames.json` is a dedicated namespace for Shadow Frames

Both contain **overlapping content** — many keys have identical or near-identical values across both files. For example:
- `projectDetail.json` `sf.footstep.title` = `"Footstep System: Surface Detection & Audio Routing"`
- `shadowFrames.json` `footstep.title` = `"How Footsteps Work"`

Same info, different phrasing. The `shadowFrames.json` versions tend to be more casual and rewritten.

### Other duplicates
- `en/home.json` `hero.label` duplicates `en/common.json` `hero.label` (same text)
- Several project descriptions appear in both `projects.json` (card descriptions) and individual project namespace files (full descriptions)

---

## 7. Hardcoded Strings in .tsx (non-i18n)

Per previous audit (MEMORY.md), these components have hardcoded English strings:
- `PageLoader.tsx` — loads before i18n is ready
- `IntroAnimation.tsx` — loads before i18n is ready

The en-dash in `IntroAnimation.tsx` line 90 is in a code comment, not displayed to users.

---

## 8. Notation Inconsistencies

- **Hyphens vs. dashes**: Mixed use of `-` (hyphen-minus), `–` (en-dash), and `—` (em-dash) across files. No consistent standard.
- **Ellipsis**: Some keys use `...` (three dots), which is fine but inconsistent with other punctuation choices.
- **Tone shift**: The `projectDetail.json` (technical documentation style) and `shadowFrames.json` (casual rewrite) have different tones for the same content. Pick one.

---

## Summary

| Metric | Count |
|--------|-------|
| Total namespaces | 22 |
| Total leaf keys per language | 1,943 |
| Missing keys (PL) | 0 |
| Missing keys (NL) | 0 |
| En-dashes in JSON | 13 |
| En-dashes in .tsx | 1 (comment only) |
| Flagged AI/corporate text | ~15 instances |
| Flagged vague/generic text | ~15 instances |
| Duplicate Shadow Frames content | projectDetail.json sf.* vs shadowFrames.json |
