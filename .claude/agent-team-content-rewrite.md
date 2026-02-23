# ✍️ Claude Code Agent Teams – Content Rewrite & Human Factor

> Research co pracodawcy chcą widzieć w tekstach → przebudowa copy na głównych stronach w 3 językach → projekt-opisy bez corpo-żargonu → human factor QA.

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to rewrite all text content on this portfolio website. The goal: make every piece of text sound like a real person wrote it — concise, specific, no corporate jargon, logically coherent, and useful to someone deciding whether to hire Igor.

## Project Context
- Portfolio of Igor Szuniewicz, game audio designer & developer, student at DAE Belgium
- Looking for internship in game audio, 2026
- i18next with 3 languages: EN (primary), PL (Polish), NL (Dutch)
- Translation files: public/locales/{en,pl,nl}/*.json (22 namespace files each)
- Core content files: home.json, about.json, contact.json, projects.json, projectDetail.json
- Project-specific files: shadowFrames.json, amorak.json, audioq.json, etc.
- Current state: about.json is already quite human and specific. home.json has corporate patterns. Some project descriptions are formulaic.

## Team – 4 Agents

### Agent 1: "EMPLOYER RESEARCHER" – What Do Game Audio Employers Actually Want to Read?
Priority: FIRST – everyone else depends on this

Task:
1. **Research what hiring managers in game audio actually look for** using WebFetch:
   - Read job postings for "Game Audio Designer", "Sound Designer", "Technical Sound Designer" at:
     - Audiokinetic careers
     - EA, Ubisoft, Remedy, Supergiant Games, Naughty Dog, Playdead, Respawn
   - Note: what WORDS do they use? What skills do they list? What soft skills matter?
   - Key question: when an audio director reads a junior's portfolio, what makes them keep reading vs close the tab?

2. **Research what DOESN'T work in portfolio text**:
   - Generic phrases employers skip: "passionate about...", "detail-oriented", "leveraging cutting-edge...", "synergize", "crafting immersive experiences"
   - What makes text sound AI-generated or corporate?
   - What sounds like a real person who's done the work?

3. **Study how top audio designers describe their work**:
   - How does Mick Gordon describe DOOM's soundtrack? (specifics, not adjectives)
   - How does Akash Thakkar describe Celeste's audio? (what he did, not what it "delivers")
   - How do SoundWorks Collection interviewees talk? (concrete, problem → solution)
   - Pattern: good descriptions say WHAT happened, not how amazing it is

4. **Define writing guidelines for Igor's portfolio**:
   - Tone: direct, specific, confident without being arrogant. Like talking to a colleague, not pitching to a VC
   - Structure: what happened → what I did → what the result was (not: vague intro → buzzword list → generic CTA)
   - Length: shorter is always better. One clear sentence > three vague ones
   - Technical terms: use them when specific (Wwise, RTPC, MetaSounds) but don't stack them for show
   - NO: "crafting immersive sonic experiences", "leveraging", "innovative solutions", "seamlessly integrate"
   - YES: "I built", "I fixed", "it broke because", "I recorded", "the problem was"
   - Igor is a student — the text should show someone who's LEARNING and BUILDING, not pretending to be senior

5. **Produce Writing Brief**: .claude/teams/content-writing-brief.md
   - 5 rules for good portfolio text (with before/after examples)
   - 5 corporate patterns to kill
   - Word bank: verbs that show action (built, recorded, designed, fixed, scripted, mixed, tuned, optimized, debugged, shipped)
   - Word blacklist: words that scream AI/corporate (leverage, synergy, seamless, innovative, cutting-edge, holistic, empower, passion-driven)
   - Tone examples: 3 sample descriptions rewritten from bad to good

Rules:
- Be SPECIFIC about game audio industry, not generic writing advice
- The brief must be actionable — other agents will follow it literally
- Consider: Igor is Polish, studying in Belgium — his English should sound natural but doesn't need to sound American
- PL text should sound like a young Polish game dev, not a corporate translator
- NL text should sound naturally Dutch (informal "je" form), not stiff


### Agent 2: "PAGE WRITER" – Rewrite Main Pages (Home, About, Contact)
Depends on: EMPLOYER RESEARCHER
Files: public/locales/{en,pl,nl}/home.json, about.json, contact.json, common.json

Task:
1. **Read the Writing Brief from Agent 1**

2. **Audit and rewrite home.json** (ALL 3 languages):
   - `hero.tagline` – currently decent ("I make games sound right...") → verify it's the best it can be
   - `hero.description` – currently specific ("footsteps that match the surface...") → keep or tighten
   - `hero.label` – "Game Audio Designer • Seeking 2026 Internship" → is this clear enough?
   - `skills.title` → "Tech Stack" is generic. Better: "Tools" or just no label
   - `skills.subtitle` → "Tools I use daily" is fine, keep
   - ALL `tech_*_desc` keys (lines 177-222) – these are the worst offenders. Examples:
     - "Low-level audio programming, DSP algorithms, engine integration, and performance-critical systems" ← CORPO GARBAGE
     - Fix: actually describe what Igor did with C++ ("Built footstep detection, enemy audio systems, and two pipeline tools")
   - `value_systems_title` → "Interactive Systems" is corpo. Fix: name the actual thing
   - `value_technical_title` → "Technical Work" is meaningless. Fix: what kind of work?
   - `value_tools_title` → "Productivity Tools" is LinkedIn language
   - Remove or rewrite any text that sounds like a LinkedIn About section
   - `demo_reel` section → "Portfolio Reel" with description is fine but could be punchier

3. **Audit and rewrite about.json** (ALL 3 languages):
   - This is ALREADY the best file — mostly specific and human
   - `about_journey_p1` and `p2` – great, maybe tighten slightly
   - `about_drives_p1` and `p2` – excellent ("Most of my best work started as a bug" is a perfect opening)
   - `philosophy_quote` – strong, keep
   - `achievement_*_desc` – check for corpo patterns
   - `cta_desc` – "Looking for 2026 internship in game audio. 3-6 months, EU passport, relocation-ready." → solid, keep
   - Overall: touch lightly, don't ruin what's already good

4. **Audit and rewrite contact.json** (ALL 3 languages):
   - `contact_intro` – currently good and specific
   - `contact_faq_*` – direct answers, decent
   - `contact_value_docs` → "You get audio files, a sound list, technical notes, and an implementation guide" → is this true for an internship seeker? Adjust to reality
   - `contact_form_title` → "Drop me a line" is fine
   - Form labels and errors: keep functional, just verify natural language in PL/NL

5. **Translation quality for PL and NL**:
   - PL: should sound like Igor talks to friends about his work. Not an official document. Use informal "ty" form consistently
   - NL: should sound natural with informal "je/jij" form. Belgian-Dutch ("Flemish") is fine if it feels more natural
   - Don't just translate from EN – adapt idioms and phrasing for each language
   - Technical terms (Wwise, FMOD, C++, MetaSounds) stay in English in all languages

Rules:
- Change ONLY text values in JSON files, never change JSON keys
- Every changed string must be updated in ALL 3 language files
- Don't break JSON syntax (validate after changes)
- Keep SEO-relevant terms in titles (Audio Designer, Game Audio, Wwise, etc.)
- about.json is already 80% good – be surgical, don't rewrite for the sake of rewriting


### Agent 3: "PROJECT WRITER" – Rewrite All Project Descriptions
Depends on: EMPLOYER RESEARCHER
Files: public/locales/{en,pl,nl}/projects.json, projectDetail.json, shadowFrames.json, amorak.json, audioq.json, notTodayDarling.json, pauseAndDeserve.json, rayAnimation.json, richter.json, gradwork.json, middlewareOptimization.json, soundDesign.json, transientica.json, unrealEngineRebuilder.json, wwiseUnrealFixer.json, akantilado.json, music.json

Task:
1. **Read the Writing Brief from Agent 1**

2. **Rewrite all project short descriptions** in projects.json (ALL 3 languages):
   For each project, the short description must answer in 1-2 sentences:
   - What is this? (game, tool, film, plugin)
   - What did Igor do? (not "leveraged", but "built", "recorded", "fixed")
   - Why should I care? (one specific detail that's impressive or interesting)
   
   Current quality check:
   - ✅ GOOD: "Solo audio designer on a 6-person student team. Made all the sounds..." (Not Today Darling) → KEEP
   - ✅ GOOD: "Disco-funk score for a graduation film. Original composer dropped out with 8 days left." (Ray) → KEEP
   - ⚠️ MEH: "Audio plugin built in JUCE to learn real-time DSP." (AudioQ) → too generic, what does the plugin DO?
   - ❌ BAD: "Sound design and music for a student film about an earthquake. All sounds recorded myself, plus orchestral score." (Richter) → "All sounds recorded myself" is awkward English
   - ❌ BAD: "Automation script: cleans Intermediate/Saved folders and regenerates project files." (UE Rebuilder) → sounds like a README, not a human

3. **Rewrite project card descriptions** (projects.cards.* section):
   - Same principles: specific, what Igor did, why it matters
   - Currently some are good ("I built a massive creature roar from scratch using 4 animal layers") and some are corpo ("Designed and implemented full audio for a level")
   - Find and fix all "designed and implemented" patterns — replace with what was actually designed and implemented

4. **Audit all project-specific namespace files** (shadowFrames.json, amorak.json, etc.):
   - These contain detailed project descriptions, challenges, technical details
   - Apply the Writing Brief rules: no corpo jargon, specific > generic, show work done
   - Check that challenge descriptions sound like real problems ("Wwise kept crashing when...") not abstract concepts ("Optimizing the audio pipeline for scalability")

5. **Verify logical coherence**:
   - Read EVERY project description start to finish — does it make sense?
   - Are there contradictions? (e.g., claiming "solo project" but also "team of 6")
   - Are years/timelines consistent?
   - Do tech stacks match between short description, card description, and detail page?
   - Are all claims true and specific? If something says "200+ events" — verify that's a real number, not inflation

Rules:
- Change ONLY text values, never JSON keys
- Update ALL 3 languages for every change
- Keep project names unchanged
- Keep technical accuracy (don't change "MetaSounds" to "MetaSound" etc.)
- When in doubt about a fact, keep the current text and flag it for review
- Every description update must be in en, pl, AND nl files


### Agent 4: "HUMAN FACTOR QA" – Final Text Review for Logic, Tone & Naturalness
Depends on: PAGE WRITER and PROJECT WRITER (runs after both are done)

Task:
1. **Read the Writing Brief from Agent 1**

2. **Read EVERY text across ALL pages in English**:
   Read each JSON file top to bottom and flag:
   - ❌ Corporate jargon that survived (any "leverage", "synergy", "seamlessly", "innovative")
   - ❌ AI-sounding patterns (every sentence starts with "I", or every paragraph has the same structure)
   - ❌ Logical inconsistencies (contradicting facts, wrong dates, mismatched tech)
   - ❌ Awkward English (grammar issues, weird phrasing, translation artifacts)
   - ❌ Empty statements (sentences that say nothing: "This project was a great learning experience")
   - ❌ Overpromising (student claiming senior-level expertise)
   - ❌ Underpromising (downplaying real achievements with "just a student project")

3. **Read EVERY text in Polish** and check:
   - Does it sound like a real Polish person talking about their work?
   - Not like Google Translate or an official document
   - Are technical terms handled correctly? (Wwise, FMOD stay English)
   - Is informal "ty" used consistently? No random "Pan/Pani" formality
   - Polish characters (ą,ę,ó,ś,ź,ż,ć,ń,ł) used correctly

4. **Read EVERY text in Dutch** and check:
   - Does it sound natural in Dutch/Flemish?
   - Informal "je/jij" form used consistently?
   - No stiff literal translations from English
   - Technical terms in English, rest in natural Dutch

5. **Apply the "Read Aloud" test**:
   - Read each description aloud (mentally). Does it sound like a person talking?
   - If it sounds like a brochure, flag it
   - If it sounds like an AI wrote it, flag it
   - If it sounds like a corporate "About Us" page, flag it
   - The target: sounds like Igor explaining his work to a fellow game dev at GDC

6. **Verify the full user journey makes sense**:
   - Read Hero → Showreel section → Featured Projects → Skills → About → Contact
   - Does the story flow? Does each section add new information?
   - Is there unnecessary repetition? (same fact stated on hero AND about AND contact)
   - Is the call-to-action clear? (visitor knows Igor wants an internship)
   - Would you, as an audio director, contact Igor after reading this?

7. **Fix issues directly** or send back to Agent 2/3 if major rewrite needed

8. **Produce final report**: .claude/teams/content-review-report.md
   - Issues found and fixed per file
   - Language quality score per language (1-10)
   - Remaining flags for Igor to review (factual stuff only he can verify)
   - "Would I hire Igor?" assessment based on the text alone

Rules:
- This is the LAST pass — fix everything you find
- Prioritize: logical errors > corpo jargon > awkward phrasing > minor style
- Don't change facts you can't verify — flag them instead
- The text must pass the "GDC hallway test": sounds like a game dev talking to another game dev
- Build must pass after all changes: `npm run build`


## Execution Order

```
Phase 1: EMPLOYER RESEARCHER → writing brief
Phase 2 (parallel):
  PAGE WRITER → home, about, contact (3 langs)
  PROJECT WRITER → all project descriptions (3 langs)
Phase 3: HUMAN FACTOR QA → final review & fixes
```

## Key Rules
- NEVER change JSON keys, only values
- EVERY text change must be in ALL 3 languages (en, pl, nl)
- NEVER break JSON syntax
- Keep SEO keywords in page titles (Audio Designer, Game Audio, Wwise, FMOD)
- Technical terms stay in English in all languages
- Igor is a STUDENT — text should show growth and skill, not fake seniority
- `npm run build` must pass after all changes
- node scripts/verify-i18n.cjs should report zero missing keys
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

## 📋 Podsumowanie

| Agent | Faza | Co robi |
|-------|------|---------|
| 🔬 **EMPLOYER RESEARCHER** | 1 | Bada co pracodawcy chcą czytać, robi Writing Brief z blacklistą słów |
| 📝 **PAGE WRITER** | 2 | Przepisuje hero, about, contact w 3 językach — zabija corpo-żargon |
| 📖 **PROJECT WRITER** | 2 | Przepisuje opisy WSZYSTKICH projektów w 3 językach — konkretnie, nie ogólnikowo |
| 🧑 **HUMAN FACTOR QA** | 3 | Czyta KAŻDY tekst od A do Z — logika, naturalność, test "GDC hallway" |

**Blacklista słów do wywalenia:**
leverage, synergy, seamless, innovative, cutting-edge, holistic, empower, passion-driven, crafting immersive experiences, designed and implemented

**Zamieniamy na:**
built, recorded, fixed, scripted, mixed, tuned, debugged, shipped, wrote, broke, solved
