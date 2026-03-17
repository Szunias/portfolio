# CLAUDE.md — Kompletna dokumentacja projektu Portfolio

## Przegląd projektu

Portfolio Igora Szuniewicza — strona osobista prezentująca projekty z dziedziny game audio, sound design, muzyki i narzędzi deweloperskich.

- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS 3
- **Routing**: React Router DOM v6 (SPA, BrowserRouter)
- **Animacje**: Framer Motion v11
- **i18n**: react-i18next (3 języki: en, pl, nl)
- **Ikony**: lucide-react
- **SEO**: react-helmet-async (Open Graph, Twitter Cards, JSON-LD)
- **Formularz kontaktowy**: @emailjs/browser
- **Audio**: Własny AudioContext z HTMLAudioElement
- **Video embed**: Vimeo Player (@vimeo/player)
- **Deploy**: GitHub Pages (gh-pages)
- **Testy**: Vitest + Testing Library

### Komendy

```bash
npm run dev        # Serwer deweloperski (Vite)
npm run build      # TypeScript check + build produkcyjny
npm run lint       # ESLint (zero warnings)
npm run test       # Vitest
npm run preview    # Podgląd buildu
npm run deploy     # Build + deploy na GitHub Pages
```

---

## Struktura katalogów

```
src/
├── App.tsx                    # Główny komponent z routingiem
├── main.tsx                   # Entry point (React root + providers)
├── i18n.ts                    # Konfiguracja i18next
├── index.css                  # Style globalne + Tailwind
├── components/
│   ├── home/
│   │   └── Hero.tsx           # Sekcja hero strony głównej
│   ├── layout/
│   │   ├── Layout.tsx         # Shell: Navbar + main + Footer + AudioPlayer
│   │   ├── Navbar.tsx         # Nawigacja (desktop + mobile drawer)
│   │   ├── Footer.tsx         # Stopka z linkami i socialami
│   │   ├── SEO.tsx            # Meta tagi, OG, Twitter, JSON-LD
│   │   ├── ScrollToTop.tsx    # Scroll to top przy zmianie route
│   │   └── LanguageSwitcher.tsx # Przełącznik EN/PL/NL
│   ├── features/
│   │   ├── AudioPlayer.tsx    # Globalny odtwarzacz audio (fixed bottom)
│   │   ├── ContactForm.tsx    # Formularz EmailJS
│   │   ├── CodeViewer.tsx     # Podgląd kodu z annotacjami
│   │   ├── ImageLightbox.tsx  # Galeria zdjęć z lightboxem
│   │   ├── ProjectCard.tsx    # Karta projektu
│   │   ├── Showreel.tsx       # Showreel video (Vimeo embed)
│   │   ├── ProductionTimeline.tsx # Timeline produkcji
│   │   ├── music/
│   │   │   ├── MusicHero.tsx  # Hero sekcja strony muzyki
│   │   │   └── TrackCard.tsx  # Karta utworu muzycznego
│   │   ├── projects/
│   │   │   ├── ProjectGrid.tsx        # Bento grid projektów
│   │   │   ├── ProjectFilters.tsx     # Filtry kategorii
│   │   │   ├── ProjectHero.tsx        # Hero sekcja projektu
│   │   │   ├── ProjectSidebar.tsx     # Sidebar z metadanymi
│   │   │   ├── ContentBlockRenderer.tsx # Renderuje content_blocks
│   │   │   ├── ChallengesBlock.tsx    # Sekcja wyzwań i rozwiązań
│   │   │   ├── ProjectCodeSection.tsx # Snippety kodu projektu
│   │   │   └── ProjectRichDetails.tsx # Responsibilities, metrics
│   │   └── gradwork/
│   │       ├── GradworkHeader.tsx
│   │       ├── GradworkSetup.tsx
│   │       ├── GradworkSolution.tsx
│   │       ├── GradworkResults.tsx
│   │       └── GradworkClosing.tsx
│   └── ui/
│       ├── Button.tsx         # Komponent przycisku (primary/secondary/ghost)
│       ├── Modal.tsx          # Okno modalne
│       ├── IntroAnimation.tsx # Animacja intro (raz na sesję)
│       ├── PageLoader.tsx     # Loader przy lazy loading
│       ├── ScrollProgress.tsx # Pasek postępu scrolla
│       ├── TechReveal.tsx     # Animacja odkrywania technologii
│       ├── ImageWithLoader.tsx# Obrazek z loaderem
│       ├── MediaRenderer.tsx  # Renderuje obrazy/video
│       └── ErrorBoundary.tsx  # React error boundary
├── pages/
│   ├── Home.tsx               # Strona główna (Hero + Showreel)
│   ├── Projects.tsx           # Lista projektów z filtrami
│   ├── ProjectDetails.tsx     # Dynamiczna strona projektu (:id)
│   ├── About.tsx              # O mnie (bento grid)
│   ├── Contact.tsx            # Kontakt (info + formularz)
│   ├── Music.tsx              # Muzyka (hero + grid tracków)
│   ├── Gradwork.tsx           # Praca dyplomowa (ML audio)
│   ├── Transientica.tsx       # Transientica AudioLab (ML rhythm game)
│   ├── SoundDesign.tsx        # Portfolio sound design (video cards)
│   ├── ShadowFrames.tsx       # Shadow Frames (horror game audio)
│   ├── NotTodayDarling.tsx    # Not Today, Darling! (MetaSounds game)
│   ├── AudioQ.tsx             # AudioQ (VST plugin C++/JUCE)
│   ├── RayAnimation.tsx       # Ray Animation (film score)
│   ├── Amorak.tsx             # Amorak (horror animation sound)
│   ├── MiddlewareOptimization.tsx # Middleware Optimization (Wwise cases)
│   ├── Richter.tsx            # Richter (short film sound design)
│   ├── Akantilado.tsx         # Akantilado (3D jungle animation)
│   ├── PauseAndDeserve.tsx    # Pause & Deserve (horror game UE5)
│   ├── WwiseUnrealFixer.tsx   # Wwise Unreal Fixer (dev tool)
│   ├── UnrealEngineRebuilder.tsx # UE Rebuilder (dev tool)
│   └── NotFound.tsx           # 404 ("Dead Air")
├── context/
│   └── AudioContext.tsx       # Global audio provider
├── hooks/
│   ├── usePortfolioData.ts    # Ładuje portfolioData.json
│   └── useProjectFilter.ts   # Filtrowanie projektów po kategorii
├── types/
│   ├── index.ts               # Re-eksportuje wszystkie typy
│   ├── project.ts             # Project, CodeSnippet, ContentBlock, etc.
│   ├── data.ts                # PortfolioData (główny interfejs danych)
│   ├── music.ts               # Track, TrackSource
│   ├── personal.ts            # PersonalInfo, Education, Statistics
│   ├── skills.ts              # CoreSkills, TechnicalSkillsMatrix
│   └── tech.ts                # TechCategory
├── constants/
│   ├── routes.ts              # Wszystkie ścieżki URL
│   ├── motion.ts              # Presety animacji framer-motion
│   ├── techData.ts            # TECH_CATEGORIES + TECH_ICON_MAP
│   └── techConnections.ts     # Mapa powiązań między technologiami
├── utils/
│   └── index.ts               # formatTime, getSafeLanguage, cn
├── data/
│   ├── portfolioData.json     # Główne dane (projekty, umiejętności, info)
│   └── tracks.json            # Lista utworów muzycznych
public/
├── locales/
│   ├── en/                    # Tłumaczenia angielskie
│   ├── pl/                    # Tłumaczenia polskie
│   └── nl/                    # Tłumaczenia holenderskie
├── assets/                    # Obrazy, video, audio, ikony, CV
└── index.html
```

