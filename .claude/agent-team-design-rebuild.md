# 🏆 Claude Code Agent Teams – Research-Driven Design Rebuild

> **Kompletna przebudowa designu portfolio** — zaczynając od researchu co działa na pracodawców w Game Audio / Audio Design, kończąc na implementacji najlepszego możliwego designu.

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to perform a COMPLETE, research-driven design rebuild of this portfolio website. This is NOT a polish pass – this is a ground-up rethinking of the visual identity, layout, and UX.

The team follows a professional design process:
1. Research what works for employers & recruiters in the game audio / creative tech industry
2. Analyze award-winning portfolio sites and design patterns
3. Create a design direction document with moodboard references
4. Implement the new design across the entire site
5. QA and verify

## Project Context
- This is the portfolio of Igor Szuniewicz – a young game audio designer & developer looking for internship/job
- Target audience: Game studios, audio directors, hiring managers, technical recruiters in game/interactive media
- Tech stack: Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion + i18next (EN/PL/NL)
- Current design: dark editorial theme with gold accent – technically fine but lacks creative identity and reads as AI-generated
- Igor's strengths: Wwise, FMOD, Unreal Engine, C++, sound design, music composition
- Site sections: Hero, Showreel (Vimeo), Projects (cards), Skills/Tech, About, Contact, Music page
- Has an audio player for listening to tracks
- The site MUST remain functional – same routing, same data, same translations

## Team Structure – 9 Agents

### Agent 1: "RESEARCHER" – Industry & Employer Research
Role: UX Researcher / Design Strategist
Priority: FIRST – all other agents depend on this research

Task:
1. **Research what game industry employers look for in portfolios** by using WebFetch to study:
   - Audiokinetic (Wwise maker) career pages and featured artist portfolios
   - Game studio career pages: Ubisoft, EA DICE, Remedy, Supergiant Games, Naughty Dog audio team pages
   - Job postings for "Game Audio Designer" and "Sound Designer" on game studio sites
   - What audio directors/leads have said publicly about evaluating portfolios
   
2. **Analyze top-tier audio designer portfolios** (use WebFetch):
   - Search for award-winning game audio portfolios and sound design showreels
   - Study portfolio sites of: Akash Thakkar (Celeste audio), Martin Stig Andersen (Limbo/Inside), Em Halberstadt
   - Study aggregators: awwwards.com game/audio portfolios, behance.net audio designer portfolios
   - Look at SoundWorks Collection interviews for how audio pros present their work
   
3. **Research design patterns that convert hiring managers**:
   - What makes a recruiter stay on a portfolio for more than 10 seconds?
   - Best practices for showing technical skills + creative work on one page
   - How to present audio work visually (since audio is invisible)
   - Case studies vs project cards: which format works better?
   - Mobile-first vs desktop-optimized for recruiters who browse on phones between meetings

4. **Produce the Research Brief**: .claude/teams/design-research-brief.md
   - Target audience profiles (audio director, tech recruiter, studio HR)
   - Top 5 design patterns that work for audio portfolios specifically
   - Top 5 anti-patterns to avoid
   - 10 reference portfolio URLs with notes on what works
   - Key insight: how to make AUDIO feel tangible on a visual medium
   - Recommendations for Igor's specific situation (student, seeking internship, EU-based)

5. Broadcast the research brief to ALL teammates before they start

Rules:
- This comes FIRST – other agents must wait for this research
- Be specific and actionable, not generic design advice
- Focus on GAME AUDIO industry, not general web design
- Consider that Igor is early-career (student) – the portfolio should show potential, not pretend to be senior

### Agent 2: "ART DIRECTOR" – Design Direction & System
Role: Creative Director
Depends on: RESEARCHER

Task:
1. **Read the Research Brief from RESEARCHER**
2. **Define the new design direction** based on research findings:
   - Overall mood/vibe (3-5 adjective descriptors, e.g., "precise, immersive, grounded")
   - Color philosophy – why each color exists and what it communicates
   - Typography philosophy – what the font choices say about Igor
   - Motion philosophy – how movement relates to audio/sound
   - Layout philosophy – editorial vs magazine vs app-like
   
