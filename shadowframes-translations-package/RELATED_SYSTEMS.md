# Systemy Powiązane z Shadow Frames i Tłumaczeniami

## Wszystkie Komponenty Używające Systemu i18n

### 1. Główny Silnik Tłumaczeń
**BulletproofI18n.js** (`assets/js/refactored/services/BulletproofI18n.js`)
- 5-warstwowy fallback system
- Automatyczne wykrywanie języka
- Inline critical translations
- Lazy loading dodatkowych tłumaczeń
- Event: `languageChanged`

**Funkcje:**
- `init()` - inicjalizacja systemu
- `changeLanguage(lang)` - zmiana języka
- `_applyTranslations()` - aplikacja tłumaczeń do elementów DOM
- `_translateAttribute(element, attribute, key)` - tłumaczenie atrybutów

### 2. Navigation Component
**Plik:** `assets/js/components/navigation.js`

**Klucze tłumaczeń (nav.json):**
```
nav_home
nav_work
nav_about
nav_projects
nav_music
nav_contact
```

**Funkcjonalności:**
- Przełącznik języka (EN/PL/NL)
- Responsywne menu mobilne
- Scroll effects
- Active state dla aktualnej strony

### 3. Footer Component
**Plik:** `assets/js/components/footer.js`

**Klucze tłumaczeń:**
```
footer_projects
footer_music
footer_about
footer_contact
```

**Funkcjonalności:**
- Dynamiczne generowanie stopki
- Linki do projektów i kontaktu
- Integracja z systemem nawigacji

### 4. Enhanced Smooth Navigation
**Plik:** `assets/js/enhanced-smooth-navigation.js`

**Moduły:**
- `CacheManager` - cache stron
- `CleanupManager` - cleanup DOM
- `MediaLoader` - lazy loading
- `ScriptReinitializer` - reinicjalizacja skryptów
- `PageHandlers` - handlery specyficzne dla stron
- `NavigationCore` - rdzeń nawigacji

**Klucze tłumaczeń (error messages):**
```
error_loading
error_failed
error_retry
```

**Funkcjonalności:**
- AJAX navigation bez przeładowania
- View Transition API
- Preloading stron przy hover
- Automatyczna reinicjalizacja i18n po nawigacji

### 5. Skill Modal System
**Plik:** `assets/js/skill-modal-system.js`

**Klucze tłumaczeń:**
```
skillModal_connectedTech
skillModal_projectUsage
skillModal_noConnections
```

**Używane na:**
- `about.html` - strona "About" z umiejętnościami

### 6. Home Page Scripts
**Plik:** `assets/js/pages/home.js`

**Klucze tłumaczeń (home.json):**
```
hero.label
hero.title
hero.description
hero.cta_work
hero.cta_cv
hero.cta_contact
hero.availability

demo_reel.badge
demo_reel.title
demo_reel.description

core_tech.label
core_tech.title
core_tech.description
core_tech.wwise.*
core_tech.cpp.*
core_tech.unreal.*

projects.label
projects.title
projects.description
projects.viewall
projects.cards.*

stats.label
stats.title
stats.projects
stats.tools
stats.languages
stats.latency
```

## Strony Używające i18n

### ✅ Z pełną obsługą i18n:
1. **index.html** - strona główna
2. **about.html** - o mnie
3. **contact.html** - kontakt
4. **music.html** - muzyka
5. **projects/index.html** - lista projektów (+ inline translations w window.__I18N__)
6. **sound-design.html** - sound design showcase

### ⚠️ Częściowa obsługa i18n:
- **projects/index.html** - używa data-i18n, ale BRAKUJE kluczy dla shadow_frames