---

## Routing — wszystkie ścieżki

Zdefiniowane w `src/constants/routes.ts`, używane w `src/App.tsx`:

| Route | Komponent | Opis |
|---|---|---|
| `/` | `Home` | Landing page z Hero i Showreelem |
| `/projects` | `Projects` | Lista wszystkich projektów z filtrami |
| `/projects/:id` | `ProjectDetails` | Dynamiczna strona projektu (fallback) |
| `/projects/gradwork` | `Gradwork` | Praca dyplomowa — ML audio |
| `/projects/transientica_audiolab` | `Transientica` | ML rhythm game |
| `/projects/sound-design` | `SoundDesign` | Portfolio sound design |
| `/projects/shadow_frames` | `ShadowFrames` | Horror game audio (Wwise+UE5) |
| `/projects/not_today_darling` | `NotTodayDarling` | Game audio (MetaSounds+UE5) |
| `/projects/audioq` | `AudioQ` | VST plugin (C++/JUCE) |
| `/projects/ray_animation` | `RayAnimation` | Film score |
| `/projects/amorak` | `Amorak` | Horror animation sound design |
| `/projects/middleware-optimization` | `MiddlewareOptimization` | Wwise case studies |
| `/projects/richter` | `Richter` | Short film sound design |
| `/projects/akantilado` | `Akantilado` | 3D animation sound |
| `/projects/pause_and_deserve` | `PauseAndDeserve` | Horror game (UE5) |
| `/projects/wwise_unreal_fixer` | `WwiseUnrealFixer` | Dev tool (Python) |
| `/projects/unreal_engine_rebuilder` | `UnrealEngineRebuilder` | Dev tool (Python) |
| `/music` | `Music` | Muzyka — grid tracków |
| `/about` | `About` | O mnie |
| `/contact` | `Contact` | Formularz kontaktowy |
| `*` | `NotFound` | 404 |

Wszystkie strony ładowane są lazy (`safeLazy`) — automatyczny retry przy chunk load failure.

---

## Strony — szczegółowy opis

