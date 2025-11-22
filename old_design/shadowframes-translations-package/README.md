# Shadow Frames - Package Tłumaczeń i Systemów Powiązanych

**Data utworzenia:** 2025-11-20
**Wersja:** 1.0

## Zawartość Pakietu

### 1. System Tłumaczeń (i18n/)
Wszystkie pliki tłumaczeń projektu:
```
i18n/i18n/
├── en/
│   ├── home.json (102 linie)
│   └── nav.json
├── pl/
│   ├── home.json
│   └── nav.json
└── nl/
    ├── home.json
    └── nav.json
```

**Języki obsługiwane:**
- `en` - English (główny)
- `pl` - Polski
- `nl` - Nederlands (holenderski)

### 2. Silnik Tłumaczeń (js/)
- `BulletproofI18n.js` - Główny system tłumaczeń (5-layer fallback)
- `translations.js` - Pomocniczy moduł tłumaczeń

### 3. Strony HTML (pages/)
- `shadow-frames.html` - Strona projektu Shadow Frames (575 linii)
- `projects-index.html` - Lista projektów z linkiem do Shadow Frames

### 4. Dokumentacja (docs/)
- `COMPLETE_PROJECT_SHADOWFRAMES_DOCUMENTATION.md` - Pełna dokumentacja techniczna projektu
- `SHADOW_FRAMES_IMPLEMENTATION.md` - Szczegóły implementacji (jeśli istnieje)

## WAŻNE USTALENIA

### ❌ Shadow Frames NIE MA tłumaczeń w systemie i18n

**Strona `shadow-frames.html`:**
- ✗ NIE używa atrybutu `data-i18n`
- ✗ NIE jest podpięta do systemu BulletproofI18n.js
- ✗ Wszystkie teksty są hardcoded w HTML/JavaScript
- ✗ Brak obsługi wielojęzyczności

**Strona `projects/index.html` (lista projektów):**
- ✓ UŻYWA atrybutów `data-i18n` dla Shadow Frames:
  - `data-i18n="projects.shadow_frames.badge"`
  - `data-i18n="projects.shadow_frames.title"`
  - `data-i18n="projects.shadow_frames.description"`
  - `data-tech="projects.shadow_frames.tech"`

**Problem:** Te klucze tłumaczeń NIE ISTNIEJĄ w plikach JSON!

## Brakujące Tłumaczenia

### Wymagane klucze w `assets/i18n/{lang}/home.json`:

```json
{
  "projects": {
    "cards": {
      "shadow_frames": {
        "badge": "Game Audio",
        "title": "Shadow Frames",
        "description": "Audio-driven horror game. Prototype done, now in production.",
        "tech": ["Wwise", "Unreal Engine", "C++", "Spatial Audio"]
      }
    }
  }
}
```

### Wersje tłumaczeń do dodania:

**Angielski (en):**
```json
"shadow_frames": {
  "badge": "Game Audio",
  "title": "Shadow Frames",
  "description": "Audio-driven horror game. Prototype done, now in production.",
  "tech": ["Wwise", "Unreal Engine", "C++", "Spatial Audio"]
}
```

**Polski (pl):**
```json
"shadow_frames": {
  "badge": "Audio Gry",
  "title": "Shadow Frames",
  "description": "Gra horror sterowana dźwiękiem. Prototyp ukończony, teraz w produkcji.",
  "tech": ["Wwise", "Unreal Engine", "C++", "Dźwięk Przestrzenny"]
}
```

**Nederlands (nl):**
```json
"shadow_frames": {
  "badge": "Game Audio",
  "title": "Shadow Frames",
  "description": "Audio-gedreven horrorspel. Prototype klaar, nu in productie.",
  "tech": ["Wwise", "Unreal Engine", "C++", "Ruimtelijke Audio"]
}
```

## Systemy Powiązane z Shadow Frames

### 1. System Nawigacji (Navigation Component)
- **Lokalizacja:** `assets/js/components/navigation.js`
- **Klucze tłumaczeń:** `nav_*` w `assets/i18n/{lang}/nav.json`
- **Status:** ✓ Działa poprawnie

