# Portfolio Layout Research: Anti-AI-Slop Design for a Game Audio Designer

## Executive Summary

This research synthesizes findings from hiring manager behavior studies, game audio industry guides, 2025-2026 design trends, and portfolio UX best practices. The core thesis: **the strongest portfolios in 2026 feel unmistakably human-crafted, specific to the person, and structured around storytelling rather than decoration.**

The backlash against "AI slop" — generic, template-driven, statistically-average design — is now a mainstream cultural force. Merriam-Webster named "slop" the 2025 word of the year. For a game audio designer's portfolio, this means the site itself must demonstrate the same intentionality and craft that the audio work does. Every visual, typographic, and interaction choice should feel like a deliberate decision, not a default.

Key recommendations: dark but warm color palette, restrained typography with personality, minimal but meaningful animation, audio-first content hierarchy, and a layout that lets the work — not the website chrome — be the star.

---

## What Employers & Hiring Managers Look For

### How Recruiters Actually Review Portfolios

Recruiters follow a predictable sequence (source: Open Doors Careers):

1. **Pre-click assessment** — They decide whether to open your link at all. A custom domain signals seriousness; a Behance/Dribbble link signals "not serious about presentation — it's an archive, not a portfolio."
2. **Visual quality check** — First impressions in 2-5 seconds. "Even non-designers feel when something's off... if the visual foundation looks sloppy, people assume your work follows the same pattern."
3. **Hero section scan** — Generic statements like "I'm passionate about design" fail. Specific positioning about strengths makes you memorable.
4. **Work preview** — Brief review of 3-5 case studies. Quality over quantity always wins.
5. **About page** — Hiring managers click About once they've decided your work is solid. This is where you tell your story.

### What Turns Them Away

- Poor visual craft and inconsistent spacing
- Vague or cliched opening statements
- Case study clutter — too many mockups without narrative
- Lack of results or impact description
- Generic template aesthetic (signals low effort)

### What Keeps Them Scrolling

- Strong visual coherence across the entire site
- Clear positioning: who you are, what you do, why it matters
- Focused storytelling that connects process to outcomes
- 3-5 strong projects rather than 15 mediocre ones
- Interactive proof-of-work (live demos, embedded players, video)

### Game Audio Specific (Paul Boechler / A Sound Effect)

- **Technical range**: Show proficiency with FMOD, Wwise, Unreal, Unity. Include in-engine implementations, not just linear redesigns.
- **Creative diversity**: Feature multiple genres, styles, subject matter — vehicles, creatures, UI, foley, ambience.
- **Sonic quality**: Compelling audio mixing with clear dynamic range. Cohesive and balanced throughout.
- **Demo reel structure**: 1-3 minutes, strongest material first, no music layered over sound design, snappy pacing.
- **Audio fidelity**: Verify the hosting platform isn't downgrading audio quality. Some embedded video players compress audio.
- **Beyond the reel**: Portfolio + engagement + personality + luck. Show you're someone people want to work with.

---

## AI Slop Anti-Patterns to Avoid

### The "Purple Gradient Problem"

In August 2025, Adam Wathan (Tailwind CSS creator) publicly apologized for making every button in Tailwind UI use `bg-indigo-500` five years ago — inadvertently training every LLM to generate purple-gradient interfaces. The result: "When you ask an AI to build a landing page without specific constraints, you're not getting design. You're getting the median of every Tailwind CSS tutorial scraped from GitHub between 2019 and 2024."

### Specific Anti-Patterns

| Anti-Pattern | Why It Reads as "AI Slop" |
|---|---|
| **Inter/Roboto font** | "Never anything with personality" — these are the statistical default |
| **Purple/indigo gradients on white** | The single most recognizable AI design fingerprint |
| **Three features in boxes with icons** | Cookie-cutter grid that reduces everything to identical rectangles |
| **Timid, evenly-distributed color palettes** | No accent strategy, no hierarchy through color |
| **Generic hero text** ("Welcome to my portfolio") | Could belong to anyone; signals zero self-awareness |
| **Stock illustration style** (isometric people, blob shapes) | Instantly recognizable as template art |
| **Overused animations** (fade-up on everything, parallax for no reason) | Animation without purpose = decoration without meaning |
| **Glassmorphism/blur cards everywhere** | Was trendy in 2021, now signals "I followed a tutorial" |
| **Dark mode with pure #000000 black** | Harsh, clinical, causes halation effect on text |
| **Perfectly symmetrical layouts** | Real design has intentional asymmetry and rhythm |

