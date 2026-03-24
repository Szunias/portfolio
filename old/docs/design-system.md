# Design System & Visual Direction — Igor Szuniewicz Portfolio Redesign

> Synthesized from: research-portfolio-layouts.md, research-loading-animations.md, audit-current-design.md

---

## 1. Design Philosophy

**Core principle**: The site should feel like it was designed by someone who thinks in sound — intentional, dynamic, restrained. Every visual choice should be defensible, not default.

**Anti-AI-slop rules**:
- No decoration without purpose
- No symmetrical grids of identical boxes
- No bouncing scroll indicators
- No generic hero copy ("Welcome to my portfolio")
- Animation follows sound design principles: purposeful, dynamic range, timing

---

## 2. Color System

### Keep (already in tailwind.config.js)
The existing palette is strong. Keep all current tokens.

### Changes
1. **Use `accent.warm` (#e6a04a) more** — it's defined but barely used. Use it as a secondary accent for:
   - Active/playing states in the audio player
   - Warm highlights on the About page
   - CTA buttons that need to stand out from the teal
2. **Fix broken classes**: Remove all references to `fill-cream-light`, `text-primary`, `bg-accent-light`, `bg-dim/40` — these don't exist
3. **Fix off-palette colors**: Replace `bg-emerald-500/10`, `bg-slate-600`, `from-red-500 to-orange-500` in Gradwork with design system tokens
4. **Add a subtle noise/grain texture** or remove the `bg-noise` div from Layout.tsx

### Contrast Requirements (WCAG AA)
- `text-primary` (#e8e4de) on `surface` (#0b0b10): 14.2:1 ✅
- `text-secondary` (#a8a4a0) on `surface`: 7.8:1 ✅
- `text-tertiary` (#6b6966) on `surface`: 4.0:1 ⚠️ (borderline, only use for large text/labels)
- `accent` (#2dd4a8) on `surface`: 9.6:1 ✅

---

## 3. Typography

### Keep
- **Space Grotesk** for headings (`font-display`) — has personality, not generic
- **Inter** for body (`font-sans`) — research warns against it for headings, but it's fine for body text
- **JetBrains Mono** for code/labels (`font-mono`) — excellent for the technical audio aesthetic
- Current sizing scale (hero through caption) — well proportioned

### Changes
- None required. Typography is one of the site's strengths.

---

## 4. Layout Changes

### Navigation
- **Keep**: Scroll-reactive blur, mobile slide panel, focus trap, escape-to-close
- **Change**: Make the subtitle "Audio Designer" slightly larger (current 9px is too small). Consider a small audio waveform icon/mark next to the logo name.
- **Remove**: Nothing

### Footer
- **Keep**: Three-column layout, social touch targets, timezone info
- **Change**: Add a CTA line ("Let's work together" or "Available for projects")
- **Critical**: Remove duplicate footers from Transientica, SoundDesign, MiddlewareOpt, Gradwork — they all should use the global Footer

### Layout Shell
- **Fix**: Either implement `bg-noise` with an actual CSS noise texture or remove the empty div
- **Fix**: Replace `pb-24` hardcoded padding with a CSS custom property for audio player height

---

## 5. Loading Animation — "Signal Check" (Concept A)

### Intro Animation (IntroAnimation.tsx)
Replace the current plain name fade with an SVG waveform line draw:

1. Dark screen (bg-surface)
2. A thin accent-colored SVG waveform path draws itself left-to-right (~800ms)
3. Path resembles a real audio waveform — jagged peaks and valleys, not a smooth sine wave
4. Brief pause, then "Igor Szuniewicz" fades in centered (~400ms)
5. Everything fades out together (~400ms)
6. **Total: ~1.8s** (down from 2.8s)

**Technical spec**:
- SVG `<path>` with `pathLength` animation via framer-motion `motion.path`
- Hand-crafted SVG path with audio-like peaks (not generated)
- Keep `useReducedMotion()` → skip immediately
- Keep `sessionStorage` one-per-session gating
- Add Escape key and click-to-skip
- Wrap in `AnimatePresence` for clean exit
- Only `transform` + `opacity` properties (compositor thread)

### Page Loader (PageLoader.tsx)
- **Keep**: 5-bar waveform design (it's good and audio-themed)
- **Change**: Add `prefers-reduced-motion` support (show static bars)
- **Change**: Use PageLoader as the Suspense fallback in App.tsx (replace the pulsing dot)

---

## 6. Home Page

### Hero
- **Keep**: Huge typographic name, availability badge, two CTAs, asymmetric role line
- **Add**: A subtle SVG waveform or audio spectrum visualization behind/below the name — NOT a full-screen background, but a purposeful visual element that establishes "this is an audio person"
- **Idea**: A static or subtly animated waveform line that spans the width, positioned between the name and the description. Accent-colored, low opacity. Responds to scroll with parallax.
- **Fix**: The `min-h-[90vh]` creates too much empty space on desktop. Reduce to `min-h-[70vh]` or use content-driven height.

### Skills Section
- **Redesign**: Currently invisible grey text. Group tools by category (Middleware, Engines, Programming, DAWs). Use mono labels with slightly more visual weight. Consider a horizontal scrolling strip or categorized columns.

### Featured Projects
- **Keep**: First card spanning two columns, stagger animation
- **Change**: Add audio-preview hover on cards if feasible (play icon overlay)

---

## 7. Projects Page

### Grid
- **Change**: Consider making the first project card larger (2-col span) like on Home
- **Keep**: Filter pills, responsive columns, stagger animation

### Cards
- **Keep**: Video thumbnail autoplay, tech pills, year badge
- **Change**: Make hover lift more pronounced (`-translate-y-1` instead of `-translate-y-0.5`)
- **Change**: Remove fixed `h-10` on description — let it be natural height with clamp

---

## 8. Project Detail Page

- **Keep**: 8/4 grid, sticky sidebar, TechReveal, challenges format, code viewer
- **Change**: Add anchor navigation / floating TOC for long pages
- **Fix**: YouTube embed in hero should move below the hero section

---

## 9. About Page

- **Must add**: A photo of Igor (or placeholder slot for one)
- **Keep**: Narrow column, varied animation directions, pull quote, education list
- **Change**: Add at least one visual break between text sections

---

## 10. Contact Page

- **Keep**: Email obfuscation, copy-to-clipboard, availability badge, timezone
- **Change**: Replace "Get In Touch" with something more specific to audio work
- **Keep**: Two-column layout (it works even if common)

---

## 11. Standalone Pages (Transientica, SoundDesign, MiddlewareOpt, Gradwork)

### Shared fixes for ALL four:
1. Remove duplicate page-specific footers — use global Footer
2. Use shared motion presets from `motion.ts` instead of inline values
3. Fix broken CSS classes (`fill-cream-light`, off-palette colors)

### Specific:
- **MiddlewareOpt**: Remove bouncing scroll chevron
- **Transientica**: Replace `animate-bounce` with custom waveform animation
- **SoundDesign**: Fix `bg-surface-raised` as page bg (use `bg-surface`)
- **Gradwork**: Replace hardcoded Tailwind colors with design tokens

---

## 12. Audio Player

- **Keep**: Everything — it's well-built
- **Change**: Close button hover should not use error-red; use a neutral color
- **Consider**: Show track title on mobile without truncating to 120px

---

## 13. Animation Philosophy

### Rules
1. Every animation serves a function (reveal, transition, feedback)
2. No animation repeats on scroll — `once: true` always
3. Stagger timing: 50-80ms for groups
4. Duration: 200-600ms max for any single animation
5. Easing: Use the existing custom curve `[0.25, 0.46, 0.45, 0.94]` consistently
6. Respect `prefers-reduced-motion` everywhere
7. No parallax on content (only on hero backgrounds where it serves the composition)
8. No bouncing elements

### Keep
- framer-motion presets from `motion.ts`
- CSS keyframe waveform animations
- TechReveal scramble
- Spring configs (interactive: 300/25, gentle: 200/20)

### Remove
- Bouncing scroll chevron (MiddlewareOpt)
- `animate-bounce` usage (Transientica)
- Unused `vu-sweep` and `oscilloscope` animations (remove from config if truly unused, or integrate them)

---

## 14. Bug Fixes Required

1. `fill-cream-light` — referenced in Transientica, SoundDesign; not in config
2. `text-primary` — referenced in ErrorBoundary; not a valid class (should be `text-text-primary`)
3. `bg-accent-light` — referenced in ErrorBoundary; not in config (should be `bg-accent`)
4. `bg-dim/40` — referenced in ProductionTimeline; not in config
5. `bg-noise` div in Layout — no corresponding CSS
6. Off-palette colors in Gradwork (`bg-emerald-500/10`, `bg-slate-600`)
7. `role="main"` on `<main>` is redundant — remove
8. Suspense fallback pulsing dot should be replaced with PageLoader

---

## 15. Implementation Priority

### Phase 1 — Critical (do first)
1. New IntroAnimation (Signal Check waveform)
2. Home Hero visual element
3. Bug fixes (broken CSS classes)

### Phase 2 — High Priority
4. Nav/Layout improvements
5. Remove duplicate footers from standalone pages
6. Skills section redesign
7. About page photo slot

### Phase 3 — Medium Priority
8. Project card enhancements
9. Contact page header copy
10. Standalone page fixes (MiddlewareOpt chevron, Transientica bounce, etc.)
11. PageLoader as Suspense fallback

### Phase 4 — Polish
12. Audio player close button
13. Project detail TOC/anchors
14. Footer CTA
15. Unused animation cleanup