### ❌ Bez obsługi i18n:
1. **projects/shadow-frames.html** - standalone, wszystko hardcoded
2. **projects/gradwork.html** - (do sprawdzenia)
3. **projects/middleware2.html** - (do sprawdzenia)
4. **projects/*.html** - inne strony projektów (do sprawdzenia)

## Inline Critical Translations (window.__I18N__)

Wiele stron ma wbudowane krytyczne tłumaczenia w `<script>`:

```javascript
window.__I18N__ = {
  "en": {
    "nav_home": "Home",
    "nav_work": "Work",
    // ... etc
  },
  "pl": {
    "nav_home": "Start",
    "nav_work": "Portfolio",
    // ... etc
  },
  "nl": {
    "nav_home": "Home",
    "nav_work": "Portfolio",
    // ... etc
  }
};
```

**Strony z inline translations:**
- index.html
- about.html
- contact.html

## Flow Działania Systemu i18n

```
1. Użytkownik wchodzi na stronę
   ↓
2. Preload script ładuje język z localStorage
   window.__preloadedLang = savedLang
   ↓
3. Inline critical translations (window.__I18N__) - instant
   ↓
4. BulletproofI18n.js inicjalizacja:
   - Fetch JSON z assets/i18n/{lang}/{section}.json
   - Merge z inline translations
   ↓
5. _applyTranslations():
   - Znajduje wszystkie [data-i18n]
   - Znajduje wszystkie [data-i18n-placeholder]
   - Znajduje wszystkie [data-i18n-aria-label]
   - Aplikuje tłumaczenia
   ↓
6. document.documentElement.classList.add('translations-ready')
   - Pokazuje elementy (były ukryte przez CSS)
```

## Event System

### languageChanged
**Dispatch:** BulletproofI18n.js
**Listeners:**
- enhanced-smooth-navigation.js (line 118-140)
- navigation.js (aktualizacja przełącznika)
- music.html (refreshMusicList)

**Usage:**
```javascript
window.addEventListener('languageChanged', (e) => {
  const newLang = e.detail?.language;
  // Reaguj na zmianę języka
});
```

## CSS Classes dla i18n

### Ukrywanie elementów przed załadowaniem tłumaczeń:
```css
html:not(.translations-ready) [data-i18n],
html:not(.translations-ready) [data-i18n-placeholder],
html:not(.translations-ready) [data-i18n-aria-label] {
  visibility: hidden !important;
}
```

### Pokazywanie elementów po załadowaniu:
```css
html.translations-ready [data-i18n],
html.translations-ready [data-i18n-placeholder],
html.translations-ready [data-i18n-aria-label] {
  visibility: visible;
  animation: fadeInContent 0.2s ease-in;
}
```

## Struktura Plików Tłumaczeń

```
assets/i18n/
├── en/
│   ├── home.json       # Tłumaczenia dla strony głównej
│   └── nav.json        # Tłumaczenia nawigacji
├── pl/
│   ├── home.json
│   └── nav.json
└── nl/
    ├── home.json
    └── nav.json
```

**Brakujące pliki (potencjalnie):**
- `about.json` - dla strony about
- `contact.json` - dla strony contact
- `music.json` - dla strony music
- `projects.json` - dla stron projektów

**Uwaga:** Obecnie wszystkie tłumaczenia są w `home.json` lub jako inline translations.

## Dependency Graph

```
BulletproofI18n.js (core)
    ↓
    ├─→ navigation.js (używa nav_*)
    ├─→ footer.js (używa footer_*)
    ├─→ home.js (używa hero.*, projects.*, stats.*)
    ├─→ skill-modal-system.js (używa skillModal_*)
    └─→ enhanced-smooth-navigation.js (reaguje na languageChanged)
```

## Potencjalne Problemy

### 1. Shadow Frames brak tłumaczeń
- **Problem:** Klucze `projects.shadow_frames.*` używane w projects/index.html, ale nie istnieją w JSON
- **Fix:** Dodać do assets/i18n/{lang}/home.json

### 2. Duplikacja tłumaczeń
- **Problem:** Inline translations w HTML + JSON files
- **Zaleta:** Fallback, jeśli JSON się nie załaduje
- **Wada:** Trzeba aktualizować w dwóch miejscach

### 3. Brak modularyzacji tłumaczeń
- **Problem:** Wszystko w home.json zamiast osobnych plików (about.json, contact.json)
- **Wpływ:** Duży plik, dłuższe ładowanie
- **Rozwiązanie:** Rozdzielić na moduły i lazy load

## Rekomendacje

### Priorytet 1: Dodać brakujące klucze Shadow Frames
```javascript
// assets/i18n/{lang}/home.json
{
  "projects": {
    "cards": {
      // ... istniejące projekty
      "shadow_frames": {
        "badge": "...",
        "title": "...",
        "description": "...",
        "tech": ["..."]
      }
    }
  }
}
```

### Priorytet 2: Zmodularyzować tłumaczenia
Rozdzielić `home.json` na:
- `hero.json`
- `projects.json`
- `stats.json`
- etc.

### Priorytet 3: Dodać i18n do shadow-frames.html
Przepisać stronę na system data-i18n.

---

**Uwaga:** Ten dokument opisuje AKTUALNY stan systemu tłumaczeń w projekcie.
