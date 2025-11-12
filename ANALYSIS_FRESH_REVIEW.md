# About.html - Fresh Design & Performance Analysis

## Executive Summary
The about.html page is well-structured with modern design patterns, but there are several impactful improvements possible across visual consistency, performance, UX polish, and mobile responsiveness.

---

## 1. VISUAL INCONSISTENCIES & DESIGN ISSUES

### Issue 1.1: Inconsistent Hover State Feedback
**Problem**: Different components have inconsistent hover feedback:
- Stat cards: `scale(1.05) translateY(-8px)` 
- Bento items: `translateY(-5px)` only
- Hexagons: `scale(1.2) translateY(-8px)`
- Project cards: `translateY(-10px)` only
- Timeline items: `scale(1.05)` only

**Impact**: Creates jarring, uncoordinated feel when interacting with the page.

**Suggestion**: Standardize to `scale(1.05) translateY(-6px)` across all interactive elements for unified motion language.

---

### Issue 1.2: Conflicting Animation Strategies
**Problem**: Stat cards have conflicting animations:
```css
.stat-card:hover {
    animation: none; /* Remove conflicting float animation */
}
```
But there's no `@keyframes float` defined. This suggests leftover code or planned animation that was removed. Cleanup needed.

**Suggestion**: Either implement the float animation for idle state or remove the comment.

---

### Issue 1.3: Hero Section Avatar Animation Doesn't Pause on Hover
**Problem**: The `avatarPulse` animation stops on hover, but other pulsing elements (like timeline dots) continue.

**Current Code**:
```css
.avatar:hover {
    animation: none;
}
```

**Issue**: This creates asymmetrical behavior. The avatar animation completely stops, while other elements continue pulsing (like timeline dots).

**Suggestion**: Use `animation-play-state: paused` instead for consistency, or let it continue softly in the background.

---

### Issue 1.4: Color Inconsistency in Hexagon Hover Effects
**Problem**: All hexagons have identical color classes but nearly identical styling:
```css
.hexagon.color-blue .hexagon-inner {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.5);
}

.hexagon.color-purple .hexagon-inner {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.5);
}

.hexagon.color-green .hexagon-inner {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.5);
}

.hexagon.color-orange .hexagon-inner {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.5);
}
```

**Issue**: The default (non-hover) states are identical for all colors. The color distinction only appears on hover, reducing visual hierarchy at rest.

**Suggestion**: Add subtle background color tints in default state that match the hover color scheme.

---

### Issue 1.5: Section Dividers Not Fully Utilized
**Problem**: The section divider line (`.content-section::before`) is subtle and inconsistent:
```css
.content-section::before {
    background: linear-gradient(...);
}
```

It's hidden for the first section but appears between others. This creates visual rhythm but could be more intentional.

**Suggestion**: Make it more prominent or add vertical rhythm indicators (like subtle connecting nodes).

---

## 2. UNUSED & REDUNDANT CODE

### Issue 2.1: Duplicate Preconnect Links
**Problem**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<!-- ... -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

Preconnect links are defined twice (lines 79-80 and again at 83-84).

**Suggestion**: Remove the duplicate preconnect declarations.

---

### Issue 2.2: Unused CSS Variables Opportunity
**Problem**: The code uses hardcoded color values throughout (e.g., `#60a5fa`, `#a78bfa`, `rgba(15, 23, 42, 0.6)`) instead of CSS variables.

**Impact**: Makes theming/rebranding difficult and code harder to maintain.

**Suggestion**: Define CSS variables:
```css
:root {
    --color-primary: #60a5fa;
    --color-secondary: #a78bfa;
    --color-accent: #ec4899;
    --bg-card: rgba(15, 23, 42, 0.6);
    --border-subtle: rgba(96, 165, 250, 0.15);
    /* ... more */
}
```

---

### Issue 2.3: Redundant Grid Span Classes
**Problem**:
```css
.span-6 {
    grid-column: span 6;
}
.span-4 {
    grid-column: span 4;
}
.span-8 {
    grid-column: span 8;
}
.span-12 {
    grid-column: span 12;
}
```

Only `.span-4` is actually used in the HTML. Others are dead code.

