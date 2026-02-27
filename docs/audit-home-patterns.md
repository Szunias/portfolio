# Home Page Pattern Audit

## Page Structure (top to bottom)

```
Home.tsx
  |-- <SEO /> + JSON-LD WebSite schema
  |-- <Hero />
  |-- Showreel Section (border-t wrapper)
  |     |-- <Showreel />
  |-- Projects Section (#projects)
  |     |-- Heading + subtitle + "All Projects" link
  |     |-- 2-col grid of <ProjectCard /> (first card spans 2 cols)
  |     |-- Mobile "View All Projects" button
  |-- <Skills />
```

---

## Section 1: Hero (`src/components/home/Hero.tsx`)

### Current Layout
- Full-width section, `min-h-[70vh]`, flex start, top-padded (`pt-32 md:pt-40`)
- Single-column content block, max-w-5xl, left-aligned
- Decorative SVG waveform sits absolutely behind content at 55% vertical, 15% opacity

### Content (top to bottom)
1. **Availability badge** -- mono caption, green pulsing dot, "Available February 2026 . EU/UK"
2. **Name** -- `IGOR SZUNIEWICZ` in display font, responsive clamp `3rem..8rem`, hardcoded in JSX (not i18n)
3. **Role** -- mono, uppercase, right-aligned on desktop via `justify-end`, "Game Audio Designer"
4. **Description** -- body text, max-w-2xl, "I make sound for games..."
5. **Tech line** -- mono caption, "Wwise and FMOD implementation, C++ audio systems..."
6. **CTAs** -- two buttons: "Watch Showreel" (filled accent, Play icon) + "View Projects" (outlined, ArrowRight)

### i18n Keys Used
- `home:hero.availability`
- `home:hero.role`
- `home:hero.description`
- `home:hero.description_tech`
- `home:hero.watch_showreel`
- `home:hero.view_projects`

### Animations
- Custom `fade(delay)` helper: opacity 0 -> 1, y 16 -> 0, staggered by 0/0.15/0.4/0.55/0.7s
- `slideFromRight(0.15)` for the role line (x: 16 -> 0)
- SVG waveform: `pathLength: 0 -> 1` draw-on animation (2s), ghost echo line offset by 6px
- All respect `useReducedMotion`

### Data from portfolioData.json
- None. Hero is entirely i18n-driven.

### Generic Pattern Score: **YES -- seen this exact thing on 100+ portfolios**

The structure is the textbook developer/designer portfolio hero:
- Big name (responsive clamp)
- Role subtitle
- One-paragraph pitch
- Tech line
- Two CTA buttons (primary action + secondary)
- Decorative background element

The only semi-unique element is the **SVG waveform** drawing animation, which nods to audio design. But it's subtle (15% opacity), non-interactive, and functionally just a background decoration like the gradient blobs on every SaaS landing page.

### What Could Be Radically Different
- **Make sound the actual hero** -- audio-reactive visualization, playable sound snippet, frequency spectrum that responds to user mic
- **Non-linear intro** -- typewriter that "types" like a DAW timeline cursor, or text that appears timed like subtitles synced to an audio clip
- **Horizontal scrolling timeline** instead of vertical stack
- **"Mixboard" layout** -- name/role/description in fader-like columns, each at different heights
- **Terminal/CLI aesthetic** -- `$ whoami` / `> igor.szuniewicz --role "game audio"` fits the technical + audio identity
- **Reduce text to absolute minimum** -- name + one sentence + play button, let the showreel do the talking

---

## Section 2: Showreel (`src/components/features/Showreel.tsx`)

### Current Layout
- Inside a `bg-surface border-t` full-width wrapper
- Content centered in `max-w-content-wide`, padded
- 16:9 `aspect-video` iframe container, rounded, border, `shadow-glow-accent`
- Below: "Chapters" heading + 4-col grid of timestamp buttons

### Content
1. **Vimeo iframe** -- video ID `1143625213`, controls enabled
2. **Loading spinner** -- Loader2 icon while iframe loads
3. **Custom play overlay** -- appears when paused + ready (accent-bordered circle with Play icon)
4. **Error state** -- AlertCircle + retry button
5. **Chapter navigation** -- 8 timestamps (Start, Shadow Frames, Amorak, Akantilado, Ray, Not Today, Ellen Wwise, Pause & Deserve) each with time + translated label
6. Active chapter highlighting (accent color when playing)

### i18n Keys Used
- `home:errors.video_load_failed`
- `home:hero.retry`
- `home:hero.showreel_title`
- `home:hero.chapters`
- `home:hero.showreel_start`
- `home:hero.chapter.shadow_frames` through `home:hero.chapter.pause_and_deserve`

### Animations
- Play button: `whileHover scale 1.05`, `whileTap scale 0.95`
- No scroll-triggered animations

### Data from portfolioData.json
- None. Timestamps are hardcoded in the component.

### Generic Pattern Score: **MODERATE -- video embed is universal, but chapter nav adds value**

