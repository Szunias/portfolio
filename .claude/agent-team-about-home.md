# 🎯 Claude Code Agent Teams – Home & About FULL Rebuild (v2)

> Poprzedni team zrobił bylejakość — wstawił zdjęcie gdzie nie trzeba, tekst brzmi jak AI, layout jest szablonowy.
> Ten team robi to PORZĄDNIE: głęboki research → kreatywny design → skromny, prawdziwy tekst → QA.

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to completely rebuild the Home page and About page of this portfolio. The previous attempt failed — it used a photo that the owner doesn't want, the text sounds like AI wrote it (exaggerated, corporate), and the layout is still template-like. This time we do it right.

## CRITICAL RULES — READ FIRST
1. NO PHOTOS of Igor. Not on Home, not on About, not anywhere. He doesn't want his photo on the site. REMOVE all <img> tags referencing cvsmile.jpg or any personal photo.
2. ALL TEXT MUST BE HUMBLE AND TRUE. Igor is a 3rd-year student, not a senior developer. Don't write "Led audio implementation" — write "did the audio for". Don't write "predictive buffering system" — write "tried caching to speed it up". If you wouldn't say it in a casual conversation, don't write it.
3. NO CORPO JARGON. Zero tolerance: "leveraging", "seamlessly", "cutting-edge", "innovative", "pipeline", "scalable", "architected", "spearheaded". Write like a person.
4. The design must be GENUINELY CREATIVE — not another portfolio template with cards and sections.

