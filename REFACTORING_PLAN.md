# 🏗️ PLAN REFAKTORINGU - Igor Szuniewicz Portfolio

## Status: W TRAKCIE
Data rozpoczęcia: 2025-11-13

---

## 🎯 CEL REFAKTORINGU

Przekształcenie portfolio w **clean, maintainable, scalable** codebase z:
- Logiczną strukturą folderów
- Spójnymi konwencjami nazewnictwa
- Modularnym kodem
- Jednolitym stylem
- Łatwą nawigacją

---

## 📂 NOWA STRUKTURA PROJEKTU

```
igorszuniewicz/
├── src/                          # Wszystkie źródła (nowe!)
│   ├── assets/
│   │   ├── css/
│   │   │   ├── 01-settings/      # Zmienne, fonty, kolory
│   │   │   │   ├── _colors.css
│   │   │   │   ├── _typography.css
│   │   │   │   ├── _spacing.css
│   │   │   │   └── _breakpoints.css
│   │   │   ├── 02-tools/          # Mixiny, funkcje (jeśli używamy preprocesora)
│   │   │   ├── 03-base/           # Reset, normalize, base styles
│   │   │   │   ├── _reset.css
│   │   │   │   ├── _typography-base.css
│   │   │   │   └── _global.css
│   │   │   ├── 04-layout/         # Grid, flexbox, page structure
│   │   │   │   ├── _grid.css
│   │   │   │   ├── _container.css
│   │   │   │   ├── _header.css
│   │   │   │   ├── _footer.css
│   │   │   │   └── _sidebar.css
│   │   │   ├── 05-components/     # Reusable UI components
│   │   │   │   ├── _buttons.css
│   │   │   │   ├── _cards.css
│   │   │   │   ├── _navigation.css
│   │   │   │   ├── _audio-player.css
│   │   │   │   ├── _modal.css
│   │   │   │   ├── _toast.css
│   │   │   │   ├── _forms.css
│   │   │   │   └── _back-to-top.css
│   │   │   ├── 06-pages/          # Page-specific styles
│   │   │   │   ├── _home.css
│   │   │   │   ├── _about.css
│   │   │   │   ├── _music.css
│   │   │   │   ├── _contact.css
│   │   │   │   └── _project-detail.css
│   │   │   ├── 07-themes/         # Themes (dark/light)
│   │   │   │   └── _dark-theme.css
│   │   │   ├── 08-utilities/      # Helper classes
│   │   │   │   ├── _spacing.css
│   │   │   │   ├── _display.css
│   │   │   │   ├── _text.css
│   │   │   │   └── _responsive.css
│   │   │   ├── 09-animations/     # Animations & transitions
│   │   │   │   ├── _transitions.css
│   │   │   │   ├── _keyframes.css
│   │   │   │   └── _scroll-effects.css
│   │   │   └── main.css           # Master import file
│   │   │
│   │   ├── js/
│   │   │   ├── core/              # Core functionality
│   │   │   │   ├── app.js         # Main app initialization
│   │   │   │   ├── config.js      # Configuration constants
│   │   │   │   ├── router.js      # Page routing logic
│   │   │   │   └── events.js      # Global event bus
│   │   │   ├── components/        # UI Components
│   │   │   │   ├── Navigation.js
│   │   │   │   ├── AudioPlayer.js
│   │   │   │   ├── Modal.js
│   │   │   │   ├── Toast.js
│   │   │   │   ├── BackToTop.js
│   │   │   │   ├── LanguageSwitcher.js
│   │   │   │   └── CustomCursor.js
│   │   │   ├── modules/           # Feature modules
│   │   │   │   ├── i18n.js        # Internationalization
│   │   │   │   ├── analytics.js   # Google Analytics
│   │   │   │   ├── form-handler.js
│   │   │   │   ├── lightbox.js
│   │   │   │   └── video-player.js
│   │   │   ├── pages/             # Page-specific scripts
│   │   │   │   ├── home.js
│   │   │   │   ├── about.js
│   │   │   │   ├── music.js
│   │   │   │   ├── contact.js
│   │   │   │   └── project.js
│   │   │   ├── utils/             # Helper utilities
│   │   │   │   ├── dom.js         # DOM helpers
│   │   │   │   ├── fetch.js       # API fetch utilities
│   │   │   │   ├── storage.js     # LocalStorage wrapper
│   │   │   │   ├── validators.js  # Form validation
│   │   │   │   └── helpers.js     # General helpers
│   │   │   ├── services/          # Business logic services
│   │   │   │   ├── AnalyticsService.js
│   │   │   │   ├── AudioService.js
│   │   │   │   ├── TranslationService.js
│   │   │   │   └── PerformanceService.js
│   │   │   └── main.js            # Entry point
│   │   │
│   │   ├── images/                # Zoptymalizowane
│   │   ├── audio/                 # Pliki audio
│   │   ├── video/                 # Pliki wideo
│   │   └── fonts/                 # Fonty
│   │
│   ├── pages/                     # HTML templates
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── music.html
│   │   ├── contact.html
│   │   └── projects/
│   │       ├── akantilado.html
│   │       ├── amorak.html
│   │       └── ...
│   │
│   └── locales/                   # Translations
│       ├── en/
│       ├── pl/
│       └── nl/
│
├── public/                        # Static files (copied as-is)
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   └── manifest.json
│
├── dist/                          # Build output
├── docs/                          # Documentation
├── scripts/                       # Build scripts
└── tests/                         # Test files
```

---

## 🔧 KONWENCJE NAZEWNICTWA

### CSS
- **Files:** `_component-name.css` (underscore prefix dla partials)
- **Classes:** BEM notation
  ```css
  .block {}
  .block__element {}
  .block--modifier {}
  ```