### The Root Cause

LLMs fill ambiguity with statistical averages. They are "pattern matchers without taste or lived design experience." The antidote: make every choice specific, intentional, and defensible. If you can't explain why a color/font/layout was chosen, it's probably a default.

---

## Exemplary Portfolio Examples

### 1. Bruno Simon (bruno-simon.com)
**Why it works**: His portfolio IS a 3D driving game. It's extreme, but the principle is universal: the portfolio demonstrates the creator's actual skills. For a creative developer, the medium is the message. Multiple Awwwards, CSS Design Awards.

**Takeaway for Igor**: The site itself should demonstrate audio-design thinking — rhythm, pacing, dynamics.

### 2. Jens Bosman (jensbosman.nl)
**Why it works**: A one-person operation combining videography, editing, and sound design. Clean, photo-centric layout where each project feels individually considered. No template smell.

**Takeaway for Igor**: Multi-disciplinary creators benefit from a layout that lets different media types (video, audio, images) breathe in their own space.

### 3. Adrien Lamy (adrienlamy.fr)
**Why it works**: Bold typography, dynamic layouts, and expressive personal projects. Intimate yet expansive presentation that feels handcrafted rather than systematized.

**Takeaway for Igor**: Strong typographic choices create identity without requiring heavy graphics.

### 4. Joffrey Spitzer Portfolio (Astro + GSAP)
**Why it works**: Minimalist build with reveals, flip transitions, and subtle motion. Described as "restrained and precise, mixing minimalist clarity with subtle transitions and attention to micro-details that makes everything feel intentional without being loud."

**Takeaway for Igor**: Restraint in animation creates sophistication. Every motion should serve a purpose.

### 5. Paul Boechler (paulboechler.com)
**Why it works**: A game audio professional whose portfolio practices what he preaches. Clean, professional, content-first. Work section leads with video/audio, not decoration.

**Takeaway for Igor**: An actual game audio peer — study the content hierarchy and how audio is presented.

### 6. Matt Jacobson (mattjacobsonsound.com)
**Why it works**: Includes behind-the-scenes videos showing edit timeline organization, examples of dialogue/music/effects stems. Transparent about process.

**Takeaway for Igor**: Showing process (not just results) builds credibility with technical hiring managers.

### 7. Loic Couthier (loiccouthier.com)
**Why it works**: Game audio specific. Work examples page with clear categorization. Demo reel integrated directly, not hidden behind clicks.

**Takeaway for Igor**: Audio should be immediately playable, not buried. Reduce friction to hearing your work.

---

## Recommended Layout Structure

### Page Hierarchy

```
1. HOME (Landing)
   - Hero: Name + one-line positioning + subtle ambient element
   - Featured work: 3-4 strongest projects with embedded audio/video
   - Brief "what I do" section with tools/skills
   - CTA to full projects or contact

2. PROJECTS (Work)
   - Filterable grid or list of all projects
   - Each card: thumbnail + title + tags + brief description
   - Audio preview on hover or click (low friction)

3. PROJECT DETAIL
   - Hero media (video/audio player, prominent)
   - Context: client, role, tools, year
   - Process narrative: challenge > approach > result
   - Additional media: screenshots, stems, behind-the-scenes
   - Next/prev project navigation

4. ABOUT
   - Personal photo (real, not stock)
   - Story in first person — who you are, your journey, what drives you
   - Tools & skills (concrete, not buzzword lists)
   - Professional timeline or key milestones
   - Links to profiles (LinkedIn, SoundCloud, etc.)

5. CONTACT
   - Simple form + direct email
   - Clear CTA
   - Social links
   - Location/timezone info (useful for remote work)

6. MUSIC (Audio Showcase)
   - Dedicated audio player with playlist
   - Categorized by type (game audio, music, sound design)
   - High-quality playback (no compression artifacts)
```

