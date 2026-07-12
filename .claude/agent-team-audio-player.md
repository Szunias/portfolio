# 🎛️ Claude Code Agent Teams – Audio Player Redesign

> Kompletna przebudowa audio playera — od researchu najlepszych playerów, przez design, po implementację.
> Aktualny problem: progress bar ciężko klikać, brak drag-to-scrub, UX na mobile słaby.

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to completely redesign the audio player component. The current player has critical UX problems: the progress bar is nearly impossible to click/scrub, there's no drag interaction, and the overall experience is below professional standards.

## Project Context
- Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion
- The audio player is a fixed bottom bar (72px height) visible across all pages
- Audio logic lives in src/context/AudioContext.tsx (HTMLAudioElement, split contexts for controls vs progress)
- Player UI lives in src/components/features/AudioPlayer.tsx
- Track cards and the Music page trigger playback via useAudio() hook
- i18next translations used for all button labels
- Player shows: album art, track title, mini visualizer, time, play/pause/prev/next, progress bar, volume, close

## Current UX Problems (identified from code audit)
1. **Progress bar is 1px tall** (h-1) at the very top edge of the player – almost invisible
2. **Hover expands to 2px** (h-2) – still tiny, requires pixel-perfect mouse placement
3. **Invisible hit area is only ±2px** (-top-2 -bottom-2) – total 5px touch target, way below 44px minimum
4. **No drag-to-scrub** – only click-to-seek. Users expect to click AND drag to scrub through audio
5. **No buffering indicator** – no visual feedback when audio is loading/buffering
6. **Volume slider is 8px tall** (h-2, hover h-3) – extremely hard to target on mobile
7. **Volume slider has no drag** – same problem as progress bar, click-only
8. **No touch events** – mobile users can't drag/scrub at all (onClick only, no onTouchStart/Move/End)
9. **Handle appears only on hover** (w-0 → group-hover:w-4) – no persistent scrub handle
10. **Mini visualizer bars** are tiny (2px wide, 10-12px tall) – barely visible
11. **Close button too small** on mobile – 16px icon in a p-1 container
12. **No keyboard controls** – can't use arrow keys to seek ±5s or ±10s

## Team – 3 Agents

### Agent 1: "AUDIO UX RESEARCHER" – Research Best-In-Class Audio Players
Priority: FIRST – runs before anyone implements

Task:
1. **Study the best web-based audio players** using WebFetch:
   - Spotify Web Player (open.spotify.com) – layout, scrubber, volume slider, mobile behavior
   - SoundCloud player – waveform scrubber, inline players, mini player
   - Apple Music web player – minimalist design, premium feel
   - Bandcamp player – audio-focused, artist portfolio context
   - YouTube Music – progress bar behavior, keyboard shortcuts
   - Tidal web player – HiFi positioning, clean UI

2. **Study audio player UI patterns in game audio portfolios**:
   - How do audio designers present playable audio on their sites?
   - What makes recruiters actually LISTEN to samples?
   - Should the player be prominent or minimal?

3. **Research scrubber/slider UX best practices**:
   - What is the minimum touch target for scrubbing? (Apple says 44px, Google says 48dp)
   - How do the best players handle drag-to-scrub? (mousedown + mousemove + mouseup)
   - How do they handle touch scrubbing on mobile?
   - Buffered/loaded range display patterns
   - Keyboard shortcuts: Space (play/pause), Arrow keys (seek), M (mute)

4. **Research mobile audio player patterns**:
   - iOS Control Center player layout
   - Android notification player layout
   - How web audio players adapt to <400px width
   - Bottom sheet / expanded player patterns

5. **Produce Research Brief**: .claude/teams/audio-player-research.md
   - Top 5 UX patterns every good audio player has
   - Top 5 anti-patterns to avoid
   - Recommended scrubber implementation (events, touch, accessibility)
   - Mobile-first layout recommendations
   - Keyboard shortcut spec

Rules:
- Focus on what makes users WANT to interact with the player
- This is an audio designer's portfolio – the player is his PRODUCT showcase
- Consider: they might be showing this to a hiring manager – it must feel professional


### Agent 2: "PLAYER DESIGNER" – Design & Implement New Player UI
Depends on: AUDIO UX RESEARCHER (must read research brief first)
Files: src/components/features/AudioPlayer.tsx

Task:
1. **Read the Research Brief from Agent 1**
2. **Redesign the player layout** based on research:
   - The player should feel like a PROFESSIONAL media player, not a browser add-on
   - Fixed bottom position stays (72px or adjust based on research)
   - Add `backdrop-blur-xl` if not already present (it is)
   - Add `safe-area-inset-bottom` padding for notched phones (already there)

3. **Rebuild the progress bar / scrubber** – THIS IS THE #1 PRIORITY:
   - **Position**: move from top edge to a more accessible position OR make much taller
   - **Height**: minimum 4px idle, 8px on hover/touch, with a 44px invisible hit area
   - **Persistent handle**: show a small circle handle (8px idle, 16px on hover) at the current position, ALWAYS visible
   - **Drag-to-scrub**: implement full mousedown → mousemove → mouseup scrubbing:
     ```
     - onMouseDown on the bar: start scrubbing, seek to click position
     - onMouseMove on document: continue seeking as mouse moves (even outside bar)
     - onMouseUp on document: stop scrubbing
     - Same for touch: onTouchStart, onTouchMove, onTouchEnd
     ```
   - **Buffered range**: show loaded/buffered portion as a lighter color behind the progress
   - **Time tooltip**: on hover over the progress bar, show a small tooltip with the time at that position
   - **Smooth animation**: use CSS transitions for the fill, but disable during active scrubbing for direct response

