# Project Guidelines

## Current Architecture (READ FIRST)

**The live site is a static HTML build.** Source of truth:

- `src/pages/*.html` — page content (no `<html>`/`<head>`/`<body>`)
- `src/layouts/*.html` — shells (home, project, music)
- `src/partials/*.html` — lightbox, player-bar
- `src/css/*.css`, `src/js/*.js` — inlined by the build
- `site.config.cjs` — page registry (slug, layout, meta)
- `build.cjs` — zero-dep Node build → `dist/`
- `.github/workflows/deploy.yml` — GitHub Pages deploy

**Legacy / backup (do NOT edit as part of the live site):**

- `old/` — legacy React/Vite/TypeScript project. Kept for its `public/assets/` (images, videos, audio, CV) which the current HTML pages still reference via `old/public/assets/...`. The React app itself is no longer deployed.
- `archive/` — static archive HTML pages (`dae-page.html`, `nuonsoft-becpp.html`) copied verbatim by the build via `staticCopy`.
- `v2/`, `new-portfolio/`, `design-mockups/` — older experiments. Not deployed, not referenced.

When working on the live site, edit only `src/`, `build.cjs`, `site.config.cjs`, or `.github/workflows/`. Touching `old/` should be limited to adding/removing assets under `old/public/assets/`.

## Portfolio Copy Rules (Audit V4)

The following rules replace any mandatory problem/solution/result template below when the two conflict:

1. The first paragraph states what the project is, the exact role and one concrete contribution.
2. Use a structure that fits the project. Never force every page into the same case-study template.
3. Keep featured pages to 3–6 meaningful sections. Archive pages should be shorter.
4. Do not use snapshots, stats grids, fact sidebars or challenge cards by default.
5. State each metric once, with its version, scope and measurement context.
6. Do not manufacture humanity with fragments, rhetorical questions, punchlines or casual filler.
7. Put proof next to the claim: gameplay, profiler, diagram, code, before/after audio or a comparison table.
8. Headings name the actual content. Avoid Overview, Challenges, Solution, Features, What I learned and The short version.
9. Borders and backgrounds are for media, data, code, interaction or warnings, not ordinary prose.
10. Describe limitations plainly and compare technical claims with public code, CV and the project page before publishing.

## Legacy Project Description Guidelines

These guidelines apply when writing or editing project descriptions for Igor's game audio portfolio. They were compiled from research on portfolio best practices, game audio industry expectations, storytelling frameworks, and an audit of the current project descriptions.

### Core Principle: Show the Problem You Solved

Every project description must answer: **"What was the problem, what did you do, and what was the result?"** A reader who spends 30 seconds on a project page should walk away understanding what you built and why it matters.

### Structure: What Was Hard, What You Did, What Happened

Every project description follows the same logic:

1. **What was hard** — The constraint or problem. (tight memory budget, 4-player mix clarity, 180ms latency)
2. **What you did** — The specific technical decisions. (switched to SVM, built hysteresis state machine, used procedural MetaSounds)
3. **What happened** — The measurable outcome. (45ms latency, 92% accuracy, 160MB down to 2MB)

Never describe work without a result. "I did sound design" is empty. "I built 200+ custom foley samples and mixed in 5.1 surround" is concrete.

### What to Include in Every Project Description

- **Your exact role** — "Solo audio designer" or "Audio programmer on 8-person team", not just "Audio"
- **The constraint or problem** — Budget limits, player count, latency targets, broken tooling
- **Technical decisions with reasoning** — Why you chose Wwise over FMOD, why SVM over neural net, why hysteresis thresholds
- **Measurable results** — Numbers: latency in ms, voice count limits, memory savings, accuracy percentages, sample counts
- **Tools and middleware** — Wwise, FMOD, MetaSounds, Reaper, JUCE, Python, C++ — be specific about versions when relevant
- **Collaboration context** — Who you worked with, how audio connected to other disciplines

### What to Avoid

- **Generic adjectives** — "amazing", "immersive", "high-quality", "cutting-edge". These say nothing. Replace with specifics.
- **Listing responsibilities without context** — "Sound Design, Mixing, Implementation" is a resume bullet, not a description. Say what you actually did and why.
- **AI-sounding filler** — No "leveraging", "utilizing", "crafting immersive experiences", "pushing boundaries". Write like you talk.
- **Passive voice** — "The audio was implemented" vs "I built the audio system". Own the work.
- **Vague process descriptions** — "I iterated on the design" means nothing without specifics about what changed and why.