### Information Architecture Principles

- **F-pattern scanning**: Place key information along the top and left edge
- **Progressive disclosure**: Overview first, detail on demand
- **3-click rule**: Any piece of work should be reachable in 3 clicks or fewer
- **Above the fold**: Name, positioning, and one piece of work should be visible without scrolling
- **Scannable content**: Headers, short paragraphs, visual breaks

---

## Typography Recommendations

### Philosophy

Typography should have personality without sacrificing readability. The 2026 trend is away from generic system fonts (Inter, Roboto) and toward typefaces that "tell a unique story." Character is in; uniformity is out.

### Specific Recommendations

**Headings**: Use a font with distinctive character. Options:
- **A geometric sans-serif with personality**: Something like Space Grotesk, General Sans, or Satoshi — modern but not generic
- **A transitional serif for contrast**: If going for a more editorial feel, something like Fraunces or Newsreader adds warmth
- Avoid: Inter, Roboto, Open Sans, Montserrat (too common, read as defaults)

**Body text**: Prioritize readability at 16-18px:
- **A clean sans-serif**: IBM Plex Sans, Instrument Sans, or Geist — readable, modern, not overused
- **Consider a monospace for UI/technical elements**: JetBrains Mono or Fira Code for code/tool references
- Avoid: Arial, Helvetica, system-ui (too generic)

**Font pairing strategy**:
- One heading font + one body font (maximum two typefaces)
- Use weight and size variation within each family for hierarchy
- Consistent line-height: 1.5 for body, 1.1-1.2 for headings

### Sizing Scale

- Hero heading: 48-64px (desktop), 32-40px (mobile)
- Section headings: 32-40px (desktop), 24-28px (mobile)
- Subheadings: 20-24px
- Body: 16-18px
- Small/caption: 13-14px
- Use `clamp()` for fluid typography between breakpoints

---

## Color Approach Recommendations

### Philosophy

Restrained palettes work because they give content room to breathe. Use fewer colors, stronger contrast, and clear hierarchy. Avoid the "AI gradient" trap — no indigo-to-purple gradients, no decorative color for color's sake.

### Recommended Palette Direction

