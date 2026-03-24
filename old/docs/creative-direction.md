# Creative Direction: Home & About Pages

## Design Philosophy

Break ONE convention hard, keep everything else usable. The "one thing" we break:
- **Home**: Replace the vertical stack with scroll-driven narrative pacing
- **About**: Replace the narrow text column with a modular bento grid

Both pages must feel like they belong to an **audio person who builds tools** — not a generic developer portfolio.

---

## HOME PAGE REDESIGN

### Structure (top to bottom)

```
1. HERO (100vh) — Scroll-driven text reveal
2. SHOWREEL — Full-width, no container border
3. MARQUEE TICKER — Skills running horizontally
4. PROJECTS — Sticky scroll reveal (left text, right visual)
5. (Skills section removed — replaced by marquee)
```

### Section 1: Hero — "The Statement"

**Kill**: Availability badge, role line, tech line as separate elements. The current hero has 6 stacked elements — too much.

**New layout**:
- Full viewport height (`min-h-screen`)
- Top: Name in huge display font, left-aligned, `text-[clamp(3rem,10vw,7rem)]`
- Below name: Role in mono uppercase (keep existing `hero.role` key)
- Middle: The `hero.description` text as a **scroll-driven text reveal**
  - Each word starts at `opacity: 0.15`
  - As user scrolls, words progressively become `opacity: 1`
  - Creates a reading-pace experience tied to scroll
  - Uses `useScroll({ target: ref })` + `useTransform` per word
- Bottom (appears after scroll): Two CTA buttons (Watch Showreel + View Projects)
- Decorative waveform SVG stays but at 10% opacity, more background than before

**i18n keys used**: `hero.role`, `hero.description`, `hero.watch_showreel`, `hero.view_projects`
**i18n keys removed from hero**: `hero.availability` (move to navbar or footer), `hero.description_tech` (fold into description or remove)

**Animation**:
- Name: immediate (no fade delay)
- Scroll text reveal: driven by `scrollYProgress`
- CTAs: `whileInView` fade up when user scrolls past the text
- `useReducedMotion`: all text at full opacity, no scroll binding

### Section 2: Showreel — "Elevated"

