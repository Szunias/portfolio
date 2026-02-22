# ✨ Claude Code Agent Teams – Visual Overhaul & Humanization

> **Prompt do wklejenia w Claude Code**, żeby odpalić drużynę agentów do wizualnej przeróbki.
> Cel: usunąć "AI-generated feel", uczynić stronę bardziej ludzką, clean, transparentną i autentyczną.
> Skopiuj cały blok poniżej i wklej jako prompt w Claude Code (z włączonym Agent Teams).

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to perform a comprehensive visual overhaul of this portfolio website. The goal is to eliminate the "AI-generated" look and make everything feel clean, human, authentic, and transparent. The site currently looks too perfectly templated – it needs personality and intentional imperfection.

## Project Context
- Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion
- Portfolio website for Igor Szuniewicz – a young game audio designer & developer
- Dark aesthetic using: primary #111111, secondary #161616, accent gold #c17f3e, dim text #8a8a8a, cream #e8e4df
- Fonts: Cormorant Garamond (display/headings), DM Sans (body), IBM Plex Mono (monospace)
- i18next for EN/PL/NL translations
- Current design: editorial dark theme with border-based interactions

## The Problem: Why It Looks AI-Generated
1. EVERY section has identical animation parameters (opacity:0, y:8, duration:0.3) – feels robotic
2. EVERY card/component uses the same pattern: `bg-secondary border border-border rounded-sm` – too uniform
3. Labels like "Technical Arsenal", "NO_SIGNAL" feel like AI prompt artifacts, not human choices
4. Typography hierarchy is mechanically consistent – no visual surprise or emphasis variation
5. Hover effects are all identical (border-border-hover) – no personality
6. Grid layouts are too symmetrical – real designers break the grid intentionally
7. Section spacing is robotic: always py-24, always gap-8
8. Colors are safe and expected – needs subtle unexpected moments
9. The intro animation is generic (name + "Audio Designer") – doesn't convey personality
10. Everything feels "designed by committee" – needs a creative voice

## Team Structure – 7 Agents

### Agent 1: "TYPOGRAPHER" – Typography & Hierarchy Overhaul
Role: Typography & Visual Hierarchy Specialist
Files: ALL component and page files, tailwind.config.js, index.css, index.html

Tasks:
1. **Audit font loading in index.html**:
   - Verify Cormorant Garamond, DM Sans, and IBM Plex Mono are loaded with correct weights
   - Add `font-display: swap` for performance
   - Consider adding ONE new font for accent use – something with more character (e.g., Space Grotesk, Clash Display, or Satoshi for a more human feel in labels)
   
2. **Break the monotonous heading pattern**:
   - Currently ALL headings use `font-display text-cream-light` – add variation
   - Hero h1: should be the MOST expressive – consider letter-spacing variations, mix of weights
   - Section headings: alternate between serif display and a cleaner sans approach
   - Subsection headings: use a different weight or style than section headings
   - Don't make every heading the same size across pages

3. **Fix body text stiffness**:
   - `text-dim` (#8a8a8a) is too muted and fails WCAG AA contrast. Change to #999999 or #a0a0a0
   - Increase paragraph line-height from `leading-relaxed` to `leading-loose` in long-text sections
   - Add occasional `text-cream` emphasis words within dim paragraphs (using <em> with custom styling)
   - Body font size is fine but the max-width constraining text blocks feels too uniform

4. **Fix monospace overuse**:
   - `font-mono` is used for everything: labels, timestamps, categories, badges, year badges
   - Reserve monospace for truly technical contexts: code, timestamps, track durations
   - Use regular sans-serif with letter-spacing for labels and categories instead
   - Remove uppercase + tracking-widest from most labels – it screams "designed by AI"

5. **Add typographic personality**:
   - The `drop-cap` CSS class exists but verify it's used meaningfully
   - Add subtle pull-quote styling (not just border-left + italic)
   - Consider optical alignment fixes (hanging punctuation in quotes)

Rules:
- Keep the dark aesthetic – only change typography choices
- Changes should be SUBTLE – we're refining, not redesigning
- Maintain readability above all
- Every change must pass WCAG AA contrast (4.5:1 minimum)

### Agent 2: "ANIMATOR" – Motion & Interaction Humanization
Role: Motion Design Specialist
Files: ALL files using framer-motion or CSS animations

Tasks:
1. **Break the animation uniformity**:
   - Currently EVERY component uses the exact same: `initial={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}`
   - Create 3-4 distinct animation presets for different contexts:
     - **hero**: slower, coming from further (y: 20, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94])
     - **section-reveal**: subtle fade (opacity only, duration: 0.4)
     - **card-in**: stagger with slight scale (scale: 0.98 → 1, opacity, y: 12, duration: 0.35)
     - **detail-in**: left/right slide depending on layout position
   - Extract these presets to a shared `src/constants/motion.ts` file

