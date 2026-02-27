# Loading / Intro Animation Research

Research document for Igor Szuniewicz's game audio designer portfolio.
Stack: React + TypeScript + Vite + Tailwind CSS + framer-motion.

---

## 1. Current Implementation Analysis

### IntroAnimation.tsx (src/components/ui/IntroAnimation.tsx)
- Full-screen overlay (z-9999, bg-surface) that shows the name "Igor Szuniewicz" in `font-display` (Space Grotesk).
- Fades in over 500ms (200ms delay), then fades out at 2200ms, completes at 2800ms.
- Uses `useReducedMotion()` from framer-motion -- immediately calls `onComplete()` if reduced motion is enabled. Good accessibility baseline.
- Shown once per session (`sessionStorage` check in App.tsx).
- **Weaknesses**: Generic fade-in of plain text. Nothing audio/sound-themed. No visual hook. The 2.8s total duration is on the long side for just showing a name.

### PageLoader.tsx (src/components/ui/PageLoader.tsx)
- 5-bar waveform animation (CSS keyframes via Tailwind) with "Loading" text.
- Bars use `scaleY` oscillation at 1.2s cycle with staggered delays -- good audio-themed visual.
- Uses `role="status"` and `aria-label="Loading"` -- good a11y.
- **Weaknesses**: Only used as a standalone component, not as the Suspense fallback (App.tsx uses a simple pulsing dot for Suspense). Hardcoded "Loading" text (noted in MEMORY.md).

### Suspense fallback (App.tsx line 69-71)
- Minimal pulsing green dot. Functional but visually disconnected from the waveform PageLoader.

---

## 2. Best Practices for Portfolio Loading Animations

### What Makes Them Memorable (Not Annoying)

1. **Short duration**: UX research (NN/Group) recommends motion under 1 second for interface transitions. Intro animations should not exceed 2-3 seconds total, and ideally 1.5-2s. Every second erodes first-impression goodwill.

2. **Sense of progress**: Indeterminate spinners are the worst performers in perceived-speed studies. Skeleton screens outperform spinners; sequential reveals outperform static screens. The key is communicating "something is happening."

3. **Brand reinforcement**: The animation should feel like an extension of the brand, not a generic gate. For a game audio designer, audio-themed visuals (waveforms, frequencies, equalizer bars) are a natural fit.

4. **Purposeful, not decorative**: The best intro animations either mask a genuine load (lazy chunks, fonts, images) or establish a visual tone. An animation that runs after content is already loaded feels like wasted time.

5. **One-and-done**: Show the intro once per session. Repeat visitors should not be forced through it again. (Current implementation already does this via sessionStorage.)

6. **Smooth exit**: The transition from intro to content should feel seamless -- not a hard cut. Clip-path reveals, opacity cross-fades, or coordinated slide-outs create continuity.

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails |
|---|---|
| Duration > 3s for an intro | Feels like a gate; users bounce |
| Looping indeterminate spinners | No progress signal; anxiety-inducing |
| Heavy JS/canvas animations blocking main thread | Causes jank; defeats the purpose |
| Animations that replay on every page load | Annoying on repeat visits |
| Skeleton screens for sub-1s loads | Flash of skeleton is more jarring than no skeleton |
| Complex animations without reduced-motion fallback | Excludes users with vestibular disorders |
| Decorative-only animation with no brand tie-in | Feels generic, templated, "AI-slop" |
| Auto-playing audio during loading | Never. Violates browser autoplay policies and is hostile UX |

---

## 3. Accessibility Requirements

### WCAG Compliance

- **2.2.2 Pause, Stop, Hide**: Auto-playing animations lasting > 5 seconds must have pause/stop/hide controls. Intro animations under 5s are exempt but should still respect reduced motion.
- **2.3.1 Three Flashes or Below Threshold**: No more than 3 flashes per second.
- **2.3.3 Animation from Interactions**: Motion triggered by interactions must be disableable via `prefers-reduced-motion`.

### Implementation Requirements

1. **`prefers-reduced-motion` detection**: Already using framer-motion's `useReducedMotion()`. When true, skip animations entirely or reduce to opacity-only fade.
2. **ARIA attributes**: `role="status"` and `aria-label` on loading indicators (PageLoader already does this).
3. **No auto-playing audio**: Even for an audio designer portfolio, loading animations must be silent. Sound should only play on user interaction.
4. **Focus management**: After intro completes, focus should return to the document naturally. Avoid trapping focus in the intro overlay.
5. **Skip mechanism**: Consider a "Skip" button or keyboard shortcut (Escape) to bypass the intro, especially if duration exceeds 2s.