### Home (`src/pages/Home.tsx`)
- **Route**: `/`
- **i18n namespace**: `home`
- **Komponenty**: `Hero`, `Showreel`, `SEO`
- **Opis**: Landing page. Hero jest "pinned" (fixed), footer przesuwa się na scroll. Showreel otwiera się w modalu (Vimeo embed). Schema.org WebSite JSON-LD.
- **State**: `isShowreelOpen` — kontroluje modal showreela
- **Accessibility**: Focus trap w modalu, Escape zamyka, body scroll lock

### Projects (`src/pages/Projects.tsx`)
- **Route**: `/projects`
- **i18n namespace**: `projects`
- **Komponenty**: `ProjectFilters`, `ProjectGrid`, `SEO`
- **Opis**: Wyświetla wszystkie projekty (featured + additional) w bento gridzie. Filtry kategorii na górze.
- **Dane**: `usePortfolioData()` → `featured_projects` + `additional_projects`
- **Hook**: `useProjectFilter()` — filtrowanie po kategorii

### ProjectDetails (`src/pages/ProjectDetails.tsx`)
- **Route**: `/projects/:id`
- **i18n namespaces**: `projectDetail`, `projects` + dynamiczny namespace projektu
- **Komponenty**: `ProjectHero`, `ContentBlockRenderer`, `ChallengesBlock`, `ProjectRichDetails`, `ProjectCodeSection`, `ImageLightbox`, `ProjectSidebar`, `SEO`
- **Opis**: Generyczna strona projektu ładowana dynamicznie po `:id`. Layout 8+4 kolumny (content + sidebar). Schema.org BreadcrumbList + CreativeWork JSON-LD.
- **Fallback**: Jeśli projekt nie znaleziony → `NotFound`

### About (`src/pages/About.tsx`)
- **Route**: `/about`
- **i18n namespace**: `about`
- **Opis**: Bento grid layout z sekcjami: afiliacje (DAE, Howest, RMA, XR Labs), tło, podejście, toolkit (12 narzędzi z ikonami), edukacja, CTA. Zdjęcie "crime-fighters".
- **Narzędzia w toolkit**: Wwise, FMOD, Pro Tools, Unreal Engine, Unity, Perforce, JUCE, Blender, GitHub, Python, C++, C#
- **Animacje**: framer-motion z `useReducedMotion` fallback

### Contact (`src/pages/Contact.tsx`)
- **Route**: `/contact`
- **i18n namespace**: `contact`
- **Komponenty**: `ContactForm`, `SEO`
- **Opis**: 2-kolumnowy layout: karta info (email base64-encoded, LinkedIn, lokalizacja, strefa czasowa, status dostępności) + formularz EmailJS.
- **Email**: Base64-encoded w `ENCODED_EMAIL` → dekodowany przez `atob()`
- **Ikony**: Mail, MapPin, Linkedin, Github, Copy, Check, Clock

### Music (`src/pages/Music.tsx`)
- **Route**: `/music`
- **i18n namespace**: `music`
- **Komponenty**: `MusicHero`, `TrackCard`, `SEO`
- **Opis**: Hero + grid 2-5 kolumn z kartami utworów. Kliknięcie na kartę uruchamia odtwarzacz.
- **Dane**: `useAudio()` → `playlist`, `playTrack`, `currentTrack`, `isPlaying`

### Gradwork (`src/pages/Gradwork.tsx`)
- **Route**: `/projects/gradwork`
- **i18n namespace**: `gradwork`
- **Komponenty**: `GradworkHeader`, `GradworkSetup`, `GradworkResults`, `GradworkSolution`, `GradworkClosing`, `SEO`
- **Opis**: Praca dyplomowa o real-time ML audio generation. Podzielona na 5 sekcji.

### Transientica (`src/pages/Transientica.tsx`)
- **Route**: `/projects/transientica_audiolab`
- **i18n namespace**: `transientica`
- **Tech**: Python, scikit-learn, Unity, LibROSA
- **Opis**: Voice-controlled rhythm game z ML audio classification. Custom layout z sekcjami: Hero, Video Showcase (2 filmy), Stats (latency <45ms, accuracy 92%, 3 sound classes, 2000+ samples), How It Works (3 feature cards), Technical Deep Dive (spectral analysis + optimization), Challenges & Solutions (3 karty), Next Project link.
- **Wideo**: `<video>` tagi z poster, klikalne (unmute + play)

### SoundDesign (`src/pages/SoundDesign.tsx`)
- **Route**: `/projects/sound-design`
- **i18n namespace**: `soundDesign`
- **Opis**: Portfolio sound design z video cards. Hero z parallax scroll. 4 karty video: God of War (Krotos redesign), Baldur's Gate 3 (magic combat), Weapon Sound Design (NDA — SIGNAL OFFLINE placeholder), Fractured Horizon (sci-fi).
- **Komponent wewnętrzny**: `VideoCard` — karta z poster → play on click