**Suggestion**: Keep only `.span-4` or make the others actually used.

---

### Issue 2.4: Unused Pseudo-Element Gradients
**Problem**: `.stat-card::after` has complex gradient animation but it's never visible because:
1. It's set to `z-index: -1`
2. Opacity starts at 0 and only changes on hover
3. The gradient never appears unless you hover

This looks like an incomplete feature.

**Suggestion**: Either complete the gradient background effect or remove it.

---

## 3. PERFORMANCE BOTTLENECKS

### Issue 3.1: Heavy Filter Effects on Many Elements
**Problem**:
```css
.skills-hexagon-container.dimmed .hexagon {
    opacity: 0.25;
    filter: blur(1px);
}
```

When hovering over a hexagon, ALL hexagons get `blur()` applied. With 20+ hexagons, this is expensive.

**Impact**: Potential jank on lower-end devices during hover.

**Suggestion**: 
- Use `will-change: filter, opacity` on `.hexagon`
- Consider replacing blur with opacity reduction only
- Use `transform: scale(0.98)` instead of blur for dimensional reduction

---

### Issue 3.2: Multiple Intersection Observers
**Problem**: The JavaScript creates separate Intersection Observers for:
1. `.fade-in` elements (scroll reveal)
2. `.lazy-img` (lazy loading)

**Suggestion**: Combine into a single observer that handles both, reducing memory overhead.

---

### Issue 3.3: Staggered Animation Delays with nth-child Selectors
**Problem**:
```css
.hexagon:nth-child(1) { animation-delay: 0.1s; }
.hexagon:nth-child(2) { animation-delay: 0.2s; }
/* ... 6 more rules ... */
```

This creates 8 separate CSS rules. With 4 hexagon categories (32+ hexagons), this approach doesn't scale.

**Suggestion**: Use CSS custom properties or JavaScript to dynamically set delays based on position.

---

### Issue 3.4: Excessive Box-Shadow Effects
**Problem**: Multiple elements have multi-layer shadows:
```css
box-shadow: 0 0 40px rgba(...), 0 0 80px rgba(...), inset 0 0 60px rgba(...);
```

On hover, these apply simultaneously across stat cards, bento items, and hexagons.

**Suggestion**: Reduce to 2-layer shadows where possible. Inset shadows are particularly expensive.

---

### Issue 3.5: Backdrop Filter on Every Card
**Problem**: 
```css
.hexagon-inner {
    backdrop-filter: blur(10px);
}
.hexagon-tooltip {
    backdrop-filter: blur(10px);
}
```

Backdrop filters are GPU-heavy. Every card and tooltip has this.

**Suggestion**: 
- Use backdrop-filter only on critical UI (header already has it)
- Consider removing from cards where there's no element behind to blur
- Use semi-transparent colors instead

---

## 4. MOBILE RESPONSIVENESS ISSUES

### Issue 4.1: Stats Grid Becomes Single Column Too Aggressively
**Problem**:
```css
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
```

On tablets (iPad: 768px), the stats immediately become full-width. A 2-column layout would work better.

**Suggestion**: 
```css
@media (max-width: 900px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
```

---

### Issue 4.2: Hexagon Grid Doesn't Reflow on Mobile
**Problem**: The hexagon grid uses `flex-wrap: wrap` with fixed `width: 130px; height: 150px`, but on mobile (< 480px) this creates:
- Oversized hexagons relative to screen width
- Poor spacing
- Scrolling issues

**Suggestion**: Add responsive sizing:
```css
@media (max-width: 768px) {
    .hexagon {
        width: 110px;
        height: 130px;
    }
}

@media (max-width: 480px) {
    .hexagon {
        width: 100px;
        height: 120px;
    }
}
```

---

### Issue 4.3: Bento Grid Column Spans Collapse Without Refinement
**Problem**:
```css
@media (max-width: 1024px) {
    .span-6, .span-4, .span-8 {
        grid-column: span 12;
    }
}
```

Everything becomes full-width at 1024px. The bento items are small enough to fit 2 columns at tablet sizes.