**Keep**: Vimeo embed + chapter navigation (it's good)

**Change**:
- Remove `border-t` wrapper — let it flow naturally from hero
- Slightly larger: `max-w-content-wide` (keep)
- Add a small label above: `hero.watch_showreel` in mono caption style

### Section 3: Marquee Ticker — "Tools Band"

**Replace** the entire Skills component with a continuous horizontal ticker.

**Layout**:
- Full-width band between showreel and projects
- Two rows scrolling in opposite directions
- Row 1 (left to right): `Wwise /// FMOD /// MetaSounds /// C++ /// Reaper /// JUCE`
- Row 2 (right to left): `Unreal Engine /// Unity /// Python /// Pro Tools /// Max/MSP /// Blueprints`
- Mono font, uppercase, `text-text-tertiary`, separator: ` /// `
- Speed: 20s per full cycle, linear, infinite repeat
- On hover: pause animation (CSS `animation-play-state: paused`)

**Implementation**: Duplicate the item array to create seamless loop. Use framer-motion `animate={{ x }}` with `repeat: Infinity` and `ease: "linear"`.

### Section 4: Projects — "Sticky Scroll Reveal"

**Replace** the 2-column card grid with a sticky scroll section.

**Layout**:
- Outer container: `relative` with height = numProjects * 100vh
- Inner container: `sticky top-0 h-screen` with two columns (40% text / 60% visual)
- Left panel: Project title, description, tech tags, "View Project" link
  - Content swaps as user scrolls through each project's scroll zone
  - Fade transition between projects
- Right panel: Project thumbnail/video (the existing media assets)
  - Also swaps per project with a crossfade
- Below projects: "All Projects" link

**i18n keys**: Same as current (`projects.featured_title`, `projects.view_all`, per-project keys via `projects:project_{id}_title` etc.)

**Data**: Same `featured_projects.slice(0, 4)` from portfolioData

**Mobile (< md)**: Falls back to stacked cards (existing ProjectCard component) since horizontal sticky doesn't work well on mobile. Keep the current card grid for mobile only.

**Animation**:
- Content transitions: `AnimatePresence` with fade + slight y-shift
- No scroll-jacking — natural scroll, sticky positioning does the work
- `useReducedMotion`: show all projects in a simple vertical stack

---

## ABOUT PAGE REDESIGN

### Structure

```
BENTO GRID (full-width, 3-column on desktop, 1-col mobile)
+--------------------------------------------------+
|  INTRO (span 3)                                  |
|  Big bold one-liner, full width                  |
+--------------------------------------------------+
|  PHOTO (span 1)  |  STORY (span 2)              |
|  3:4 ratio       |  Expandable text              |
|                   |  Click to reveal more         |
+--------------------------------------------------+
|  QUOTE (span 3, accent bg band)                  |
|  Giant display text, full-width interruption     |
+--------------------------------------------------+
|  STAT   |  STAT   |  STAT                        |
|  4      |  12     |  <55ms                       |
|  Games  |  Years  |  Latency                     |
|         |  Piano  |                              |
+--------------------------------------------------+
|  APPROACH (span 2)    |  EDUCATION (span 1)      |
|  How I work text      |  Three compact badges    |
+--------------------------------------------------+
|  CTA (span 3)                                    |
|  Looking for internship + buttons                |
+--------------------------------------------------+
```

### Card: INTRO (full-width)
- Same content as current, same `intro` i18n key
- `font-display text-h1` (upgrade from h2 for more presence)
- No card background — just text, full grid width

### Card: PHOTO
- Same image loading logic (profile.jpg with waveform fallback)
- Rounded card with `bg-surface-raised` border
- `aspect-[3/4]`, fills its grid cell
- Keep existing image load/error states

### Card: STORY (expandable)
- Shows `story_1` text initially
- "Read more" button reveals `story_2` and `story_3` with `AnimatePresence` height animation
- Card: `bg-surface-raised`, rounded, padded, border
- This solves the "wall of three paragraphs" problem

### Card: QUOTE (full-width accent band)
- **Kill** the left-border blockquote pattern
- Instead: full-width band with `bg-accent/10` background
- Quote text in `font-display text-h2 md:text-h1` — big, commanding
- Accent-colored left vertical line (2px) as the only decorative element
- Grid: `col-span-full`, negative margin to break out of grid padding

### Cards: STATS (three cards)
- Three equal stat cards in a row
- Each: big number (display font, accent color) + label below (mono, small)
- Stats:
  - "4" / `stat.games` (new key: "Games Shipped")
  - "12" / `stat.piano` (new key: "Years Piano")
  - "<55ms" / `stat.latency` (new key: "Best Latency")
- Numbers animate: count-up on scroll into view using `useInView` + spring
- Card: `bg-surface-raised`, rounded, centered content, border

### Card: APPROACH
- Both `approach_1` and `approach_2` in one card
- `bg-surface-raised`, rounded, padded
- No expansion needed — approach text is short enough

### Card: EDUCATION
- Three entries as **compact horizontal badges** instead of a vertical list
- Each badge: `bg-surface-overlay`, rounded-full, mono font, small
- Layout: stacked vertically within the card (they're too long for horizontal)
- Same `edu_dae`, `edu_hs`, `edu_piano` keys

### Card: CTA
- Full-width bottom card
- Same `cta_text` + two buttons
- `bg-surface-raised` card with more padding

### Grid Implementation
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
  {/* Intro spans all 3 */}
  <div className="md:col-span-3">...</div>

  {/* Photo (1 col) + Story (2 col) */}
  <div className="md:col-span-1">...</div>
  <div className="md:col-span-2">...</div>

  {/* Quote spans all 3, breaks out */}
  <div className="md:col-span-3 -mx-6 lg:-mx-8 px-6 lg:px-8 bg-accent/5 py-12">...</div>

  {/* Stats: 3 equal */}
  <div>...</div>
  <div>...</div>
  <div>...</div>

  {/* Approach (2) + Education (1) */}
  <div className="md:col-span-2">...</div>
  <div className="md:col-span-1">...</div>

  {/* CTA spans all 3 */}
  <div className="md:col-span-3">...</div>
</div>
```

### Animation Strategy
- **Entrance**: Each card fades in with `whileInView` + staggered delay (0.05s between cards)
- **Stats**: Number count-up animation (0 to target over 0.8s, spring easing)
- **Story expand**: `AnimatePresence` + `motion.div` with height auto-animation
- **Quote**: Slight scale-up on scroll into view (1.0 to 1.0, but opacity 0 to 1)
- **Reduced motion**: All content visible, no animations

---

## NEW i18n KEYS NEEDED

### About namespace (add to en/pl/nl about.json)

```json
{
  "stat_games_value": "4",
  "stat_games_label": "Games Shipped",
  "stat_piano_value": "12",
  "stat_piano_label": "Years Piano",
  "stat_latency_value": "<55ms",
  "stat_latency_label": "Best Latency",
  "story_expand": "Read more",
  "story_collapse": "Show less"
}
```

PL:
```json
{
  "stat_games_value": "4",
  "stat_games_label": "Gry",
  "stat_piano_value": "12",
  "stat_piano_label": "Lat pianina",
  "stat_latency_value": "<55ms",
  "stat_latency_label": "Najlepsza latencja",
  "story_expand": "Czytaj dalej",
  "story_collapse": "Zwiń"
}
```

NL:
```json
{
  "stat_games_value": "4",
  "stat_games_label": "Games",
  "stat_piano_value": "12",
  "stat_piano_label": "Jaar piano",
  "stat_latency_value": "<55ms",
  "stat_latency_label": "Beste latentie",
  "story_expand": "Lees meer",
  "story_collapse": "Minder tonen"
}
```

### No new Home keys needed
All existing hero/projects keys are reused. The marquee ticker uses hardcoded tool names (same as current Skills — brand names don't get translated).

---

## WHAT TO KEEP UNCHANGED

- `Showreel.tsx` — component works well, just change its wrapper styling
- `ProjectCard.tsx` — used as mobile fallback
- `SEO` component on both pages
- All portfolioData.json project data
- Helmet JSON-LD schema
- All existing i18n key values (content unchanged, just presented differently)

## WHAT TO DELETE

- `DividerWaveform` component from About (decorative divider removed)
- `Skills.tsx` import from Home.tsx (replaced by marquee)
- The `Skills` component can remain in the codebase but is no longer imported

## ACCESSIBILITY

- All scroll-driven animations respect `useReducedMotion()`
- Reduced motion: show all content immediately, no scroll binding
- Bento grid: semantic HTML (sections, headings)
- Stats: `aria-label` with full text (e.g., "4 games shipped")
- Expandable story: proper button with `aria-expanded`
- Marquee ticker: `aria-hidden="true"` (decorative, tools listed elsewhere in content)