### framer-motion Accessibility Pattern

```tsx
import { useReducedMotion } from 'framer-motion';

const IntroAnimation = ({ onComplete }) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete(); // Skip immediately
      return;
    }
    // Normal animation timers...
  }, [onComplete, shouldReduceMotion]);

  // ...
};
```

The current IntroAnimation.tsx already implements this pattern correctly.

---

## 4. Performance Considerations

### Technology Comparison

| Approach | Performance | Complexity | Bundle Size | Best For |
|---|---|---|---|---|
| **CSS-only (keyframes/transitions)** | Excellent. Runs on compositor thread. Zero JS overhead. | Low | 0 KB | Simple looping animations (waveform bars, pulses) |
| **framer-motion** | Very good. Uses Web Animations API + JS fallback. 120fps capable. | Medium | ~30KB (already in bundle) | Orchestrated sequences, spring physics, layout animations |
| **SVG + CSS/framer-motion** | Good. Lightweight, scalable, crisp at any size. | Medium | Tiny (inline SVG) | Path drawing, waveform shapes, frequency visualizations |
| **Canvas / WebGL** | Variable. Can be excellent or terrible depending on implementation. | High | Variable | Particle effects, generative art, 3D |
| **Lottie (lottie-react)** | Good for complex pre-made animations. | Low (designer exports, dev imports) | ~50KB library + JSON per animation | Complex pre-designed animations |
| **GSAP** | Excellent. Industry standard for complex timelines. | High | ~30KB | Complex multi-element orchestrations |

### Recommendation for This Project

**Use framer-motion + CSS keyframes (already in bundle).**

Rationale:
- framer-motion is already a dependency (~30KB already paid).
- No additional library needed.
- CSS keyframes handle the simple looping animations (waveform bars) efficiently on the compositor thread.
- framer-motion handles orchestrated sequences (stagger, spring, exit animations).
- SVG elements can be animated with `motion.path`, `motion.line`, etc. for waveform drawing effects.
- Adding Lottie or GSAP would increase bundle size for marginal benefit.

### Performance Tips

1. Use `transform` and `opacity` only -- these are composited properties that avoid layout/paint.
2. Avoid animating `width`, `height`, `top`, `left` -- use `transform: translate/scale` instead.
3. Use `will-change: transform` sparingly for elements that will animate.
4. Keep SVG complexity low (under 50 path points for waveforms).
5. Prefer CSS `@keyframes` for infinite looping animations (PageLoader bars).
6. Use framer-motion's `AnimatePresence` for mount/unmount transitions.

---

## 5. Concept Proposals

### Concept A: "Signal Check" -- Waveform Line Draw

**Description**: A single horizontal audio waveform line draws itself across the screen (left to right) like an oscilloscope trace, then morphs into or reveals the name "Igor Szuniewicz". The waveform has the characteristic jagged peaks of audio data, not a smooth sine wave.