2. **Vary stagger delays**:
   - Currently: `delay: index * 0.05` everywhere
   - Use different stagger values: 0.08 for cards, 0.03 for tags, 0.1 for timeline items
   - Add subtle randomness: `delay: index * 0.08 + Math.random() * 0.02`

3. **Fix hover interactions**:
   - EVERY card uses the same hover: `border-border-hover` color change
   - Add variety:
     - ProjectCard: subtle shadow-glow on hover instead of just border color
     - Skills cards: slight tilt/3D perspective effect
     - Nav links: custom underline animation (width grow) instead of just color change
     - Footer links: color shift to accent instead of cream
   - Add cursor changes: `cursor-pointer` on all interactive elements

4. **Improve transitions**:
   - Use spring physics instead of linear easing for interactive elements
   - Page transitions: add a subtle page-level fade/slide
   - Modal/lightbox: use spring animation for open/close
   - Scroll-linked effects: parallax on Hero background elements

5. **Fix the intro animation**:
   - Current: name fades in center, fades out. Very generic
   - Make it more memorable: stagger-reveal each letter, or use a wipe-in effect
   - Add a subtle sound design reference (like a waveform animation or audio meter)
   - Keep it under 3 seconds total

6. **Reduce motion considerations**:
   - Respect `prefers-reduced-motion` everywhere
   - Already checked in IntroAnimation but verify ALL framer-motion components

Rules:
- Motion should feel ORGANIC – like breathing, not like a machine clicking
- No animation should exceed 600ms for interactive elements
- Scroll animations should use `viewport: { once: true }` to avoid replay
- Performance: use GPU-accelerated properties only (transform, opacity)

### Agent 3: "LANDSCAPER" – Layout & Spacing Humanization
Role: Layout & Spatial Design Specialist
Files: ALL page and component files

Tasks:
1. **Break the grid uniformity**:
   - Projects page: instead of uniform 2-col grid, use an asymmetric masonry-like layout
     - Feature 1st project as full-width or 2/3 width
     - Alternate between 1-col and 2-col rows
   - Skills section: instead of 3x2 grid, use varied sizing (one big card, smaller cards around it)
   - About page achievements: vary card sizes

2. **Fix robotic spacing**:
   - Currently: py-24 for ALL sections, gap-8 for ALL grids
   - Vary section padding: py-16, py-20, py-28, py-32 based on content importance
   - Vary gaps: gap-6 for tight groups, gap-10 for breathing room, gap-16 for major separations
   - Add intentional asymmetric margins (e.g., mt-4 mb-12 instead of my-8)

3. **Improve the Hero layout**:
   - The name typography is strong but the "Technical Arsenal" sidebar feels like a template
   - Replace "Technical Arsenal" with the  tech listed more organically – perhaps inline tags under the tagline
   - OR make the sidebar feel more personal: add a subtle personal photo or waveform visual
   - The CTA buttons row feels cluttered (3 items: view works, CV, play button)
   - Simplify: primary CTA (View Work) + subtle secondary (CV link under tagline)

4. **Fix max-width inconsistency**:
   - Some sections use max-w-7xl, some max-w-[1600px], some max-w-5xl
   - Standardize to 2 widths: `max-w-6xl` for content pages, `max-w-7xl` for wide layouts (projects)
   - Hero should be wider to feel expansive

5. **Add visual breathing room**:
   - Add more whitespace between major sections (not just padding but actual visual separators)
   - Use subtle horizontal lines or decorative elements as section dividers
   - The footer feels cramped – increase its padding and breathing room

