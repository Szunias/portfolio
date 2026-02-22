# 🐛 Claude Code Agent Teams – Bug Hunting & Error Fixing

> **Prompt do wklejenia w Claude Code**, żeby odpalić drużynę agentów do znajdowania i naprawiania bugów, niedopatrzeń, edge case'ów i potencjalnych problemów.
> Skopiuj cały blok poniżej i wklej jako prompt w Claude Code (z włączonym Agent Teams).

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to perform a comprehensive bug hunt, error fix, and correctness pass across the entire codebase. Every potential bug, edge case, race condition, memory leak, and oversight must be found and fixed.

## Project Context
- Vite + React 18 + TypeScript (strict mode) + Tailwind CSS 3 + Framer Motion
- i18next for internationalization (3 languages: en, pl, nl)
- EmailJS for contact form
- Vimeo embed via @vimeo/player
- Custom audio player with AudioContext + HTMLAudioElement
- React Router v6 with lazy-loaded pages
- Deployed to GitHub Pages (SPA with 404.html trick)
- Key files:
  - Audio system: src/context/AudioContext.tsx, src/components/features/AudioPlayer.tsx
  - Contact form: src/components/features/ContactForm.tsx
  - Video player: src/components/features/Showreel.tsx
  - Navigation: src/components/layout/Navbar.tsx
  - Lightbox: src/components/features/ImageLightbox.tsx
  - SEO: src/components/layout/SEO.tsx
  - Routing: src/constants/routes.ts, src/App.tsx
  - Data: src/data/portfolioData.json, src/data/tracks.json
  - Types: src/types/*.ts

## Team Structure – 8 Agents

### Agent 1: "AUDIO DETECTIVE" – Audio System Bugs
Role: Audio Playback Specialist
Files to audit: src/context/AudioContext.tsx, src/components/features/AudioPlayer.tsx, src/components/ui/AudioVisualizer.tsx, src/data/tracks.json

Known risk areas to investigate and fix:
1. **Race condition in playTrack**: `setCurrentTrack(track)` is called AFTER `audioRef.current.play()` starts – the track state may not match the actual playing audio during the transition. Fix: set track state before starting playback
2. **Stale closure in togglePlay**: `togglePlay` depends on `isPlaying` and `currentTrack` state, but `playTrack` calls `togglePlay` for same-track toggling – if `playTrack` is called rapidly, the closure may have stale `isPlaying` state. Fix: use functional state update or check `audioRef.current.paused` directly
3. **Mute/volume desync in AudioPlayer**: The `isMuted` state in AudioPlayer is local, but `volume` lives in AudioContext. If volume changes externally (e.g., from another component), `isMuted` state won't update. Also: `prevVolume` captures stale volume if mute is toggled multiple times quickly. Fix: derive mute state from volume === 0
4. **Preload race condition**: The preload useEffect loads playlist[0] but `currentTrack` might already be set to a different track from a previous session. This could cause a flash where the wrong track shows
5. **Missing autoplay policy handling**: `play()` can reject with `NotAllowedError` on mobile browsers with stricter policies. Currently only catches and logs – should show a user-visible "tap to play" hint
6. **Audio element not disposed**: When AudioProvider unmounts, audio.pause() is called but the Audio element itself is never fully disposed (src not cleared). This can cause the browser to keep the connection open
7. **Track source validation**: No validation that `track.sources[0].url` actually resolves to a valid audio file. Add network error handling with retry logic
8. **Progress bar seeking**: If user clicks the progress bar while audio is loading (duration === 0), `seek(percent * 0)` sends currentTime to 0 which is a no-op but looks broken
9. **Volume slider click propagation**: Volume slider onClick might bubble to parent elements. Verify stopPropagation is used where needed
10. Verify all audio file paths in tracks.json actually exist in public/

Rules:
- Test EVERY fix by verifying the audio system still works end-to-end
- Do NOT break the existing audio playback flow
- Ensure cleanup runs properly on unmount

### Agent 2: "FORM GUARDIAN" – Contact Form & Input Security
Role: Form & Security Specialist
Files to audit: src/components/features/ContactForm.tsx, .env

Known risk areas to investigate and fix:
1. **Missing env var validation**: `import.meta.env.VITE_EMAILJS_SERVICE_ID` etc. are used directly without checking if they exist. If .env is missing or vars are undefined, emailjs.sendForm will fail silently or throw a cryptic error. Fix: validate env vars at startup and show a clear error
2. **No input sanitization**: Form inputs are passed directly to EmailJS without any sanitization. While EmailJS handles most security, XSS could be injected through the form fields if they're ever displayed back
3. **No rate limiting / spam protection**: The form can be submitted repeatedly with no throttle. Fix: add a cooldown period after successful send (e.g., disable form for 30 seconds)
4. **Double submission**: If user clicks submit rapidly before state updates to 'sending', multiple requests fire. Fix: disable the form immediately on first click, not just on state change
5. **formRef.current! (non-null assertion)**: Line 33 uses `!` non-null assertion on formRef.current. If the ref hasn't attached yet (React lifecycle edge case), this crashes. Fix: add null check
6. **Status resets while component might be unmounted**: setTimeout callbacks on line 38/41 may fire after component unmount, causing "setState on unmounted component" warnings. Fix: check if component is still mounted before setState, or use the existing timeoutRef cleanup more carefully
7. **No email format validation**: The HTML `type="email"` validation can be bypassed. Add JavaScript validation as a defense layer
8. **Missing aria-live region**: Screen readers won't announce form status changes (sending, sent, error). Fix: add `aria-live="polite"` to the status area
9. **Subject field has no autocomplete**: Unlike name and email, the subject field has no `autoComplete` attribute for consistency

Rules:
- Maintain the existing UX flow
- Never expose API keys or secrets
- All security fixes must not break the form submission flow

### Agent 3: "VIDEO SURGEON" – Vimeo & Media Bugs
Role: Media Embed Specialist
Files to audit: src/components/features/Showreel.tsx, src/components/ui/MediaRenderer.tsx, src/components/features/ImageLightbox.tsx

Known risk areas to investigate and fix:
1. **Vimeo player leak if error before ready()**: If the iframe loads but `vimeoPlayer.ready()` rejects, the player instance is stored in state but event listeners were never attached. On unmount, `player.off()` will be called on a player that may not have those listeners – this is fine, but the player was never properly initialized, so `destroy()` might behave unexpectedly
2. **Missing iframe loading state**: There's no loading indicator while the Vimeo iframe loads. The user sees a blank black box until the iframe is ready. Fix: add a skeleton/spinner until handleLoad fires
3. **Chapter navigation when player is null**: `jumpTo()` silently does nothing if player is null (before iframe loads). The chapter buttons should either be disabled or show a toast saying "Video is still loading"
4. **Duplicate formatTime function**: Showreel.tsx defines its own `formatTime` on line 71, but `src/utils/index.ts` already exports one. Fix: use the shared utility
5. **ImageLightbox body scroll lock missing**: When lightbox opens, the body can still scroll behind it. Fix: add `document.body.style.overflow = 'hidden'` like Navbar does
6. **ImageLightbox using array index as key**: Line 48 uses `key={i}` for the images array. If images are reordered, React won't re-render correctly. Fix: use image src as key
7. **No keyboard navigation in lightbox**: Can close with Escape, but can't navigate between images with arrow keys. Fix: add left/right arrow key listeners
8. **Video elements in ImageLightbox**: Videos are rendered inline without error handling. If a video path is broken, it silently fails. Fix: add error handler for video elements
9. **MediaRenderer error handling**: Verify MediaRenderer handles all media types gracefully and doesn't crash on unknown types

Rules:
- Fix EVERY media-related edge case
- Test with broken URLs to verify error handling
- Ensure player cleanup runs on every unmount path

### Agent 4: "NAVIGATOR" – Routing, Navigation & SPA Bugs
Role: Routing & Navigation Specialist
Files to audit: src/App.tsx, src/constants/routes.ts, src/components/layout/Navbar.tsx, src/components/layout/ScrollToTop.tsx, src/pages/ProjectDetails.tsx, src/pages/NotFound.tsx

Known risk areas to investigate and fix:
1. **Route conflict**: ROUTES.PROJECT_DETAILS = '/projects/:id' catches ALL /projects/* routes, including the static ones like /projects/gradwork. The order in App.tsx matters – verify Gradwork/Transientica/SoundDesign routes are listed BEFORE the dynamic :id route, otherwise they'll be caught by ProjectDetails with id="gradwork"
2. **ProjectDetails 404 redirect**: `<Navigate to="/404" replace />` redirects to /404, but there's no route for "/404". The `path="*"` catch-all renders NotFound. So the redirect actually works, but the URL changes to /404 which then gets caught by "*". This is technically fine but the URL in browser shows /404 instead of staying on the current URL. Fix: render NotFound inline instead of Navigate
3. **safeLazy chunk reload loop**: If a chunk genuinely fails (not a transient error), the app will reload once, then on second fail it throws. But the `sessionStorage.setItem('chunk_reload', 'true')` is never cleared except at the top of App function body. If the user navigates away and back, the flag is cleared – this is correct. Verify edge case: what if two different chunks fail?
4. **ScrollToTop**: Verify it scrolls to top on EVERY route change, not just on push navigation. What about back/forward browser buttons?
5. **Navbar body scroll lock leak**: If the component unmounts while menu is open (e.g., route change), the cleanup function should reset `document.body.style.overflow`. It does have cleanup in the useEffect, but verify it actually runs in all unmount scenarios
6. **Navbar scroll handler**: `handleScroll` on line 45 has no throttle/debounce. On fast scrolling, this fires dozens of times per second. Fix: add requestAnimationFrame throttle
7. **Navbar navLinks array**: Created on every render. Should be memoized with useMemo since it depends on t() which changes on language switch
8. **Mobile menu focus trap missing**: When the mobile menu is open, tab key should cycle within the menu panel. Currently, focus can escape to elements behind the backdrop
9. **Active route detection**: `location.pathname === link.path` won't match for nested routes. /projects/shadow_frames won't highlight "Projects" in the nav. Fix: use startsWith for Projects route

Rules:
- Every route must work correctly with direct URL access AND client-side navigation
- Verify with GitHub Pages SPA routing (hashbang or 404.html redirect)
- Back/forward browser buttons must work correctly on every page

### Agent 5: "SEO INSPECTOR" – Meta Tags, Schema & Accessibility
Role: SEO & Accessibility Specialist
Files to audit: src/components/layout/SEO.tsx, src/pages/*.tsx, src/components/layout/Layout.tsx, index.html

Known risk areas to investigate and fix:
1. **Hreflang points to same URL**: Lines 88-91 in SEO.tsx set hreflang for en/pl/nl all pointing to the SAME URL. Since the language is stored in localStorage (not URL), search engines can't distinguish language versions. This is technically fine for JS-rendered SPAs but the hreflang tags are misleading. Fix: either remove hreflang entirely OR add `?lang=en` / `?lang=pl` / `?lang=nl` parameters and handle them
2. **Missing SEO on some pages**: Verify EVERY page component uses the SEO component. Check Music, NotFound, Gradwork, Transientica, SoundDesign, MiddlewareOptimization
3. **Double Helmet in ProjectDetails**: ProjectDetails uses both `<Helmet>` directly AND `<SEO>` component. This could cause conflicting meta tags. Fix: consolidate into SEO component props
4. **Canonical URL issue**: The canonical URL might include GitHub Pages subdirectory path. Verify it generates clean URLs
5. **OG image path construction**: `image.startsWith('http') ? image : ${baseUrl}${image}` – if image starts with "/" it works, but some image paths in portfolioData.json might not start with "/" causing double slash or missing slash
6. **Missing alt text audit**: Check ALL <img> tags across ALL components for proper alt text. Flag any empty alt="" that should have descriptive text
7. **Missing aria labels**: Audit all interactive elements (buttons, links, inputs) for proper aria-label or aria-labelledby
8. **Color contrast**: Verify text-dim (#8a8a8a) on bg-primary (#111111) meets WCAG AA minimum contrast ratio (4.5:1). Calculate: #8a8a8a on #111111 ≈ 4.3:1 – this FAILS AA. Fix: lighten dim color slightly
9. **Heading hierarchy**: Verify each page has exactly one <h1> and proper heading order (no skipping from h2 to h4)
10. **Missing lang attribute**: Verify index.html has a default lang attribute, and SEO.tsx updates it dynamically
11. **Structured data validation**: Verify JSON-LD schemas in SEO.tsx and ProjectDetails.tsx are valid against schema.org specs

Rules:
- Test meta tags with Open Graph debugger format
- Validate all structured data against schema.org
- Every accessibility fix must meet WCAG 2.1 AA minimum
- Do NOT change visual appearance while fixing accessibility

### Agent 6: "DATA VALIDATOR" – Data Integrity & Type Safety
Role: Data Integrity Specialist
Files to audit: src/data/portfolioData.json, src/data/tracks.json, src/types/*.ts, src/hooks/usePortfolioData.ts

Known risk areas to investigate and fix:
1. **Unsafe double cast**: `usePortfolioData` uses `as unknown as PortfolioData` which bypasses ALL type checking. If portfolioData.json has wrong shape, it'll crash at runtime. Fix: add runtime validation or at minimum a dev-only assertion
2. **Missing data validation**: No runtime checks that portfolioData.json has all required fields. If a project is missing `media`, `content_blocks`, or `challenges_solved`, components accessing these may crash
3. **Track sources undefined**: AudioContext accesses `track.sources[0].url` but never validates `sources` isn't empty or undefined. Add null-safe access
4. **Orphaned project IDs**: Verify every project ID in portfolioData.json maps to: a valid route, a valid i18n namespace (if it has one), and that all referenced media files exist in public/
5. **Image path consistency**: Some image paths in portfolioData.json might have leading "/" and some might not. Normalize path handling so `/${path}` doesn't become `//path`
6. **Category consistency**: useProjectFilter has a static KEY_MAP of categories. If a new project is added with a category not in KEY_MAP, it falls through to raw English text even in Polish/Dutch. Fix: log a warning in development for unmapped categories
7. **Type exhaustiveness**: Check that Project type in src/types/project.ts covers ALL fields actually used in portfolioData.json. Look for any fields accessed in components but not declared in the type
8. **tracks.json validation**: Verify every track has: id (unique), title, cover image (exists in public/), and at least one source with valid URL
9. **Social media links validation**: Verify personal_info.social_media URLs are valid and accessible
10. **Content block types**: Verify all content_block types used in portfolioData.json are handled by ContentBlockRenderer

Rules:
- Add runtime validations for development, not production (use import.meta.env.DEV guards)
- Fix EVERY data access that could crash on missing data
- Add TypeScript strict null checks where needed
- Verify all referenced assets (images, audio, video) exist in public/

### Agent 7: "PERFORMANCE DOCTOR" – Performance Bugs & Memory Leaks
Role: Performance & Memory Specialist
Files to audit: ALL source files

Known risk areas to investigate and fix:
1. **Framer Motion re-render cascade**: Components using `motion.div` with inline style objects `{}` or inline transition objects create new objects on every render. Find and memoize or extract to constants
2. **Unnecessary re-renders from context**: AudioContext.tsx exports a `value` object via useMemo, but the dependency array includes `progress`, `currentTime`, and `duration` which change on every timeupdate event (~4x/sec). This causes EVERY component consuming useAudio() to re-render 4 times per second while playing. Fix: split context into separate contexts (playback controls vs. progress state)
3. **Event listener accumulation**: Verify ALL addEventListener calls have matching removeEventListener in cleanup. Check: Navbar scroll, AudioContext timeupdate, ImageLightbox escape key, Showreel Vimeo events
4. **Memory leak on language change**: When i18n language changes, do all components properly re-render with new translations? Check for stale cached translation strings
5. **Large bundle imports**: Check if lucide-react imports use tree shaking correctly. `import { Play, Pause, ... }` from lucide-react is fine IF the bundler tree-shakes properly. Verify with build analysis
6. **Image optimization**: Check all images in public/ for unnecessarily large files (> 500KB). List any that should be converted to WebP or resized
7. **Repeated DOM queries**: Check for any `document.querySelector` or similar DOM queries inside render loops or effects without proper refs
8. **useCallback/useMemo missing**: Find components that pass inline functions as props to memoized children, defeating React.memo. Specifically check: ProjectCard onClick handlers, navLinks items
9. **Lazy loading**: Verify all heavy components are properly lazy-loaded. Check if Showreel (with Vimeo SDK) is lazy-loaded or bundled with the home page
10. **Animation performance**: Check for animations that trigger layout (top, left, width, height) instead of using transform/opacity. Use will-change hints where appropriate

Rules:
- Profile actual build bundle size before and after changes
- Use React DevTools profiler concepts (which components re-render and why)
- Do NOT change user-visible behavior for performance
- Document every performance fix with before/after reasoning

### Agent 8: "EDGE CASE HUNTER" – Final Sweep & Verification
Role: QA Lead & Edge Case Specialist
Tasks:
1. **Browser compatibility**: Check for any API usage that won't work in: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. Specifically check: Web Audio API usage, CSS features, IntersectionObserver, ResizeObserver
2. **Mobile edge cases**:
   - Audio autoplay on iOS (requires user gesture)
   - Safe area insets (notch/home indicator overlap with fixed AudioPlayer)
   - Touch targets must be minimum 44x44px (check small buttons)
   - Fixed player bar height on mobile keyboards
   - Landscape orientation handling
3. **Network failures**:
   - What happens when i18n translation files fail to load?
   - What happens when portfolioData.json fails to load?
   - What happens when images fail to load?
   - What happens when the Vimeo embed is blocked by an ad blocker?
   - What happens when EmailJS is down?
4. **Empty states**:
   - No projects match filter
   - No tracks in playlist
   - No images in gallery
   - portfolioData.json has empty arrays
5. **Locale edge cases**:
   - What if browser language is 'en-GB'? Does getSafeLanguage handle it?
   - What if localStorage has corrupted language value?
   - Special characters in Polish (ą, ę, ó, ś, ź, ż, ć, ń, ł) rendering correctly
   - Right-to-left text (future-proofing)
6. **Rapid user actions**:
   - Click play/pause 10 times quickly
   - Switch language while audio is playing
   - Open/close mobile menu rapidly
   - Submit form, then navigate away immediately
   - Resize window during animations
7. Run ALL verification:
   - `npx tsc --noEmit` → zero errors
   - `npx eslint . --max-warnings 0` → pass
   - `npm run build` → successful build
   - `npm run test` → all tests pass
8. Create final report: .claude/teams/bug-hunt-final-report.md
   - Total bugs found and fixed per agent
   - Remaining low-risk issues that couldn't be auto-fixed
   - Recommended follow-up actions

Rules:
- This is the FINAL SWEEP – catch everything others missed
- You have authority to message any agent to fix issues you find
- Be especially ruthless about edge cases
- The build MUST pass after all fixes
- Every fix must be verified

## Execution Order & Dependencies

```
Phase 1 (parallel – independent systems):
  AUDIO DETECTIVE → audio system
  FORM GUARDIAN → contact form
  VIDEO SURGEON → media embeds

Phase 2 (parallel – cross-cutting concerns):
  NAVIGATOR → routing & navigation
  SEO INSPECTOR → meta tags & accessibility
  DATA VALIDATOR → data integrity & types

Phase 3 (after Phase 1-2 changes are done):
  PERFORMANCE DOCTOR → performance & memory

Phase 4 (final sweep after all fixes):
  EDGE CASE HUNTER → edge cases & verification
```

## Coordination Rules
- Agents in the same phase can work in parallel
- Each agent broadcasts completion status when done
- If any agent's fix breaks another agent's domain, coordinate directly
- EDGE CASE HUNTER has authority to send ANY agent back to fix issues
- All reports go to .claude/teams/ directory
- EDGE CASE HUNTER produces the final summary for me

## Critical Constraints
- FIX bugs, don't just find them. Every found issue must have a fix or a documented reason why it can't be fixed
- DO NOT change the visual design
- The production build (`npm run build`) MUST succeed after all changes
- Preserve existing user-facing behavior while fixing underlying issues
- When in doubt, add defensive checks rather than removing features
```

---

## ⚙️ Jak użyć

### Krok 1: Włącz Agent Teams
```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
```

### Krok 2: Odpal Claude Code w projekcie
```powershell
cd c:\Users\iszun\Documents\GitHub\igorszuniewicz
claude
```

### Krok 3: Wklej Master Prompt
Skopiuj cały blok z sekcji **Master Prompt** powyżej i wklej go jako swój prompt.

---

## 📋 Przegląd Drużyny

| # | Agent | Faza | Specjalizacja | Szacunek problemów |
|---|-------|------|---------------|-------------------|
| 🎵 | **AUDIO DETECTIVE** | 1 | Race conditions w audio, stale closures, play() policy | ~10 |
| 📝 | **FORM GUARDIAN** | 1 | Env vars, sanityzacja, rate limiting, a11y formularza | ~9 |
| 🎬 | **VIDEO SURGEON** | 1 | Vimeo lifecycle, lightbox scroll lock, media error handling | ~9 |
| 🧭 | **NAVIGATOR** | 2 | Konflikty routowania, ScrollToTop, focus trap, scroll debounce | ~9 |
| 🔍 | **SEO INSPECTOR** | 2 | Hreflang, structured data, kontrast kolorów, aria labels | ~11 |
| 📊 | **DATA VALIDATOR** | 2 | JSON integrity, type safety, ścieżki do assetów, null checks | ~10 |
| ⚡ | **PERFORMANCE DOCTOR** | 3 | Context re-render cascade, memoization, memory leaks, bundle | ~10 |
| 🎯 | **EDGE CASE HUNTER** | 4 | Mobile, sieć, locale, rapid actions, finalna walidacja | ~8 |

**Łącznie ~76 znanych issue'ów do zbadania** + cokolwiek agenty znajdą dodatkowo.

---

## 🎯 Uwagi

- **Naprawiać, nie tylko raportować** — każdy znaleziony bug musi mieć fix
- **Nie zmieniajcie designu** — poprawiamy logikę, nie wygląd
- **Build musi przejść** — EDGE CASE HUNTER sprawdza to na końcu
- Można uruchomić po **agent-team-cleanup.md** lub oddzielnie
- To jest najbardziej szczegółowa drużyna — każdy agent ma wylistowane konkretne linie kodu do zbadania