## Project Context
- Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion
- i18next: EN/PL/NL
- Igor Szuniewicz, 22, Polish, studies Game Development at DAE Howest (Belgium)
- Background: 6 years classical piano → math & physics high school → game dev at DAE
- Real skills: Wwise, FMOD, Unreal Engine, C++, MetaSounds, Reaper, Python
- Real projects: Shadow Frames (horror game), Not Today Darling (multiplayer racer), AudioQ (VST plugin), thesis on AI audio
- Looking for game audio internship in 2026
- Dark theme with gold accent (#c17f3e)

## What's Currently Wrong

### Hero (Hero.tsx) — Current Problems:
- Has a PHOTO of Igor (lines 107-131) — REMOVE THIS ENTIRELY
- Green glow gradient looks like a generic SaaS hero
- Availability badge + Name + Role + Description + Tech line + CTAs = standard LinkedIn layout
- No visual personality, no creative element, no surprise

### About (About.tsx) — Current Problems:
- Has ANOTHER PHOTO (lines 33-50) — REMOVE THIS ENTIRELY
- Text (about.json) sounds AI-generated:
  - "Led audio implementation on four student games" → too senior, say "did audio for 4 games"
  - "predictive buffering to mask the latency" → overselling thesis, say "tried to cache sounds so they'd play faster"
  - "debug audio the way I debug code — follow the signal chain, isolate the variable" → sounds like ChatGPT wrote this
  - "every sound has to earn its place" → corpo poetry
- Layout: intro → 3 story paragraphs → quote → 3 approach paragraphs → education list → CTA
  - Still feels like a template even though headers were removed. Same rhythm: p → p → p → quote → p → p → p

## Team – 8 Agents

### Agent 1: "DESIGN RESEARCHER" – Study What Actually Surprises & Impresses
Priority: FIRST

Task:
1. **Research creative portfolio home pages** that break the mold using WebFetch:
   - Award-winning portfolios on awwwards.com (creative/design category, NOT tech/SaaS)
   - Game developer portfolios that feel genuinely different
   - Music producer and sound artist websites
   - Animation studio landing pages (they know how to create mood)
   - Key question: what makes you STOP scrolling and go "wow, this is cool"?

2. **Research creative About pages** that feel human:
   - Artists who describe themselves without being pretentious
   - Designers whose About pages tell a real story
   - Musicians who show personality without a corporate bio
   - Junior/student portfolios that impressed employers (Reddit r/gamedev, r/sounddesign threads about portfolio reviews)

3. **Research what game audio hiring managers notice**:
   - Use WebFetch: GDC talks about hiring, audio director interviews
   - What makes a student portfolio stand out from 200 others?
   - What do they NOT care about? (tech stack lists, tool logos, buzzwords)
   - What DO they care about? (actual work, personality, communication, taste)

4. **Identify "positive surprise" patterns**:
   - Scroll-triggered audio (on an audio designer's site? meta and brilliant)
   - Interactive sound elements
   - Typography as visual design (not just text)
   - Asymmetric layouts that feel intentional
   - One-page narrative flow vs traditional sections
   - Terminal/console aesthetic (fits a technical audio person)
   - Studio/DAW-inspired UI (faders, meters, timelines)
   - Minimal editorial (like a magazine article)

5. **Produce Research Brief**: .claude/teams/v2-design-research.md
   - Top 10 "positive surprise" techniques with URLs
   - 5 "don't do this" anti-patterns (cards grid, centered text, icon+heading+paragraph, photo+intro)
   - Recommended approach for Igor's specific situation
   - Tone guide for humble, truthful text

Rules:
- NO SaaS/startup patterns. This is a creative portfolio.
- Focus on portfolios by INDIVIDUAL creators, not agencies
- Consider: Igor is audio — the site should somehow FEEL like audio, not just talk about it


### Agent 2: "HOME ARCHITECT" – Completely Redesign Home Page Layout
Depends on: DESIGN RESEARCHER
Files: src/pages/Home.tsx, src/components/home/Hero.tsx, src/components/home/Skills.tsx

Task:
1. **Read the Research Brief**

2. **REMOVE the photo from Hero.tsx** (lines 107-131, the entire photo column + glow effect). This is non-negotiable.

3. **Redesign the Hero WITHOUT a photo**:
   The hero needs a strong visual identity without using Igor's face. Options from research:
   - **Audio-visual element**: a subtle, generative canvas animation (sine waves, frequency spectrum, audio meters) — NOT the old waveform bars, something elegant and understated
   - **Typography as hero**: Igor's name as a large typographic statement, with role text flowing around it
   - **Showreel as hero**: the Vimeo showreel IS the hero (background video, muted, with text overlay)
   - **Minimal editorial**: just huge text, no decorative elements, confidence through simplicity
   - **Split layout**: text left, interactive/animated element right that's NOT a photo
   
   Pick the approach that's MOST creative and LEAST expected based on research.

4. **Rethink the page flow**:
   Current: Hero → Showreel → Featured Projects → Skills
   
   Consider:
   - Should showreel be embedded in hero (more impactful) or separate?
   - Does the Skills section ADD value? Projects already demonstrate skills. Consider removing it entirely.
   - Should there be a brief personal/about teaser on homepage?
   - Is 4 featured projects right, or should it be 2-3 (quality > quantity)?
   - What if the homepage is JUST: Hero + Showreel + "See my work" link? Minimalism = confidence.

5. **Make it visually distinctive**:
   - The background glow (rgba(45, 212, 168, 0.06)) feels like a generic green tint — either commit to it or remove it
   - Use the gold accent (#c17f3e) more intentionally
   - Create visual rhythm that doesn't follow the standard section → section → section pattern
   - Consider full-bleed elements, oversized typography, or unexpected spacing

6. **Responsive**: 375px, 768px, 1440px all must look good

Rules:
- NO PHOTO of Igor. Absolutely none.
- The home page should make someone go "oh, this is different" — not "oh, another portfolio"
- Keep Showreel functional (Vimeo embed with chapters)
- Keep navigation to /projects working


### Agent 3: "ABOUT ARCHITECT" – Completely Rebuild About Page
Depends on: DESIGN RESEARCHER
Files: src/pages/About.tsx, public/locales/{en,pl,nl}/about.json

Task:
1. **Read the Research Brief**

2. **REMOVE the photo from About.tsx** (lines 33-50). Non-negotiable.

3. **Completely restructure the About page layout**:
   Current: photo+intro → 3 story paragraphs → quote → 3 approach paragraphs → education → CTA
   
   This STILL follows an AI template rhythm. Every section is the same: text block → text block → text block.
   
   Options for a genuinely different structure:
   - **Letter format**: one continuous piece, like a letter to a hiring manager. No sections. Personal tone.
   - **Timeline narrative**: visual timeline from piano → physics → DAE → projects, each with a short honest paragraph
   - **Q&A format**: "What do you do?" / "Why audio?" / "What's your best work?" — conversational, real answers
   - **Split screen**: left side = the factual stuff (education, location, status), right side = the real story in flowing text
   - **Cards with variation**: NOT identical cards — each "fact about Igor" presented differently (number, quote, paragraph, list)
   
   Pick what best fits the research findings.

4. **Rewrite the About text from scratch** — HUMBLE AND TRUE:
   
   What to FIX in the current text:
   - "Led audio implementation on four student games" → "I did the audio for 4 student games"
   - "Built a real-time beatbox classifier when off-the-shelf ML tools couldn't keep up" → "Made a beatbox recognition thing for my game — the libraries were too slow so I had to train my own model"
   - "predictive buffering to mask the latency" → "I'm trying to cache sounds ahead of time so there's no delay"
   - "debug audio the way I debug code — follow the signal chain, isolate the variable, test the fix" → too perfect, sounds rehearsed. Try: "When something sounds wrong I check the Wwise profiler, mute things one by one until I find the culprit"
   - "every sound has to earn its place" → corpo poetry. Try: "we had a 150MB budget and 4 players, so I had to cut stuff"
   
   TONE GUIDE:
   - Write as if Igor is explaining his work to another student at a game jam
   - Use "I" naturally, not in every sentence
   - Admit things honestly: "I'm still learning X", "this was my first time with Y", "I didn't know Z existed until..."
   - Show real excitement: "the best part was when..." not "I'm passionate about..."
   - Specifics over adjectives: "200 Wwise events" beats "extensive audio system"
   - DON'T oversell the thesis: it's a prototype, it's for school, it's interesting but it's not production-ready
   - DON'T pretend to be senior: 3rd year student means 3rd year student

5. **Education section**: keep it compact. 3 lines is fine. Don't over-design it.

6. **CTA**: keep "Looking for 2026 internship. EU passport, relocation-ready." + Say Hi button + CV download. Don't overthink this.

7. **Translate to PL and NL**:
   - PL: jak Igor by to powiedział kumplowi. "Zacząłem od pianina, potem fizyka, teraz robię dźwięk do gier." Nie: "Moja pasja do dźwięku zaprowadziła mnie..."
   - NL: informal "je" form, natural Flemish-Dutch is fine. "Ik maak geluid voor games" not "Ik creëer immersieve audio-ervaringen"

Rules:
- NO PHOTO. Remove all img tags.
- Humble > impressive. Truth > marketing.
- If a sentence sounds like LinkedIn, delete it.
- Igor is 22 and a student — the text should sound 22 and student-like
- Keep the philosophy quote IF it still fits the new layout. It's a good quote.


### Agent 4: "HOME COPY" – Write Home Page Text
Depends on: HOME ARCHITECT
Files: public/locales/{en,pl,nl}/home.json

Task:
1. **Adapt text to whatever layout HOME ARCHITECT created**
2. **Hero text**: 
   - Name: Igor Szuniewicz (never changes)
   - Role: "Audio Designer" or "Game Audio Designer" — NOT "Game Audio Designer & Developer" (too long, "Developer" is secondary)
   - Tagline: something true, not poetic. Current "I make games sound right" is decent. Keep or improve.
   - Description: keep factual, short. What Igor does in one sentence.
3. **Section text** (if sections exist):
   - Featured projects title: "Work" or "Projects" — not "Selected Works" (pretentious)
   - Subtitle: cut it or make it one specific sentence
   - Skills: if section survives, use simple tool names, no descriptions
4. **ALL 3 languages**
5. **Quick sanity check**: read every string aloud. Does it sound human?

Rules:
- Keep JSON keys consistent with what components expect
- Don't change keys that other components depend on (check imports)


### Agent 5: "INTERACTION DESIGNER" – Add Creative Interactive Elements
Depends on: HOME ARCHITECT, ABOUT ARCHITECT
Files: whatever components the architects create

Task:
1. Based on the research, add ONE OR TWO subtle interactive elements:
   - Scroll-linked effects (parallax text, color shift, element reveal)
   - Hover interactions that feel unique (not just color change)
   - A micro-interaction that references audio (hover sounds?, scrubber-like element?)
   - Cursor effect (SUBTLE — like a glow, not a custom cursor)
   
2. For the Hero specifically:
   - If using a generative canvas element: make it react to mouse movement or scroll
   - If using typography: add a subtle lettering animation or stagger
   - Whatever it is, it must feel EFFORTLESS — like it was always there

3. For About page:
   - SUBTLE transitions between text sections (not all at once)
   - Maybe: text highlight on scroll (words light up as you read)
   - Or: parallax timeline if using timeline layout

Rules:
- DO NOT overdo it. One great interaction > ten mediocre ones
- Must work on mobile (touch) and desktop (mouse)
- Respect prefers-reduced-motion
- Performance: no layout shifts, 60fps, GPU-accelerated only
- If it feels gimmicky, remove it


### Agent 6: "COPY VALIDATOR" – Validate All Text for Human Factor
Depends on: ABOUT ARCHITECT, HOME COPY
Files: public/locales/{en,pl,nl}/about.json, home.json

Task:
1. **Read EVERY string in EN about.json and home.json and apply this checklist**:
   - [ ] Does this sound like a 22-year-old student talking?
   - [ ] Would Igor actually say this out loud?
   - [ ] Is this true? (no exaggeration, no inflation)
   - [ ] Is this specific? (a number, a name, a tool — not a vague adjective)
   - [ ] Is this humble? (not "led", "architected", "designed and implemented")
   - [ ] Zero corpo jargon? (no "leveraging", "seamlessly", "innovative", "pipeline")
   - [ ] Zero AI patterns? (no "this allowed me to", "which in turn", "furthermore")
   
2. **Specific strings to verify/fix**:
   - Any reference to "leading" anything → Igor contributed, he didn't lead (unless he was literally the only person)
   - Thesis description → it's a school project prototype, NOT a production system
   - Tool descriptions → list what he DID with the tool, not what the tool CAN do
   - "Built a real-time beatbox classifier" → okay but clarify it's a school project
   - "200+ Wwise events" → if true, keep. If guessed, remove the number.

3. **Read PL translations**: does it sound like natural Polish? Not an official document?
4. **Read NL translations**: does it sound like natural Dutch? Not stiff?

5. **Flag anything uncertain for Igor to verify** (factual claims he needs to confirm)

Rules:
- Be ruthlessly honest. If it sounds like AI, flag it.
- If you can't verify a fact, flag it rather than removing it
- The "conversation test": could Igor say this at a GDC meetup without feeling fake?


### Agent 7: "VISUAL POLISH" – Final Visual Refinement
Depends on: HOME ARCHITECT, ABOUT ARCHITECT, INTERACTION DESIGNER
Files: all component files for Home and About

Task:
1. **Visual consistency between Home and About**: do they feel like the same site?
2. **Typography check**: heading hierarchy, body text readability, contrast ratios
3. **Spacing refinement**: nothing feels too cramped or too sparse
4. **Color usage**: gold accent used meaningfully, not randomly. Background layers distinguishable
5. **Animation timing**: all animations feel smooth, no janky transitions
6. **Mobile polish**: everything looks great at 375px and larger
7. **Dark mode**: ensure it looks premium dark, not just "dark background with light text"

Rules:
- Subtle improvements only — don't redesign what the architects built
- Every change should be barely noticeable individually
- Test at 375px, 768px, 1440px


### Agent 8: "FINAL QA" – Build, Test, Verify Everything
Depends on: ALL agents

Task:
1. **Technical verification**:
   - `npm run build` → must pass
   - `npx tsc --noEmit` → zero errors
   - All 3 languages render correctly
   - No console errors or warnings

2. **Photo check**: GREP for "cvsmile" in ALL source files. If found ANYWHERE in a component that renders it as an <img>, REMOVE IT. (It can stay in SEO/meta tags only.)

3. **Corpo jargon check**: GREP for these words in all JSON files:
   - "leverage", "seamless", "innovative", "cutting-edge", "scalable", "architect", "spearhead", "pipeline", "holistic", "empower"
   - If any found, fix or flag

4. **Responsive testing**: both pages at 375px, 768px, 1024px, 1440px
5. **Accessibility**: focus states, contrast ratios, screen reader labels
6. **Performance**: no layout shifts, animations smooth

7. **The three-second test**:
   - Open homepage. In 3 seconds: do you know who this is and what they do?
   - Open about page. In 10 seconds: do you know enough about Igor to decide if he's interesting?
   - Does ANYTHING look like an AI template? If yes, send the responsible agent back.

8. **Report**: .claude/teams/v2-rebuild-report.md

Rules:
- Build MUST pass
- Zero photos in rendered components
- Zero corpo jargon in any language file
- Both pages must feel genuinely creative — not "a bit better than before"


## Execution Order

```
Phase 0 — RESEARCH:
  DESIGN RESEARCHER → research brief

Phase 1 — ARCHITECTURE (parallel, after research):
  HOME ARCHITECT → new Home layout (removes photo, new hero)
  ABOUT ARCHITECT → new About layout + text (removes photo, humble text)

Phase 2 — POLISH (parallel, after architecture):
  HOME COPY → text for Home in 3 languages
  INTERACTION DESIGNER → creative interactive elements
  COPY VALIDATOR → validates all text for human factor

Phase 3 — FINAL (after all above):
  VISUAL POLISH → consistency, spacing, animation
  FINAL QA → build, grep checks, 3-second test
```

## NON-NEGOTIABLE
1. NO PHOTOS of Igor anywhere in rendered components
2. Text must be HUMBLE and TRUE — student, not senior
3. Zero corpo jargon in any language
4. Must be GENUINELY creative — not another template
5. npm run build must pass
6. All 3 languages must work
```

---

## ⚙️ Jak użyć

```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
cd c:\Users\iszun\Documents\GitHub\igorszuniewicz
claude
# Wklej Master Prompt
```

---

## 📋 Przegląd

| Agent | Faza | Co robi |
|-------|------|---------|
| 🔬 **DESIGN RESEARCHER** | 0 | Research kreatywnych portfoliów, "positive surprise" patterns, co robi wrażenie |
| 🏠 **HOME ARCHITECT** | 1 | Nowy layout Home BEZ ZDJĘCIA, coś kreatywnego zamiast generycznej karty |
| ✍️ **ABOUT ARCHITECT** | 1 | Nowy layout + tekst About BEZ ZDJĘCIA, skromny i prawdziwy |
| 📝 **HOME COPY** | 2 | Tekst Home w 3 językach pod nowy layout |
| ✨ **INTERACTION DESIGNER** | 2 | 1-2 kreatywne interakcje (scroll, hover, audio-related) |
| 🧑 **COPY VALIDATOR** | 2 | Każdy tekst pod lupą: brzmi jak człowiek? Prawda? Skromne? |
| 💎 **VISUAL POLISH** | 3 | Spójność, spacing, animacje, dark mode premium |
| 🏁 **FINAL QA** | 3 | Build, grep na "cvsmile" + corpo words, test 3-sekundowy |

**NON-NEGOTIABLE:**
- 🚫 Zero zdjęć Igora
- 🙏 Tekst musi być skromny i prawdziwy
- 🚫 Zero corpo-żargonu
- ✨ Design musi być GENUINELY kreatywny