A Vimeo/YouTube embed is as generic as it gets. However, the chapter navigation with active tracking is a genuinely useful addition that most portfolios skip. The implementation (Vimeo Player API, timeupdate tracking) is solid.

### What Could Be Radically Different
- **Inline the showreel in the hero** -- don't make it a separate section, make the video BE the background or the central piece of the landing experience
- **Audio waveform scrubber** instead of timestamp buttons -- visual waveform with chapter markers, like a DAW
- **Split-screen** -- video on one side, live-updating project info on the other as chapters change
- **"Now Playing" bar** -- sticky bottom bar (like Spotify) that persists as you scroll, showing current chapter
- **Skip the embed entirely** -- use short looping clips/GIFs with spatial audio descriptions instead of one long video

---

## Section 3: Projects Grid (`Home.tsx`, lines 47-110)

### Current Layout
- `max-w-content`, centered, py-16
- Header block: h2 + subtitle + "All Projects" link with ArrowRight icon
- 2-column grid (`grid-cols-1 md:grid-cols-2 gap-6`)
- First project card spans 2 columns (`md:col-span-2`)
- Shows first 4 featured projects from portfolioData.json
- Mobile-only "View All Projects" button at bottom

### Content
- Section title: "Selected Work" (i18n)
- Subtitle: "Games, tools, and experiments..." (i18n)
- "All Projects" link
- 4x ProjectCard components

### i18n Keys Used
- `home:projects.featured_title`
- `home:projects.subtitle`
- `home:projects.view_all`

### Data from portfolioData.json
- `featured_projects` array, sliced to first 4
- Each card uses: `project.id`, `project.title`, `project.media.thumbnail`, `project.technologies`, `project.tags`, `project.category`, `project.year`, `project.short_description`, `project.externalLink`

### Animations
- Header: `sectionReveal` (opacity fade, 0.4s)
- Cards: `cardIn` (opacity + y:12 + scale:0.98, staggered by 0.08s each)
- Mobile button: `sectionReveal`
- All viewport-triggered, once

### Generic Pattern Score: **YES -- extremely standard portfolio project grid**

This is the #1 most common portfolio section pattern:
- Centered heading + subtitle
- 2-column card grid
- Card = image + title + description + tags
- "View All" link
- First card larger than the rest

Every dev/design portfolio on the internet has this exact section.

### What Could Be Radically Different
- **Replace grid with a single "featured" deep-dive** -- one project, full width, with video/audio/code side by side
- **Horizontal scrolling "tape reel"** -- projects as a horizontal strip you scrub through, like an audio timeline
- **Interactive "mixing board"** -- each project is a fader channel strip with its thumbnail and key stats
- **Project as audio players** -- each card has an inline audio snippet that plays on hover/focus
- **Asymmetric/scattered layout** -- cards at different sizes and positions, breaking the grid
- **Case study teasers** -- instead of thumbnail+title cards, show a key stat or pull-quote from each project with a "Read more" expansion

---

## Section 4: ProjectCard (`src/components/features/ProjectCard.tsx`)

### Current Layout
- Full-width rounded card, `bg-surface-raised`, border, hover lift (-translate-y-1 + shadow)
- Top: 16:9 aspect-ratio media (image or auto-playing muted video via IntersectionObserver)
- Year badge (top-right overlay)
- External link icon (top-left) if `externalLink` exists
- Bottom: title + description (2-line clamp) + tech pills + category badge
- Footer: "View Project" text + arrow (opacity-reveals on hover)

### Content
- Thumbnail (image or .mp4/.webm video)
- Translated title via `projects:project_{id}_title`
- Translated short description via `projects:project_{id}_short_desc`
- Category pill
- Up to 4 tech tags (sorted by priority: C++, Unreal, Wwise, MetaSounds, etc.)
- Year badge

### i18n Keys Used
- `projects:project_{id}_title` (dynamic per project)
- `projects:project_{id}_short_desc` (dynamic per project)
- `projects:card.no_signal`
- `projects:card.view_project`

### Animations
- None built-in (parent applies cardIn via motion.div wrapper)
- Video auto-play/pause via IntersectionObserver at 25% threshold

### Data from portfolioData.json
- `project.id`, `project.title`, `project.media.thumbnail`, `project.technologies`, `project.tags`, `project.category`, `project.year`, `project.short_description`, `project.description`, `project.externalLink`

### Generic Pattern Score: **YES -- standard portfolio card**

Image + title + description + tags + hover effect is the universal portfolio card. The auto-playing video thumbnail is a nice touch but increasingly common (seen on Dribbble, Behance, etc.).

### What's Unique
- Video thumbnails with IntersectionObserver auto-play
- Priority-sorted tech tags
- "NO_SIGNAL" fallback for missing thumbnails (fits the audio/tech aesthetic)

---

## Section 5: Skills (`src/components/home/Skills.tsx`)