### ShadowFrames (`src/pages/ShadowFrames.tsx`)
- **Route**: `/projects/shadow_frames`
- **i18n namespace**: `shadowFrames`
- **Tech**: Wwise, Unreal Engine 5, C++, Reaper
- **Opis**: Audio-driven psychological horror game. Bento grid: YouTube trailer embed, concept, audio systems (footstep, proximity, anomaly), Wwise gallery (YouTube + ImageLightbox), CodeViewer z 3 snippetami C++ (FootstepComponent, EnemyPresenceAudioManager, EnemyPresenceComponent z annotacjami), challenges & solutions, collaboration image, links (trailer + sound doc PDF).
- **Snippety kodu**: Inline `CODE_SNIPPETS` array z annotacjami per linia

### NotTodayDarling (`src/pages/NotTodayDarling.tsx`)
- **Route**: `/projects/not_today_darling`
- **i18n namespace**: `notTodayDarling`
- **Tech**: MetaSounds, Unreal Engine 5, Sound Cues, Reaper
- **Opis**: Bento grid: auto-play video clip + game logo, concept, audio systems (engine, mix, voices), sound showcase video, MetaSounds gallery (6 obrazów ImageLightbox), challenges, links (YouTube trailer + itch.io download).
- **Galeria**: 6 obrazów MetaSounds (MonoArray, Pickup, Powerups, SoundClasses, SoundClassMixes, AttenuationPresets)

### AudioQ (`src/pages/AudioQ.tsx`)
- **Route**: `/projects/audioq`
- **i18n namespace**: `audioq`
- **Tech**: C++, JUCE, VST3/AU, DSP
- **Opis**: VST sampler plugin. Bento grid: video demo + about, features (6 items), collapsible code deep dive (5 snippetów C++: Tremolo DSP, Parameter Layout, Process Block, DSP Setup, Audio Playback System z annotacjami), download links (GitHub releases + repo).
- **State**: `codeOpen` — toggle widoczności kodu

### RayAnimation (`src/pages/RayAnimation.tsx`)
- **Route**: `/projects/ray_animation`
- **i18n namespace**: `rayAnimation`
- **Tech**: Pro Tools, Omnisphere, Waves J37, Frame Sync
- **Opis**: Disco-funk score for graduation film. Bento grid: auto-play clip, about, YouTube embed, music approach (3 items).

### Amorak (`src/pages/Amorak.tsx`)
- **Route**: `/projects/amorak`
- **i18n namespace**: `amorak`
- **Tech**: Logic Pro, Reaper, Dear VR Pro, Krotos Studio
- **Opis**: Horror animation sound design z binaural mix. Bento grid: auto-play clip, about, YouTube embed, sound approach (3 items).

### MiddlewareOptimization (`src/pages/MiddlewareOptimization.tsx`)
- **Route**: `/projects/middleware-optimization`
- **i18n namespace**: `middlewareOptimization`
- **Tech**: Wwise, Unity, C#, RTPC
- **Opis**: 3 case studies optymalizacji Wwise middleware. Bento grid: Wwise logo, about, Boney Boogaloo (video), Ellen (Vimeo embed), Stomach Aches (video).

### Richter (`src/pages/Richter.tsx`)
- **Route**: `/projects/richter`
- **i18n namespace**: `richter`
- **Tech**: Reaper, Cubase, Zoom H6, Vital, Field Recording
- **Opis**: Short film sound design. Bento grid: auto-play clip, about, film video z poster, sound approach (field, synth, foley, mix).

### Akantilado (`src/pages/Akantilado.tsx`)
- **Route**: `/projects/akantilado`
- **i18n namespace**: `akantilado`
- **Tech**: Reaper, Foley, 5.1 Surround, Spatial Audio
- **Opis**: 3D jungle animation sound design. Bento grid: auto-play clip, about, YouTube embed, approach (jungle, characters, foley, mix).

### PauseAndDeserve (`src/pages/PauseAndDeserve.tsx`)
- **Route**: `/projects/pause_and_deserve`
- **i18n namespace**: `pauseAndDeserve`
- **Tech**: Unreal Engine 5, Blueprints, MetaSounds, Sound Cues
- **Opis**: Horror game. Bento grid: auto-play clip, about, YouTube embed, approach (pause, ambience, spatial, learned).

### WwiseUnrealFixer (`src/pages/WwiseUnrealFixer.tsx`)
- **Route**: `/projects/wwise_unreal_fixer`
- **i18n namespace**: `wwiseUnrealFixer`
- **Tech**: Python, Batch Script, Wwise, Unreal Engine, Perforce
- **Opis**: Dev tool naprawiający integrację Wwise z UE. Bento grid: logo, about, how it works (scan, fix, backup), features (logging, precision, teams).

### UnrealEngineRebuilder (`src/pages/UnrealEngineRebuilder.tsx`)
- **Route**: `/projects/unreal_engine_rebuilder`
- **i18n namespace**: `unrealEngineRebuilder`
- **Tech**: Python, Batch Script, Unreal Engine, Automation
- **Opis**: Dev tool do odbudowy projektów UE. Bento grid: logo, about, screenshot UI, features (rebuild, backup, disk, detect, logs, ui).

