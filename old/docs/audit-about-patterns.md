# About Page Audit: Generic Patterns & Redesign Opportunities

## File: `src/pages/About.tsx` (227 lines)

---

## Section-by-Section Breakdown

### 1. INTRO (lines 77-87)

**Is this just paragraphs of text?** YES -- a single `<p>` tag.

**Layout:** Full-width text inside a narrow column (`max-w-content-narrow` = 720px), centered with `mx-auto`. No heading, no visual element. Just a large-font sentence floating in space.

**Content:** `"22, based in Belgium. Third-year game audio student at DAE. Shipped audio for 4 student games so far."` -- Three facts in one sentence. Short, punchy. Good writing, generic presentation.

**i18n keys:** `intro`

**Animation:** `sectionReveal` -- simple opacity fade-in. No spatial movement.

**What's unique:** The copy itself is direct and no-nonsense. No "Hello, I'm..." or "Welcome to my page." That's good.

**What's generic:** A single line of centered intro text on a dark page. Every portfolio does this. There is zero visual context -- no geography hint, no audio-related visual, nothing that says "sound person" before you read the words.

**Radical alternative:** What if the intro was not text at all, but an interactive audio waveform that reveals text as it plays? Or a terminal-style typewriter effect showing `> whoami` output? Or three floating stat cards (22yo / 4 games / Belgium) that animate in separately?

---

### 2. STORY + PHOTO (lines 89-132)

**Is this just paragraphs of text?** YES -- three `<p>` tags stacked in `space-y-8`.

**Layout:** Two-column on desktop (`flex-col md:flex-row`), stacked on mobile. Left: three paragraphs. Right: profile photo with waveform SVG placeholder (280px max-width, 3:4 aspect ratio). The photo is wrapped in a rounded-lg box with a border.

**Content:**
- `story_1`: Piano childhood -> curiosity about why sound works -> Python scripts
- `story_2`: DAE projects (beatbox classifier, Wwise scripts, 4 games)
- `story_3`: Thesis on AI-generated game audio, caching system at 55ms

**i18n keys:** `story_1`, `story_2`, `story_3`, `profile_photo_alt`

**Animation:** `fadeFromLeft` -- opacity + horizontal slide from left. Photo gets the same animation as the text (no separate animation).

**What's unique:** The content is genuinely interesting -- beatbox classifier, Wwise repair scripts, 55ms caching. These are concrete, specific, unusual. The problem is the *presentation* makes them feel like any "my story" section.

**What's generic:**
- **Wall of three paragraphs** next to a photo. This is the #1 most common About page pattern on the internet.
- **Rectangular photo with a placeholder SVG** -- the waveform placeholder is a nice touch, but the overall pattern (rounded box, border, object-cover) is completely standard.
- **No visual hierarchy** between the three stories. They all look identical. The reader's eye has no anchor point.
- **Photo adds no information** -- it's just "what Igor looks like." It doesn't tell us he's an audio person.

**Radical alternatives:**
- Replace the three paragraphs with a **visual timeline** (piano -> physics -> DAE -> thesis) where each node has an icon/sound.
- Instead of a static photo, show a **photo collage** of workspaces/tools/DAW screenshots -- things that show what he DOES, not what he looks like.
- Present the three stories as **expandable cards** with different visual treatments (childhood = warm, DAE = technical/code-styled, thesis = experimental).
- Use the "55ms" number as a **hero metric** -- huge number, small label -- because that's actually impressive and specific.

---

### 3. PULL QUOTE (lines 134-145)

**Is this just paragraphs of text?** YES -- one `<p>` inside a `<blockquote>`.

**Layout:** Left-border accent (2px `border-l-2 border-accent`), padding left 24px. Standard pullquote pattern.

**Content:** `"If the player can't hear the enemy because the ambient is too loud, that's not a design choice. It's a bug."` -- This is the strongest line on the entire page. It shows *how he thinks*.

**i18n keys:** `pull_quote`

**Animation:** Standard `sectionReveal` (opacity fade).

**What's unique:** The quote itself is excellent. It's opinionated, practical, memorable. It sounds like something said in a code review, not in a TED talk.

**What's generic:** The visual presentation is the most overused quote pattern in web design: left accent border + italic-ish text. Every Medium article, every portfolio, every agency site uses this exact pattern.

**Radical alternatives:**
- Present it as a **code comment** (`// if the player can't hear the enemy...`) in a monospace block, leaning into the developer identity.
- Make it a **full-width interruption** -- dark band across the page, huge text, treating it as a design statement rather than a side note.
- Animate it as a **redline markup** on a fake game screenshot -- showing the quote in context of what it means visually.
- Display it as a **waveform visualization** where the "ambient too loud" part is visually louder than the "enemy" part.

---

### 4. VISUAL BREAK / DIVIDER (lines 147-154)

