# 🎮 Claude Code Agent Teams – Project Pages Complete Rewrite

> Przepisuje KAŻDĄ stronę projektu: research prawdziwych info z netu → research jak pisać o projektach → przepisanie w 3 językach → human factor QA.
> 13 projektów × 3 języki × tekst + layout = ogromny task.

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create a large agent team to completely rewrite every project detail page on this portfolio. This is a massive task covering 13+ projects, each with its own translation files in 3 languages.

## Project Context
- Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion + i18next (EN/PL/NL)
- Each project has a detail page at /projects/{project_id}
- Translation files: public/locales/{en,pl,nl}/ — 13 project-specific files + projectDetail.json (shared)
- Some projects have dedicated React pages (Gradwork.tsx, SoundDesign.tsx, Transientica.tsx)
- Generic projects use ProjectDetails.tsx with sub-components (ProjectHero, ProjectSidebar, ProjectRichDetails, ChallengesBlock, ContentBlockRenderer, ProjectCodeSection)
- Owner: Igor Szuniewicz, 22, 3rd year student at DAE Belgium

## Project Inventory

| # | Project | Namespace File | Type |
|---|---------|---------------|------|
| 1 | Shadow Frames | shadowFrames.json (298 lines) + projectDetail.json sf.* | Horror game, Wwise+UE5, biggest project |
| 2 | Not Today Darling | notTodayDarling.json (80 lines) | Multiplayer racer, MetaSounds, shipped |
| 3 | Pause & Deserve | pauseAndDeserve.json | Horror prototype, solo, 8 weeks |
| 4 | Amorak | amorak.json | Horror animation, sound design |
| 5 | Akantilado | akantilado.json | 3D animation, foley+spatial |
| 6 | Ray Animation | rayAnimation.json | Disco-funk score, last-minute replacement |
| 7 | Richter | richter.json | Earthquake film, field recording |
| 8 | AudioQ | audioq.json | VST/AU plugin, JUCE+C++ |
| 9 | Transientica: AudioLab | transientica.json | ML beatbox, Python+Unity |
| 10 | AI Audio Research (Gradwork) | gradwork.json | Bachelor thesis |
| 11 | Wwise Unreal Fixer | wwiseUnrealFixer.json | Pipeline tool, C++ |
| 12 | Unreal Engine Rebuilder | unrealEngineRebuilder.json | Pipeline tool, C++ |
| 13 | Middleware Optimization | middlewareOptimization.json | Wwise exam project |
| 14 | Sound Design Showcase | soundDesign.json | Sound design reel |
| + | Shared keys | projectDetail.json (649 lines) | UI labels + all full_desc |

## Key Problems to Fix
1. **Corpo jargon everywhere**: "RTPC-Based Dynamic System", "Delegate-Based Communication", "Surface Detection & Audio Routing" — these sound like technical docs, not a portfolio
2. **Tone inconsistency**: Not Today Darling is already human and fun. Shadow Frames is dry and technical. Others are mixed.
3. **Descriptions oversell**: calling student projects "architecture", "pipeline", "infrastructure"
4. **Duplication**: Shadow Frames content exists in BOTH shadowFrames.json AND projectDetail.json (sf.* namespace)
5. **Some full_desc in projectDetail.json are weak**: generic, formulaic, don't tell a story
6. **PL and NL translations need quality check**: may be machine-translated or stiff

## CRITICAL RULES
1. Text must be HUMBLE AND TRUE. Student projects, not AAA studios.
2. Zero corpo jargon. Write about Wwise RTPCs like a person, not a manual.
3. Every description should answer: "What is this? What did I do? Why does it matter?"
4. If a fact can't be verified, flag it for Igor to confirm
5. Keep technical accuracy (correct tool names, Wwise terminology is fine)
6. ALL changes in ALL 3 languages

## Team – 12 Agents across 5 Phases

---

### PHASE 0: RESEARCH (2 agents, parallel)