### NotFound (`src/pages/NotFound.tsx`)
- **Route**: `*`
- **i18n namespace**: `notFound`
- **Opis**: 404 "Dead Air" z animacją waveform flatline (5 barów CSS). Przycisk "Return to Base".

---

## Komponenty — szczegółowy opis

### Layout

#### `Layout.tsx` (`src/components/layout/Layout.tsx`)
Root shell aplikacji. Zawiera:
- Skip-to-main link (accessibility)
- `ScrollProgress` — pasek postępu scrolla na górze
- Noise texture overlay (`bg-noise`)
- `Navbar`
- `<main>` z `children`
- `Footer`
- `AudioPlayer` (fixed, z-audio-player)

#### `Navbar.tsx` (`src/components/layout/Navbar.tsx`)
- Desktop: logo "IGOR SZUNIEWICZ" + nav links + GitHub/LinkedIn ikony + LanguageSwitcher
- Mobile: hamburger → slide-in drawer z prawej (AnimatePresence)
- Scroll detection (RAF-throttled): po 20px → bg-surface/80 + backdrop-blur
- Focus trap w mobile menu, Escape zamyka
- Body scroll lock gdy menu otwarte
- Nav links: Home, Projects, Music, About, Contact
- Active link detection: exact match `/` lub `startsWith` dla reszty

#### `Footer.tsx` (`src/components/layout/Footer.tsx`)
- Brand + tagline
- Nav links: Projects, About, Music, Contact
- Social icons: LinkedIn, GitHub, Mail, Spotify
- Copyright z aktualnym rokiem

#### `SEO.tsx` (`src/components/layout/SEO.tsx`)
Ustawia `<head>` meta tagi:
- `<title>`: "Page | Igor Szuniewicz" lub default
- `<meta description>`, `<meta author>`, `<meta keywords>`
- `<link rel="canonical">`
- Open Graph: og:type, og:title, og:description, og:image (1200x630), og:url, og:locale
- Twitter Cards: summary_large_image
- JSON-LD Person schema (tylko homepage)
- JSON-LD BreadcrumbList (inner pages)
- Robots noindex (opcjonalnie)
- Props: `title`, `description`, `type`, `image`, `url`, `noindex`

#### `ScrollToTop.tsx` (`src/components/layout/ScrollToTop.tsx`)
Scrolluje do góry strony przy każdej zmianie route'a.

#### `LanguageSwitcher.tsx` (`src/components/layout/LanguageSwitcher.tsx`)
Dropdown do przełączania między EN/PL/NL. Prop `dropUp` dla mobile menu.

### Features

#### `AudioPlayer.tsx` (`src/components/features/AudioPlayer.tsx`)
Globalny odtwarzacz audio, fixed na dole strony. Pojawia się po kliknięciu tracku.
- **Progress bar**: na samej górze, full-width, 3px (5px hover). Scrub mouse/touch. Tooltip z czasem na hover.
- **Kontrolki**: Prev | Play/Pause | Next
- **Album art** + tytuł + mini visualizer (5 barów CSS)
- **Volume**: slider z mute toggle (desktop only)
- **Close**: zamyka player
- **Keyboard shortcuts**: Space (play/pause), Arrow Left/Right (seek ±5s, +Shift ±10s), Arrow Up/Down (volume), M (mute toggle)
- **Hooks**: `useAudio()`, `useAudioProgress()`

#### `ContactForm.tsx` (`src/components/features/ContactForm.tsx`)
Formularz EmailJS z polami: name, email, message.
- **Stany**: idle → sending → sent → cooldown (30s) | error (4s)
- **Walidacja**: regex email, sanitizacja HTML tags
- **Env vars**: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
- **Double-submit guard** + cooldown
- **Focus management**: fokus na success message po wysłaniu

#### `CodeViewer.tsx` (`src/components/features/CodeViewer.tsx`)
Podgląd snippetów kodu z annotacjami per linia. Tab interface do przełączania między snippetami.

#### `ImageLightbox.tsx` (`src/components/features/ImageLightbox.tsx`)
Grid miniaturek → kliknięcie otwiera lightbox z powiększonym obrazem. Keyboard navigation.

#### `ProjectCard.tsx` (`src/components/features/ProjectCard.tsx`)
Karta projektu do użycia w gridach. Link do strony projektu.

#### `Showreel.tsx` (`src/components/features/Showreel.tsx`)
Vimeo embed showreela. Tryby: `modal` (z close button) lub inline.

#### `ProductionTimeline.tsx` (`src/components/features/ProductionTimeline.tsx`)
Timeline produkcji audio.

### Music

#### `MusicHero.tsx` (`src/components/features/music/MusicHero.tsx`)
Sekcja hero strony muzyki.

#### `TrackCard.tsx` (`src/components/features/music/TrackCard.tsx`)
Karta utworu z cover art, tytułem, play button. Highlight gdy aktualnie odtwarzany.

### Projects

#### `ProjectGrid.tsx` (`src/components/features/projects/ProjectGrid.tsx`)
Bento grid layout projektów z animacjami stagger.

