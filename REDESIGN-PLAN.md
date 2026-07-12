# Portfolio Redesign Plan - Complete Specification

## Design Philosophy
"Creative studio space, not tech startup." Warm, cinematic, editorial. Every choice serves the content (game audio work).

---

## 1. DESIGN TOKENS (tailwind.config.js + index.css)

### Color Palette Changes
```
// BACKGROUNDS (refined, slightly warmer)
surface-base:     #0C0C11
surface-raised:   #141419
surface-overlay:  #1C1C24
surface-subtle:   #22222D   (NEW - for hover on raised)

// TEXT (keep existing - already good)
text-primary:     #E8E4DE
text-secondary:   #A8A4A0
text-tertiary:    #6B6966
text-muted:       #4A4845

// ACCENT (MAJOR CHANGE: green -> warm gold)
accent-primary:   #D4A853   (was #2dd4a8)
accent-hover:     #E6BE6A   (was #5eead4)
accent-muted:     rgba(212, 168, 83, 0.12)
accent-warm:      #D4A853   (unify with primary)

// SECONDARY ACCENT (NEW)
accent-secondary: #5B8A72   (muted sage green)
accent-sec-hover: #6FA088

// BORDERS
border-default:   #1E1E28
border-hover:     #2A2A36
border-accent:    rgba(212, 168, 83, 0.3)

// SHADOWS
shadow-elevated:  0 4px 16px rgba(0, 0, 0, 0.25)
shadow-hover:     0 8px 32px rgba(0, 0, 0, 0.35)
shadow-glow:      0 0 24px rgba(212, 168, 83, 0.1)
```

### Typography Changes
- Hero size: `4.5rem` (was `4rem`), line-height `1.05`, letter-spacing `-0.04em`
- Body line-height: `1.7` (was `1.6`)
- Add `overline` size: `0.6875rem`, weight `500`, tracking `0.12em` (for section labels)
- Add `label` refinement: `0.6875rem`, weight `600`, tracking `0.1em`

### Border Radius Standardization
- ALL cards: `rounded-xl` (12px) — standardize across entire site
- Buttons: `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)
- Tags/badges: `rounded-md` (6px)
- Images inside cards: no rounding (card clips with overflow-hidden)

### Spacing Standardization
- All page top padding: `pt-32` (8rem) — accounts for 64px nav + breathing room
- Section gaps: `py-20 md:py-28 lg:py-32`
- All containers: `max-w-content-wide mx-auto px-6 md:px-12 lg:px-16`
- Card gaps: `gap-6`

---

## 2. COMPONENT SPECIFICATIONS

### Navbar (src/components/layout/Navbar.tsx)
- Keep: fixed position, mobile hamburger, language switcher
- Change: transparent bg at top -> `bg-surface/80 backdrop-blur-xl border-b border-border` on scroll
- Active link: `text-accent-primary` (gold) instead of green
- Logo: keep SVG waveform but tint accent-primary on hover
- Mobile menu: full-screen overlay, large Space Grotesk links, stagger animation
- Height: 64px desktop, 56px mobile

### Footer (src/components/layout/Footer.tsx)
- Simplify to 2-column: Brand+nav (left) + Social icons (right)
- Subtle top border separator
- Small copyright text
- Remove CTA (it's redundant with nav)
- Consistent gold accent for links

### ProjectCard (src/components/features/ProjectCard.tsx)
- Image aspect: `aspect-[16/9]`
- Card: `bg-surface-raised border border-border rounded-xl overflow-hidden`
- Hover: `hover:border-border-accent hover:shadow-glow` + `whileHover={{ y: -4 }}`
- Image hover: `whileHover={{ scale: 1.03 }}` with overflow-hidden clip
- Content padding: `p-5`
- Category tag: overline style, accent-primary color, uppercase
- Title: `font-display text-h4`
- Description: `text-body-sm text-text-secondary line-clamp-2`

### Button (src/components/ui/Button.tsx)
- Update variants with gold accent instead of green
- Primary: `bg-accent-primary hover:bg-accent-hover text-surface-base`
- Secondary: `border border-border hover:border-accent-primary text-text-primary`
- Ghost: `hover:bg-surface-overlay text-text-secondary`
- USE THIS COMPONENT EVERYWHERE (replace all inline button styles)

### ImageWithLoader (src/components/ui/ImageWithLoader.tsx)
- Fix broken skeleton: use `bg-surface-overlay animate-pulse` instead of broken gradient
- Smooth fade-in on load complete

### ScrollProgress (src/components/ui/ScrollProgress.tsx)
- Change from green to gold accent

### AudioPlayer (src/components/features/AudioPlayer.tsx)
- Replace hardcoded `bg-white/10` etc with design tokens
- Background: `bg-surface-raised border-t border-border`
- Progress bar: `bg-accent-primary`
- Controls: `text-text-secondary hover:text-text-primary`

---

## 3. PAGE SPECIFICATIONS

### Home Page
#### Hero (src/components/home/Hero.tsx)
- Min-height: `min-h-[85vh]` with flex center
- Overline: "GAME AUDIO DESIGNER" in overline style, accent-primary
- Heading: Space Grotesk, `text-[clamp(2.5rem,8vw,4.5rem)]`, font-bold
- Subtitle: Inter, body size, text-secondary, max-w-lg
- CTA row: 2 buttons using Button component (primary "View Projects" + secondary "Listen")
- Word-by-word stagger animation (keep existing approach, refine timing)
- Remove duplicate CTA code (line 159-196 duplication)

#### MarqueeTicker (src/components/home/MarqueeTicker.tsx)
- Fix duplicate border class: use `border-y border-border`
- Change accent colors to gold

#### StickyProjects (src/components/home/StickyProjects.tsx)
- Use standardized ProjectCard component
- Consistent spacing with rest of site

#### Showreel
- Consistent section spacing
- Clean container

### Projects Page (src/pages/Projects.tsx)
- Page header: overline "PORTFOLIO" + h1 heading + subtitle
- Standardized top padding `pt-32`
- ProjectFilters: pill-style buttons, active = `bg-accent-primary text-surface-base`
- ProjectGrid: bento layout, first item spans 2 cols at md+ (keep existing approach)
- All cards use standardized ProjectCard

### Project Details (src/pages/ProjectDetails.tsx)
- Keep 12-col grid layout (8+4)
- Standardize to rounded-xl cards
- Sidebar: sticky, `bg-surface-raised rounded-xl border border-border p-6`
- Tags: `bg-surface-overlay text-accent-secondary rounded-md px-3 py-1 text-label`
- Section headings: consistent h2 style with overline labels

### About Page (src/pages/About.tsx)
- Keep bento grid structure
- Standardize card styles to `bg-surface-raised rounded-xl border border-border`
- Quote section: gold left border accent, Space Grotesk italic
- Stat cards: animated numbers, gold accent for the number
- CTA section: use Button components
- Fix negative margin breakout (use proper full-width approach)

### Contact Page (src/pages/Contact.tsx)
- Keep 2-column layout
- Info card: `bg-surface-raised rounded-xl border border-border`
- Form: clean inputs with `bg-surface-overlay border border-border rounded-lg`
- Focus state: `border-accent-primary ring-1 ring-accent-primary/20`
- Submit button: primary Button variant
- Links: gold accent color

### Music Page (src/pages/Music.tsx)
- MusicHero: keep blurred cover background, refine with gold accent
- Track cards: standardized card style with rounded-xl
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6`
- Active track: gold border glow
- Use `max-w-content-wide` instead of `max-w-7xl`