3. **Design the new color palette**:
   - Define 8-12 colors with semantic names and purpose
   - Primary backgrounds: 2-3 dark tones with MORE visible layering
   - Accent system: 1 primary accent + 1 secondary accent
   - Text hierarchy: 4 levels with proper contrast ratios (all WCAG AA)
   - Status colors: success, error, warning (muted to fit palette)
   - Consider: should the accent stay gold? Or does research suggest another direction?
   - Important: colors should evoke the AUDIO WORLD – think studio monitors, mixing desks, DAW interfaces, oscilloscope greens, VU meter warmth

4. **Design the typography system**:
   - Select 2-3 fonts that feel like a creative professional (not corporate, not generic)
   - Define the complete type scale: h1 through h6, body, caption, label, code
   - Define weight usage: when to use light, regular, medium, bold
   - Consider non-Latin characters: Polish (ą,ę,ó,ś,ź,ż,ć,ń,ł) and Dutch must render perfectly
   - All fonts must be free / Google Fonts (no licensing issues)

5. **Design the component language**:
   - Card styles: how do project cards, skill cards, timeline items look?
   - Button hierarchy: primary, secondary, ghost, icon-only
   - Borders vs shadows: what creates depth?
   - Radius values: sharp (0), subtle (4px), rounded (8px), pill – define ONE approach
   - Hover/active/focus states: define for all interactive elements

6. **Create the Design System Document**: .claude/teams/design-system.md
   - All decisions above with clear rationale
   - Reference the RESEARCHER findings for each decision
   - Include the exact Tailwind config values to implement

7. Broadcast design system to all implementation agents

Rules:
- Every design decision must be justified by the research
- The design must be IMPLEMENTABLE in Tailwind CSS – no abstract concepts
- Consider Igor's brand: young, technical, creative, cross-cultural (Polish in Belgium)
- The vibe should say: "I take my craft seriously, I'm detail-oriented, I have taste"

### Agent 3: "HERO BUILDER" – Landing & First Impression
Role: Above-The-Fold Specialist
Depends on: ART DIRECTOR

Task:
1. **Redesign the Hero section** – this is the most critical screen. A recruiter decides in 3-5 seconds.
   - The hero MUST immediately communicate: WHO (Igor), WHAT (audio designer/developer), and HOW GOOD (showreel/sample)
   - Igor's name should feel like a logo/brand mark, not just text
   - The tagline should be specific and memorable, not generic
   - Show don't tell: integrate audio-visual element (waveform, frequency spectrum, or audio-related visual metaphor)
   - CTA should be crystal clear: what does Igor want the visitor to do? (Watch showreel → See projects → Contact)
   - The hero MUST work perfectly on mobile (375px) AND large monitors (1920px+)

2. **Redesign the Showreel section**:
   - The Vimeo embed should feel premium, not like a generic iframe
   - Chapter navigation should feel like a tracklist/timeline
   - Consider: should the showreel be IN the hero or a separate section?

3. **Redesign the Intro Animation (IntroAnimation.tsx)**:
   - Make it memorable and audio-themed
   - Ideas: waveform draw-on, audio meter animation, frequency sweep visualization
   - Must complete in under 3 seconds
   - Must respect prefers-reduced-motion

4. **Technical Arsenal / Tech sidebar**:
   - Either integrate into hero naturally or remove
   - If keeping: no "Technical Arsenal" label — show tools as organic visual elements

Rules:
- The hero is a BILLBOARD – every pixel matters
- Test at exact breakpoints: 375px, 768px, 1440px, 1920px
- The first 3 seconds must hook both creative directors AND technical recruiters
- No generic hero patterns (centered text + gradient = AI template)

### Agent 4: "GALLERY ARCHITECT" – Projects & Work Showcase
Role: Portfolio Gallery Specialist
Depends on: ART DIRECTOR

Task:
1. **Redesign the Projects page layout**:
   - Research says: a recruiter wants to see QUALITY over QUANTITY
   - Feature the 2-3 strongest projects prominently (large thumbnails/previews)
   - Secondary projects in a more compact format
   - Category filters: make them feel like audio channel strips or mixer faders, not generic pill buttons
   - Consider: do we need a "bento grid" or would a simple, editorial, full-width layout be more impactful?