**Layout:** Centered flexbox with two horizontal rules (`border-t`) flanking a small SVG waveform icon. The waveform has 3 bars in accent color.

**Animation:** None (static).

**What's unique:** The waveform SVG is a thematic touch. It says "audio" without being heavy-handed.

**What's generic:** Decorative dividers between sections are a dated pattern. They signal "I ran out of layout ideas and needed to separate things." The content should flow naturally without needing a visual separator.

**Radical alternative:** Remove it entirely. If sections need separation, the layout itself should provide it through spacing, color shifts, or structural changes. Or: make it *functional* -- an actual audio waveform snippet that plays a 2-second sound on hover.

---

### 5. HOW I WORK / APPROACH (lines 156-170)

**Is this just paragraphs of text?** YES -- two `<p>` tags in `space-y-8`.

**Layout:** Full-width text, same narrow column. No heading, no visual. Just two paragraphs.

**Content:**
- `approach_1`: Debugging as the starting point. Memory budgets. Cutting audio for split-screen.
- `approach_2`: "Build tools when I have to do the same task twice." Wwise script, Unreal Rebuilder.

**i18n keys:** `approach_1`, `approach_2`

**Animation:** `fadeFromRight` -- opacity + horizontal slide from right. Varies direction from the story section, which is a small plus.

**What's unique:** The philosophy is distinctive -- "I automate what annoys me." That's a clear, memorable take.

**What's generic:** Two paragraphs of text with no visual support. There's no heading to label the section. The reader doesn't know they've entered a "how I work" section -- it just looks like more paragraphs continuing from the story.

**Radical alternatives:**
- **Before/After cards**: Show a problem (manual Wwise merge) and the solution (automated script), side by side.
- **"My rules" list**: Styled like terminal output or a config file. Rule 1: If it breaks, fix the system, not the symptom. Rule 2: If you do it twice, automate it.
- **Tool showcase**: Mini cards for each tool he's built (Wwise repair script, Unreal Rebuilder) with one-line descriptions -- making the *work itself* visible.

---

### 6. EDUCATION (lines 172-191)

**Is this just paragraphs of text?** NO -- it's a `<ul>` with three `<li>` items. But functionally, yes: it's a simple list.

**Layout:** Three list items, `space-y-2`, monospace font, small text (`body-sm`), tertiary color. No heading.

**Content:**
- `edu_dae`: DAE Howest (2022-2026), Game Development
- `edu_hs`: Copernicus HS (2018-2022), Mathematics & Physics
- `edu_piano`: State Music School (2012-2018), Classical Piano

**i18n keys:** `edu_dae`, `edu_hs`, `edu_piano`

**Animation:** Standard `sectionReveal`.

**What's unique:** The monospace font and tertiary color make it feel intentionally understated -- like metadata rather than a brag. The piano entry adds personality.

**What's generic:** Education as a bulleted list is the #2 most common About page pattern (after bio+photo). The tertiary color makes it feel like a footnote the designer didn't know what to do with.

**Radical alternatives:**
- **Horizontal timeline bar** with three periods marked (2012-2018 Piano, 2018-2022 Science, 2022-2026 Games). Each period shifts in color from warm (music) to cool (science) to accent (games).
- **Merge education into the story** -- don't separate it. The story already mentions piano and DAE. Having a separate education section is redundant.
- **"Stack" format**: Like a tech stack, showing education + tools/skills gained at each stage. Piano -> ear training, theory. HS -> math/physics, Python. DAE -> Wwise, FMOD, MetaSounds.

---

### 7. CTA (lines 193-220)

**Is this just paragraphs of text?** Partially -- one heading + two buttons.

**Layout:** A heading (`text-h3`), then a flex-wrap row of two buttons: "Say hi" (filled accent) and "My CV" (outlined with download icon).

**Content:**
- `cta_text`: "Looking for a game audio internship in 2026. 3-6 months, EU passport, can relocate."
- Two action buttons.

**i18n keys:** `cta_text`, `cta_contact`, `cta_cv`

**Animation:** Standard `sectionReveal`.

**What's unique:** The CTA text is refreshingly specific. "3-6 months, EU passport, can relocate" is not fluff. It's actionable information for a hiring person.

**What's generic:** Two buttons at the bottom of an About page. Every portfolio has "Contact me" and "Download CV" buttons. The layout (heading + button row) is completely standard.

**Radical alternatives:**
- **"Availability" status bar**: A small, persistent banner-like element that says "Available for internship" with a green dot, EU flag, and relocation icon. Feels like a status indicator, not a plea.
- **Embed the CTA into the story** rather than isolating it at the bottom. The reader already knows he's looking for work from the content -- the CTA could appear naturally where the narrative ends.
- **Interactive contact form** right there, not a link to another page.

---

## Overall Page Structure Analysis