**Suggestion**: Add intermediate breakpoint:
```css
@media (max-width: 1024px) {
    .span-6 {
        grid-column: span 6;
    }
    .span-4, .span-8, .span-12 {
        grid-column: span 12;
    }
}

@media (max-width: 640px) {
    .span-6, .span-4, .span-8 {
        grid-column: span 12;
    }
}
```

---

### Issue 4.4: Timeline Dot Positioning on Small Screens
**Problem**: The timeline uses `left: 0; transform: translateX(-50%)` on mobile:
```css
@media (max-width: 1024px) {
    .timeline-dot {
        left: 0;
        transform: translateX(-50%);
    }
}
```

This places the dot slightly off-screen on mobile. It should be fully visible.

**Suggestion**: Use `left: -12px` instead of transform for consistent positioning.

---

### Issue 4.5: Font Sizing Not Responsive Enough on Very Small Screens
**Problem**: 
```html
<h1 style="font-size: clamp(2.5rem, 5vw, 4rem)">
```

On 320px screens: `clamp(2.5rem, 16vw, 4rem)` = ~2.5rem still, which is 40px font. That's large for a 320px screen.

**Suggestion**: Adjust clamp values for headings on mobile:
```css
@media (max-width: 480px) {
    .hero h1 {
        font-size: clamp(1.75rem, 6vw, 2.5rem);
    }
    
    .section-title {
        font-size: clamp(1.5rem, 5vw, 2rem);
    }
}
```

---

## 5. MISSING UX FEATURES

### Feature 5.1: No Keyboard Navigation for Hexagons
**Problem**: The hexagons are interactive (hover effects, tooltips) but not keyboard accessible.

**Current Code**:
```html
<div class="hexagon color-blue" data-skill="wwise">
```

No `tabindex`, no `:focus` styles, no keyboard event listeners.

**Suggestion**:
```html
<div class="hexagon color-blue" data-skill="wwise" tabindex="0" role="button">
```

And add CSS:
```css
.hexagon:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 8px;
}

.hexagon:focus-visible .hexagon-tooltip {
    opacity: 1;
    bottom: -60px;
}
```

---

### Feature 5.2: No Active/Current State for Timeline
**Problem**: The timeline shows past events but doesn't highlight the current one (2023-Present DAE).

**Suggestion**: Add a `.current` class and style:
```css
.timeline-item.current .timeline-dot {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #10b981, #34d399);
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
}
```

---

### Feature 5.3: Missing "Read More" or Expand Functionality
**Problem**: Sections like Design Philosophy have descriptions but no interactive depth. Players might want more detail.

**Suggestion**: Add a `<details>` element or "View Details" button:
```html
<div class="bento-item span-6">
    <details>
        <summary>Clarity First</summary>
        <p>Full explanation here...</p>
    </details>
</div>
```

---

### Feature 5.4: No Visual Indication of Scroll Progress
**Problem**: The page is quite long (hero + skills + achievements + timeline + philosophy + CTA), but there's no scroll progress indicator.

**Suggestion**: Add a subtle progress bar:
```css
.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #60a5fa, #a78bfa);
    z-index: 1020;
}
```

And JavaScript:
```javascript
window.addEventListener('scroll', () => {
    const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.querySelector('.scroll-progress').style.width = progress + '%';
});
```

---

### Feature 5.5: No "Back to Top" Button
**Problem**: The page is long. A back-to-top button would improve UX, especially on mobile.

**Suggestion**: Add a floating button that appears after scrolling:
```html
<button id="back-to-top" aria-label="Back to top" style="display: none;">↑</button>
```

---

## 6. COLOR & SPACING INCONSISTENCIES

### Issue 6.1: Inconsistent Border Colors
**Problem**: Different elements use different border opacities:
- Stat cards: `rgba(96, 165, 250, 0.2)` default, `rgba(96, 165, 250, 0.5)` hover
- Bento items: `rgba(96, 165, 250, 0.15)` default, `rgba(96, 165, 250, 0.4)` hover
- Project cards: `rgba(96, 165, 250, 0.15)` default, `rgba(96, 165, 250, 0.5)` hover

The contrast ratios vary significantly, creating visual chaos.

**Suggestion**: Standardize to:
- Default border: `rgba(96, 165, 250, 0.2)`
- Hover border: `rgba(96, 165, 250, 0.5)`

