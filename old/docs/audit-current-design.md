# Visual Design Audit - Igor Szuniewicz Portfolio

**Date**: 2026-02-27
**Auditor**: Design Audit Agent
**Scope**: Every visual component in `src/`

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [IntroAnimation](#2-introanimation)
3. [PageLoader](#3-pageloader)
4. [Layout Shell](#4-layout-shell)
5. [Navbar](#5-navbar)
6. [Footer](#6-footer)
7. [LanguageSwitcher](#7-languageswitcher)
8. [ScrollProgress](#8-scrollprogress)
9. [Home Page - Hero](#9-home-page---hero)
10. [Home Page - Showreel](#10-home-page---showreel)
11. [Home Page - Featured Projects Grid](#11-home-page---featured-projects-grid)
12. [Home Page - Skills](#12-home-page---skills)
13. [ProjectCard](#13-projectcard)
14. [Projects Page](#14-projects-page)
15. [ProjectFilters](#15-projectfilters)
16. [ProjectGrid](#16-projectgrid)
17. [Project Detail Page](#17-project-detail-page)
18. [ProjectHero](#18-projecthero)
19. [ProjectSidebar](#19-projectsidebar)
20. [ProjectRichDetails](#20-projectrichdetails)
21. [ContentBlockRenderer](#21-contentblockrenderer)
22. [ChallengesBlock](#22-challengesblock)
23. [ProjectCodeSection & CodeViewer](#23-projectcodesection--codeviewer)
24. [ImageLightbox](#24-imagelightbox)
25. [ProductionTimeline](#25-productiontimeline)
26. [About Page](#26-about-page)
27. [Contact Page](#27-contact-page)
28. [ContactForm](#28-contactform)
29. [Music Page](#29-music-page)
30. [MusicHero](#30-musichero)
31. [TrackCard](#31-trackcard)
32. [AudioPlayer](#32-audioplayer)
33. [NotFound Page](#33-notfound-page)
34. [Transientica Page](#34-transientica-page)
35. [SoundDesign Page](#35-sounddesign-page)
36. [MiddlewareOptimization Page](#36-middlewareoptimization-page)
37. [Gradwork Page](#37-gradwork-page)
38. [Button Component](#38-button-component)
39. [Modal Component](#39-modal-component)
40. [ErrorBoundary](#40-errorboundary)
41. [Global Animation Patterns](#41-global-animation-patterns)
42. [AI-Slop Assessment](#42-ai-slop-assessment)
43. [Summary: What to Keep vs. What to Change](#43-summary-what-to-keep-vs-what-to-change)

---

## 1. Design System Foundation

### Color Palette (from `tailwind.config.js` + `index.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `surface.DEFAULT` | `#0b0b10` | Page background, near-black with slight blue |
| `surface.raised` | `#12121a` | Cards, sidebar, footer background |
| `surface.overlay` | `#1a1a25` | Hover states, overlays, nav bg |
| `text-primary` | `#e8e4de` | Main body/heading text, warm off-white |
| `text-secondary` | `#a8a4a0` | Supporting text, descriptions |
| `text-tertiary` | `#6b6966` | Labels, captions, timestamps |
| `text-muted` | `#4a4845` | Barely visible text |
| `accent.DEFAULT` | `#2dd4a8` | Primary accent -- mint/teal green |
| `accent.hover` | `#5eead4` | Lighter teal on hover |
| `accent.muted` | `rgba(45,212,168,0.15)` | Subtle accent backgrounds |
| `accent.warm` | `#e6a04a` | Warm amber -- secondary accent |
| `accent.warm-hover` | `#f0b866` | Warm amber hover |
| `border.DEFAULT` | `#1f1f2a` | Subtle borders |
| `border.hover` | `#2a2a38` | Border hover state |
| `border.accent` | `rgba(45,212,168,0.4)` | Accent-tinted border |
| `success` | `#4ade80` | Green |
| `error` | `#f87171` | Red |
| `warning` | `#fbbf24` | Amber |

**Assessment**: The color system is well-structured with clear semantic tokens. The dark theme with warm off-white text and teal accent is professional. However, the `accent.warm` is defined but almost never used -- the site is overwhelmingly monochromatic teal. The three surface levels are good but the visual difference between `surface` and `surface.raised` is very subtle (`#0b0b10` vs `#12121a` -- only 7 units apart in hex). This makes card separation weak.

### Typography (from `tailwind.config.js` + `index.html`)

| Font | Weight(s) | Usage |
|------|-----------|-------|
| **Inter** | 300, 400, 500, 600, 700 | Body text (`font-sans`) |
| **Space Grotesk** | 500, 600, 700 | Headings (`font-display`) |
| **JetBrains Mono** | 400, 500 | Code, labels, timestamps (`font-mono`) |

**Font Size Scale** (custom Tailwind tokens):
- `hero`: 4rem / 1.1 lh / -0.03em / 700
- `h1`: 3rem / 1.15 lh / -0.02em / 600
- `h2`: 2rem / 1.2 lh / -0.01em / 600
- `h3`: 1.5rem / 1.3 lh / 0 / 500
- `h4`: 1.25rem / 1.4 lh / 0 / 600
- `h5`: 1rem / 1.4 lh / 0.01em / 600
- `h6`: 0.875rem / 1.4 lh / 0.05em / 500
- `body`: 1rem / 1.6 lh / 0 / 400
- `body-sm`: 0.875rem / 1.5 lh / 0 / 400
- `caption`: 0.75rem / 1.4 lh / 0.02em / 400
- `label`: 0.75rem / 1.3 lh / 0.08em / 500
- `code`: 0.875rem / 1.5 lh / 0 / 400

**Assessment**: Strong type system. The three font families create nice contrast (geometric sans for headings, humanist sans for body, monospace for technical detail). The `label` size with `0.08em` letter-spacing is used extensively for mono-styled category tags -- this works well for the "technical audio" aesthetic. Good negative tracking on large headings.

### Spacing

Custom additions: `18` (4.5rem), `22` (5.5rem). Otherwise standard Tailwind spacing scale.

**Max widths**:
- `content-narrow`: 720px (About page)
- `content`: 1024px (project grids, main content)
- `content-wide`: 1280px (home, footer, project details)
- `content-max`: 1440px (unused in current code)

**Assessment**: The multiple `max-w` tokens create good layout variety. Spacing is generally consistent using standard Tailwind classes. `py-16` is the most common section padding.

### Z-Index Scale

Organized semantic z-indices: sticky(10), audio-player(30), nav(40), dropdown(50), modal-backdrop(60), modal(70), toast(80), skip-link(100). Well-structured.

### Border Radius

`sm: 4px`, `md: 6px`, `lg: 8px`, `xl: 12px`. Very subtle rounding throughout -- the site mostly uses `rounded-sm`, `rounded-md`, and `rounded-lg`. Some components use `rounded-full` for pills and circles. Several components use `rounded-sm` from Tailwind's default (which is remapped to 4px).

### Box Shadows

- `elevated`: standard drop shadow
- `hover`: deeper drop shadow
- `glow-accent`: teal glow (used on audio player cover, active track)
- `glow-warm`: amber glow (unused in current components)
- `input-focus`: accent focus ring
- `input-error`: error focus ring

---

## 2. IntroAnimation

**File**: `src/components/ui/IntroAnimation.tsx`

**Current Implementation**:
- Full-screen overlay (`fixed inset-0 z-[9999]`) with `bg-surface`
- Displays "Igor Szuniewicz" in `font-display text-4xl md:text-5xl` centered
- Fade in name (0.5s, delay 0.2s), wait 2.2s, fade out entire overlay (0.6s)
- Total duration: ~2.8 seconds
- Respects `prefers-reduced-motion` (skips immediately)
- Session-gated via `sessionStorage.getItem('intro_shown')`

**Tailwind Classes**: `fixed inset-0 z-[9999] bg-surface flex items-center justify-center overflow-hidden`, name uses `font-display text-4xl md:text-5xl text-text-primary tracking-tight`

**Animation**: framer-motion `opacity` only, no spring/transform/scale

**What Works**:
- Session gating is correct (shows once per session)
- Reduced motion support
- Clean unmount via `onComplete` callback

**What Needs to Change**:
- Extremely minimal -- just a name fade. This is the first impression for recruiters/employers and it's underwhelming
- No audio-themed visual metaphor (waveform, frequency, signal)
- No brand identity beyond the name text
- The 2.8s total feels long for just showing a name
- No visual progression/loading indication
- Hardcoded strings ("Igor Szuniewicz") -- loads before i18n, acceptable but noted

---

## 3. PageLoader

**File**: `src/components/ui/PageLoader.tsx`

**Current Implementation**:
- 5 vertical bars with staggered `animate-waveform-{1-5}` Tailwind animations
- Below bars: "Loading" in `text-label font-mono text-text-secondary uppercase tracking-wider`
- Background `bg-surface`, centered in `min-h-[50vh]`

**Tailwind Classes**: bars are `w-1.5 bg-accent rounded-full`, container `flex items-end gap-1.5 h-16`

**Animation**: CSS keyframe `waveform-bar` -- scaleY bouncing between 0.3 and 1.0 over 1.2s with stagger offsets (0.15s apart)

**What Works**:
- Audio waveform metaphor is on-brand
- Accessibility: `role="status"` and `aria-label="Loading"`

**What Needs to Change**:
- Hardcoded "Loading" string (loads before i18n -- known issue, acceptable)
- The waveform bars are generic -- identical size/weight, no character
- Could integrate with intro animation for a more cohesive loading experience

---

## 4. Layout Shell

**File**: `src/components/layout/Layout.tsx`

**Current Implementation**:
- Flex column full-screen: `flex flex-col min-h-screen text-text-primary font-sans overflow-x-hidden relative bg-surface`
- Contains: `<ScrollProgress>`, a `bg-noise` div (but no actual noise texture CSS found), skip link, `<Navbar>`, `<main>`, `<Footer>`, `<AudioPlayer>`
- Main: `flex-grow pt-16 md:pt-20 pb-24` with `role="main"` and `tabIndex={-1}`

**What Works**:
- Skip link for a11y
- Audio player separated in its own z-index layer
- Clean semantic structure

**What Needs to Change**:
- `bg-noise` div exists but there is no corresponding CSS for a noise texture -- it's an empty decorative div doing nothing
- Main padding `pb-24` is hardcoded to accommodate audio player height -- should use CSS var
- `role="main"` is redundant on `<main>` element (implicit)

---

## 5. Navbar

**File**: `src/components/layout/Navbar.tsx`

**Current Implementation**:
- Fixed top bar with scroll-dependent opacity: `bg-surface-overlay/80 backdrop-blur-lg` (scrolled) vs `bg-surface-overlay/60 backdrop-blur-md` (top)
- Logo: "IGOR SZUNIEWICZ" in `font-display text-base uppercase tracking-[0.2em]`, with "Audio Designer" subtitle in `text-[9px] text-accent uppercase tracking-[0.25em] font-mono`
- Desktop nav links: `text-xs uppercase tracking-wider font-mono` with animated underline on hover
- Social icons: GitHub + LinkedIn (lucide-react), 16px
- Mobile: slide-in panel from right (framer-motion spring), full-height `w-80`
- Mobile links: `text-2xl font-display` staggered entrance

**Tailwind Classes (key)**:
- Nav: `fixed top-0 left-0 right-0 z-nav transition-all duration-300 border-b`
- Logo name: `font-display text-base uppercase text-text-primary tracking-[0.2em]`
- Links: `text-xs uppercase tracking-wider transition-colors duration-200 font-mono pb-1`
- Mobile panel: `fixed inset-y-0 right-0 w-80 max-w-full z-nav bg-surface border-l border-border`

**Animations**:
- Scroll state: `transition-all duration-300` (background, padding, border)
- Mobile backdrop: fade opacity
- Mobile panel: spring slide `x: 100%` to `x: 0` (damping: 25, stiffness: 200)
- Mobile links: stagger fade `opacity: 0, x: 20` to `opacity: 1, x: 0` (delay: index * 0.06)
- Desktop active link underline: `transition-all duration-300` width animation
- Language switcher chevron: 180deg rotate on open

**What Works**:
- Scroll-reactive background blur is polished
- Focus trap in mobile menu
- Escape key closes mobile menu
- Body scroll lock on mobile open
- RAF-throttled scroll listener
- Good focus-visible ring styling throughout
- Separator between nav links and social icons

**What Needs to Change**:
- Logo tagline at `text-[9px]` is extremely small -- may not be legible on all screens
- "IGOR SZUNIEWICZ" in nav is plain uppercase text -- no icon, no logo mark, no personality
- The mobile hamburger button uses a bordered container (`border border-border`) which looks like a form input more than a menu trigger
- Active link state is just color change + underline -- could be more distinctive
- No mobile prev/next track controls visible (only in desktop AudioPlayer)

---

## 6. Footer

**File**: `src/components/layout/Footer.tsx`

**Current Implementation**:
- `bg-surface-raised border-t border-border`
- Three-column layout: Brand+Social | Nav Links | Location
- Bottom bar: copyright in `text-caption`
- Social links: 44px touch targets (`w-11 h-11`), icons at 20px
- Nav links: vertical list, `text-body-sm`

**What Works**:
- Good touch targets for social icons
- Clean minimal layout
- Location and timezone info is practical for international employers

**What Needs to Change**:
- Footer feels generic/templated -- could be more compact or more distinctive
- No CTA (e.g., "Let's work together" or link to showreel)
- The three-column layout on desktop is very spread out for minimal content

---

## 7. LanguageSwitcher

**File**: `src/components/layout/LanguageSwitcher.tsx`

**Current Implementation**:
- Bordered button showing current language code (EN/PL/NL) with chevron
- Dropdown with three options, active one highlighted with `bg-accent text-surface`
- `whileTap={{ scale: 0.95 }}` micro-interaction
- Support for `dropUp` prop (used in mobile menu)

**Tailwind Classes**: trigger `px-4 py-2 rounded-md border border-border`, dropdown `bg-surface-raised border border-border rounded-md`

**What Works**:
- Clean, functional, properly ARIA-labeled
- Dropdown positioning with `dropUp` is smart

**What Needs to Change**:
- Works well as-is; low priority for redesign

---

## 8. ScrollProgress

**File**: `src/components/ui/ScrollProgress.tsx`

**Current Implementation**:
- `fixed top-0 left-0 right-0 h-0.5 z-nav pointer-events-none`
- Fill bar: `bg-accent transition-[width] duration-150 ease-out`
- RAF-throttled scroll handler

**What Works**:
- Subtle, non-intrusive, good performance

**What Needs to Change**:
- The 0.5px height is almost invisible -- could be slightly thicker or have more visual presence
- Consider whether this adds value or is just visual noise

---

## 9. Home Page - Hero

**File**: `src/components/home/Hero.tsx`

**Current Implementation**:
- Full-width section `min-h-[90vh]` with `pt-32 md:pt-40 pb-20`
- Top: Availability badge -- green dot + "Available February 2026" in mono/caption
- Name: `text-[clamp(3rem,12vw,8rem)]` in `font-display` with tight tracking (-0.04em), leading 0.95
- Role line: "Audio Designer" in `font-mono text-h4 md:text-h3 uppercase tracking-widest`, right-aligned on desktop
- Description paragraph: `text-body md:text-h5 text-text-secondary max-w-2xl`
- Tech line: `font-mono text-caption text-text-tertiary uppercase tracking-wider`
- Two CTAs: "Watch Showreel" (primary, accent bg) and "View Projects" (secondary, border)

**Animations** (framer-motion):
- All elements: fade up `opacity: 0, y: 16` with custom ease `[0.16, 1, 0.3, 1]`
- Role line: slides from right (`x: 16`)
- Staggered delays: 0, 0.15, 0.4, 0.55, 0.7 seconds
- Availability dot: CSS `animate-pulse-glow`
- Play icon on CTA: `group-hover:rotate-12`
- Arrow on CTA: `group-hover:translate-x-0.5`

**Tailwind Key Classes**:
- Name: `font-display text-[clamp(3rem,12vw,8rem)] text-text-primary leading-[0.95] tracking-[-0.04em]`
- CTAs: primary `bg-accent text-surface font-sans font-semibold text-body-sm rounded-md hover:bg-accent-hover hover:scale-[1.02]`, secondary `border border-border text-text-primary font-sans font-medium text-body-sm rounded-md hover:border-text-secondary hover:bg-surface-overlay`

**What Works**:
- Huge typographic name creates strong visual hierarchy
- The right-aligned role on desktop creates intentional asymmetry
- Clamp-based responsive sizing is smooth
- The stagger timing (0, 0.15, 0.4, 0.55, 0.7) has good rhythm -- fast attack, slower body
- Availability badge is practical and immediately useful for employers
- Two CTA levels (primary/secondary) with clear distinction

**What Needs to Change**:
- No visual backdrop or imagery -- it's just text on a flat dark background. The hero is 90vh of mostly empty space
- No audio-themed visual element (waveform, spectrum, oscilloscope) to establish the profession
- The "Available February 2026" date is hardcoded in the i18n key -- will become stale
- No background texture, gradient, or visual interest beyond typography
- The gap between the name and the description (mb-4, mb-8, mb-3, mb-10) creates a very long vertical reading path
- On mobile, `min-h-[90vh]` plus `pt-32` means content starts very far down

---

## 10. Home Page - Showreel

**File**: `src/components/features/Showreel.tsx`

**Current Implementation**:
- Vimeo embed in `aspect-video rounded-lg` container with `shadow-glow-accent`
- Chapter navigation: 8 timestamps in a 4-column grid
- Custom play button overlay (when paused): 80px circle with accent border
- Loading state: spinning Loader2 icon
- Error state: AlertCircle + retry button
- Chapters: `px-3 py-2 rounded text-body-sm font-medium` with active state `bg-accent/10 text-accent`

**Animations**:
- Play button: `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}`
- Background cross-fades between chapters (AnimatePresence not used here, but play/pause overlay is conditional)

**What Works**:
- Chapter navigation is a strong UX feature -- lets employers jump to specific projects
- Error handling with retry is thoughtful
- The play overlay design is clean

**What Needs to Change**:
- The chapter grid layout doesn't visually communicate a timeline/tracklist well enough
- The glow shadow on the video container is subtle but nice -- should keep
- "Chapters" label is in `text-label font-mono text-text-tertiary uppercase` -- easy to miss

---

## 11. Home Page - Featured Projects Grid

**File**: `src/pages/Home.tsx` (projects section)

**Current Implementation**:
- Header: `font-display text-h1 text-text-primary` centered
- Subtitle + "View All Projects" link with ArrowRight
- 2-column grid (`grid-cols-1 md:grid-cols-2 gap-6`), first card spans both columns (`md:col-span-2`)
- Mobile: separate "View All" button below grid

**Animations**:
- Header: `sectionReveal` (opacity fade, 0.4s)
- Cards: `cardIn` (opacity + y:12 + scale:0.98, 0.35s) with `stagger.cards` (0.08s) delay
- Mobile CTA: `sectionReveal`

**What Works**:
- First card spanning two columns creates visual hierarchy
- Staggered card entrance is smooth

**What Needs to Change**:
- `text-center` alignment on the header feels generic/corporate
- "View All Projects" link styling (border-b on span) is subtle -- could be more prominent
- Only 4 projects shown -- may need to surface more work

---

## 12. Home Page - Skills

**File**: `src/components/home/Skills.tsx`

**Current Implementation**:
- Horizontal list of tool names separated by "/" dividers
- All in `font-mono text-caption text-text-tertiary uppercase tracking-wider`
- Section: `py-16 bg-surface border-t border-border`

**What Works**:
- Minimal, non-intrusive
- Lists real tools (Wwise, FMOD, MetaSounds, UE5, C++, etc.)

**What Needs to Change**:
- Very passive presentation -- just a line of small grey text at page bottom
- No visual weight, easy to scroll past
- No grouping or hierarchy (middleware vs programming language vs DAW)
- The "/" separator is in `text-border` color -- nearly invisible

---

## 13. ProjectCard

**File**: `src/components/features/ProjectCard.tsx`

**Current Implementation**:
- Card container: `rounded-lg bg-surface-raised border border-border hover:border-border-hover hover:-translate-y-0.5 hover:shadow-hover transition-all duration-300`
- Top: aspect-video thumbnail (image or video with IntersectionObserver autoplay)
- Year badge: absolute top-right, mono label
- External link indicator: ExternalLink icon top-left
- Content: title `text-h3 font-display`, description `text-body-sm line-clamp-2`, tech pills, footer with category + "View Project" text
- Tech pills: `px-2.5 py-1 rounded font-mono text-label uppercase bg-accent/10 text-accent border border-accent/15`
- Footer: `border-t border-border` with category tag and arrow

**Animations**:
- Card lift: `hover:-translate-y-0.5 hover:shadow-hover transition-all duration-300`
- Title color: `group-hover:text-accent`
- "View Project" text: `opacity-0 group-hover:opacity-100` (desktop only)
- Arrow: `group-hover:translate-x-1`
- Video thumbnails: IntersectionObserver play/pause at 25% threshold

**What Works**:
- Video thumbnails with IO-based autoplay is impressive
- Tech tag prioritization (key tech sorted first) is smart
- The hover lift + shadow combo is tactile
- Year badge placement is clean

**What Needs to Change**:
- The card design is relatively standard/safe -- similar to many template portfolios
- Description is fixed at `h-10` which can cause awkward spacing
- `line-clamp-2` truncation means some descriptions are cut mid-sentence
- The footer area (category + arrow) takes significant space but adds little value
- No visual differentiation between project types (game audio vs tool dev vs research)

---

## 14. Projects Page

**File**: `src/pages/Projects.tsx`

**Current Implementation**:
- Header with title + description on left, filters on right
- `border-b border-border pb-6 lg:pb-8` separator
- Grid via `<ProjectGrid>` component
- Title: `text-h1 md:text-hero font-display`

**What Works**:
- Clean header/filter layout
- Responsive filter placement (stacked on mobile, right-aligned on desktop)

**What Needs to Change**:
- The page is minimal but functional -- the grid layout does the heavy lifting
- No hero element or visual lead-in -- jumps straight to the filter/grid

---

## 15. ProjectFilters

**File**: `src/components/features/projects/ProjectFilters.tsx`

**Current Implementation**:
- Horizontal scrollable button row with snap
- Active: `bg-accent text-surface border border-accent`
- Inactive: `bg-accent/10 text-accent border border-accent/15`
- Right-side gradient fade on mobile (`from-[#0b0b10]`) for scroll hint

**What Works**:
- Mobile scroll with gradient hint is good UX
- `aria-pressed` support

**What Needs to Change**:
- The hardcoded gradient color `from-[#0b0b10]` should reference the surface token
- Active/inactive states are both teal -- could differentiate more
- Mono uppercase label font for all filters makes them hard to read at small sizes

---

## 16. ProjectGrid

**File**: `src/components/features/projects/ProjectGrid.tsx`

**Current Implementation**:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6`
- Uses `containerVariants` (staggerChildren: 0.08) and `itemVariants` (fade-up)
- Empty state: centered text "No projects found in this category."

**What Works**:
- Responsive column count progression is smooth
- Stagger animation gives good visual flow

**What Needs to Change**:
- Uniform grid -- all cards same size. No visual hierarchy or featured/large card option (unlike the Home page's first-card-spanning-two-columns pattern)

---

## 17. Project Detail Page

**File**: `src/pages/ProjectDetails.tsx`

**Current Implementation**:
- Hero section (ProjectHero) + 12-column grid (8 content + 4 sidebar)
- Content: timeline, description, content blocks, challenges, rich details, code, gallery
- Structured data (JSON-LD for BreadcrumbList and CreativeWork)

**What Works**:
- Comprehensive content structure
- 8/4 grid split is appropriate
- Dynamic namespace loading per project

**What Needs to Change**:
- Very long vertical scrolling page -- no visual breaks or anchored navigation
- All sections stack with `space-y-12 lg:space-y-16` -- rhythm is monotonous
- No section navigation or table of contents

---

## 18. ProjectHero

**File**: `src/components/features/projects/ProjectHero.tsx`

**Current Implementation**:
- `min-h-[80vh]` with background media (image/video at low opacity)
- Gradient overlay: `from-surface via-surface/80 to-surface/40`
- Back button, category badge (`bg-accent text-surface`), year badge
- Title in `text-h1 md:text-hero font-display` using `<TechReveal>` scramble effect
- Description in `text-body md:text-h4`
- Embedded YouTube/local video below title

**Animations**:
- Content: `hero` preset (opacity + y:20, 0.6s)
- TechReveal: character-by-character random scramble then resolve (30ms interval, 1/3 char per frame)

**What Works**:
- TechReveal text scramble is a standout effect -- distinctive and on-brand
- Background media with gradient overlay creates depth
- Category badge is immediately scannable

**What Needs to Change**:
- The background image at 20% opacity is so faint it's barely visible
- Hero takes 80vh but most of the space is empty dark area above the content
- YouTube embed in the hero breaks the visual flow -- should be below

---

## 19. ProjectSidebar

**File**: `src/components/features/projects/ProjectSidebar.tsx`

**Current Implementation**:
- Sticky at `top-32`
- Actions card: project meta (Team, Engine, Platforms) + CTA buttons (demo, video, repo, docs)
- Tech stack: pills in `text-label font-mono uppercase text-accent bg-accent/10 border border-accent/15`
- Tags: hashtags in `text-caption text-text-secondary`

**What Works**:
- Sticky sidebar is good for long detail pages
- Clear action hierarchy (primary accent CTA, secondary bordered)

**What Needs to Change**:
- Meta stats (Team, Engine, Platforms) have hardcoded English labels ("Members", "Engine", "Platforms")
- Tags section uses `cursor-default` which implies interactivity but they're not clickable
- The sidebar is visually monotonous -- all sections look similar

---

## 20. ProjectRichDetails

**File**: `src/components/features/projects/ProjectRichDetails.tsx`

**Current Implementation**:
- Sections: Responsibilities (checklist), Technical Achievements (key-value grid), Audio Systems, Performance Metrics, Technical Stack, Key Scenes
- Each section: `border-t border-border` with icon + title
- Key-value grid: `bg-surface-raised p-5 rounded-lg border border-border`
- List items: CheckCircle2 icon + text

**What Works**:
- Icon + title pattern is consistent
- Key-value grid layout works for structured data

**What Needs to Change**:
- Visually repetitive -- every section looks the same
- No visual differentiation between data types (metrics should feel different from responsibilities)
- Too many `border-border` cards -- creates visual noise

---

## 21. ContentBlockRenderer

**File**: `src/components/features/projects/ContentBlockRenderer.tsx`

**Current Implementation**:
- Three block types: `stats_grid`, `split_text_media`, default `text`
- Stats grid: 4-column layout with large value + label
- Split text+media: 2-column with optional `reverseLayout`
- Generic: left border accent line
- Inline lightbox for images (click to enlarge)

**What Works**:
- Stats grid creates strong visual contrast
- Split layout with reverse option adds rhythm

**What Needs to Change**:
- Uses `dangerouslySetInnerHTML` for content -- security concern if data isn't sanitized
- The generic text block's `border-l-2 border-accent/20 pl-6` creates an indentation that feels like a blockquote -- unclear semantics

---

## 22. ChallengesBlock

**File**: `src/components/features/projects/ChallengesBlock.tsx`

**Current Implementation**:
- Numbered cards with problem/solution split
- Problem: red label with AlertTriangle
- Solution: green label with CheckCircle2
- Each card: `bg-surface-raised border border-border rounded-lg`

**What Works**:
- Problem/solution side-by-side is effective storytelling
- Numbered circles provide clear ordering
- Color coding (red/green) is intuitive

**What Needs to Change**:
- Clean implementation, relatively low priority for redesign

---

## 23. ProjectCodeSection & CodeViewer

**Files**: `src/components/features/projects/ProjectCodeSection.tsx`, `src/components/features/CodeViewer.tsx`

**Current Implementation**:
- Collapsible section with chevron toggle
- Code viewer: macOS-style window bar (red/yellow/green dots), file tabs, line numbers
- Custom syntax highlighting for C++ (keywords, types, strings, numbers, member variables)
- Clickable annotated lines expand inline explanations

**Colors** (hardcoded hex in CodeViewer):
- Keywords: `#c792ea` (purple)
- Types: `#82aaff` (blue)
- Strings: `#c3e88d` (green)
- Numbers: `#f78c6c` (orange)
- Members: `#89ddff` (cyan)
- Window dots: `#f38ba8`, `#f9e2af`, `#a6e3a1` (Catppuccin palette)
- Code text: `#cdd6f4`

**What Works**:
- The annotated code lines are an excellent feature for technical portfolios
- macOS window chrome is a familiar metaphor
- Collapsible by default keeps the page clean for non-technical viewers

**What Needs to Change**:
- Syntax highlighting is manual/naive -- won't handle complex C++ correctly
- The color palette (Catppuccin Mocha) doesn't match the site's design tokens
- No copy-to-clipboard button

---

## 24. ImageLightbox

**File**: `src/components/features/ImageLightbox.tsx`

**Current Implementation**:
- 2-column grid of images/videos
- Click to open lightbox: `bg-black/95` backdrop, centered image
- Keyboard navigation: Escape to close, arrows to navigate (images only, not videos)
- Loading spinner while image loads
- Zoom icon overlay on hover

**What Works**:
- Keyboard navigation
- Separate handling for videos (controls, no lightbox)
- Loading state for large images

**What Needs to Change**:
- No swipe gesture support for mobile
- Video error handling (shows "Media unavailable" text)

---

## 25. ProductionTimeline

**File**: `src/components/features/ProductionTimeline.tsx`

**Current Implementation**:
- Row of 9 dots (weeks), color-coded by phase
- Current week enlarged with accent ring
- Tooltip on hover with week number + phase name
- Phase legend below

**What Works**:
- Compact visual representation of project progress
- Hover tooltips add context

**What Needs to Change**:
- Uses `bg-dim/40` which isn't in the Tailwind config -- may not render correctly
- `bg-slate-600`, `bg-slate-500` are default Tailwind colors not in the custom palette
- Very niche (only for Shadow Frames project)

---

## 26. About Page

**File**: `src/pages/About.tsx`

**Current Implementation**:
- Narrow layout (`max-w-content-narrow`, 720px)
- Sections: intro (large text), story (3 paragraphs), pull quote, approach (2 paragraphs), education (mono list), CTA
- Pull quote: `border-l-2 border-accent pl-6 py-2`
- Education: `font-mono text-body-sm text-text-tertiary` unordered list
- CTAs: "Say hi" (accent) + "My CV" (secondary with download icon)

**Animations**:
- Varied directions: `sectionReveal` (opacity), `fadeFromLeft` (x: -16), `fadeFromRight` (x: 16)

**What Works**:
- Narrow column for long-form text is excellent readability
- Varied animation directions break monotony
- Pull quote creates visual rhythm break
- Education is compact and understated (appropriate)
- CTA section is direct and practical

**What Needs to Change**:
- No photo of Igor -- employers want to see who they're considering hiring
- All text, no visual elements at all -- needs at least one image or visual break
- The page feels sparse despite good content -- needs more visual anchoring

---

## 27. Contact Page

**File**: `src/pages/Contact.tsx`

**Current Implementation**:
- Centered header: `font-display text-h1`, intro paragraph
- 2-column grid: Contact Info card + Contact Form
- Info card: email (with copy button), LinkedIn, location, timezone, availability badge, GitHub link
- Availability badge: `bg-success/10 text-success border border-success/20` with pulsing dot
- Base64-encoded email for bot protection

**What Works**:
- Email obfuscation is smart
- Copy-to-clipboard with visual feedback
- Availability badge is immediately useful for recruiters
- Timezone info is practical

**What Needs to Change**:
- Standard two-column contact layout -- seen on every portfolio template
- The page header "Get In Touch" is generic
- Could consolidate timezone into location section

---

## 28. ContactForm

**File**: `src/components/features/ContactForm.tsx`

**Current Implementation**:
- EmailJS integration with 5 states: idle, sending, sent, error, cooldown
- Fields: name, email (with validation), message (textarea)
- Anti-spam: cooldown timer (30s between sends), HTML tag stripping
- Inputs: `bg-surface-raised border border-border rounded-md py-3 px-4`, focus `border-accent shadow-input-focus`
- Submit button spans full width with dynamic content per state

**What Works**:
- Robust state machine with cooldown
- Input sanitization
- Good error/validation UX with inline messages
- Aria-live region for screen reader announcements

**What Needs to Change**:
- No subject field (just name, email, message)
- The form background matches the card background -- inputs blend in
- Consider whether a contact form is even necessary vs. just prominent email/LinkedIn

---

## 29. Music Page

**File**: `src/pages/Music.tsx`

**Current Implementation**:
- MusicHero section + library grid
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10`
- Header: title + release count, separated by `border-b border-border`

**What Works**:
- Responsive column count is appropriate for album art
- Release count gives context

**What Needs to Change**:
- No filtering or sorting by year/genre/tag
- The transition between hero and grid is abrupt
- Large gap-y-10 creates a lot of vertical space

---

## 30. MusicHero

**File**: `src/components/features/music/MusicHero.tsx`

**Current Implementation**:
- Ambient blurred background: cover art at `blur-[100px] opacity-30 scale-110`
- Gradient overlays: `bg-surface/70` + `bg-gradient-to-t from-surface via-surface/80 to-transparent`
- 2-column grid: album art (350px) + track details
- Album art: play overlay with 80px circle button
- Tags: `px-3 py-1 rounded border border-border bg-accent/10 text-xs text-accent font-mono uppercase`
- Track title: `text-5xl md:text-7xl font-display`
- Description: `border-l-2 border-accent/40 pl-6`

**Animations**:
- Background: `AnimatePresence` crossfade (1s)
- Album art: `hero` preset
- Details: `detailIn` (slide from left)
- Description: `sectionReveal` with 0.2s delay

**What Works**:
- Blurred album art background is gorgeous and dynamic
- The play overlay on hover is intuitive
- AnimatePresence for track transitions

**What Needs to Change**:
- On mobile, 350px album art might be too large
- The "by" artist attribution is generic
- Loading state (Sparkles icon) doesn't match the audio theme

---

## 31. TrackCard

**File**: `src/components/features/music/TrackCard.tsx`

**Current Implementation**:
- Square aspect ratio cover art with hover overlay
- Active state: `border-accent shadow-glow-accent`, scale 1.05
- Play overlay: 56px circle with Play/BarChart3 icons
- Info below: title, artist, year badge, active indicator dot
- Memoized with `React.memo`

**What Works**:
- Active track glow is distinctive
- BarChart3 icon for "now playing" is creative
- Performance optimization with memo

**What Needs to Change**:
- The active-state pulsing dot + glow + scale could be simplified
- Year badge styling is inconsistent with project card year badges

---

## 32. AudioPlayer

**File**: `src/components/features/AudioPlayer.tsx`

**Current Implementation**:
- Fixed bottom bar: `bg-surface-overlay/90 backdrop-blur-xl border-t border-border`
- Three sections: left (album art 48px + track info + mini visualizer), center (prev/play/next), right (volume + close)
- Progress bar: full-width at top, scrubble with handle
- Volume slider: desktop-only, horizontal
- Mini waveform visualizer: 5 bars, `w-[2px] bg-accent`
- Play/pause: 48px circle `bg-accent text-surface`
- Keyboard: Space (play), arrows (seek/volume), M (mute)
- Time tooltip on progress hover

**What Works**:
- Comprehensive keyboard controls
- Scrub with preview tooltip
- Touch support for sliders
- Volume mute memory
- Mini waveform visualizer ties to playing state
- Album art with glow shadow

**What Needs to Change**:
- On small screens, track title truncates to `max-w-[120px]` -- might be unreadable
- Prev/next buttons hidden on mobile (`hidden sm:flex`)
- The close button hover turns red (error color) -- harsh
- No mobile volume control

---

## 33. NotFound Page

**File**: `src/pages/NotFound.tsx`

**Current Implementation**:
- Centered content: waveform flatline bars + "404" hero text + "DEAD AIR" subtitle + description + "Return to Base" button
- Waveform bars: same as PageLoader but smaller and at 30% opacity
- "DEAD AIR" in mono uppercase tracking-widest

**What Works**:
- "Dead Air" audio metaphor is clever and on-brand
- "The requested frequency could not be tuned" is better than generic 404 copy
- "Return to Base" button copy is engaging

**What Needs to Change**:
- The flatline bars are barely visible at `bg-accent/30` with `h-2`
- Overall page is very sparse -- could use more visual interest

---

## 34. Transientica Page

**File**: `src/pages/Transientica.tsx`

**Current Implementation**:
- Standalone project page (not using ProjectDetails layout)
- Hero: badge, title (accent-colored subtitle), description, bouncing visualizer bars, tag pills
- Video showcase: click-to-play with poster overlay
- Stats: 4-column grid with accent numbers
- Features: 3-column icon cards
- Technical deep dive: 2-column text+video
- Footer CTA

**Animation**:
- Visualizer bars: CSS `animate-bounce` with staggered delays -- NOT using the custom waveform animation
- No framer-motion scroll reveals (most content is static)

**What Works**:
- Stats section is visually impactful
- Feature cards with icon-led layout
- Technical section is well-structured

**What Needs to Change**:
- Uses `animate-bounce` (default Tailwind) instead of custom waveform animations -- inconsistent
- Has its own footer with copyright -- duplicates the global footer
- `fill-cream-light` class referenced but not defined -- broken styling
- No framer-motion animations for scroll entrance -- feels static compared to other pages
- Very different design language from the rest of the site

---

## 35. SoundDesign Page

**File**: `src/pages/SoundDesign.tsx`

**Current Implementation**:
- Uses `bg-surface-raised` for the entire page (different from other pages that use `bg-surface`)
- Parallax hero with `useScroll`/`useTransform` for opacity/scale
- Tool logos grid (grayscale on idle, color on hover)
- 2-column video card grid with click-to-play
- "SIGNAL OFFLINE" placeholder for NDA content
- Own footer section

**Animation**:
- Hero parallax: scroll-driven opacity (1->0) and scale (1->0.95)
- VideoCards: `initial={{ opacity: 0, y: 15 }}` whileInView

**What Works**:
- Parallax hero is smooth
- "SIGNAL OFFLINE" NDA placeholder is well-designed
- Tool logo strip adds visual interest

**What Needs to Change**:
- Has its own footer -- duplicates global footer
- `bg-surface-raised` as page background makes cards hard to distinguish (both `bg-surface-raised`)
- `fill-cream-light` class used but not defined
- The VideoCard play button uses `bg-accent/90 rounded-full` -- a completely different play button style than the Showreel or MusicHero
- Tool images may not all exist (referenced from `/assets/images/tools/`)

---

## 36. MiddlewareOptimization Page

**File**: `src/pages/MiddlewareOptimization.tsx`

**Current Implementation**:
- Full standalone page with own hero, 3 case study cards, skills grid, own footer
- Hero: parallax scroll (same pattern as SoundDesign), Wwise logo, context box, stats
- CaseStudyCards: video (Vimeo or local mp4) + paragraphs with left border accent
- Skills: 3x2 grid of icon cards with hover lift

**Animation**:
- Parallax hero: scroll-driven opacity/scale
- Section titles: `sectionReveal`
- Case studies: `detailIn` (slide from left)
- Skill cards: `cardIn` with `whileHover={{ y: -4 }}`
- Bouncing ChevronDown at bottom of hero

**What Works**:
- Case study format is excellent for this type of content
- Video integration (both Vimeo and local) is flexible
- Skills section provides good summary

**What Needs to Change**:
- Has its own footer (duplicated again)
- Bouncing chevron at hero bottom is a common AI-template pattern ("scroll down indicator")
- The page is very long -- no navigation aids
- `font-black` weight on hero title -- heavier than other pages, inconsistent

---

## 37. Gradwork Page

**Files**: `src/pages/Gradwork.tsx`, `src/components/features/gradwork/*.tsx`

**Current Implementation**:
- 5 sections: Header, Setup, Results (with chart), Solution, Closing
- Header: centered, badge pill (`rounded-full`), huge clamp title
- Setup: architecture diagram (flex row of boxes with arrows)
- Results: custom bar chart (CSS-drawn, log-scale latency comparison)
- Solution: before/after comparison cards, pipeline steps
- Closing: conclusion + back link + own footer

**Animations**:
- Header: `hero` preset
- Other sections: `useInView` + inline framer-motion (not using shared presets)
- Before/after: slide from left/right with 0.6s duration + 0.2s delay

**What Works**:
- Architecture diagram is effective
- Bar chart for latency comparison is visually compelling
- Before/after comparison (red vs green) is immediately clear

**What Needs to Change**:
- Uses `bg-emerald-500/10` and `from-red-500 to-orange-500` -- default Tailwind colors not in custom palette
- `rounded-full` on the badge pill -- inconsistent with other pages using `rounded-sm`
- Has its own footer section (duplicated pattern)
- Animations use inline framer-motion values instead of shared presets from `motion.ts`
- The `-mt-16` on the page wrapper is a hack to compensate for layout padding

---

## 38. Button Component

**File**: `src/components/ui/Button.tsx`

**Variants**: primary, secondary, ghost, icon, danger
**Sizes**: sm, md, lg, icon

**Tailwind Classes**:
- Base: `inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200`
- Primary: `bg-accent text-surface hover:bg-accent-hover active:scale-[0.98]`
- Secondary: `border border-border text-text-primary hover:border-text-secondary hover:bg-surface-overlay`
- Ghost: `text-text-secondary hover:text-text-primary hover:bg-surface-raised`
- Loading spinner: SVG with `animate-spin`

**What Works**:
- Good variant system
- ForwardRef support
- Active scale micro-interaction
- Loading state with spinner

**What Needs to Change**:
- The `active:scale-[0.98]` is very subtle -- almost imperceptible
- No "link" variant for buttons that look like links

---

## 39. Modal Component

**File**: `src/components/ui/Modal.tsx`

**Current Implementation**:
- Backdrop: `bg-black/80`, click to close
- Content: `bg-surface-raised border border-border p-8 rounded-sm max-w-md`
- Close button: ghost icon button top-right
- Animation: scale 0.95 + y:8 + opacity fade with spring transition

**What Works**:
- Escape key handling
- Body scroll lock
- Reduced motion support
- ARIA attributes

**What Needs to Change**:
- No focus trap (unlike mobile menu which has one)

---

## 40. ErrorBoundary

**File**: `src/components/ui/ErrorBoundary.tsx`

**Current Implementation**:
- Fallback UI: centered card with error title, description, collapsible error details, reload button
- Uses `i18n.t()` directly (class component pattern)

**What Works**:
- Error details are collapsible (good for non-technical users)
- Localized error messages

**What Needs to Change**:
- Reload button uses non-existent classes: `text-primary`, `bg-accent-light` -- these aren't in the Tailwind config
- `focus:ring-offset-primary` -- also not a valid token

---

## 41. Global Animation Patterns

### framer-motion Presets (from `src/constants/motion.ts`)

| Preset | Motion | Duration | Ease |
|--------|--------|----------|------|
| `pageVariants` | y:12, opacity | 0.5s in, 0.3s out | custom cubic-bezier |
| `containerVariants` | stagger children | 0.08s stagger, 0.1s delay | -- |
| `itemVariants` | y:16, opacity | 0.4s | custom |
| `fadeUpVariants` | y:20, opacity | 0.6s | custom |
| `hero` | y:20, opacity | 0.6s | [0.25, 0.46, 0.45, 0.94] |
| `sectionReveal` | opacity only | 0.4s | easeOut |
| `cardIn` | y:12, scale:0.98, opacity | 0.35s | [0.25, 0.46, 0.45, 0.94] |
| `detailIn` | x:-16, opacity | 0.4s | [0.25, 0.46, 0.45, 0.94] |
| `detailInRight` | x:16, opacity | 0.4s | [0.25, 0.46, 0.45, 0.94] |
| `noMotion` | none | 0 | -- |

### Stagger Delays

| Context | Delay |
|---------|-------|
| Cards | 0.08s |
| Tags | 0.03s |
| Timeline | 0.1s |
| Nav items | 0.06s |
| Skills | 0.05s |

### Spring Configs

| Config | Stiffness | Damping |
|--------|-----------|---------|
| Interactive | 300 | 25 |
| Gentle | 200 | 20 |

### CSS Keyframe Animations (from `tailwind.config.js`)

| Animation | Duration | Effect |
|-----------|----------|--------|
| `waveform-bar` | 1.2s + stagger | scaleY 0.3-1.0 bounce |
| `vu-sweep` | 1s | width 0->target |
| `oscilloscope` | 2s | x/y translate |
| `fade-in-up` | 0.3s | opacity+translateY |
| `pulse-glow` | 2s | opacity 0.4-1.0 pulse |

### Observations

- Reduced motion is well-handled: every component with framer-motion checks `useReducedMotion()`
- Most animations are subtle fade/slide -- no dramatic effects
- The Gradwork page bypasses shared presets and uses inline animation values
- Transientica uses Tailwind's `animate-bounce` instead of custom animations
- Custom easing `[0.25, 0.46, 0.45, 0.94]` is used for most presets -- this is a nice custom curve
- `vu-sweep` and `oscilloscope` animations are defined but unused in current components

---

## 42. AI-Slop Assessment

### Patterns That Read as Generic/AI-Generated

1. **Bouncing scroll-down chevron** (MiddlewareOptimization hero) -- an overused template pattern
2. **"Get In Touch" heading** (Contact page) -- the most generic contact page title possible
3. **Generic section titles** like "Selected Work", "Key Features" -- could be more specific to audio
4. **Uniform card grids** with identical sizing everywhere -- no visual surprise or asymmetry
5. **Icon + Title + Description card pattern** repeated identically across: Features (Transientica), Skills (MiddlewareOpt), Audio Systems (ProjectRichDetails) -- same layout template copied
6. **Hero patterns**: centered badge pill + huge title + subtitle + CTA is the exact same structure on Transientica, SoundDesign, MiddlewareOptimization, and Gradwork -- four pages with nearly identical hero layouts
7. **Standalone footers** on Transientica, SoundDesign, MiddlewareOptimization, and Gradwork -- each has its own copyright footer, duplicating the global Footer
8. **Empty hero backgrounds** -- the Home hero is 90vh of flat dark space with text only

### Patterns That Feel Authentic/Human

1. **Audio metaphors**: "Dead Air" (404), waveform loader, "NO_SIGNAL" placeholder, "frequency" language
2. **TechReveal scramble** effect on project titles -- distinctive and memorable
3. **Showreel chapter navigation** -- shows genuine thought about how employers review demo reels
4. **Problem/Solution format** in ChallengesBlock -- demonstrates engineering thinking
5. **Annotated code viewer** -- unusual and valuable for a technical portfolio
6. **Blurred album art background** on MusicHero -- genuinely beautiful effect
7. **Availability badge** with date -- practical, shows awareness of employer needs
8. **IntersectionObserver video autoplay** on project card thumbnails -- good attention to detail

---

## 43. Summary: What to Keep vs. What to Change

### Definitely Keep (Strong Design Decisions)

- **Color system**: Dark theme with warm off-white text and teal accent is professional and distinctive
- **Typography system**: Three fonts (Inter/Space Grotesk/JetBrains Mono) work perfectly for audio/technical portfolio
- **TechReveal scramble effect**: Unique, on-brand, memorable
- **Showreel with chapter navigation**: Excellent portfolio UX
- **Annotated code viewer**: Standout feature for technical roles
- **Audio metaphors**: waveform loader, "Dead Air" 404, "NO_SIGNAL", frequency language
- **AudioPlayer**: Well-built, accessible, good keyboard support
- **Blurred album art in MusicHero**: Beautiful dynamic effect
- **Availability badge**: Practical for employers
- **Problem/Solution challenges format**: Good storytelling
- **Reduced motion support throughout**: Excellent accessibility
- **Focus-visible styling**: Consistent and proper
- **i18n throughout**: Three language support is impressive
- **Session-gated intro animation**: Smart UX decision

### Must Change (High Priority)

1. **IntroAnimation**: Too minimal -- needs audio-themed visual (waveform, frequency visualization) and should feel like "tuning into a signal"
2. **Home Hero**: Empty dark space needs a visual element -- waveform, spectrum analyzer, or generative background tied to audio theme
3. **Duplicate page structures**: Transientica, SoundDesign, MiddlewareOpt, and Gradwork all have identical hero layouts and their own footers -- needs consolidation and visual differentiation
4. **Skills section**: Currently invisible grey text at bottom of page -- needs to be a proper showcase with visual weight
5. **About page**: No photo, no visual elements at all -- needs at least one image
6. **Bouncing scroll chevron**: Remove this template pattern
7. **Hardcoded colors outside design system**: `bg-emerald-500/10`, `bg-slate-600`, `from-red-500 to-orange-500` in Gradwork -- should use custom tokens
8. **Broken class references**: `fill-cream-light`, `text-primary`, `bg-accent-light`, `bg-dim/40` -- classes that don't exist in the config
9. **`bg-noise` div**: Referenced in Layout but no corresponding CSS -- either implement or remove

### Should Change (Medium Priority)

1. **Navbar logo**: Just uppercase text -- could have a small visual mark
2. **ProjectCard design**: Functional but generic -- needs more character to stand out from template portfolios
3. **Footer**: Could be more compact or include a distinctive CTA
4. **Project detail page length**: No section navigation -- long pages need anchor links or TOC
5. **Standalone project pages** (Transientica, SoundDesign, MiddlewareOpt): Should share more design DNA with the main project detail layout
6. **CodeViewer colors**: Catppuccin palette doesn't match site design tokens -- should harmonize
7. **Card hover effects**: The `-translate-y-0.5` lift is too subtle to notice -- either make it more pronounced or remove
8. **ProjectGrid**: Uniform grid on the Projects page has no hierarchy -- consider masonry or featured sizes
9. **Contact page**: "Get In Touch" title is generic -- could use audio-themed language

### Low Priority (Nice to Have)

1. **ScrollProgress bar**: Could be thicker or removed entirely
2. **Language switcher**: Works fine, no urgent changes
3. **Modal**: Missing focus trap (low priority since it's rarely used)
4. **NotFound flatline bars**: Could be more prominent
5. **Volume control on mobile AudioPlayer**: Currently hidden
6. **`vu-sweep` and `oscilloscope` animations**: Defined but unused -- either use them or remove
