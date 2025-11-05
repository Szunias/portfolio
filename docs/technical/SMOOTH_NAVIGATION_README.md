# System Płynnej Nawigacji

## Opis
System eliminuje białe migotanie między stronami i dodaje płynne przejścia typu fade-in/fade-out.

## Funkcje
- ✅ Eliminacja białego migotania (white flicker)
- ✅ Płynne przejścia fade-in/fade-out
- ✅ Preload stron przy hover
- ✅ Cache dla szybszego ładowania
- ✅ Kompatybilność z systemem tłumaczeń
- ✅ Obsługa przycisku wstecz/dalej
- ✅ Reinicjalizacja skryptów po nawigacji
- ✅ Loading overlay podczas przejść

## Pliki
- `assets/js/smooth-navigation.js` - główny system nawigacji
- `assets/js/page-helpers.js` - funkcje pomocnicze (header scroll, countery)
- `assets/js/preload-lang.js` - zaktualizowany dla współpracy
- `assets/js/translations.js` - zaktualizowany dla współpracy

## Jak działa
1. Przechwytuje kliknięcia w linki
2. Fade-out obecnej strony (200ms)
3. Ładuje nową stronę (z cache lub fetch)
4. Zastępuje zawartość
5. Reinicjalizuje skrypty
6. Fade-in nowej strony (300ms)

## Konfiguracja
```javascript
const CONFIG = {
  fadeOutDuration: 200,    // Czas fade-out
  fadeInDuration: 300,     // Czas fade-in
  preloadDelay: 50,        // Opóźnienie preload przy hover
  cacheSize: 5,            // Rozmiar cache
  enablePreload: true      // Włącz preload
};
```

## Debugowanie
```javascript
// Dostępne w konsoli
window.smoothNavigation.navigateToPage('about.html');
window.smoothNavigation.pageCache; // Zobacz cache
window.smoothNavigation.CONFIG;    // Zobacz konfigurację
```

## Kompatybilność
- Działa ze wszystkimi przeglądarkami obsługującymi ES6
- Automatycznie fallback do standardowej nawigacji przy błędach
- Nie interferuje z zewnętrznymi linkami
- Obsługuje linki z target="_blank", download, mailto:, tel:

## Instalacja na nowych stronach
1. Dodaj `<script src="assets/js/preload-lang.js"></script>` w `<head>`
2. Dodaj przed `</body>`:
```html
<script src="assets/js/page-helpers.js"></script>
<script src="assets/js/translations.js"></script>
<script src="assets/js/smooth-navigation.js"></script>
```

## Uwagi
- System automatycznie wykrywa i cache'uje strony
- Preload działa przy hover nad linkami (50ms opóźnienie)
- Cache przechowuje maksymalnie 5 stron
- Automatycznie reinicjalizuje animacje i event listenery
- Kompatybilny z systemem tłumaczeń i zapobieganiem FOUC