### Current Layout (top to bottom):
```
[  720px narrow column, centered, dark background  ]
|                                                    |
|  1. Intro sentence (large text)                    |
|  2. Story paragraphs + Photo (2-col)               |
|  3. Pull quote (left border)                       |
|  4. Decorative divider (waveform SVG)              |
|  5. Approach paragraphs                            |
|  6. Education list (small mono)                    |
|  7. CTA heading + buttons                          |
|                                                    |
[  end  ]
```

### The core problem: It is a single-column text document with a photo.

The entire page is `max-w-content-narrow` (720px) -- the same width as a blog post. Every section lives inside this one column. There are no full-width breaks, no layout shifts, no grid changes, no background color changes. The page scrolls like a Word document.

### What animations exist:
- `sectionReveal`: Opacity fade (sections 1, 3, 6, 7)
- `fadeFromLeft`: Opacity + x-slide (section 2)
- `fadeFromRight`: Opacity + x-slide (section 5)
- Alternating left/right is a small effort to break monotony, but the result is still "things fade in as you scroll"

### All i18n keys used (17 total):
`about_page_title`, `about_page_description`, `intro`, `story_1`, `story_2`, `story_3`, `pull_quote`, `approach_1`, `approach_2`, `edu_dae`, `edu_hs`, `edu_piano`, `cta_text`, `cta_contact`, `cta_cv`, `profile_photo_alt` (+ fallback defaults for `about_page_title`, `cta_contact`, `cta_cv`, `profile_photo_alt`)

### Components & dependencies:
- `SEO` (layout component)
- `WaveformIcon` (inline SVG, photo placeholder)
- `DividerWaveform` (inline SVG, section divider)
- `Link` from react-router-dom (CTA)
- `Download` icon from lucide-react (CV button)
- `motion` from framer-motion
- `sectionReveal`, `noMotion` from motion constants

---

## Generic Pattern Scorecard

| Pattern | Present? | Severity |
|---------|----------|----------|
| Narrow column of centered text | YES | HIGH -- entire page is 720px |
| "About Me" heading | NO (avoided) | -- |
| Wall of paragraphs | YES | HIGH -- 5 paragraphs + intro + CTA |
| Pull quote with left border | YES | HIGH -- most overused quote style |
| Education as a bullet list | YES | MEDIUM -- at least styled small/mono |
| CTA buttons at the bottom | YES | MEDIUM -- standard pattern |
| Photo placeholder as empty box | YES (with waveform SVG) | MEDIUM |
| Single background color throughout | YES | HIGH -- no visual rhythm |
| No section headings | YES | MEDIUM -- reader has no navigation |
| Same text size/style for all body text | YES | HIGH -- no hierarchy |
| Scroll-triggered fade animations only | YES | HIGH -- decorative, not meaningful |

**Generic score: 8/11 patterns present.** This page is solidly in "every portfolio ever" territory despite the excellent copy.

---

## Personality Traits from the Content

Reading the EN and PL copy, Igor comes across as:

1. **Practical problem-solver**: "If it breaks, fix it. If you do it twice, automate it." This is the strongest personality signal.
2. **Direct/no-BS communicator**: Short sentences. No fluff. "Short answer: not yet." He writes like a developer, not a marketer.
3. **Tool-builder**: He doesn't just use tools -- he builds them when the existing ones fail. This is a maker identity.
4. **Debugging-first thinker**: Work starts with "something breaking." This is a specific worldview.
5. **Young and hungry**: 22, looking for internship, willing to relocate. Confident but not arrogant.
6. **Cross-disciplinary**: Piano -> math/physics -> audio -> ML -> game dev. Unusual range.

### How the PAGE DESIGN could reflect these traits:

- **Practical/tool-builder**: The page itself could feel like a tool -- interactive elements, functional animations (not decorative), showing data not just describing it. Think: dashboard aesthetic, not magazine aesthetic.
- **Direct communicator**: Short content blocks, not paragraphs. Cards, not essays. Scannable, not readable.
- **Debugging-first**: What if the page design reveals information progressively, like debugging? Console-style logs, expandable details, "inspect element" metaphors.
- **Cross-disciplinary range**: Different visual treatments for different life chapters. Piano section looks different from code section looks different from game section. The layout itself *shifts* as the story moves through disciplines.
- **Young/confident**: Bold layout choices. Not playing it safe with a blog template. Full-bleed sections, asymmetric grids, unexpected interactions.

---

## Key Takeaway

**The content is genuinely good. The presentation actively undermines it.** Igor's voice is direct, specific, and memorable. But the page wraps it in the most generic possible layout: narrow centered column, paragraphs, left-border quote, education list, CTA buttons. A hiring person scanning this page will subconsciously pattern-match it to the thousand other portfolio About pages they've seen, even though the *words* are better than most.

The redesign should make the **form match the content**. If Igor is a tool-builder who automates boring things, his About page should not look like the boring thing he'd automate away.