#### `ProjectFilters.tsx` (`src/components/features/projects/ProjectFilters.tsx`)
Pill buttons filtrów kategorii (All, Game Audio, Sound Design, Music, Dev Tool, etc.).

#### `ProjectHero.tsx` (`src/components/features/projects/ProjectHero.tsx`)
Hero sekcja strony projektu z thumbnail, tytułem, tagami.

#### `ProjectSidebar.tsx` (`src/components/features/projects/ProjectSidebar.tsx`)
Sidebar (sticky) z metadanymi: tech stack, linki, rok, kategoria, tagi.

#### `ContentBlockRenderer.tsx` (`src/components/features/projects/ContentBlockRenderer.tsx`)
Renderuje tablicę `content_blocks` z projektu. Obsługuje typy: `text`, `image`, `video`, `split_text_media`, `stats_grid`, `code`.

#### `ChallengesBlock.tsx` (`src/components/features/projects/ChallengesBlock.tsx`)
Grid kart challenge/problem/solution.

#### `ProjectCodeSection.tsx` (`src/components/features/projects/ProjectCodeSection.tsx`)
Collapsible sekcja ze snippetami kodu projektu.

#### `ProjectRichDetails.tsx` (`src/components/features/projects/ProjectRichDetails.tsx`)
Renderuje responsibilities, performance_metrics, technical_achievements, audio_systems, audio_design, technical_work — jako listy lub key-value pairs.

### Gradwork

5 komponentów sekcji pracy dyplomowej:
- `GradworkHeader.tsx` — hero z tytułem i opisem
- `GradworkSetup.tsx` — opis problemu i setupu
- `GradworkResults.tsx` — wyniki badań
- `GradworkSolution.tsx` — opis rozwiązania
- `GradworkClosing.tsx` — podsumowanie i wnioski

### UI

#### `Button.tsx` (`src/components/ui/Button.tsx`)
Warianty: `primary` (accent bg), `secondary` (border), `ghost` (transparent). Rozmiary: `sm`, `md`, `lg`.

#### `Modal.tsx` (`src/components/ui/Modal.tsx`)
Generyczne okno modalne z backdrop, focus trap, Escape to close.

#### `IntroAnimation.tsx` (`src/components/ui/IntroAnimation.tsx`)
Animacja intro wyświetlana raz na sesję (sessionStorage `intro_shown`). Callback `onComplete`.

#### `PageLoader.tsx` (`src/components/ui/PageLoader.tsx`)
Suspense fallback dla lazy-loaded stron.

#### `ScrollProgress.tsx` (`src/components/ui/ScrollProgress.tsx`)
Cienki pasek postępu scrolla na samej górze viewportu.

#### `TechReveal.tsx` (`src/components/ui/TechReveal.tsx`)
Animacja odkrywania narzędzi/technologii.

#### `ImageWithLoader.tsx` (`src/components/ui/ImageWithLoader.tsx`)
Obrazek z placeholder/skeleton loader.

#### `MediaRenderer.tsx` (`src/components/ui/MediaRenderer.tsx`)
Renderuje media (obraz lub video) na podstawie rozszerzenia pliku.

#### `ErrorBoundary.tsx` (`src/components/ui/ErrorBoundary.tsx`)
React Error Boundary z fallback UI.

---

## Context & Hooks

### `AudioContext.tsx` (`src/context/AudioContext.tsx`)
Globalny provider audio. Zarządza jednym `HTMLAudioElement` dla całej aplikacji.

**Dwa konteksty** (split dla performance):
1. `AudioControlsContext` — kontrolki (rzadkie re-renders)
2. `AudioProgressContext` — progress/time (~4x/sec podczas playback)

**Eksportowane hooki**:
- `useAudio()` → `{ currentTrack, isPlaying, playlist, playTrack, togglePlay, nextTrack, prevTrack, loadPlaylist, seek, volume, setVolume, isPlayerVisible, closePlayer }`
- `useAudioProgress()` → `{ progress, duration, currentTime }`

**Dane**: Ładuje `tracks.json` jako domyślną playlistę.
**Preload**: Pierwszy track jest preloadowany, żeby togglePlay działał od razu.

### `usePortfolioData.ts` (`src/hooks/usePortfolioData.ts`)
Zwraca typowane dane z `portfolioData.json` jako `PortfolioData`.
- W DEV mode: waliduje wymagane pola i loguje warningi
- Double cast: `portfolioData as unknown as PortfolioData`

### `useProjectFilter.ts` (`src/hooks/useProjectFilter.ts`)
Zarządza filtrami kategorii na stronie projektów.
- **Input**: lista projektów
- **Output**: `{ filter, setFilter, categories, filteredProjects, getCategoryLabel }`
- **KEY_MAP**: mapuje nazwy kategorii na klucze i18n (Game Audio → projects_filter_game, etc.)
- Default filter: "All"

---

## Typy TypeScript