---

### Issue 6.2: Padding Inconsistency Across Cards
**Problem**:
- Stat cards: `padding: 1.5rem`
- Bento items: `padding: 2rem`
- Timeline content: `padding: 2rem`
- Project cards: `padding: 1.5rem`

No consistent rhythm.

**Suggestion**: Establish a card padding scale (1.25rem, 1.5rem, 2rem) and use consistently.

---

### Issue 6.3: Section Spacing Not Uniform
**Problem**: 
- `.content-section`: `padding: 4rem 0`
- `.cta-section`: `padding: 4rem 0`

But the vertical rhythm isn't always consistent due to:
- Different `margin-bottom` on `.section-header` (3rem) vs others
- No consistent gutter between sections

**Suggestion**: Define spacing system:
```css
:root {
    --space-xs: 0.5rem;
    --space-sm: 1rem;
    --space-md: 1.5rem;
    --space-lg: 2rem;
    --space-xl: 3rem;
    --space-2xl: 4rem;
}
```

---

### Issue 6.4: Inconsistent Text Color Hierarchy
**Problem**: Too many text color variations:
- `#e0e6ed` (body)
- `#b0b8c9` (secondary text)
- `#a8b3c1` (category titles)
- `#9ca3af` (navigation)
- `#fff` (headings)

Makes it hard to create visual hierarchy.

**Suggestion**: Simplify to:
- Primary: `#fff`
- Secondary: `#b0b8c9`
- Tertiary: `#9ca3af`

---

## 7. TYPOGRAPHY ISSUES

### Issue 7.1: Heading Font Size Inconsistency
**Problem**:
- Hero h1: `clamp(2.5rem, 5vw, 4rem)`
- Section titles: `2.5rem` (fixed)
- Bento titles: `1.25rem`
- Timeline titles: `1.25rem`

Section titles should use clamp too for better responsiveness.

**Suggestion**:
```css
.section-title {
    font-size: clamp(2rem, 4vw, 2.5rem);
}
```

---

### Issue 7.2: Line Height Not Consistent Across Text
**Problem**:
```css
body {
    line-height: 1.6;
}

.hero-bio {
    line-height: 1.7;
}

.bento-content p {
    line-height: 1.7;
}

.timeline-content p {
    line-height: 1.7;
}
```

Why is `.hero-bio` 1.7 but body is 1.6? Creates inconsistent text rhythm.

**Suggestion**: Use consistent 1.7 line-height for all body text.

---

### Issue 7.3: Letter Spacing Overused
**Problem**: Multiple elements have letter-spacing:
```css
.logo {
    letter-spacing: -0.02em;
}

.hexagon-name {
    letter-spacing: 0.8px;
}

.skills-category-title {
    letter-spacing: 2px;
}
```

Too much variation makes the page feel chaotic.

**Suggestion**: Use letter-spacing only for special elements (uppercase labels), not body text.

---

## 8. ANIMATION TIMING & SMOOTHNESS ISSUES