6. **Mobile layout improvements**:
   - Verify every page looks good at 375px width (iPhone SE)
   - Hero on mobile: ensure name doesn't overflow, reduce font size gracefully
   - ProjectCard on mobile: full-width with proper touch targets
   - Audio player on mobile: ensure all controls are accessible

Rules:
- Breaking the grid should feel INTENTIONAL, not broken
- Every spacing change must look good on mobile AND desktop
- Use CSS Grid's auto-fill/auto-fit for organic sizing where possible
- Maintain consistent horizontal margins (px-6 lg:px-12) across pages

### Agent 4: "COLORIST" – Color & Visual Atmosphere
Role: Color & Mood Specialist
Files: tailwind.config.js, index.css, ALL component files

Tasks:
1. **Enrich the color palette**:
   - Current palette is functional but monotone (just grays + one gold accent)
   - Add 2-3 subtle secondary colors to create depth:
     - A cooler tone for technical content (e.g., #4a6fa5 slate blue for code/tech areas)
     - A warmer highlight for personal content (e.g., the existing gold, but with a warm cream variance)
     - A subtle success/positive color for achievements/CTAs (existing #22c55e is too vivid – mute it)
   - Do NOT make the site colorful – keep it predominantly monochromatic with occasional color touches

2. **Fix the #8a8a8a contrast issue**:
   - text-dim fails WCAG AA on bg-primary
   - Change to #9a9a9a (ratio ~4.8:1) or #a0a0a0 (5.3:1)
   - Update tailwind.config.js `dim` color

3. **Add depth layers**:
   - Currently bg-primary and bg-secondary are almost indistinguishable (#111 vs #161616)
   - Make the layering more visible: bg-secondary should be #1a1a1a or #1d1d1d
   - Add a bg-elevated for cards that hover: slightly lighter still
   - Use subtle background gradients on key sections instead of flat colors

4. **Improve the accent usage**:
   - Gold accent (#c17f3e) is used only for: borders, small labels, CTA buttons
   - Use it more meaningfully: section divider lines, active states, focus rings
   - But DON'T overuse it – accent should be ~5-10% of visible color

5. **Add subtle texture**:
   - The `.bg-noise` class exists in CSS but verify it's used
   - Add subtle grain/noise overlay to hero section for analog feel
   - Consider very subtle color shift on scroll (header becomes slightly more opaque)

6. **Fix dark mode consistency**:
   - Some text uses color values directly (text-red-400, text-green-400) which clash with the refined palette
   - Create custom error/success colors that fit the palette:
     - Error: #cc6b6b (muted red) instead of text-red-400
     - Success: #6bcc8a (muted green) instead of text-green-400

Rules:
- The site MUST stay predominantly dark – we're adding depth not brightness
- Every color change must be tested against the dark background for contrast
- Update ONLY tailwind.config.js for new colors, no inline hex values
- Keep the gold accent as the primary brand color

### Agent 5: "PERSONALITY" – Content & Microcopy Humanization
Role: UX Writer & Human Voice Specialist
Files: ALL i18n translation files (public/locales/en/*.json), component files with hardcoded strings

Tasks:
1. **Fix AI-sounding labels**:
   - "Technical Arsenal" → "Tools I Use" or simply the tech names with no label
   - "NO_SIGNAL" (placeholder for missing thumbnails) → something wittier or just a simple icon
   - "Selected Works" → "Work" or "Projects" (less pretentious)
   - "What Drives Me" → something more personal and less corporate
   - "Notable Work" → "Highlights" or just remove the section header and let cards speak

2. **Detemplate the section structure**:
   - Every section follows: Label → Heading → Subtitle → Content → CTA
   - Some sections should skip the label or subtitle
   - Vary the CTA positioning and style (not always bottom-centered with arrow)

3. **Make CTAs feel natural**:
   - "View Selected Works" → "See my work" or just "Projects →"
   - "Download CV" → "My CV" (PDF icon is enough)
   - "Get in Touch" → "Say hi" or "Let's talk"
   - "Send Message" → "Send"
   - These changes should be in EN translation files, and correspondingly natural in PL and NL

4. **Add human touches**:
   - Footer: the "Built with React, TypeScript & Tailwind CSS" line could be playful: "Handbuilt with React, TypeScript & way too much coffee"
   - Or remove it entirely – listing your tech stack in the footer is an AI pattern
   - 404 page: make it memorable (audio-themed: "This frequency doesn't exist" or "404 – Dead air")
   - Loading state: instead of just a pulsing dot, consider a subtle audio waveform animation

5. **Review section-by-section**:
   - Hero: tagline should feel like Igor's voice, not a LinkedIn summary
   - About: Journey and Drives sections should read like a personal letter, not a bio
   - Projects: descriptions should have personality, not just describe what the project does
   - Contact: the form introduction should make people WANT to reach out
   - Skills: labels should showcase expertise without the corporate "stack listing" feel

6. **Remove generic filler text**:
   - Find any "Lorem ipsum", placeholder descriptions, or generic copy
   - Replace with specific, real, personal content

Rules:
- Every text change must be updated in ALL 3 languages (en, pl, nl)
- PL should feel natural and informal (not a direct translation from EN)
- NL should feel natural too (informal "je/jij" form)
- Don't change Igor's name or factual info
- Keep key SEO terms (Audio Designer, Game Audio, Wwise, etc.) in titles

### Agent 6: "DETAILER" – Micro-Interactions & Polish
Role: UI Detail & Polish Specialist
Files: ALL UI and component files

Tasks:
1. **Custom cursor effects** (subtle):
   - Default cursor: keep standard
   - Interactive elements: consider a subtle custom cursor glow/highlight (but don't overdo it)
   - OR: skip custom cursor but add cursor: pointer to ALL clickable elements

2. **Focus states**:
   - Current focus ring is `ring-accent/50` everywhere
   - Make focus states more visible and varied
   - Add visible focus indicators for keyboard navigation (accessibility)

3. **Scroll-based effects**:
   - Navbar: already has scroll-based opacity – refine the transition
   - Add a subtle scroll progress indicator (thin line at top of viewport)
   - Sections: use IntersectionObserver to add class-based reveal (more performant than framer-motion for simple fades)

4. **Audio player polish**:
   - The fixed bottom player is functional but looks generic
   - Add a subtle backdrop blur (`backdrop-blur-md`)
   - Make the progress bar scrubber more tactile (larger hit area, handle that appears on hover)
   - Album art: add subtle rounded corners and shadow

5. **Card hover states enrichment**:
   - ProjectCard: add a subtle image zoom on hover (already has opacity change, but zoom adds life)
   - Skills/tech cards: add subtle background color shift
   - Footer links: underline slide-in effect

6. **Loading & transition states**:
   - Page transitions: add a subtle crossfade between pages
   - Image loading: skeleton shimmer animation (currently uses ImageWithLoader but verify its quality)
   - Lazy-loaded sections: smooth content pop-in

7. **Button refinements**:
   - Primary button: add subtle gradient instead of flat color
   - Secondary button: refine the border animation on hover
   - Ghost button: add a subtle background wipe on hover
   - Add active state (small scale down) for tactile feedback

8. **Selection & text highlighting**:
   - Add custom `::selection` color in CSS to match the accent palette
   - Current scrollbar is custom – verify it looks good in all browsers

Rules:
- SUBTLETY is key – each detail should barely be noticed individually but collectively feel premium
- Performance: no detail should cause layout shifts or jank
- Every micro-interaction must work on mobile too (touch-friendly)
- Test with keyboard navigation

### Agent 7: "QUALITY GATE" – Visual QA & Final Verification
Role: Visual QA Lead
Tasks:
1. **Cross-page consistency check**:
   - Every page should feel like part of the same site but NOT like cookie-cutter sections
   - Verify color usage is consistent after changes
   - Verify font usage follows the new hierarchy rules
   - Check spacing feels cohesive

2. **Responsive testing** (verify visually at these breakpoints):
   - 375px (iPhone SE)
   - 390px (iPhone 14)
   - 768px (iPad)
   - 1024px (iPad landscape / small laptop)
   - 1440px (desktop)
   - 1920px (large monitor)

3. **Performance after visual changes**:
   - `npm run build` must succeed
   - Check that new animations don't cause layout shifts
   - Verify no new rendering jank
   - Check bundle size hasn't significantly increased

4. **Accessibility after changes**:
   - All new colors pass WCAG AA contrast
   - All focus states are visible
   - Animations respect prefers-reduced-motion
   - Touch targets remain 44x44px minimum

5. **The "Human" test**:
   - Read every page top to bottom: does it feel like a PERSON made this?
   - Look at each section: could you tell an AI generated this? If so, flag it
   - Check that variation feels intentional, not random
   - Verify the overall vibe: creative professional portfolio, not a SaaS landing page

6. **Final report**: .claude/teams/visual-overhaul-report.md
   - Before/after design decisions
   - Every component that was changed and why
   - Remaining recommendations
   - Screenshots or descriptions of key visual changes

Rules:
- The build MUST pass
- Visual changes should make the site feel BETTER, not just DIFFERENT
- If any agent's changes clash with another's, coordinate a fix
- The gold accent, dark palette, and serif headings are CORE identity – don't lose them

## Execution Order

```
Phase 1 (parallel – independent systems):
  TYPOGRAPHER → font system & text hierarchy
  COLORIST → palette & atmosphere

Phase 2 (after Phase 1 – builds on font/color changes):
  LANDSCAPER → layout & spacing
  ANIMATOR → motion & interactions

Phase 3 (after Phase 2 – depends on layout/motion):
  PERSONALITY → content & copy
  DETAILER → micro-interactions & polish

Phase 4 (final):
  QUALITY GATE → visual QA & verification
```

## Coordination Rules
- Phase 1 agents establish the visual foundation (colors + fonts)
- Phase 2 agents restructure layout and motion on top of that foundation
- Phase 3 agents add copy and polish
- QUALITY GATE has authority to send ANY agent back
- All reports go to .claude/teams/

## Design Principles (non-negotiable)
1. DARK IS IDENTITY – the site stays dark, we add depth not brightness
2. GOLD IS BRAND – #c17f3e accent stays, we refine its role
3. SERIF + SANS – keep Cormorant Garamond + DM Sans as core, add ONE accent font max
4. LESS IS MORE – remove visual noise, don't add more
5. SHOW PERSONALITY – Igor is a young creative, not a Fortune 500 exec
6. TRANSPARENCY – the user wants things to be "clear" (jasne/transparent) – prioritize readability and honest, direct design
7. HUMAN OVER PERFECT – intentional imperfection beats robotic precision
```

---

## ⚙️ Jak użyć

### Krok 1:
```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
```

### Krok 2:
```powershell
cd c:\Users\iszun\Documents\GitHub\igorszuniewicz
claude
```

### Krok 3: Wklej **Master Prompt** powyżej.

---

## 📋 Przegląd Drużyny

| # | Agent | Faza | Co zmienia |
|---|-------|------|-----------|
| ✏️ | **TYPOGRAPHER** | 1 | Hierarchia czcionek, kontrast, mniej uppercase/mono, więcej zróżnicowania |
| 🎨 | **COLORIST** | 1 | Głębsza paleta, poprawiony kontrast, subtelne warstwy, texture |
| 🏗️ | **LANDSCAPER** | 2 | Asymetryczne layouty, zróżnicowany spacing, ludzkie proporcje |
| 🌊 | **ANIMATOR** | 2 | Zróżnicowane animacje, humanizowane hovery, lepsze intro |
| 💬 | **PERSONALITY** | 3 | Ludzki mikro-copy, mniej "AI labels", naturalny głos |
| 💎 | **DETAILER** | 3 | Backdrop blur, scroll progress, button gradients, selection styling |
| 🏁 | **QUALITY GATE** | 4 | Responsywność, a11y, performance build, "human test" |

---

## 🎯 Kluczowe zasady

- **Dark = tożsamość** — strona pozostaje ciemna, dodajemy głębię
- **Gold = brand** — złoty akcent (#c17f3e) zostaje
- **Human > Perfect** — celowe niedoskonałości > robotyczna precyzja
- **Jasność/transparentność** — czytelność i bezpośredni design ponad wszystko
- **Build musi przejść** na końcu