2. **Redesign ProjectCard**:
   - The card must answer 3 questions at a glance: What is this? What's the tech? Am I impressed?
   - Video thumbnails should autoplay on hover (already implemented, verify it works)
   - Tags/technology pills: style them to match the new design system
   - The "View Project" CTA should feel inviting, not template-y

3. **Redesign ProjectDetails page**:
   - This is where Igor sells his competence. It must be the BEST designed page
   - Layout: hero image/video → context (client, role, tools) → description → media gallery → code snippets → challenges
   - Make it feel like a professional case study, not a blog post
   - Add clear role/contribution callout (recruiters want to know WHAT IGOR SPECIFICALLY DID)
   - Tech stack used should be visually prominent but not cluttering

4. **Optimize for the "2-minute recruiter visit"**:
   - Above-the-fold on projects page: best work visible immediately
   - Each project detail page: key info in first viewport, details below
   - Clear navigation: easy to go from project → next project → back to all

Rules:
- Quality > quantity in the work showcase
- Every project must have clear: title, role, tools used, outcome
- Media (images, video) should be the HERO of project pages – not text walls
- Make audio work VISIBLE: screenshots of Wwise sessions, DAW timelines, code blocks

### Agent 5: "SKILLS ENGINEER" – Technical Identity Display
Role: Skills & Competence Visualization Specialist
Depends on: ART DIRECTOR

Task:
1. **Redesign Skills/Tech section on homepage**:
   - Current: 6 tech logo cards + tag cloud. Feels like every other portfolio
   - New approach inspired by the research: make it feel like Igor's WORKSTATION
   - Ideas:
     - Audio mixer metaphor: each skill area is a channel strip
     - DAW timeline metaphor: skills grouped by workflow stage (Design → Implement → Mix → Ship)
     - Simple but distinctive: skill groups with subtle audio-visual decoration
   - Show PROFICIENCY, not just "I've heard of this tool"

2. **Redesign About page skill sidebar (AboutSkillsSidebar.tsx)**:
   - Current: simple list in sidebar
   - Make it more visual and informative
   - Group by competency area with clear hierarchy

3. **Fix the tech logo showcase**:
   - Current logos are at 70% opacity with invert filter – looks washed out
   - Use proper branded SVG logos OR simple text-based tech names (no blurry PNGs)
   - Consider: logos vs text-indicator approach (like an IDE status bar)

4. **Secondary skills section**:
   - Current: tag cloud of skills. Generic
   - Better: organized by category in a grid or timeline

Rules:
- Skills section should answer: "Can this person do the job I'm hiring for?"
- Tech logos must be crisp – no blurry images
- Show WORKFLOW competence, not just tool names
- Reflect the research findings on what recruiters want to see

### Agent 6: "CONTACT DESIGNER" – Contact & Conversion Page
Role: Conversion Page Specialist
Depends on: ART DIRECTOR

Task:
1. **Redesign the Contact page**:
   - Current: form + social links. Very standard
   - A recruiter reaching the contact page is READY to reach out – make it easy
   - Show Igor's email prominently (recruiters prefer email over forms)
   - LinkedIn should be one-click prominent
   - Location (Kortrijk, Belgium) and timezone: helps international recruiters
   - "Available for internship" status: make it visually prominent but tasteful
   - Consider: add a "Download CV" button directly on the contact page

2. **Redesign the ContactForm**:
   - Make it feel personal, not generic
   - Reduce fields: Name + Email + Message only (remove Subject – adds friction)
   - Success state: something memorable (not just "Message sent!")
   - Error state: helpful and human

3. **Redesign the Footer**:
   - Current: 3-column grid, standard
   - Make it distinctive: audio-themed, or very minimal editorial
   - Social links should be prominent and fingertip-accessible on mobile
   - Remove "Built with React, TypeScript & Tailwind CSS" – recruiters don't care about your tech stack in the footer

Rules:
- Contact page = conversion page. Every element should push toward "contact Igor"
- Remove friction: fewer fields, bigger touch targets, prominent email
- Make CV download accessible from multiple places

### Agent 7: "NAV & CHROME DESIGNER" – Navigation, Audio Player, Intro
Role: Chrome & Persistent UI Specialist
Depends on: ART DIRECTOR