### 2. System AJAX Navigation (Enhanced Smooth Navigation)
- **Lokalizacja:** `assets/js/enhanced-smooth-navigation.js`
- **Moduły:** cache, cleanup, media-loader, script-reinit, page-handlers, core
- **Status:** ✓ Działa poprawnie
- **Uwaga:** Automatycznie ładuje strony bez przeładowania

### 3. System Lazy Loading (Media Loader)
- **Lokalizacja:** `assets/js/ajax/media-loader.js`
- **Funkcja:** Ładowanie obrazów i wideo na żądanie
- **Status:** ✓ Działa poprawnie

### 4. Footer Component
- **Lokalizacja:** `assets/js/components/footer.js`
- **Klucze tłumaczeń:** `footer_*` w plikach i18n
- **Status:** ✓ Działa poprawnie

### 5. Skill Modal System
- **Lokalizacja:** `assets/js/skill-modal-system.js`
- **Klucze tłumaczeń:** `skillModal_*`
- **Status:** ✓ Działa poprawnie

## Plan Implementacji Tłumaczeń dla Shadow Frames

### Opcja A: Dodać Shadow Frames do systemu i18n (ZALECANE)

**Kroki:**
1. Dodać brakujące klucze do `assets/i18n/{en,pl,nl}/home.json`
2. Zmodyfikować `shadow-frames.html`:
   - Dodać `<script type="module" src="../assets/js/refactored/services/BulletproofI18n.js">`
   - Zamienić hardcoded teksty na atrybuty `data-i18n`
   - Dodać inline critical translations (window.__I18N__)
3. Dodać przełącznik języka na stronie Shadow Frames

**Zalety:**
- Spójność z resztą projektu
- Automatyczne tłumaczenia dla wszystkich języków
- Łatwa konserwacja

**Wady:**
- Wymaga znaczącej modyfikacji `shadow-frames.html`

### Opcja B: Pozostawić Shadow Frames jako standalone (NIE ZALECANE)

**Kroki:**
1. Usunąć atrybuty `data-i18n` z `projects/index.html`
2. Hardcoded tekst bezpośrednio w HTML

**Zalety:**
- Brak zmian w `shadow-frames.html`

**Wady:**
- Brak wielojęzyczności
- Niespójność z projektem
- Trudniejsza konserwacja

## Struktura Projektu - Systemy i18n

```
/
├── assets/
│   ├── i18n/              # Pliki tłumaczeń JSON
│   └── js/
│       ├── refactored/
│       │   └── services/
│       │       └── BulletproofI18n.js  # Główny silnik
│       ├── components/
│       │   ├── navigation.js          # Nawigacja
│       │   └── footer.js              # Stopka
│       └── enhanced-smooth-navigation.js  # AJAX navigation
├── projects/
│   ├── shadow-frames.html  # ❌ Bez i18n
│   └── index.html          # ✓ Z i18n (ale brakuje kluczy)
├── index.html              # ✓ Z i18n
├── about.html              # ✓ Z i18n
├── contact.html            # ✓ Z i18n
└── music.html              # ✓ Z i18n
```

## Kluczowe Pliki do Modyfikacji

### 1. Dodać brakujące klucze (PRIORYTET 1):
- `assets/i18n/en/home.json` - dodać `projects.cards.shadow_frames`
- `assets/i18n/pl/home.json` - dodać `projects.cards.shadow_frames`
- `assets/i18n/nl/home.json` - dodać `projects.cards.shadow_frames`

### 2. Opcjonalnie - dodać i18n do shadow-frames.html (PRIORYTET 2):
- `projects/shadow-frames.html` - przepisać na system i18n

## Kontakt i Wsparcie

**Autor:** Igor Szuniewicz
**Email:** igorszuniewiczwork@gmail.com
**GitHub:** https://github.com/Szunias

---

**Uwaga:** Ten pakiet zawiera TYLKO kod źródłowy (HTML, CSS, JS, JSON). Assety binarne (obrazy, wideo) NIE SĄ uwzględnione.