**Primary: Warm dark background**
- Not pure black (#000000) — causes halation and eye strain
- Instead: deep charcoal with a warm undertone (#0a0a0f, #111116, #16161d)
- This creates a "cinema screen" effect — dark enough for media to pop, warm enough to feel inviting

**Text: Off-white to cream**
- Not pure white (#ffffff) — too harsh against dark backgrounds
- Instead: warm off-white (#e8e4df, #f0ece7, #d9d5d0)
- Secondary text: muted warm gray (#8a8580, #9a9590)

**Accent: One distinctive color**
- Pick ONE accent color used sparingly for CTAs, active states, and highlights
- Options for game audio:
  - Amber/warm gold (#d4a853) — warmth, craft, studio lighting
  - Soft teal (#4a9e9e) — tech-forward without being cold
  - Muted coral (#c7725a) — energy without screaming
- Use the accent at 10-15% of the visual space, never more

**Functional colors**:
- Success/active: the accent color
- Error: desaturated red (#c75a5a)
- Borders/dividers: very subtle (#ffffff10 or #ffffff08)

### What to Avoid

- Indigo/purple gradients (the #1 AI slop fingerprint)
- Rainbow or multi-colored accents (reads as template)
- Fully saturated primary colors (too aggressive)
- Gray-on-gray low-contrast text (accessibility failure)
- Gradient backgrounds behind text (readability killer)

### Accessibility Requirements (WCAG AA)

- Normal text: minimum 4.5:1 contrast ratio
- Large text (18px+ bold, 24px+ regular): minimum 3:1
- Non-text elements (icons, borders): minimum 3:1
- Test every text color against its actual background, not assumptions

---

## Animation Philosophy

### Core Principle: Audio Designer Thinking

Animations should follow the same principles as good sound design:
- **Purposeful**: Every sound in a game serves a function. Every animation should too.
- **Dynamic range**: Like audio mixing — some moments are quiet, some are loud. Not everything moves all the time.
- **Timing and rhythm**: Good sound design has musical timing. Animations should have considered easing and duration.
- **Subtlety over spectacle**: The best sound design is often invisible. The best web animation feels natural, not performative.

### Recommended Animation Patterns

**Page transitions**:
- Smooth, quick crossfades (200-400ms) between pages
- Content slides or reveals, not full-page cinematic transitions
- Keep the user oriented — don't lose navigation context during transitions

**Scroll-triggered reveals**:
- Elements fade in and translate up slightly (8-16px) as they enter viewport
- `once: true` — play once, not every time the user scrolls past
- Stagger children by 50-80ms for grouped elements (cards, lists)
- Keep total animation duration under 600ms

**Micro-interactions**:
- Hover states on interactive elements: subtle scale (1.02-1.05), color shift, or underline reveal
- Button press feedback: slight scale-down (0.98) on click
- Audio player: waveform or progress indicator that responds to playback state

**What to avoid**:
- Parallax scrolling (overused, causes motion sickness for some users)
- Fade-up on every single element (monotonous, slows perceived loading)
- Bouncy/spring animations on text (distracting, reads as playful rather than professional)
- Loading spinners or skeleton screens that last more than 200ms for cached content
- Auto-playing video backgrounds (bandwidth, performance, distraction)

### Framer Motion Best Practices

- Use `transform` and `opacity` properties (GPU-accelerated, no layout reflow)
- Use `layoutId` for shared element transitions between pages
- Use `whileHover` and `whileTap` instead of custom event handlers
- Use `useInView` with `once: true` for scroll reveals
- Use `AnimatePresence` for exit animations on route changes
- Respect `prefers-reduced-motion` — disable or simplify all animation

### Easing Recommendations

- Entrances: `ease-out` or `[0.0, 0.0, 0.2, 1.0]` (decelerate into position)
- Exits: `ease-in` or `[0.4, 0.0, 1.0, 1.0]` (accelerate out)
- Interactions: `ease-in-out` or `[0.4, 0.0, 0.2, 1.0]` for hover/click
- Avoid: linear timing (feels mechanical), excessive spring physics (feels bouncy/juvenile)

---

## Content Hierarchy Recommendations

### The "Inverted Pyramid" for Portfolios

1. **Who you are** (5 seconds): Name, title, one-line positioning
2. **What you've done** (30 seconds): 3-4 strongest pieces, immediately accessible
3. **How you work** (2 minutes): Process, tools, approach
4. **Your full story** (5 minutes): Background, journey, personality

### Audio-First Content Strategy

For a game audio designer, **sound must be the primary medium**, not an afterthought:

- **Homepage**: Feature an audio-interactive element — a waveform, an ambient soundscape, or a "listen" CTA that's more prominent than any "read" CTA
- **Project cards**: Include a small play button or audio preview on each card, so hiring managers can hear samples without clicking through
- **Project detail pages**: Lead with the audio/video player, not a text description. Let the work speak (literally) first
- **Demo reel**: Embedded directly in the flow, not hidden on a separate page or behind a YouTube link
- **Audio player**: Custom-built, high-quality, with scrubbing and volume control. No default browser controls.

### What NOT to Put Above the Fold

- Long paragraphs about yourself (save for About page)
- A wall of technology logos/badges
- Social media feeds or counters
- Blog posts or news updates (unless directly relevant)
- Generic stock photography

---

## Specific Recommendations for a Game Audio Designer Portfolio

### 1. Audio Must Be a First-Class Citizen

The portfolio of a game audio designer should make listening effortless:
- Custom audio player with playlist functionality, scrubbing, and volume control
- Categorization: game audio, music, sound design, foley, etc.
- High-fidelity playback — verify no compression artifacts from the hosting platform
- Consider: a subtle ambient sound or interactive audio element on the homepage (opt-in, never autoplay)

### 2. Show the Game Context

Don't just show audio — show how it lives in a game:
- Video captures of in-engine implementation
- Before/after comparisons (original vs. redesigned audio)
- Screenshots or clips showing the game context for each sound
- Mention middleware (Wwise, FMOD) and engines (Unity, Unreal) used

### 3. Tell the Story of Each Project

For each project, answer:
- What was the brief/challenge?
- What was your specific role?
- What tools and techniques did you use?
- What was the creative approach?
- What was the outcome/reception?

### 4. Demonstrate Technical + Creative Range

- Show different genres: horror, sci-fi, casual, narrative, etc.
- Show different audio types: SFX, ambience, foley, UI sounds, music
- Show implementation skills, not just content creation
- Include personal/experimental projects alongside client work

### 5. Make It Personal

The anti-AI-slop differentiator is YOU:
- Write in first person
- Include a real photo (not an avatar or AI-generated image)
- Share your origin story — what drew you to game audio?
- Mention specific influences, favorite games, or formative experiences
- Show personality without being unprofessional

### 6. Technical Polish as Credibility

The site itself demonstrates your attention to detail:
- Fast loading times (optimize images, lazy-load media)
- No broken links, no layout shifts, no audio glitches
- Responsive across all devices
- Accessible (keyboard navigation, screen reader support, reduced motion)
- Clean URLs, proper meta tags, Open Graph for social sharing

### 7. Clear Call to Action

Make it obvious how to hire you:
- "Available for work" / "Open to opportunities" if applicable
- Contact form AND direct email
- LinkedIn profile link
- Location/timezone for remote work context
- Resume/CV download option

---

## Summary: The Anti-AI-Slop Checklist

Before shipping any design, run through this checklist:

- [ ] Can you explain why every color was chosen? (Not "it's the default")
- [ ] Does the typography have personality beyond Inter/Roboto?
- [ ] Is the layout asymmetric or rhythmic, not a perfect grid of identical boxes?
- [ ] Do animations serve a purpose, or are they decorative?
- [ ] Does the hero section say something specific about THIS person?
- [ ] Is the accent color used sparingly and intentionally?
- [ ] Does the site feel like it was made BY someone, not generated FOR someone?
- [ ] Is audio playback a first-class experience, not an afterthought?
- [ ] Does every piece of content earn its place on the page?
- [ ] Would this site look identical if you replaced the name? (If yes, redesign it)

---

## Sources

- [How Recruiters Actually Look at Your Portfolio](https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio)
- [Why Your AI Keeps Building the Same Purple Gradient Website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)
- [Game Audio Portfolio Guide - Paul Boechler](https://www.asoundeffect.com/game-audio-portfolio-guide/)
- [Game Audio Hiring: Sound Design Roles](https://www.asoundeffect.com/game-audio-sound-design-hiring/)
- [Best Practices for Getting a Job in Game Audio](https://intogames.org/news/best-practices-for-getting-a-job-in-game-audio)
- [Top 100 Most Creative Portfolio Websites of 2025](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [Web Design Trends 2026 - Wix](https://www.wix.com/blog/web-design-trends)
- [Portfolio Design Trends 2026 - Colorlib](https://colorlib.com/wp/portfolio-design-trends/)
- [Typography Trends 2026 - Creative Bloq](https://www.creativebloq.com/design/fonts-typography/breaking-rules-and-bringing-joy-top-typography-trends-for-2026)
- [Dark Mode Accessibility Guide](https://www.accessibilitychecker.org/blog/dark-mode-accessibility/)
- [Framer Motion Performance Tips](https://tillitsdone.com/blogs/framer-motion-performance-tips/)
- [Joffrey Spitzer Portfolio - Codrops](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/)
- [5 Color Palettes for Balanced Web Design 2026](https://www.elegantthemes.com/blog/design/color-palettes-for-balanced-web-design)
- [How to Make a Killer Demo Reel in Game Audio](https://www.gameaudiolearning.com/knowledgebase/how-to-make-a-killer-demo-reel-in-game-audio)
- [10 Tips for Creating a Game Sound Design Demo Reel](https://www.daviddumaisaudio.com/10-tips-for-creating-a-video-game-sound-design-demo-reel/)
- [Framer: Animation Techniques to Enhance UX](https://www.framer.com/blog/website-animation-examples/)