### Issue 8.1: Inconsistent Animation Durations
**Problem**:
- Hexagon fade-in: `0.6s`
- Hexagon hover: `0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- Bento hover: `0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- Stat card hover: `0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- Avatar pulse: `3s ease-in-out infinite`
- Timeline dot pulse: `2s ease-in-out infinite`

The pulsing animations have different durations, creating visual discord.

**Suggestion**: Standardize to 2.5s for ambient animations, 0.3s for interaction animations.

---

### Issue 8.2: Easing Function Variety
**Problem**: Multiple easing functions used:
- `ease-in-out` (avatar)
- `ease` (hexagon)
- `cubic-bezier(0.4, 0, 0.2, 1)` (most hovers)

**Suggestion**: Standardize to cubic-bezier(0.4, 0, 0.2, 1) for all interactive animations (it's the "Material Design" easing curve).

---

### Issue 8.3: Animation Delays Stack Unnecessarily
**Problem**: Hexagons have 0.1s to 0.8s staggered delays. On subsequent page visits, this delay is annoying (can't see content immediately).

**Suggestion**: Reduce delays to 0.05s-0.4s, or better, only apply on first load.

---

### Issue 8.4: Hover Animation Jank on Stat Cards
**Problem**:
```css
.stat-card:hover::after {
    opacity: 1;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

The `::after` element has an animated background that's invisible (z-index: -1) but still animating. This wastes GPU cycles.

**Suggestion**: Only start the animation when `:hover::after` has `opacity: 1`.

---

## 9. INTERACTIVE ELEMENT IMPROVEMENTS

### Issue 9.1: Hexagon Tooltip Positioning Issues
**Problem**: 
```css
.hexagon-tooltip {
    position: absolute;
    bottom: -70px;
    left: 50%;
    transform: translateX(-50%);
}
```

On the bottom hexagons in a category, the tooltip goes off-screen.

**Suggestion**: Use JavaScript to detect if tooltip would go off-screen and flip to top:
```javascript
const hex = event.target.closest('.hexagon');
const tooltip = hex.querySelector('.hexagon-tooltip');
const rect = tooltip.getBoundingClientRect();
if (rect.bottom > window.innerHeight) {
    tooltip.style.top = '-70px';
    tooltip.style.bottom = 'auto';
}
```

---

### Issue 9.2: Project Cards Have No Hover State for Image
**Problem**:
```css
.project-card:hover .project-image {
    transform: scale(1.1);
}
```

This is nice, but the image doesn't have overflow hidden, so the scaling can break the card appearance.

**Suggestion**: Ensure `.project-image` has proper clipping:
```css
.project-image {
    overflow: hidden;
}
```

---

### Issue 9.3: Timeline Items Have Scale Transform But No Overflow Handling
**Problem**:
```css
.timeline-content:hover {
    transform: scale(1.05);
}
```

When scaled, the content could overlap adjacent elements. The `.timeline-item` doesn't have `z-index` or `overflow` handling.

**Suggestion**:
```css
.timeline-item {
    position: relative;
    z-index: 1;
}

.timeline-item:hover {
    z-index: 10;
}
```

---

### Issue 9.4: CTA Buttons Don't Have Enough Visual Differentiation
**Problem**:
```css
.cta-btn.primary {
    background: linear-gradient(135deg, #10b981, #059669);
}

.cta-btn.secondary {
    background: transparent;
    border: 2px solid rgba(96, 165, 250, 0.3);
}
```

The secondary button is hard to see. Weak visual hierarchy.

**Suggestion**: Make secondary button more prominent:
```css
.cta-btn.secondary {
    background: rgba(96, 165, 250, 0.15);
    border: 2px solid rgba(96, 165, 250, 0.5);
}
```

---

## 10. MISSING POLISH DETAILS

### Detail 10.1: No Scroll Smooth Behavior Explicitly Set for iOS
**Problem**:
```css
html {
    scroll-behavior: smooth;
}
```

This works on most browsers but not consistently on iOS Safari.

**Suggestion**: Add `-webkit-overflow-scrolling: touch;` on scrollable containers.

---

### Detail 10.2: Missing Loading State for Images
**Problem**: The avatar uses lazy loading with `data-src`, but there's no placeholder or loading skeleton.

**Suggestion**: Add a blur-up effect:
```html
<img 
    src="data:image/svg+xml,%3Csvg..." 
    data-src="cv/pieknyportret_square.png"
    class="avatar lazy-img"
/>
```

Or use a gradient placeholder:
```css
.avatar {
    background: linear-gradient(90deg, rgba(...) 25%, rgba(...) 50%, rgba(...) 75%);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}
```

---

### Detail 10.3: No Focus Visible States for Navigation
**Problem**: The page has `.stat-card:focus-visible` etc., but the main navigation links don't have clear focus indicators.

**Suggestion**: Add to navigation CSS:
```css
.nav-links a:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 4px;
}
```

---

### Detail 10.4: Missing Micro-Interactions for Form-like Elements
**Problem**: The skills hexagons are interactive but have no click feedback. They don't indicate they're clickable (no cursor pointer, no state changes).

**Suggestion**:
```css
.hexagon {
    cursor: pointer;
}

.hexagon:active {
    transform: scale(1.1);
}
```

---

### Detail 10.5: No Toast/Notification System for CTA Actions
**Problem**: The "Get in Touch" button links to contact.html, but there's no feedback indicating the action was taken.

**Suggestion**: Prevent default and show a toast:
```javascript
document.querySelector('.cta-btn.primary').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Redirecting to contact form...');
    setTimeout(() => location.href = 'contact.html', 500);
});
```

---

### Detail 10.6: No Icon Fallbacks for SVGs
**Problem**: The Blueprints skill uses an SVG, but if it fails to load, there's no fallback.

**Suggestion**: Add `<img>` fallback:
```html
<svg>... SVG code ...</svg>
<img src="honeyicons/blueprints.png" alt="Blueprints" class="hexagon-icon" style="display: none;" />
```

---

### Detail 10.7: Missing Touch Event Handling
**Problem**: Hover effects are applied via CSS, but on touch devices:
- Long-press might be needed to see tooltips
- Touch hover states stick until another element is touched

**Suggestion**: Add touch event handling:
```javascript
if (window.matchMedia("(hover: none)").matches) {
    // Touch device - adjust interactions
    document.querySelectorAll('.hexagon').forEach(hex => {
        hex.addEventListener('touchstart', () => {
            hex.classList.add('active');
        });
    });
}
```

---

### Detail 10.8: No Accessibility Arialabels for Interactive Icons
**Problem**: Hexagons and bento icons are SVGs without descriptive labels.

**Suggestion**:
```html
<div class="bento-icon" aria-label="Bachelor Thesis achievement">
    <svg>...</svg>
</div>
```

---

### Detail 10.9: No Reduced Data Mode Support
**Problem**: Users on slow connections see 3-4 gradient backgrounds and heavy animations.

**Suggestion**: Add media query:
```css
@media (prefers-reduced-data: reduce) {
    .bg-gradient::before {
        display: none;
    }
    
    img {
        image-rendering: pixelated;
    }
}
```

---

### Detail 10.10: Missing Breadcrumb Navigation
**Problem**: The about page has no breadcrumb. If someone lands here via search/link, they don't know the site structure.

**Suggestion**: Add breadcrumb:
```html
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><span>About</span></li>
    </ol>
</nav>
```

---

## SUMMARY TABLE

| Category | Issue Count | Severity | Priority |
|----------|-----------|----------|----------|
| Visual Consistency | 5 | Medium | High |
| Unused Code | 4 | Low | Medium |
| Performance | 5 | Medium | High |
| Mobile Responsive | 5 | Medium | High |
| Missing UX Features | 5 | Low | Medium |
| Color/Spacing | 4 | Low | High |
| Typography | 3 | Low | Medium |
| Animations | 4 | Low | Medium |
| Interactive Elements | 4 | Low | Medium |
| Polish Details | 10 | Low | Low |

---

## QUICK WINS (Implement First)

1. **Remove duplicate preconnect links** (2 lines removed)
2. **Standardize hover transforms** across all cards (10 min refactor)
3. **Add CSS variables** for colors and spacing (20 min refactor)
4. **Fix stats grid on tablets** (5 min responsive update)
5. **Make hexagons keyboard accessible** (10 min JavaScript)
6. **Standardize animation durations** (5 min CSS refactor)
7. **Add scroll progress bar** (10 min JavaScript)
8. **Fix hexagon tooltip overflow** (15 min JavaScript)
9. **Add focus-visible states** to all interactive elements (5 min CSS)
10. **Remove or complete `.stat-card::after` gradient** (5 min)

---

## MEDIUM EFFORT IMPROVEMENTS

1. Combine Intersection Observers (10 min JavaScript)
2. Add responsive hexagon sizing (10 min CSS)
3. Implement "Back to Top" button (15 min HTML/JS)
4. Add details/expand functionality to Philosophy section (20 min)
5. Improve hexagon color differentiation (15 min CSS)
6. Add shimmer loading effect for avatar (15 min CSS/HTML)

---

## STRATEGIC IMPROVEMENTS (High Impact)

1. Establish design system (CSS variables, spacing scale)
2. Create accessibility audit checklist
3. Implement dark/light theme toggle
4. Add analytics/engagement tracking
5. Create component library for reuse

