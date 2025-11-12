# 🔧 Jak Przetestować Tłumaczenia - INSTRUKCJA

## ⚠️ WAŻNE: Problem z Protokołem File://

**Tłumaczenia NIE BĘDĄ DZIAŁAĆ** jeśli otworzysz pliki HTML bezpośrednio w przeglądarce (double-click).

**Dlaczego?**
- Przeglądarki blokują ładowanie plików JavaScript przez protokół `file://` ze względów bezpieczeństwa
- Potrzebujesz lokalnego serwera HTTP

## ✅ Rozwiązanie 1: Użyj Lokalnego Serwera (ZALECANE)

### Krok 1: Uruchom Serwer
```
Kliknij dwa razy na plik: START_SERVER.bat
```

### Krok 2: Otwórz Przeglądarkę
Serwer uruchomi się na: **http://localhost:8000**

### Krok 3: Testuj Strony
Otwórz w przeglądarce:

**Test strony:**
- http://localhost:8000/QUICK_TEST.html

**Projekty:**
- http://localhost:8000/projects/pawism.html
- http://localhost:8000/projects/akantilado.html
- http://localhost:8000/projects/richter.html
- http://localhost:8000/projects/environments.html
- itd...

### Krok 4: Testuj Tłumaczenia
1. Kliknij przyciski EN / PL / NL w prawym górnym rogu
2. Tekst na stronie powinien się natychmiast zmienić
3. Odśwież stronę - wybrany język powinien zostać zapamiętany

### Krok 5: Sprawdź Console (F12)
Naciśnij F12 aby otworzyć DevTools i sprawdź zakładkę "Console":
- Powinny być komunikaty: "Loading translations from..." i "Translations loaded successfully"
- Nie powinno być błędów (czerwonych komunikatów)

---

## ✅ Rozwiązanie 2: Użyj Node.js (jeśli masz zainstalowane)

```bash
npx http-server -p 8000
```

Potem otwórz: http://localhost:8000

---

## ✅ Rozwiązanie 3: Użyj VS Code Live Server

Jeśli używasz Visual Studio Code:
1. Zainstaluj rozszerzenie "Live Server"
2. Kliknij prawym na plik HTML
3. Wybierz "Open with Live Server"

---

## 🔍 Diagnostyka - Co Sprawdzić

### Test 1: Sprawdź czy pliki istnieją
Upewnij się że te pliki istnieją:
- ✅ `assets/js/project-translations.js`
- ✅ `locales/pawism.json`
- ✅ `locales/akantilado.json`
- ✅ `locales/richter.json`
- itd.

### Test 2: Sprawdź Console (F12)
Otwórz DevTools (F12) i sprawdź zakładkę Console:

**Dobre komunikaty (✅):**
```
Loading translations from: ../locales/pawism.json
Translations loaded successfully
```

**Złe komunikaty (❌):**
```
Failed to load translations: 404
Cross-origin request blocked
```

### Test 3: Sprawdź Network (F12 → Network)
1. Otwórz DevTools → zakładka Network
2. Odśwież stronę (F5)
3. Sprawdź czy `project-translations.js` został załadowany
4. Sprawdź czy `pawism.json` (lub inny) został załadowany
5. Status powinien być **200 OK**, nie 404

### Test 4: Sprawdź LocalStorage
1. Otwórz DevTools → Application → Local Storage
2. Kliknij na swoją domenę (localhost:8000)
3. Powinieneś zobaczyć klucz `language` z wartością `en`, `pl` lub `nl`

---

## 🐛 Problemy i Rozwiązania

### Problem: "Nic się nie dzieje gdy klikam przyciski"
**Rozwiązanie:**
- Wyczyść cache przeglądarki (Ctrl + Shift + R)
- Sprawdź Console (F12) czy są błędy
- Upewnij się że używasz serwera HTTP (nie file://)

### Problem: "Failed to load translations"
**Rozwiązanie:**
- Sprawdź czy plik JSON istnieje w folderze `locales/`
- Upewnij się że nazwa pliku się zgadza (np. `pawism.json` dla `pawism.html`)

### Problem: "Cross-origin request blocked"
**Rozwiązanie:**
- **Musisz używać lokalnego serwera!**
- Nie możesz otwierać plików przez `file://`
- Użyj `START_SERVER.bat`

### Problem: "Niektóre teksty się nie tłumaczą"
**Rozwiązanie:**
- Sprawdź czy element ma atrybut `data-i18n="klucz"`
- Sprawdź czy klucz istnieje w pliku JSON
- Otwórz Console i zobacz które klucze są missing

---

## 📊 Sprawdź Status Wszystkich Stron

Otwórz: **http://localhost:8000/translation-check.html**

Ta strona automatycznie sprawdzi:
- ✅ Czy pliki JSON istnieją
- ✅ Czy wszystkie języki (EN, PL, NL) są dostępne
- ✅ Czy pliki HTML są dostępne
- ✅ Czy skrypt tłumaczeń jest załadowany

**Wszystko powinno być zielone!**

---

## 📝 Lista Wszystkich Naprawionych Stron

Wszystkie te strony powinny mieć działające tłumaczenia:

1. ✅ akantilado.html
2. ✅ amorak.html
3. ✅ ray-animation.html
4. ✅ not-today-darling.html
5. ✅ pawism.html
6. ✅ pause-and-deserve.html
7. ✅ richter.html
8. ✅ environments.html
9. ✅ wwise-unreal-fixer.html
10. ✅ unreal-engine-rebuilder.html
11. ✅ audiolab.html
12. ✅ middleware-optimization.html
13. ✅ audioq.html
14. ✅ middleware2.html
15. ✅ musicforgames.html

---

## 🎯 Szybki Test (30 sekund)

1. Kliknij dwa razy: **START_SERVER.bat**
2. Otwórz: **http://localhost:8000/QUICK_TEST.html**
3. Kliknij przyciski EN / PL / NL
4. Jeśli tekst się zmienia → **DZIAŁA!** ✅
5. Jeśli nie działa → sprawdź Console (F12)

---

## 📞 Potrzebujesz Pomocy?

Jeśli nadal nie działa:

1. Otwórz Console przeglądarki (F12)
2. Skopiuj wszystkie błędy (czerwone komunikaty)
3. Sprawdź czy używasz serwera HTTP (URL powinien zaczynać się od `http://`, nie `file://`)

---

**Status: ✅ Wszystkie 15 stron naprawione**
**Data: 2025-01-12**