### Tone and Voice

- **Direct and confident** — First person, active voice. "I built", "I solved", "I shipped."
- **Technical but accessible** — A game designer should understand the problem; an audio programmer should appreciate the solution. Layer information: lead with the concept, then go deeper for technical readers.
- **Honest about constraints** — "We had 4 weeks" or "I was the only audio person" makes the work more impressive, not less.
- **No false modesty, no hype** — State what you did. The numbers speak.

### Game Audio-Specific Guidelines

- **Make audio work visible** — Audio is invisible by default. Describe what the player hears and how it changes their experience. "Enemies get louder as they approach" is tangible. "Dynamic audio system" is not.
- **Connect audio to gameplay** — Don't describe sounds in isolation. Explain how audio drives or supports gameplay: "Players find anomalies by listening — there are no UI markers."
- **Show technical depth** — Recruiters and audio directors want to see: middleware proficiency (Wwise/FMOD), engine integration (C++/Blueprints/C#), optimization awareness (voice counts, memory budgets, latency), and problem-solving.
- **Describe the signal chain** — Where does the sound start (recording, synthesis, library) and where does it end (mix bus, spatial system, player's ears)? This shows you understand the full pipeline.
- **Mention collaboration** — Game audio is inherently collaborative. Describe how you worked with programmers, designers, composers. "I exposed audio variables as DataAssets so designers could tune without asking me."
- **Include challenge-solution pairs** — These are the most valuable part of a game audio description. They prove you can solve real production problems, not just make sounds.

### Scannable Formatting

- **Lead with a one-line hook** — The first sentence should make someone want to keep reading. "Horror game where audio is the only weapon" works. "This is my horror game project" does not.
- **Use stats grids** — Key numbers (latency, accuracy, voice count, memory) should be immediately visible, not buried in paragraphs.
- **Break text into named sections** — "The Concept", "Audio Systems", "Challenges & Solutions", "Technical Deep Dive". Readers scan headings first.
- **Keep paragraphs short** — 2-3 sentences max. Dense paragraphs get skipped.
- **Put the most impressive thing first** — Front-load results and unique aspects. Technical details can go deeper on the page.

### Multilingual Considerations (EN/PL/NL)

- **Write in English first** — EN is the source of truth. PL and NL are translations, not rewrites.
- **Keep technical terms in English** — Wwise, FMOD, MetaSounds, RTPC, SVM, FFT stay in English across all languages. Don't translate technical middleware or engine terms.
- **Adapt tone, not content** — PL and NL versions should convey the same information and confidence. Don't make them more formal or more casual than EN.
- **NL can fall back to EN** — NL has fewer keys (covered by `fallbackLng: 'en'`). This is fine. Only translate NL keys that are genuinely used.

### Current Project Description Quality (Audit Summary)

**Strong descriptions** (use as reference):
- **Shadow Frames** — Clear concept hook, named audio systems with technical detail, challenge-solution pairs, code snippets with annotations, stats grid, collaboration credits
- **Transientica** — Measurable results upfront (45ms, 92%), "How It Works" sections, three specific challenges with before/after numbers
- **Not Today, Darling** — Good constraints ("only audio person"), concrete numbers (70 events, 180MB, 32 voices), MetaSounds optimization story

**Needs improvement**:
- **Sound Design Showcase** — No description beyond one line. Needs: which projects, what techniques, what was the hardest mix
- **Richter** — Has approach breakdown but no challenge or result. Needs: what was hard about field recording, what constraint did you solve
- **Middleware Optimization** — Just "Three Wwise projects" — needs specifics on each project and what was optimized
- **Ray Animation** — Great backstory (8 days, composer dropped out) but thin on audio details. Needs: how many tracks, what the score sounds like, sync challenges
- **Wwise Unreal Fixer / UE Rebuilder** — Technical tools need: how many teams use it, time saved, specific bugs it fixes

### Template for New Project Descriptions

```
Hook: [One sentence — what is this and why should I care?]

Role: [Exact role and team context]
Constraint: [What made this hard?]
Solution: [What you built and why]
Result: [Numbers and outcomes]

Technical: [Tools, middleware, pipeline details]
Challenge-Solution pairs: [2-3 specific problems you solved with measurable results]
```