Task:
1. **Redesign the Navbar**:
   - Current: standard top-bar nav with logo + links + socials
   - Make it feel more like a creative's site, not a SaaS app
   - Consider: minimal nav (just name + hamburger) that expands
   - OR: keep horizontal nav but make it more distinctive
   - Mobile menu: full-screen takeover with creative animation, not just a slide panel
   - Language switcher should be subtle but accessible

2. **Redesign the Audio Player (fixed bottom bar)**:
   - This is a UNIQUE DIFFERENTIATOR – no other portfolio has a built-in audio player
   - It should feel like a professional media player, not a browser addon
   - Add backdrop blur for premium feel
   - Progress bar: more tactile, with time display
   - Album art: slightly larger, with subtle glow
   - Controls: intuitive, well-spaced, accessible
   - Consider: making it more prominent instead of hiding it – it's Igor's SUPERPOWER

3. **Redesign the Music page**:
   - This page shows off Igor's compositional work
   - Each track should feel like an album listing
   - Add waveform visualization if possible
   - Make playlists/categories more browseable

4. **Redesign 404 / NotFound page**:
   - Current: generic
   - Make it audio-themed and memorable: "404 – Dead air", static noise visual, or a broken waveform
   - Provide clear path back to homepage

5. **Redesign loading states and page transitions**:
   - Loading: audio waveform pulse instead of generic spinner
   - Page transitions: smooth crossfade or audio-inspired swipe

Rules:
- The audio player is a SELLING POINT – treat it as a premium feature
- Nav must work flawlessly across all pages and breakpoints
- Mobile nav is critical – many recruiters browse on phones

### Agent 8: "IMPLEMENTER" – Tailwind Config & CSS Foundation
Role: Design System Implementation Engineer
Depends on: ART DIRECTOR (must wait for design system document)

Task:
1. **Implement the new tailwind.config.js**:
   - All new colors from ART DIRECTOR's palette
   - All new fonts with proper fallbacks
   - All spacing/sizing tokens
   - Custom keyframes for audio-themed animations
   - Responsive breakpoints verification

2. **Update index.html**:
   - New font loading with preconnect and font-display: swap
   - Updated meta tags and favicon if needed
   - Any new external resources

3. **Rewrite index.css**:
   - New base styles reflecting the design system
   - Custom utility classes needed
   - Scrollbar styling update
   - Selection color update
   - Print styles update
   - Audio-themed reusable animations

4. **Create src/constants/design.ts** (if needed):
   - Motion presets (animation variants for framer-motion)
   - Shared constants (breakpoints, z-index layers, timing values)

5. **Build and verify**: `npm run build` must pass

Rules:
- Implement EXACTLY what ART DIRECTOR specified
- No creative freelancing – follow the design system
- Ensure all tokens are properly defined for team 3-7's components to use
- Verify font loading performance

### Agent 9: "QUALITY LEAD" – Final Integration & QA
Role: Final QA / Integration Lead
Depends on: ALL other agents

Task:
1. **Integration pass**:
   - Visit every page and verify visual consistency
   - Ensure all agents' changes work together harmoniously
   - Fix any conflicts between agents' changes

2. **Technical verification**:
   - `npx tsc --noEmit` → zero errors
   - `npx eslint . --max-warnings 0` → zero warnings
   - `npm run build` → successful build
   - `npm run test` → all tests pass
   - `node scripts/verify-i18n.cjs` → zero i18n issues

3. **Visual verification**:
   - Every page at 375px, 768px, 1024px, 1440px, 1920px
   - Light/dark OS settings (site is dark, should look good regardless of OS theme)
   - All interactive states: hover, focus, active, disabled
   - Audio player in all states: playing, paused, closed
   - Mobile menu: open, close, navigate

4. **The "Would I Hire Igor?" test**:
   - Read through the entire site as if you're an Audio Director looking for an intern
   - Time yourself: can you understand what Igor does in under 5 seconds?
   - Can you see his best work in under 30 seconds?
   - Can you find his contact info in under 10 seconds?
   - Does the site feel like it was made by a creative professional with taste?
   - Does it stand out from generic portfolio templates?