#### Agent 1: "PROJECT FACT-CHECKER" – Research Real Project Info from the Internet
Task:
1. **Search online for EVERY project** using WebFetch:
   - Shadow Frames: search DAE Howest game projects, RITCS collaborations, itch.io
   - Not Today Darling: search itch.io page (it was released!), any gameplay videos
   - Pause & Deserve: search itch.io or DAE showcases
   - Ray Animation: search DAE graduation films 2024/2025
   - Amorak: search student animation festivals
   - Richter: search student film festivals
   - AudioQ: search GitHub (Igor's account: Szunias or similar)
   - Transientica AudioLab: search GitHub, DAE research projects
   - Gradwork (AI Audio): search DAE thesis repository
   - Wwise Unreal Fixer: search GitHub
   - Unreal Engine Rebuilder: search GitHub
   - Akantilado: search student animation showcases
   
2. **For each project, gather**:
   - Official description (from itch.io, GitHub README, DAE showcase)
   - Team size and Igor's actual role
   - Release date or development period
   - Any reviews, screenshots, or gameplay videos
   - Technology actually used (verify against what's claimed on the site)
   - What URL can someone access this at? (itch.io link, GitHub link, etc.)

3. **Produce Fact Sheet**: .claude/teams/project-facts.md
   - One section per project with verified facts
   - Flag any discrepancies between site claims and found info
   - Flag anything that couldn't be verified

Rules:
- Only record FACTS you can verify. Don't fill gaps with assumptions.
- If you can't find a project online, that's fine — note it
- Note tone/language used in official descriptions (itch.io etc.) — this is how Igor or his team described them naturally


#### Agent 2: "WRITING RESEARCHER" – How to Write About Projects Without Corpo-Speak
Task:
1. **Research how game audio professionals describe their projects** using WebFetch:
   - A Sound Effect (blog): how sound designers write about their work
   - GDC Vault descriptions: how talks describe game audio work
   - Video game audio breakdowns on YouTube (Game Audio University, Marshall McGee)
   - Wwise blog case studies: how they describe implementations
   - Sound design portfolio sites (Akash Thakkar, Richard Ludlow, etc.)

2. **Analyze the DIFFERENCE between good and bad project descriptions**:
   
   BAD (corpo/template):
   - "Implemented a comprehensive RTPC-based dynamic audio system"
   - "Leveraged Wwise Switch Containers for granular zone-based audio management"
   - "Architected a modular delegate-based communication pipeline"
   
   GOOD (human):
   - "The more photos you collect, the worse everything sounds. Ambient drones get louder, your character breathes heavier."
   - "Footsteps change when you walk from tiles to wood. The game checks what's under you and picks the right sound."
   - "When 4 players crash at the same time, the important sounds need to cut through. I set priorities so pickups always beat collisions."

3. **Create a writing style guide for project pages**:
   - Structure: What is this game? → What did I do? → How does it work? → What was hard?
   - Verb bank: built, recorded, mixed, fixed, wrote, layered, crossfaded, triggered, tested
   - Blacklist: architected, leveraged, implemented, comprehensive, infrastructure, pipeline, scalable, modular (used as buzzword), granular, holistic
   - Technical terms that are OK: RTPC, Switch Container, MetaSounds, Blueprint, delegate, line trace (these are real tool names, not jargon)
   - Sections should tell a STORY, not list features
   - "I fixed X because Y was broken" > "Implemented solution for X"

4. **Produce Writing Guide**: .claude/teams/project-writing-guide.md

Rules:
- This guide will be used by ALL implementation agents. Make it specific and actionable.
- Include before/after examples for the ACTUAL content in this portfolio (use shadowFrames.json, projectDetail.json text)

---

### PHASE 1: HEAVYWEIGHT PROJECTS (3 agents, parallel)
Each agent rewrites ONE major project completely. These are the biggest, most important projects.

#### Agent 3: "SHADOW FRAMES WRITER"
Depends on: PHASE 0
Files: public/locales/{en,pl,nl}/shadowFrames.json, projectDetail.json (sf.* keys AND project_shadow_frames_* keys)

Task:
1. Read Fact Sheet + Writing Guide
2. Shadow Frames is Igor's BIGGEST and most technical project — it MUST be the best page
3. Rewrite ALL text following the Writing Guide
4. Key fixes needed:
   - `footstep.title`: "Footstep System: Surface Detection & Audio Routing" → humanize (e.g. "How Footsteps Work")
   - `player_audio.title`: "Player Audio System: Delegate-Based Communication" → humanize (e.g. "Player Sounds" or "Camera & Interaction Audio")
   - `rtpc.title`: "Dynamic Tension System: RTPC-Driven Ambience" → humanize (e.g. "How Tension Builds")
   - `wwise_arch.title`: "Wwise Architecture: Switch Containers & Photoboard Integration" → humanize
   - `audio_systems.title`: "Audio Implementation" → too generic, what kind?
   - ALL the "what/how/why/result" blocks — rewrite to sound like Igor explaining, not documentation
   - Code explanations (ann.* namespace) — these can stay more technical since they're code docs, BUT remove jargon from plain-text descriptions
5. Fix duplication: decide if content lives in shadowFrames.json or projectDetail.json sf.* — don't have both
6. Translate to PL and NL (natural, informal)

Rules:
- Keep ALL JSON keys exactly as they are
- This is a student project — text should reflect that
- Technical details are a STRENGTH but they need to sound like explanation, not documentation


#### Agent 4: "NOT TODAY DARLING WRITER"
Depends on: PHASE 0
Files: public/locales/{en,pl,nl}/notTodayDarling.json, projectDetail.json (project_not_today_* and project_nottoday_* keys)

Task:
1. Read Fact Sheet + Writing Guide
2. Not Today Darling text is ALREADY the best on the site — it's fun, specific, and human
3. Light touch only:
   - Verify facts against itch.io page
   - Check if tagline is accurate and compelling
   - `overview.role_desc`: "Audio Designer & Technical Implementer" → drop "Technical Implementer", just "Audio Designer"
   - `overview.tech_desc`: good but check if "No pre-baked loops" is accurate
   - `challenges.story`: good, keep
4. Fix any duplicate content between notTodayDarling.json and projectDetail.json
5. Translate/verify PL and NL

Rules:
- DON'T break what's already working. This file is a model for others.
- If it's already good, say so and move on


#### Agent 5: "GRADWORK WRITER"
Depends on: PHASE 0
Files: public/locales/{en,pl,nl}/gradwork.json, projectDetail.json (project_gradwork_* keys), src/pages/Gradwork.tsx

Task:
1. Read Fact Sheet + Writing Guide
2. The thesis is sensitive — it's a school project, NOT a production-ready system
3. Rewrite to be honest about limitations:
   - "predictive buffer" → "I tried caching sounds ahead of time to speed things up"
   - "pipeline" → "the system" or "how it works"
   - Don't claim AI audio is solved — state what was tested and what the results were
   - Keep actual metrics if they're real (latency numbers, model names)
4. Translate to PL and NL
5. Check Gradwork.tsx component for any text that's hardcoded (not in i18n)

Rules:
- Be MOST careful here. This is academic work — facts must be verifiable.
- Don't oversell. Don't undersell either — it's interesting research.

---

### PHASE 2: MEDIUM PROJECTS (3 agents, parallel)
Each agent handles 2-3 medium-sized projects.

#### Agent 6: "HORROR GAMES WRITER" – Pause & Deserve + Middleware Optimization
Depends on: PHASE 0
Files: public/locales/{en,pl,nl}/pauseAndDeserve.json, middlewareOptimization.json, projectDetail.json (related keys)

Task:
1. Read Fact Sheet + Writing Guide
2. Pause & Deserve: solo prototype, 8 weeks, learning Unreal. Describe it honestly as a learning project that has a cool mechanic.
3. Middleware Optimization: exam project, one week, 150MB limit. Short and honest.
4. Rewrite both following the guide
5. Translate to PL and NL


#### Agent 7: "ANIMATION WRITER" – Amorak + Akantilado + Ray Animation + Richter
Depends on: PHASE 0
Files: public/locales/{en,pl,nl}/amorak.json, akantilado.json, rayAnimation.json, richter.json, projectDetail.json (related keys)

Task:
1. Read Fact Sheet + Writing Guide
2. These are animation/film projects — focus on the CREATIVE process, not tech jargon
3. Amorak: creature roar, binaural mix. Text is decent, light touch.
4. Akantilado: foley, 5.1 mix. Currently sparse — add more detail about the work if facts support it.
5. Ray Animation: GREAT story (composer dropped out 8 days before). Keep and polish the narrative.
6. Richter: field recording, no libraries. Fix "All sounds recorded myself" → "I recorded everything from scratch"
7. Translate to PL and NL


#### Agent 8: "TOOLS & TECH WRITER" – AudioQ + Transientica + Wwise Fixer + UE Rebuilder + Sound Design
Depends on: PHASE 0
Files: public/locales/{en,pl,nl}/audioq.json, transientica.json, wwiseUnrealFixer.json, unrealEngineRebuilder.json, soundDesign.json, projectDetail.json (related keys)

Task:
1. Read Fact Sheet + Writing Guide
2. AudioQ: VST plugin, C++/JUCE. Describe what it does, not the tech stack list.
3. Transientica: ML beatbox. Cool project — describe the EXPERIENCE of playing it.
4. Wwise Fixer: utility tool. Keep short, practical. "Fixes broken Wwise after Perforce pulls. One click."
5. UE Rebuilder: utility tool. Same — short.
6. Sound Design Showcase: reel of work. Describe what's in it.
7. Check Transientica.tsx and SoundDesign.tsx for hardcoded text
8. Translate to PL and NL

---

### PHASE 3: SHARED CONTENT & CONSISTENCY (2 agents, parallel)

#### Agent 9: "SHARED CONTENT WRITER" – projectDetail.json Shared Keys
Depends on: PHASES 1-2
Files: public/locales/{en,pl,nl}/projectDetail.json

Task:
1. Read Writing Guide
2. Review ALL shared UI keys in projectDetail.json:
   - Section labels: "About the Project", "Technical Implementation", "Challenges & Solutions" → are these the best labels?
   - Code section labels: "Code Explanation", "Quick Reference" → fine, keep technical
   - Link labels: "Live Demo", "Source Code", "Watch Video" → fine
   - Timeline labels: "Prototype", "Production", "Polish" → fine
3. Review ALL `project_*_full_desc` keys — these are the MAIN descriptions shown on project cards:
   - project_shadow_frames_full_desc → must match shadowFrames.json narrative
   - project_not_today_darling_full_desc → must match notTodayDarling.json narrative
   - Do they all answer: What is this? What did Igor do? Why does it matter?
4. Remove/fix any remaining corpo jargon
5. Ensure consistency: same project described the same way across different JSON files
6. Translate/verify PL and NL

Rules:
- This is the GLUE file. Check for contradictions between shared descriptions and project-specific files.


#### Agent 10: "LANGUAGE QA" – PL and NL Translation Quality
Depends on: PHASES 1-2
Files: ALL files in public/locales/pl/ and public/locales/nl/

Task:
1. Read EVERY PL translation file:
   - Does it sound like a 22-year-old Polish game dev talking?
   - Not an official document, not Google Translate
   - Technical terms in English (Wwise, FMOD, MetaSounds, RTPC)
   - Informal "ty" form consistently
   - Polish characters correct (ą,ę,ó,ś,ź,ż,ć,ń,ł)
   - No literal translations that sound weird in Polish
   
2. Read EVERY NL translation file:
   - Natural Dutch/Flemish
   - Informal "je/jij" form
   - Not stiff or formal
   - Technical terms in English
   
3. Fix any issues directly
4. Flag uncertain translations

---

### PHASE 4: FINAL VERIFICATION (2 agents)

#### Agent 11: "CONTENT QA" – Cross-Project Consistency & Human Factor
Depends on: ALL previous phases

Task:
1. **Read every project page start to finish in EN**:
   - Does each page tell a coherent story?
   - Is there a logical flow? (overview → what I did → how it works → challenges)
   - No contradictions between pages
   - No repeated phrases across projects (each should feel unique)
   - No corpo jargon survived

2. **Apply the "podcast test"**: would Igor say this out loud on a podcast about student game dev?
   - If it sounds scripted → rewrite
   - If it sounds like documentation → humanize
   - If it sounds like marketing → remove

3. **Verify technical accuracy**:
   - Wwise terminology correct?
   - MetaSounds vs Sound Cues used correctly?
   - C++ vs Blueprint descriptions accurate?
   - Tool names spelled correctly?

4. **Check project hierarchy**: does the site make it clear which projects are IMPORTANT?
   - Shadow Frames & Not Today Darling = flagship
   - Gradwork = impressive research
   - Others = supporting portfolio

5. **Produce report**: .claude/teams/project-content-report.md


#### Agent 12: "BUILD VALIDATOR" – Technical Verification
Depends on: ALL previous phases

Task:
1. `npm run build` → must pass
2. `npx tsc --noEmit` → zero errors
3. Verify all 3 languages render for EVERY project page
4. Check that no JSON keys were accidentally changed or deleted
5. Verify all JSON files are valid (no syntax errors)
6. Check for missing translation keys (if a key exists in en/ but not in pl/ or nl/)
7. GREP for corpo jargon in ALL JSON files:
   - "leverage", "seamless", "innovative", "cutting-edge", "scalable", "architect" (as verb), "spearhead", "holistic", "empower", "streamline"
8. Verify ProjectDetails.tsx, Gradwork.tsx, Transientica.tsx, SoundDesign.tsx all render without errors

Rules:
- Build MUST pass
- Zero missing translation keys
- Zero corpo jargon


## Execution Order

```
PHASE 0 (parallel):
  PROJECT FACT-CHECKER → fact sheet
  WRITING RESEARCHER → writing guide

PHASE 1 (parallel, after Phase 0):
  SHADOW FRAMES WRITER → biggest project
  NOT TODAY DARLING WRITER → best-written project (light touch)
  GRADWORK WRITER → thesis (careful, honest)

PHASE 2 (parallel, after Phase 0):
  HORROR GAMES WRITER → Pause & Deserve, Middleware
  ANIMATION WRITER → Amorak, Akantilado, Ray, Richter
  TOOLS & TECH WRITER → AudioQ, Transientica, Wwise Fixer, UE Rebuilder, Sound Design

PHASE 3 (parallel, after Phases 1-2):
  SHARED CONTENT WRITER → projectDetail.json consistency
  LANGUAGE QA → PL and NL quality

PHASE 4 (after Phase 3):
  CONTENT QA → cross-project consistency, human factor
  BUILD VALIDATOR → technical verification
```

## NON-NEGOTIABLE
1. Zero corpo jargon in ANY language
2. ALL text humble and true — student projects, not AAA
3. Technical accuracy — Wwise/UE terms must be correct
4. ALL 3 languages updated for EVERY change
5. NO JSON keys changed (only values)
6. npm run build must pass
7. Each project page must tell a STORY, not list features
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

## 📋 Przegląd – 12 Agentów, 5 Faz

| Agent | Faza | Co robi |
|-------|------|---------|
| 🔍 **FACT-CHECKER** | 0 | Googla każdy projekt — itch.io, GitHub, DAE, weryfikuje fakty |
| ✍️ **WRITING RESEARCHER** | 0 | Jak pisać o projektach: before/after, blacklista, verb bank |
| 🎮 **SHADOW FRAMES** | 1 | Przepisuje największy projekt — 298+ lines, corpo→human |
| 🏎️ **NOT TODAY DARLING** | 1 | Lekki dotyk — już jest dobre, tylko weryfikacja |
| 🎓 **GRADWORK** | 1 | Thesis — ostrożnie, uczciwie, bez oversellingu |
| 👻 **HORROR GAMES** | 2 | Pause & Deserve + Middleware — 2 projekty |
| 🎬 **ANIMATION** | 2 | Amorak + Akantilado + Ray + Richter — 4 projekty |
| 🔧 **TOOLS & TECH** | 2 | AudioQ + Transientica + Fixer + Rebuilder + SoundDesign — 5 projektów |
| 🔗 **SHARED CONTENT** | 3 | projectDetail.json — spójność cross-project |
| 🇵🇱🇳🇱 **LANGUAGE QA** | 3 | PL + NL jakość — brzmi jak człowiek? |
| 🧑 **CONTENT QA** | 4 | "Podcast test" — czy Igor powiedziałby to na żywo? |
| 🏗️ **BUILD VALIDATOR** | 4 | npm run build + grep na corpo + brakujące klucze |

**Skala:**
- 13 projektów × 3 języki = **39 plików** do przejrzenia
- `projectDetail.json` sam ma **649 linii**
- `shadowFrames.json` ma **298 linii**
