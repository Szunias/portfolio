# 🔧 Claude Code Agent Teams – Targeted Fixes (Intro + Project Grid)

> Dwa konkretne zadania: zmiana animacji wczytywania + naprawa siatki projektów i tagów.

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to fix two specific issues on this portfolio site.

## Project Context
- Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion
- i18next (EN/PL/NL), React Router v6 lazy-loaded pages
- Key files listed below per agent

## Team – 2 Agents

### Agent 1: "INTRO FIXER" – Replace Loading Animation & Remove Waveform
Files: src/components/ui/IntroAnimation.tsx, src/components/ui/AudioVisualizer.tsx, src/App.tsx

**Current state:**
- IntroAnimation.tsx (lines 36-57) renders 5 animated bars (green/accent-colored vertical pills) that scale up and down in a loop. This looks generic, cheap, and AI-generated. The user wants it GONE.
- AudioVisualizer.tsx renders a 60-bar canvas-based waveform animation with accent-colored bars. Check if this is used anywhere – if it's only used in the intro or in a decorative context the user wants removed, remove the usage.

**Task:**
1. REMOVE the waveform bars from IntroAnimation.tsx entirely (the motion.div with className "flex items-end gap-2.5 h-32 mb-8" and its 5 child bars)

2. REPLACE with a cleaner, more subtle intro animation. Choose ONE of these approaches:
   - **Option A – Typography reveal**: Igor's name appears letter-by-letter or word-by-word with a smooth stagger, then "Audio Designer" fades in below. Clean, minimal, no gimmicks.
   - **Option B – Simple fade**: A single elegant fade-in of Igor's name in the display font (Cormorant Garamond), held for 1.5 seconds, then the whole overlay fades out. Very Apple-like.
   - **Option C – Line wipe**: A thin horizontal accent-colored line draws across the screen center, then the name and role appear above and below it, then it all fades.
   - Pick whichever feels the most polished and LEAST like an AI template. If unsure, go with Option B – simplicity wins.

3. Ensure the new animation:
   - Completes in under 3 seconds total
   - Has a clean fade-out transition to the main site
   - Respects `prefers-reduced-motion` (skip entirely if reduced motion is on)
   - Only shows once per session (sessionStorage check already exists in App.tsx)
   - Uses framer-motion (already imported)

4. Check if AudioVisualizer.tsx is imported/used anywhere in the codebase:
   - Grep for `AudioVisualizer` in all src/ files
   - If it's NOT used anywhere, delete the file entirely
   - If it IS used somewhere the user doesn't want it, remove the usage but keep the file

5. After changes: `npm run build` must pass, `npx tsc --noEmit` must pass

Rules:
- NO animated bars, NO waveform visualization, NO equalizer effect in the intro
- The intro should feel PREMIUM and CONFIDENT – like opening a luxury brand site
- Keep it short – the intro is a door, not a destination


### Agent 2: "GRID FIXER" – Project Grid Layout & Tag Clipping Fix
Files: src/components/features/projects/ProjectGrid.tsx, src/components/features/ProjectCard.tsx, src/components/features/projects/ProjectFilters.tsx

**Current state – Grid issues:**
- ProjectGrid.tsx uses a 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- The "wide" logic on line 33: `index === 0 || (index > 0 && index % 4 === 0)` makes the first project and every 4th project span 2 columns
- This creates awkward holes in the grid when the total project count doesn't divide evenly
- The layout feels arbitrary – "every 4th" has no logical reason

**Current state – Tag clipping:**
- ProjectCard.tsx line 47: `displayTags = uniqueTags.sort(...).slice(0, 3)` limits to 3 tags
- Line 102: tags have `whitespace-nowrap` which on narrow cards causes tags to overflow or get clipped
- The tag container on line 100: `flex flex-wrap gap-2` should wrap but in narrow contexts (especially the wide 2-col cards where aspect ratio changes) tags can still clip

**Task:**
1. FIX the grid layout logic:
   - Remove the arbitrary "every 4th is wide" pattern
   - Instead, use a smarter approach:
     - Option A: First 2 projects as full-width / large format, rest in uniform 3-col grid
     - Option B: Uniform grid (all same size) – simple, clean, predictable
     - Option C: Manual "featured" flag from portfolioData.json – only featured_projects get wide treatment
   - Choose the option that looks best with the current number of projects (check how many projects exist in portfolioData.json)
   - Ensure no "holes" or empty cells in the grid at any breakpoint
   - Test at 375px (1 col), 768px (2 col), 1024px+ (3 col)

2. FIX the tag clipping:
   - Remove `whitespace-nowrap` from individual tag spans (line 102)
   - OR: keep nowrap but ensure the container properly wraps to next line with `flex-wrap`
   - Increase from 3 tags to 4 if space allows, OR make it responsive: 2 tags on mobile, 3-4 on desktop
   - If tags are too many for the card width, they should wrap to a new line, NOT clip/overflow
   - Ensure tag text doesn't truncate – each tag should be fully readable

3. FIX the filter buttons:
   - ProjectFilters.tsx: the horizontal scroll on mobile works but the `no-scrollbar` class might hide scroll indication
   - Add a subtle fade/gradient at the right edge to indicate more filters are scrollable
   - Verify all filter categories are visible without guessing

4. VERIFY the grid with real data:
   - Count actual projects in src/data/portfolioData.json (featured + additional)
   - Verify the grid looks clean at that exact count
   - Check that filtering (showing subset of projects) doesn't create ugly grid gaps

5. After changes: `npm run build` must pass

Rules:
- The grid should feel INTENTIONAL, not algorithmic
- Every project card should be the same height within its row
- Tags must NEVER be cut off or overlap card boundaries
- Mobile layout (1 column) should work perfectly


## Execution Order
Both agents can work in PARALLEL – they touch completely different files.

## Coordination
- If either agent's changes somehow affect the build, they must fix it
- Both agents should run `npm run build` after completing their work
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

## 📋 Podsumowanie

| Agent | Co robi | Pliki |
|-------|---------|-------|
| 🎬 **INTRO FIXER** | Usuwa waveform bars, zastępuje elegancką animacją fade/typography | `IntroAnimation.tsx`, `AudioVisualizer.tsx` |
| 📐 **GRID FIXER** | Naprawia siatkę projektów (logiczny layout, brak dziur) + fix tagów (nie ucinają się) | `ProjectGrid.tsx`, `ProjectCard.tsx`, `ProjectFilters.tsx` |

Oba pracują **równolegle** — nie dotykają tych samych plików.