5. **Produce final report**: .claude/teams/design-rebuild-final-report.md
   - Summary of all changes
   - Design decisions and their rationale
   - Before/after comparisons (describe key screens)
   - Remaining recommendations
   - The research insights that drove the biggest decisions

Rules:
- The build MUST pass
- If ANY page feels inconsistent, send the responsible agent back
- This is Igor's career tool – it must be PERFECT
- The site must beat 95% of student audio designer portfolios they've seen in research

## Execution Order

```
Phase 0 – RESEARCH (must complete before anything else):
  RESEARCHER → produces design-research-brief.md

Phase 1 – DESIGN DIRECTION (must complete before implementation):
  ART DIRECTOR → reads research, produces design-system.md

Phase 2 – FOUNDATION:
  IMPLEMENTER → builds tailwind config, CSS, design tokens

Phase 3 – IMPLEMENTATION (parallel, all using the design system):
  HERO BUILDER → hero, showreel, intro
  GALLERY ARCHITECT → projects page, cards, detail pages
  SKILLS ENGINEER → skills section, tech display
  CONTACT DESIGNER → contact, footer, CTA areas
  NAV & CHROME DESIGNER → navbar, audio player, music page, 404, transitions

Phase 4 – FINAL QA:
  QUALITY LEAD → integration, testing, "would I hire Igor?" test
```

## Coordination Rules
- RESEARCHER goes FIRST. Nobody starts until the research brief is published
- ART DIRECTOR goes SECOND. Nobody implements until the design system is published
- IMPLEMENTER goes THIRD. Sets up the foundation for all Phase 3 agents
- Phase 3 agents CAN work in parallel – they all follow the same design system
- QUALITY LEAD goes LAST and has authority to send anyone back
- Every agent reads BOTH the research brief AND the design system before starting
- All artifacts go to .claude/teams/

## Non-Negotiable Constraints
1. Site remains FUNCTIONAL – same routing, same data, same features
2. i18n stays intact – all 3 languages must work
3. Audio player stays – it's a unique differentiator
4. Showreel stays – it's the best proof of work
5. Mobile-first – recruiters browse on phones
6. Performance – page load under 3 seconds, no layout shifts
7. Accessibility – WCAG 2.1 AA minimum
8. The design must look like it was built by a creative professional, NOT generated by AI
```

---

## ⚙️ Jak użyć

```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
cd c:\Users\iszun\Documents\GitHub\igorszuniewicz
claude
# Wklej Master Prompt powyżej
```

---

## 📋 Przegląd Drużyny

| # | Agent | Faza | Rola |
|---|-------|------|------|
| 🔬 | **RESEARCHER** | 0 | Research branży Game Audio, analiza portfoliów top audio designerów, co działa na rekruterów |
| 🎨 | **ART DIRECTOR** | 1 | Decyzje designu oparte na researchu: kolory, fonty, komponenty, filozofia |
| ⚙️ | **IMPLEMENTER** | 2 | Tailwind config, CSS, design tokens – fundament |
| 🏠 | **HERO BUILDER** | 3 | Hero, showreel, intro animation – pierwsze 3 sekundy |
| 🖼️ | **GALLERY ARCHITECT** | 3 | Strona projektów, karty, case studies – portfolio core |
| 🛠️ | **SKILLS ENGINEER** | 3 | Display umiejętności – workstation/mixer display |
| 📞 | **CONTACT DESIGNER** | 3 | Kontakt, footer, konwersja – "hire Igor" flow |
| 🎛️ | **NAV & CHROME** | 3 | Navbar, audio player, muzyka, 404, transitions |
| 🏁 | **QUALITY LEAD** | 4 | Build, responsywność, "Would I Hire Igor?" test |

---

## 🎯 Co wyróżnia tę drużynę

1. **Research-first** — RESEARCHER idzie pierwszy, wszystko jest oparte na danych z branży Game Audio
2. **Art direction** — ART DIRECTOR tworzy spójny design system zanim ktokolwiek ruszy implementację
3. **"Would I Hire Igor?" test** — QUALITY LEAD ocenia stronę z perspektywy Audio Directora
4. **Audio-specific design** — nie generic portfolio, a strona zaprojektowana dla branży audio
5. **Fazy zależne** — 0→1→2→3→4, żaden agent nie zaczyna bez kompletnych danych od poprzednika