### `Project` (`src/types/project.ts`)
```typescript
interface Project {
  id: string;
  i18nNamespace?: string;           // Namespace tłumaczeń
  title: string;
  category: string;                 // Game Audio, Sound Design, Music, Dev Tool, etc.
  year?: number;
  description?: string;
  short_description?: string;
  full_description?: string;
  content_blocks?: ContentBlock[];   // Dynamiczne bloki treści
  tags: string[];
  technologies?: string[];
  links?: { demo?, repo?, video?, video_legacy?, documentation? };
  media: { thumbnail, images?, video?, video_legacy?, audio? };
  code_snippets?: CodeSnippet[];
  challenges_solved?: ChallengeSolved[];
  responsibilities?: string[];
  technical_stack?: Record<string, string>;
  performance_metrics?: Record<string, string>;
  technical_achievements?: Record<string, string>;
  audio_systems?: Record<string, string>;
  team_size?: number;
  engine?: string;
  platforms?: string[];
  collaboration?: string;
  key_scenes?: string[];
  audio_design?: Record<string, string>;
  technical_work?: Record<string, string>;
  externalLink?: string;
  featured?: boolean;
}
```

### `ContentBlock` (`src/types/project.ts`)
Typ bloku treści: `text | image | video | split_text_media | stats_grid | code`

### `CodeSnippet` (`src/types/project.ts`)
```typescript
interface CodeSnippet {
  title: string;
  language: string;
  code: string;
  description?: string;
  annotations?: CodeAnnotation[];  // { line, label, explanation }
}
```

### `Track` (`src/types/music.ts`)
```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;           // Ścieżka do cover art
  sources: TrackSource[];  // { url, type }
  desc: Record<string, string>;  // pl/en/nl descriptions
  tags: string[];
  length: number;          // Długość w sekundach
  year?: number;
  date?: string;
}
```

### `PortfolioData` (`src/types/data.ts`)
```typescript
interface PortfolioData {
  personal_info: PersonalInfo;
  education: { current, previous[] };
  professional_summary: ProfessionalSummary;
  featured_projects: Project[];
  additional_projects: Project[];
  core_skills: CoreSkills;
  statistics: Statistics;
  technical_skills_matrix: TechnicalSkillsMatrix;
}
```

### `PersonalInfo` (`src/types/personal.ts`)
Zawiera: name, title, role, email, location (city/country/region), availability (status/period/duration/passport/relocation/remote), languages, social_media (github/linkedin/spotify/itch_io/website).

---

## Stałe (Constants)

### `routes.ts` (`src/constants/routes.ts`)
Obiekt `ROUTES` z wszystkimi ścieżkami URL. Typ `RouteKey`.

### `motion.ts` (`src/constants/motion.ts`)
Presety animacji framer-motion:
- `pageVariants` — przejścia stron
- `containerVariants` / `itemVariants` — stagger children
- `fadeUpVariants` — fade up scroll-triggered
- `fadeInVariants` — fade in (bez ruchu pionowego)
- `cardHover` — hover na kartach
- `hero`, `sectionReveal`, `cardIn`, `detailIn`, `detailInRight` — legacy presety
- `stagger` — delays: cards 0.08, tags 0.03, timeline 0.1, navItems 0.08, skills 0.05
- `spring` — interactive (300/25), gentle (200/20)
- `noMotion` — static (reduced motion)
- `viewportOnce` — `{ once: true, margin: '-80px' }`