### Transientica (src/pages/Transientica.tsx)
- Standardize to site-wide design tokens
- Fix back button positioning (add proper top padding for nav)
- Cards: rounded-xl (was rounded-sm)
- Consistent section spacing
- Use design token max-widths

### SoundDesign (src/pages/SoundDesign.tsx)
- Standardize card styles (rounded-xl)
- Use design token max-widths (max-w-content-wide instead of max-w-7xl)
- Consistent heading sizes
- Consistent section spacing

### MiddlewareOptimization (src/pages/MiddlewareOptimization.tsx)
- Standardize card styles (rounded-xl)
- Fix mixed max-widths (use max-w-content-wide consistently)
- Consistent heading sizes (not bigger than hero token)
- Consistent section spacing

### Gradwork (src/pages/Gradwork.tsx)
- Standardize to match site-wide design
- Consistent spacing and typography

### NotFound (src/pages/NotFound.tsx)
- Keep "Dead Air" concept
- Update accent colors to gold
- Standardize button to use Button component

---

## 4. ANIMATION STANDARDS

### Easing
- Standard: `[0.25, 0.1, 0.25, 1]` (custom cubic-bezier) for all enter animations
- Spring: only for number counters and interactive elements
- Exit: `[0.25, 0.1, 0.25, 1]` with shorter duration

### Durations
- Enter: 0.5-0.6s
- Hover: 0.2-0.3s
- Exit: 0.2s
- Stagger: 0.08s between items

### Standard Variants (update motion.ts)
```typescript
fadeInUp: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }
fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } }
staggerContainer: { animate: { transition: { staggerChildren: 0.08 } } }
cardHover: { whileHover: { y: -4 }, transition: { duration: 0.3 } }
```

### viewport for whileInView
- Always use `{ once: true, margin: "-80px" }`

---

## 5. IMPLEMENTATION ORDER

1. **Task 4**: Global tokens + Layout (Navbar, Footer) + shared components (Button, ImageWithLoader, ScrollProgress)
2. **Task 5**: Home page (Hero, MarqueeTicker, StickyProjects, Showreel)
3. **Task 6**: Projects page (ProjectCard, ProjectGrid, ProjectFilters)
4. **Task 7**: All remaining pages (ProjectDetails, About, Contact, Music, Transientica, SoundDesign, MiddlewareOptimization, Gradwork, NotFound)
5. **Task 8**: QA pass (tsc, vite build, visual check, responsive check)

Tasks 5, 6, 7 can run in PARALLEL after Task 4 completes.

---

## 6. CRITICAL RULES

1. **Preserve all functionality**: routing, i18n, audio playback, data-driven content, animations (reduced motion support)
2. **Use design tokens**: NO hardcoded colors/sizes. Everything via Tailwind config.
3. **Standardize border-radius**: ALL cards rounded-xl (12px), ALL buttons rounded-lg (8px)
4. **Standardize containers**: ALL pages use `max-w-content-wide mx-auto px-6 md:px-12 lg:px-16`
5. **Standardize page padding**: ALL pages use `pt-32` for top (below navbar)
6. **Use Button component**: Replace ALL inline button/link styles with Button component
7. **Gold accent**: Replace ALL instances of green accent (#2dd4a8, #5eead4) with gold (#D4A853, #E6BE6A)
8. **Fix all identified bugs**: broken skeleton, duplicate borders, back button positioning, etc.