### Current Layout
- Full-width section, py-16, `border-t border-border`
- Centered `max-w-content`
- 4-column grid (2 on mobile) with 4 categories
- Each category: mono accent heading + bulleted tool list

### Content (hardcoded, NOT i18n)
```
Middleware: Wwise, FMOD, MetaSounds
Engines: Unreal Engine 5, Unity
Programming: C++, C#, Python, Blueprints
DAWs & Tools: Reaper, Pro Tools, JUCE, Max/MSP
```

### i18n Keys Used
- **None.** All labels and tool names are hardcoded English strings in `SKILL_CATEGORIES` array.

### Animations
- Container: `sectionReveal` (opacity fade)
- Each category: custom fade (opacity + y:8, staggered by `stagger.skills` = 0.05s)
- Viewport-triggered, once

### Data from portfolioData.json
- None. Skills are hardcoded in the component.

### Generic Pattern Score: **YES -- one of the most generic portfolio patterns**

A grid of skill category labels + tool names is the #1 most boring section on any portfolio. It tells you nothing about proficiency, context, or what makes this person's skill set special. It's a checklist, not a story.

### What Could Be Radically Different
- **Kill it entirely** -- skills are demonstrated by the projects. A list adds nothing.
- **Signal path diagram** -- show tools as nodes in an audio signal flow (mic -> Reaper -> Wwise -> Unreal)
- **"What I actually do" format** -- replace tool lists with 1-sentence descriptions of capabilities (e.g., "I write the C++ that makes Wwise events fire when the player walks on gravel")
- **Per-project tool usage** -- instead of listing tools, show which projects used which tools as a matrix or Sankey diagram
- **Interactive audio chain** -- click a node and hear a brief sound that was made with that tool

---

## Section 6: TechReveal (`src/components/home/TechReveal.tsx`)

### Overview
- A "matrix scramble" text reveal effect
- Characters scramble randomly then settle into the final text, left to right
- Triggered on scroll into view (IntersectionObserver via `useInView`)
- 30ms interval, reveal speed = 1/3 character per tick

### Currently Used
- **Not imported anywhere in Home.tsx or any home component.** This appears to be an unused/orphaned component.

### Generic Pattern Score: **MODERATE**

The scramble effect itself is well-known (popularized by Hyperplexed on YouTube). It's cool but overused on tech portfolios in 2024-2025. If used strategically on one or two key phrases, it could work.

---

## Summary: Generic vs. Unique

### What's Generic (seen on 100+ portfolios)
| Pattern | Location | Severity |
|---------|----------|----------|
| Big name -> subtitle -> description -> CTAs | Hero | HIGH |
| Decorative background SVG | Hero | MEDIUM |
| Video embed section | Showreel | HIGH |
| Centered section heading + subtitle | Projects | HIGH |
| 2-column project card grid | Projects | HIGH |
| Image + title + desc + tags card | ProjectCard | HIGH |
| "View All Projects" link | Projects | MEDIUM |
| Grid of skill category + tool names | Skills | HIGH |
| Fade-up scroll animations everywhere | All sections | MEDIUM |

### What's Genuinely Unique
| Feature | Location | Notes |
|---------|----------|-------|
| SVG waveform draw-on animation | Hero | Audio-themed but too subtle (15% opacity) |
| Video chapter navigation with live tracking | Showreel | Genuinely useful, well-implemented |
| Auto-playing video thumbnails | ProjectCard | IntersectionObserver-based, good UX |
| "NO_SIGNAL" fallback aesthetic | ProjectCard | Fits the technical audio brand |
| Priority-sorted tech tags | ProjectCard | Smart, surfaces most relevant tech first |
| Right-aligned role text | Hero | Small layout asymmetry, breaks the mold slightly |

### What's Missing
- **No audio anywhere on the home page** -- this is a game audio designer's portfolio with zero playable audio on the landing page
- **No demonstration of skill** -- the page tells you Igor does audio, but doesn't let you hear or interact with anything
- **No personality in the layout** -- the structure could belong to any React developer's portfolio
- **Skills section has no i18n** -- all strings hardcoded in English
- **TechReveal component exists but is unused**
- **No connection between projects section and showreel** -- chapters in the showreel map to projects, but there's no visual link

### Data Architecture Notes
- Hero: pure i18n, no portfolioData dependency
- Showreel: pure i18n + hardcoded timestamps, no portfolioData dependency
- Projects: depends on `featured_projects` from portfolioData + i18n from both `home` and `projects` namespaces
- Skills: zero dependencies (hardcoded arrays, no i18n, no data)
- All motion presets come from `src/constants/motion.ts`

### i18n Coverage
- Hero: fully i18n'd (except the hardcoded name `IGOR SZUNIEWICZ`)
- Showreel: fully i18n'd
- Projects section header: fully i18n'd
- ProjectCard: fully i18n'd (uses `projects` namespace with dynamic keys)
- Skills: **NOT i18n'd at all** -- category labels and tool names are hardcoded English