### `techData.ts` (`src/constants/techData.ts`)
- `TECH_ICON_MAP` — mapuje nazwy technologii na pliki ikon
- `TECH_CATEGORIES` — 4 kategorie: Code (C++, C#, Python, Blueprints, JUCE, Pure Data), Middleware (Wwise, FMOD, MetaSounds, 3D Audio), Engine (UE5, Unity), Tools (Reaper, Logic Pro, iZotope RX, GitHub, Perforce)

### `techConnections.ts` (`src/constants/techConnections.ts`)
Mapa powiązań między technologiami (np. Wwise ↔ Unreal Engine 5, C++ ↔ JUCE).

---

## Utilities (`src/utils/index.ts`)

```typescript
formatTime(seconds: number): string     // 90 → "1:30"
getSafeLanguage(langCode: string): 'en' | 'pl' | 'nl'  // 'en-US' → 'en'
cn(...classes: (string | undefined | null | false)[]): string  // Merge klas CSS
```

---

## Dane

### `portfolioData.json` (`src/data/portfolioData.json`)
Główny plik danych. Zawiera:
- `personal_info`: Igor Szuniewicz, Kortrijk Belgium, email, social media, availability
- `education`: current (Howest DAE), previous (high school, music school)
- `professional_summary`: tagline, short_bio, extended_bio
- `featured_projects`: główne projekty
- `additional_projects`: dodatkowe projekty
- `core_skills`: game_audio, production, programming, tools
- `statistics`: years_of_music, completed_projects, tools_built, etc.
- `technical_skills_matrix`: szczegółowa matryca umiejętności

### `tracks.json` (`src/data/tracks.json`)
Lista utworów muzycznych. Każdy track ma: id, title, artist, cover (ścieżka do obrazka), sources (url + type), desc (pl/en/nl), tags, length (sekundy), year, date.

---

## i18n — Tłumaczenia

**Konfiguracja**: `src/i18n.ts` — i18next z `i18next-http-backend` (ładuje JSON z `/locales/{lang}/{ns}.json`) + `i18next-browser-languagedetector`.

**Obsługiwane języki**: `en`, `pl`, `nl`

**Namespaces** (pliki JSON w `public/locales/{lang}/`):
| Namespace | Używany przez |
|---|---|
| `common` | Layout, Navbar, Footer, AudioPlayer |
| `home` | Home page |
| `projects` | Projects page, ProjectFilters |
| `projectDetail` | ProjectDetails |
| `about` | About page |
| `contact` | Contact page |
| `music` | Music page |
| `notFound` | 404 page |
| `gradwork` | Gradwork page |
| `transientica` | Transientica page |
| `soundDesign` | SoundDesign page |
| `shadowFrames` | ShadowFrames page |
| `notTodayDarling` | NotTodayDarling page |
| `audioq` | AudioQ page |
| `rayAnimation` | RayAnimation page |
| `amorak` | Amorak page |
| `middlewareOptimization` | MiddlewareOptimization page |
| `richter` | Richter page |
| `akantilado` | Akantilado page |
| `pauseAndDeserve` | PauseAndDeserve page |
| `wwiseUnrealFixer` | WwiseUnrealFixer page |
| `unrealEngineRebuilder` | UnrealEngineRebuilder page |

---

## Konfiguracja

### Tailwind (`tailwind.config.js`)
Design system z custom tokenami:
- **Kolory**: `surface` (tła), `text-primary/secondary/tertiary`, `accent`/`accent-hover`, `border`, `success`, `error`
- **Fonty**: `display` (Inter), `sans` (Inter), `mono` (JetBrains Mono), `pixel` (Press Start 2P)
- **Typography scale**: `hero`, `h1`-`h4`, `body`, `body-sm`, `caption`, `overline`
- **Max-width**: `content` (1200px), `content-wide` (1400px)
- **Z-index**: `nav` (50), `audio-player` (60), `modal` (70), `overlay` (80), `max` (99)
- **Animacje**: waveform-1 do waveform-5, pulse-glow, waveform-bar

### Vite (`vite.config.ts`)
- Plugin: `@vitejs/plugin-react`
- Path alias: `@` → `./src`
- Base URL: `/` (konfigurowalny)

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Strict mode
- Path alias: `@/*` → `src/*`
- JSX: react-jsx

### ESLint (`eslint.config.js`)
- TypeScript ESLint
- React Hooks plugin
- React Refresh plugin
- Zero warnings policy

---

## Zależności — kluczowe paczki

| Paczka | Wersja | Do czego |
|---|---|---|
| `react` | ^18.2.0 | UI framework |
| `react-router-dom` | ^6.22.0 | Routing SPA |
| `framer-motion` | ^11.0.0 | Animacje |
| `i18next` + `react-i18next` | ^23/^14 | Internationalizacja |
| `@emailjs/browser` | ^4.4.1 | Wysyłanie emaili z formularza |
| `lucide-react` | ^0.344.0 | Ikony SVG |
| `react-helmet-async` | ^2.0.5 | Meta tagi SEO |
| `@vimeo/player` | ^2.30.1 | Vimeo video embed |
| `tailwindcss` | ^3.4.1 | CSS utility-first |
| `vite` | ^5.1.6 | Bundler/dev server |
| `typescript` | ^5.2.2 | Type checking |
| `vitest` | ^4.0.13 | Test runner |
| `gh-pages` | ^6.3.0 | Deploy na GitHub Pages |

---

## Wzorce projektowe

### Lazy Loading
Wszystkie strony ładowane przez `safeLazy()` — wrapper wokół `React.lazy()` z automatycznym retryem (reload strony przy chunk load failure, max 1 retry per chunk via sessionStorage).

### Reduced Motion
Każda strona z animacjami używa `useReducedMotion()` z framer-motion. Gdy użytkownik preferuje reduced motion → animacje zastąpione przez `noMotion` variants (opacity:1, y:0, duration:0).

### Bento Grid Pattern
Większość stron projektów używa wspólnego wzorca: `motion.div` z `grid grid-cols-1 md:grid-cols-3` + `containerVariants`/`itemVariants` + `SectionLabel` helper component. Każda sekcja to `motion.section` z `variants={itemVars}`.

### Audio Architecture
Split context pattern: `AudioControlsContext` (rzadkie updates) + `AudioProgressContext` (częste updates ~4x/sec). Refs mirror state w event listenerach, żeby uniknąć stale closures.

### Data Layer
Statyczny JSON (`portfolioData.json`, `tracks.json`) zamiast API. Hook `usePortfolioData()` z dev-time validation.

### SEO
Każda strona ma `<SEO>` component. Strony projektów mają dodatkowe JSON-LD (BreadcrumbList + CreativeWork). Homepage ma Person schema.