- **Variables:** `--color-primary`, `--spacing-md`, `--font-heading`

### JavaScript
- **Files:** PascalCase dla klas (`AudioPlayer.js`), camelCase dla modułów (`analytics.js`)
- **Classes:** PascalCase (`class AudioPlayer {}`)
- **Functions:** camelCase (`function initPlayer() {}`)
- **Constants:** UPPER_SNAKE_CASE (`const API_KEY = '...'`)
- **Private methods:** `_privateMethod()`

### HTML
- **Attributes:** kebab-case (`data-audio-id="1"`)
- **IDs:** camelCase (`id="audioPlayer"`)
- **Classes:** BEM (`class="audio-player__button--active"`)

---

## 📝 FAZY REFAKTORINGU

### FAZA 1: SETUP & CRITICAL FIXES ✅
- [ ] Dodać DOCTYPE do wszystkich HTML
- [ ] Naprawić Vite config (multi-page setup)
- [ ] Stworzyć nową strukturę folderów
- [ ] Dodać ESLint + Prettier config

### FAZA 2: CSS REFACTORING
- [ ] Stworzyć system zmiennych CSS (colors, spacing, typography)
- [ ] Refaktoryzować base styles
- [ ] Refaktoryzować komponenty (BEM)
- [ ] Przenieść page-specific styles
- [ ] Usunąć duplikaty i nieużywany CSS
- [ ] Stworzyć utilities classes

### FAZA 3: JAVASCRIPT REFACTORING
- [ ] Stworzyć core app structure
- [ ] Refaktoryzować komponenty UI
- [ ] Refaktoryzować moduły (i18n, analytics)
- [ ] Stworzyć services layer
- [ ] Standaryzować error handling
- [ ] Dodać JSDoc comments

### FAZA 4: HTML REFACTORING
- [ ] Standaryzować HTML structure
- [ ] Poprawić semantic HTML
- [ ] Uspójnić meta tags
- [ ] Dodać ARIA labels konsekwentnie
- [ ] Stworzyć reusable HTML components

### FAZA 5: BUILD & OPTIMIZATION
- [ ] Zaktualizować Vite config
- [ ] Dodać code splitting strategy
- [ ] Skonfigurować asset optimization
- [ ] Dodać source maps config
- [ ] Stworzyć production build script

### FAZA 6: TESTING & QA
- [ ] Napisać unit tests (Vitest)
- [ ] Przetestować wszystkie funkcjonalności
- [ ] Sprawdzić performance (Lighthouse)
- [ ] Walidować accessibility (WAVE)
- [ ] Test cross-browser

### FAZA 7: DOCUMENTATION
- [ ] Stworzyć README dla developerów
- [ ] Dokumentować komponenty
- [ ] Stworzyć style guide
- [ ] Dodać contributing guidelines

---

## 🎨 SYSTEM DESIGNU

### Color System
```css
:root {
  /* Primary */
  --color-primary-900: #...;
  --color-primary-500: #...;
  --color-primary-100: #...;

  /* Secondary */
  --color-secondary-900: #...;

  /* Neutrals */
  --color-neutral-900: #...;
  --color-neutral-500: #...;
  --color-neutral-100: #...;

  /* Semantic */
  --color-success: #...;
  --color-warning: #...;
  --color-error: #...;
  --color-info: #...;
}
```

### Spacing System (8px base)
```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
}
```

### Typography Scale
```css
:root {
  --font-family-base: 'Poppins', sans-serif;
  --font-family-heading: 'Sora', sans-serif;

  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */
  --font-size-4xl: 3rem;      /* 48px */
}
```

---

## 🔍 CODE QUALITY STANDARDS

### JavaScript
- ES6+ features (arrow functions, destructuring, async/await)
- No global variables (use modules)
- Consistent error handling (try/catch + logging)
- JSDoc comments for public APIs
- Max function length: 50 lines
- Max file length: 300 lines

### CSS
- Mobile-first approach
- No !important (except utilities)
- Max nesting depth: 3 levels
- Alphabetical property order
- CSS custom properties for theming

### HTML
- Semantic HTML5 elements
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images
- ARIA labels where needed
- Valid HTML (W3C validator)

---

## ✅ DEFINITION OF DONE

Refaktoring jest zakończony gdy:

1. ✅ Wszystkie pliki są w nowej strukturze
2. ✅ Konwencje nazewnictwa są spójne
3. ✅ Nie ma duplikatów kodu
4. ✅ Wszystkie funkcjonalności działają
5. ✅ Tests pass (minimum 70% coverage)
6. ✅ Lighthouse score > 90 (wszystkie kategorie)
7. ✅ ESLint 0 errors, 0 warnings
8. ✅ Build działa bez błędów
9. ✅ Dokumentacja jest kompletna
10. ✅ Code review przeprowadzony

---

## 📊 METRYKI SUKCESU

### Przed refaktoringiem
- 79 plików JS (nieuporządkowane)
- 25 plików CSS (niespójne)
- Brak testów
- 44 ESLint warnings
- Niejasna struktura

### Po refaktoringu (cele)
- Logiczna struktura folderów (ITCSS approach)
- 0 ESLint warnings/errors
- Min. 70% test coverage
- Lighthouse score > 90
- Dokumentacja 100%
- Build time < 5s

---

## 🚀 NASTĘPNE KROKI

1. ✅ Utworzyć nową strukturę folderów
2. Naprawić krytyczne błędy (DOCTYPE, Vite)
3. Migrować CSS (ITCSS approach)
4. Migrować JavaScript (modular architecture)
5. Zaktualizować HTML files
6. Napisać testy
7. Zaktualizować build config
8. Final testing & deploy

---

**Autor:** Igor Szuniewicz
**Kontakt:** [contact details]
**Data ostatniej aktualizacji:** 2025-11-13