**Visual flow**:
1. Dark screen (bg-surface).
2. A thin accent-colored (#2dd4a8) SVG path draws itself L-to-R (800ms) -- looks like an audio waveform snippet.
3. The waveform pauses briefly, then the name fades in below/overlapping it (400ms).
4. Everything fades out together or slides up to reveal content (400ms).
5. Total duration: ~1.8s.

**Implementation**: SVG `<path>` with `pathLength` animation via framer-motion's `motion.path`. The waveform shape is a hand-crafted SVG path with audio-like peaks and valleys.

**Pros**:
- Strongly audio-themed without being literal.
- Lightweight (single SVG path + framer-motion).
- Elegant and minimal -- fits the dark, modern aesthetic.
- Easy to make responsive (SVG viewBox scales).

**Cons**:
- The waveform shape is static (not reactive to actual audio).
- SVG path drawing is a well-known technique -- not entirely novel.

---

### Concept B: "Equalizer Bars" -- Staggered Bar Reveal

**Description**: 7-9 vertical bars (like an equalizer/spectrum analyzer) animate in sequence, growing from the center. They pulse once or twice, then compress together and transform into a horizontal line/divider, above which the name appears.

**Visual flow**:
1. Dark screen.
2. Bars appear one by one from center outward, each growing to a random height (stagger: 60ms).
3. Bars pulse rhythmically for one cycle (~600ms).
4. Bars compress to equal height, forming a single line (300ms).
5. Name and optional subtitle fade in above the line (300ms).
6. Whole composition fades out (300ms).
7. Total duration: ~2.0s.

**Implementation**: Array of `motion.div` bars with `staggerChildren` variants. Uses `scaleY` transforms. Built on the existing waveform-bar keyframe aesthetic in Tailwind config.

**Pros**:
- Directly extends the existing PageLoader visual language (consistency).
- Very lightweight (DOM elements, no SVG/canvas needed).
- Strong audio identity (equalizer is universally recognized).
- Easy to implement with framer-motion's `staggerChildren`.

**Cons**:
- Equalizer bars are a common trope -- risk of looking generic if not executed with finesse.
- The morphing transition (bars to line) adds implementation complexity.

---

### Concept C: "Frequency Sweep" -- Radial Waveform Burst

**Description**: Concentric rings of varying opacity and thickness expand outward from the center (like a sonar ping or speaker cone vibration), then collapse back to a point where the name appears.

**Visual flow**:
1. Dark screen.
2. A small point at center pulses.
3. 3-4 concentric rings expand outward with staggered timing and varying opacity (like sound propagating).
4. Rings reach max radius and fade (800ms total).
5. Name appears at center with a subtle scale-up (400ms).
6. Fade-out transition (400ms).
7. Total duration: ~1.8s.

**Implementation**: SVG `<circle>` elements or `motion.div` with `border-radius: 50%` and `scale` animations. Uses framer-motion `variants` with `staggerChildren`.

**Pros**:
- Unique among portfolio intros -- not the standard bar/waveform.
- Strong metaphor (sound radiating from a source).
- Very performant (only transform + opacity on a few elements).
- Visually striking on the dark background.

**Cons**:
- More abstract -- may not immediately read as "audio" to all viewers.
- The sonar/radar metaphor could be misread as navigation/tech rather than audio.

---

### Concept D: "Tape Head" -- Horizontal Scan Line

**Description**: A thin horizontal line (like a tape head or playback cursor) scans from left to right across the screen. As it passes, content is revealed behind it -- first a subtle background texture/gradient, then the name and a tagline. This mirrors the concept of a DAW playhead scanning through audio.

**Visual flow**:
1. Dark screen.
2. A thin vertical accent-colored line appears at the left edge.
3. The line sweeps smoothly to the right (1s, ease-out).
4. As it passes, the content behind it is revealed (clip-path or mask animation).
5. Name and subtitle are revealed as the line passes over them.
6. Line reaches the right edge and fades.
7. Total duration: ~1.5s.

**Implementation**: A `motion.div` with `translateX` animation, combined with a CSS `clip-path` or mask on the content container. The `vu-sweep` keyframe already in Tailwind config is conceptually similar.

**Pros**:
- Directly references DAW/audio production workflow (playhead).
- Creates a satisfying reveal effect.
- Very fast (1.5s total) -- respects user time.
- Uses only transforms and clip-path -- highly performant.

**Cons**:
- The playhead metaphor may be too subtle for non-audio people.
- `clip-path` animations can be tricky across browsers (but well-supported now).
- Less visually "impressive" than other concepts -- relies on elegance over spectacle.

---

### Concept E: "Sound Pulse" -- Minimalist Typography with Audio Accent

**Description**: The name "Igor Szuniewicz" appears with a staggered character-by-character reveal, accompanied by a small waveform or equalizer accent below it. The text reveal feels like audio samples being laid down one by one. After the name is complete, a subtle pulse wave ripples out and the scene transitions.

**Visual flow**:
1. Dark screen.
2. Name characters appear one by one (stagger: 30ms per char, ~600ms total).
3. A small 3-bar equalizer animation plays below the name for one cycle (~600ms).
4. A single outward pulse (thin ring expanding from center, 300ms).
5. Fade out (300ms).
6. Total duration: ~1.8s.

**Implementation**: Map over name string, wrap each char in `motion.span` with `staggerChildren`. Small equalizer uses existing waveform-bar keyframes. Pulse is a single `motion.div` with scale + opacity.

**Pros**:
- Combines typography with audio visual -- best of both worlds.
- The character-by-character reveal has a rhythmic, sample-like quality.
- Uses existing waveform keyframes (consistency with PageLoader).
- Lightweight and fast.

**Cons**:
- Per-character animation can feel "typewriter cliche" if timing is wrong.
- Needs careful kerning/spacing to avoid jank as characters appear.

---

## 6. Technical Implementation Recommendations

### Recommended Architecture

```
IntroAnimation.tsx
  |-- Full-screen overlay (motion.div, z-9999)
  |-- Animation content (SVG or DOM elements)
  |-- AnimatePresence for exit transition
  |-- useReducedMotion() check -> skip if true
  |-- onComplete callback -> App.tsx removes from DOM
  |-- Optional: Escape key / click to skip

PageLoader.tsx (for route transitions)
  |-- Keep existing waveform bar design (good audio theming)
  |-- Add prefers-reduced-motion: show static state
  |-- Use as Suspense fallback (replace current pulsing dot)
```

### Key Implementation Details

1. **Use `AnimatePresence` for exit**: Wrap IntroAnimation in `AnimatePresence` in App.tsx so the exit animation is handled cleanly.

2. **Coordinate with Suspense**: The intro can mask the initial lazy-load of the Home page. Start loading the Home chunk while the intro plays, so by the time the intro completes, the page is ready.

3. **Skip mechanism**: Add `onKeyDown` listener for Escape and optional click-to-skip. This improves UX for repeat visitors who clear sessionStorage or use incognito.

4. **Keep PageLoader for route transitions**: Unify the Suspense fallback with PageLoader instead of the current pulsing dot. This creates a consistent visual language across all loading states.

5. **CSS keyframes for infinite loops, framer-motion for orchestrated sequences**: The waveform bars in PageLoader should stay as CSS keyframes (already are). The intro animation sequence should use framer-motion for precise orchestration.

### Skeleton Code (Concept A - Waveform Line Draw)

```tsx
import { useEffect, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

// A simplified audio waveform SVG path
const WAVEFORM_PATH = "M0,50 L10,30 L20,60 L30,20 L40,70 L50,10 L60,80 L70,25 ...";

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const shouldReduceMotion = useReducedMotion();

  const handleSkip = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    const timer = setTimeout(onComplete, 1800);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onComplete, shouldReduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-surface flex items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={handleSkip}
      role="status"
      aria-label="Loading"
    >
      {/* Waveform SVG */}
      <svg viewBox="0 0 200 100" className="w-64 md:w-96">
        <motion.path
          d={WAVEFORM_PATH}
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </svg>

      {/* Name */}
      <motion.h1
        className="absolute font-display text-4xl md:text-5xl text-text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        Igor Szuniewicz
      </motion.h1>
    </motion.div>
  );
};
```

---

## 7. Recommended Approach

### Primary Recommendation: Concept A ("Signal Check" -- Waveform Line Draw)

**Justification**:

1. **Audio identity**: The waveform is the most universally recognized audio visual. It immediately communicates "this person works with sound" without being cliche (unlike a generic equalizer).

2. **Technical elegance**: SVG path drawing with framer-motion is well-supported, performant, and requires zero additional dependencies. It uses only `transform` and `opacity` -- fully composited.

3. **Duration**: At ~1.8s, it respects the user's time while still making an impression. Short enough that a skip button is a nice-to-have rather than a necessity.

4. **Consistency**: The waveform theme connects with the existing PageLoader's waveform bars, creating a coherent audio visual language throughout the site.

5. **Differentiation**: Path drawing animations are less common in portfolio intros than text fades or bar animations, giving it a distinctive feel without being distractingly complex.

6. **Anti-AI-slop**: The animation feels intentional and domain-specific rather than a generic template effect. It communicates design thinking, not just "I added an animation."

### Secondary Recommendation: Concept D ("Tape Head" -- Horizontal Scan Line)

If a more minimal/faster approach is preferred, the tape head concept at ~1.5s is even more restrained while still carrying audio production metaphor.

### For PageLoader (Route Transitions)

Keep the existing 5-bar waveform design. It is already well-themed, accessible, and performant. The only changes needed:
- Add `prefers-reduced-motion` support (show static bars or no animation).
- Use it as the Suspense fallback in App.tsx instead of the pulsing dot, for visual consistency.

---

## 8. Sources

- [NN/Group: Animation Duration and Motion Characteristics](https://www.nngroup.com/articles/animation-duration/)
- [NN/Group: Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/)
- [W3C WCAG 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)
- [W3C WCAG 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Pope Tech: Accessible Animation and Movement](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)
- [Motion (framer-motion): Accessibility Guide](https://motion.dev/docs/react-accessibility)
- [Motion: useReducedMotion Hook](https://www.framer.com/motion/use-reduced-motion/)
- [framer-motion vs CSS Animation Comparison](https://tillitsdone.com/blogs/framer-motion-vs-css-in-react/)
- [LottieFiles: Audio & Waveform Animations](https://lottiefiles.com/categories/audio)
- [Wavesurfer.js: Audio Waveform Library](https://wavesurfer.xyz/)
- [Muzli: Top 100 Creative Portfolio Websites 2025](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [Awwwards: Best Portfolio Websites](https://www.awwwards.com/websites/portfolio/)
- [Boldist: Loading Spinner UX](https://boldist.co/usability/loading-spinner-ux-killer/)
- [GitHub Gist: Web Animation Best Practices](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838)