4. **Rebuild the volume slider**:
   - Same drag interaction as progress bar (mousedown/move/up + touch events)
   - Minimum 40px wide, 6px tall idle, 10px on hover
   - Persistent handle (always visible, enlarges on hover)
   - On mobile: consider a vertical popup slider on speaker icon tap

5. **Improve controls layout**:
   - Play/pause button: keep the current large circle, it's good
   - Prev/next: ensure 44px minimum touch targets on mobile
   - Close button: make it 44px touch target, consider moving to corner
   - Album art: keep current size, add subtle shadow

6. **Add keyboard controls**:
   - Space: play/pause (when player is focused)
   - ArrowLeft: seek -5 seconds
   - ArrowRight: seek +5 seconds
   - ArrowUp: volume up 10%
   - ArrowDown: volume down 10%
   - M: toggle mute
   - Only active when no input/textarea is focused

7. **Mobile optimizations** (< 640px):
   - Simplify to: album art + title + play/pause + progress bar
   - Hide volume (use device volume instead)
   - Hide prev/next (or make very compact)
   - Ensure progress bar is scrubable via touch with 48px hit area
   - Consider: tap on album art to expand to full mini-player view

8. **Implement all accessibility**:
   - `role="slider"` on progress bar and volume
   - `aria-valuemin`, `aria-valuemax`, `aria-valuenow` for both sliders
   - `aria-label` on ALL buttons
   - Focus-visible styles for keyboard navigation
   - Screen reader announcements for track changes

Rules:
- The player must FEEL professional – like Spotify/SoundCloud quality
- Scrubbing must be SMOOTH – no jumping, no lag, instant response
- Every interactive element: minimum 44px touch target
- Test at 375px (mobile) and 1440px (desktop)
- Do NOT change AudioContext.tsx logic – only the player UI component


### Agent 3: "PLAYER QA" – Test & Verify Player
Depends on: PLAYER DESIGNER (after implementation is done)

Task:
1. **Functional testing**:
   - Play/pause works correctly
   - Next/prev track cycles through playlist
   - Scrubbing works via mouse click, mouse drag, touch tap, touch drag
   - Volume slider works via click, drag, and touch
   - Keyboard shortcuts all work (Space, arrows, M)
   - Mute/unmute preserves previous volume
   - Close button stops playback and hides player
   - Track end auto-advances to next track

2. **Visual testing at all breakpoints**:
   - 375px: minimal layout, everything accessible
   - 768px: full layout starts appearing
   - 1440px: full desktop layout with all controls
   - Progress bar handle visible at all sizes
   - No overflow or clipping at any size

3. **Edge case testing**:
   - Scrub while audio is loading (duration = 0)
   - Rapid play/pause clicks
   - Click progress bar at 0% and 100%
   - Volume to 0, then unmute
   - Switch tracks while scrubbing
   - Resize window while player is open
   - Navigate to different page while playing

4. **Performance check**:
   - No layout shifts during scrubbing
   - Smooth 60fps scrubber animation
   - No excessive re-renders (check with React DevTools concept)
   - `npm run build` passes

5. **Accessibility check**:
   - Tab to player controls
   - Use keyboard to control playback
   - Screen reader announces track info
   - All interactive elements have labels

6. **Produce final report**: .claude/teams/audio-player-report.md

Rules:
- If ANY issue is found, send PLAYER DESIGNER back to fix it
- The player must feel as good as Spotify's web player
- Build must pass after all changes


## Execution Order

```
Phase 1: AUDIO UX RESEARCHER → research brief
Phase 2: PLAYER DESIGNER → reads brief, designs & implements
Phase 3: PLAYER QA → tests everything
```

## Key Constraint
- Do NOT modify src/context/AudioContext.tsx – the audio logic is fine
- Only modify src/components/features/AudioPlayer.tsx (player UI)
- All translations via t() from 'common' namespace – add new keys as needed
- The player is this portfolio's UNIQUE FEATURE – it must be BEST IN CLASS
```

---

## ⚙️ Jak użyć

```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
cd c:\Users\iszun\Documents\GitHub\igorszuniewicz
claude
# Wklej Master Prompt
```

---

## 📋 Podsumowanie

| Agent | Faza | Rola |
|-------|------|------|
| 🔬 **AUDIO UX RESEARCHER** | 1 | Bada Spotify, SoundCloud, Apple Music, best practices scrubberów |
| 🎨 **PLAYER DESIGNER** | 2 | Przebudowuje UI: drag-to-scrub, 44px touch targets, keyboard shortcuts, mobile |
| 🧪 **PLAYER QA** | 3 | Testuje scrubbing, edge cases, responsywność, a11y, wydajność |

**Główne zmiany które zostaną zrobione:**
- Progress bar: z 1px → 4-8px z **drag-to-scrub** + 44px hit area + **persistent handle**
- Volume: z click-only → **drag slider** + touch support
- Mobile: uproszczony layout + touch scrubbing
- **Klawiatura**: Space, strzałki, M
- **Accessibility**: role="slider", aria-value*, focus-visible
