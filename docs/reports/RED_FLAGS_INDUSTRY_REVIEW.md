# 🚨 RED FLAGS - ANALIZA Z PERSPEKTYWY REKRUTERA Z BRANŻY

**Data:** 9 listopada 2025
**Cel:** Identyfikacja problemów które zauważy profesjonalista przeglądający portfolio

---

## ⚠️ CRITICAL ISSUES (Muszą być naprawione przed review)

### 1. **"Shipped Projects" ≠ Student Projects**
**Lokalizacja:** `about.json:88` + `about.json:61`

```
achievement_games_title: "Shipped Projects"
achievement_games_desc: "Lead audio on 4 group projects, contributed to 8+ total student game projects"
```

**PROBLEM:**
- "Shipped" w branży oznacza: wydane komercyjnie (Steam, Epic, App Store, etc.)
- Twoje projekty to: student projects (DAE Belgium, 12-week assignments)
- Not Today Darling: itch.io release (student project)
- Pause & Deserve: "Solo project over 8 weeks. Started as a school assignment" (pause-and-deserve.json:78)

**CO WIDZI REKRUTER:**
"Ten kandydat próbuje sprzedać szkolne projekty jako profesjonalne wydania. To jest mislabeling."

**NAPRAWA:**
```diff
- "achievement_games_title": "Shipped Projects"
+ "achievement_games_title": "Student Game Projects"

- "achievement_games_desc": "Lead audio on 4 group projects, contributed to 8+ total student game projects"
+ "achievement_games_desc": "Led audio on 4 team-based projects at DAE, contributed sound to 8+ additional student games"
```

---

### 2. **Niespójne liczby projektów (15+ vs 4 vs 8+)**
**Lokalizacja:** `about.json:61-88`, `index.json:82`

```
# W about.json:
stat_projects: "Student Projects" (wartość: 15+ ?)
achievement_games_desc: "Lead audio on 4 group projects, contributed to 8+ total"

# W index.json:
stats.projects: "Student Projects" (bez liczby?)
```

**PROBLEM:**
- Gdzie jest liczba "15+"? Skąd się wzięła?
- "4 lead" + "8+ total" = 12 max (nie 15+)
- Brak jasności co się liczy: pełne gry? Moduły? Prototypy?

**CO WIDZI REKRUTER:**
"Liczby nie zgadzają się. Czy to zawyżanie doświadczenia?"

**NAPRAWA:**
Policz DOKŁADNIE wszystkie projekty i podaj spójne liczby:
```
"Led audio implementation on 4 full games (12-week team projects at DAE).
Contributed sound design to 6 additional student projects (3-8 week duration)."
```

---

### 3. **ZERO linków do demo/GitHub/playable builds**
**Lokalizacja:** Wszystkie projekty w `/projects/`

**BRAKUJE:**
- GitHub links (dla AudioLab, Wwise Unreal Fixer, Unreal Rebuilder, AudioQ)
- Itch.io links (dla gier które wspominasz jako "released")
- Demo builds (dla projektów które opisujesz jako "playable")
- Audio samples (dla sound design work)

**PROJEKTY BEZ WERYFIKACJI:**
- **AudioLab**: "92% accuracy" (audiolab.json:34) - jak to zmierzone? Gdzie kod?
- **Pause & Deserve**: Opisany jako "horror game" ale BEZ linku do zagrania
- **Not Today Darling**: "Released on itch.io May 2025" (not-today-darling.json:22) - gdzie link?
- **Wwise Unreal Fixer**: "fixes 200+ broken references" (about.json:67) - gdzie repo?
- **Unreal Rebuilder**: "cuts build time in half" (about.json:67) - gdzie to można pobrać?

**CO WIDZI REKRUTER:**
"Brak weryfikacji = red flag. Czy te projekty rzeczywiście istnieją? Czy kod jest czysty?
Junior developer bez GitHub = nieprofesjonalne."

**NAPRAWA:**
Dodaj do KAŻDEGO projektu:
- GitHub link (jeśli kod jest dostępny)
- Itch.io / demo link (jeśli gra jest dostępna)
- Audio sample / reel (jeśli to sound design)

---

### 4. **Overclaiming na skill levels (Expert po 2 latach studiów)**
**Lokalizacja:** `about.json:36-59`

```
Timeline:
- 2023-Present: DAE Game Development (~2 lata)

Ale claims:
- level_expert: "Expert" (dla Wwise)
- level_advanced: "Advanced" (dla C++, Unreal)
```

**PROBLEM:**
- "Expert" w branży = 5-7+ lat doświadczenia komercyjnego
- "Advanced" = 3-5 lat
- Po 2 latach studiów (bez komercyjnego doświadczenia) maksymalnie: **Intermediate** lub **Proficient**

**CO WIDZI REKRUTER:**
"Zawyżony poziom umiejętności. Jeśli mówi że jest Expert w Wwise ale ma tylko 2 lata studiów,
to albo nie rozumie co znaczy Expert, albo próbuje zaimpresjonować bez podstaw."

**NAPRAWA:**
```diff
# Wwise
- level_expert: "Expert"
+ level_advanced: "Advanced"  (jeśli masz 4+ full projects w Wwise)
+ level_proficient: "Proficient"  (bezpieczniejszy wybór)

# C++
- level_advanced: "Advanced"
+ level_intermediate: "Intermediate"  (realistyczne dla 2 lat nauki)

# Unreal Engine
- level_expert: "Expert"
+ level_advanced: "Advanced"  (jeśli masz solidne portfolio w UE)
```

---

### 5. **Bachelor Thesis = AudioLab? (Niejasność)**
**Lokalizacja:** `about.json:84`, `audiolab.json:21`

```
# W about.json:
achievement_thesis_title: "Real-Time AI Audio for Games"
achievement_thesis_desc: "...end-to-end latency under 500ms..."

# W audiolab.json:
type_value: "Student Research Project"
institution_value: "Howest DAE"
duration_value: "5 months"
```

**PROBLEM:**
- Czy Bachelor Thesis = AudioLab? (brzmi bardzo podobnie)
- Jeśli TAK: dlaczego są wymienione osobno?
- Jeśli NIE: gdzie jest thesis paper? Link?

**CO WIDZI REKRUTER:**
"Niejasne. Czy to dwa osobne projekty, czy ten sam projekt liczony podwójnie?"

**NAPRAWA:**
```diff
# W about.json achievement_thesis_desc:
- "Real-Time AI Audio for Games: end-to-end latency under 500ms..."
+ "Bachelor Thesis: Built AudioLab (ML beatbox classifier, <60ms latency).
   Research focused on reducing latency for real-time generative audio in games."
```

---

## 🟠 HIGH PRIORITY ISSUES

### 6. **Metryki bez kontekstu (brzmi jak marketing BS)**

**Przykłady:**
```
AudioLab:
- "92% accuracy" - na jakim test dataset? Ile sampli?
- "45ms latency" - czy to jest dobre? W porównaniu do czego?

Wwise Unreal Fixer:
- "fixes 200+ broken references" - w jakim projekcie? Jak duży projekt?

Unreal Rebuilder:
- "cuts build time in half" - z czego do czego? (20min → 10min?)
```

**CO WIDZI REKRUTER:**
"Te liczby brzmią zbyt precyzyjnie bez kontekstu. Czy to jest zmierzone, czy wymyślone?"

**NAPRAWA:**
Dodaj kontekst:
```
✅ "92% accuracy (tested on 450 samples across 3 sound classes, 5 different microphones)"
✅ "45ms average latency (measured on Intel i7, 16GB RAM — 3x faster than industry baseline of 150ms)"
✅ "Fixes 200+ Wwise references after plugin updates (tested on mid-sized project: 800+ assets)"
✅ "Cuts Unreal build time from 22 minutes to 11 minutes (lighting rebuild + shader compilation)"
```

---

### 7. **Pause & Deserve: "horror game" ale opisany jako starter project**

**Lokalizacja:** `pause-and-deserve.json:6, 78, 50`

```
tagline: "A horror game where you're hunted by something you can hear but rarely see"

ALE:
desc: "Solo project over 8 weeks. Started as a school assignment"
desc: "This was my first real game project"
```

**PROBLEM:**
- Opisany jako portfolio piece (szczegółowy opis, high production value)
- Ale faktycznie: 8-week school assignment, PIERWSZY projekt gry
- Brak linku do zagrania (więc jak recenzent ma zweryfikować jakość?)

**CO WIDZI REKRUTER:**
"Czy to jest rzeczywista gra która mogę zagrać, czy tylko student prototype?"

**NAPRAWA:**
1. Dodaj link do itch.io (jeśli jest dostępny)
2. Zmień ton:
```diff
- "A horror game where you're hunted..."
+ "Student horror game built in 8 weeks to learn Unreal Blueprints and 3D audio.
   Focus: sound-driven gameplay where audio cues are your primary survival tool."
```

---

### 8. **Amorak: 2000+ słów technical details, ZERO audio sample**

**Lokalizacja:** `amorak.json` (34KB file size!)

**PROBLEM:**
- Bardzo szczegółowe technical specs:
  - "lion, elephant, tiger, hippo sounds layered together" (linia 52)
  - "CLA-76 (8:1, all buttons), LA-2A (8-12dB)" (linia 52)
  - "boost 60-120Hz, cut 300-500Hz, lift 2-4kHz" (linia 52)

- **ALE: ZERO audio sample, ZERO video link, ZERO sposób żeby to usłyszeć**

**CO WIDZI REKRUTER:**
"Ten poziom szczegółów bez audio sample wygląda jak copy-paste z tutorial'a.
Czy on rzeczywiście to zrobił? Dlaczego nie mogę tego usłyszeć?"

**NAPRAWA:**
1. Dodaj embedded video/audio player
2. Dodaj Vimeo/YouTube link
3. Jeśli nie możesz opublikować audio: **skróć opis o 70%** (mniej szczegółów = mniej podejrzeń)

---

### 9. **Contact FAQ: Obietnice bez SLA**

**Lokalizacja:** `contact.json:43`

```
"Quick call to align on scope and references, then I build a first pass in Wwise or FMOD
and send you a playable build."
```

**PROBLEM:**
- "Quick call" = ile czasu? (1h? 15min?)
- "First pass" = ile czasu na delivery? (1 dzień? 1 tydzień?)
- "Playable build" = jak duży scope? (pełna gra? Jeden level?)

**CO WIDZI REKRUTER:**
"To brzmi jak standardowy agency pitch. Ale to junior bez doświadczenia komercyjnego.
Czy on wie co obiecuje?"

**NAPRAWA:**
```diff
- "Quick call to align on scope and references, then I build a first pass..."
+ "30-minute intro call to discuss project scope and audio references.
   I deliver a first implementation pass (using Wwise or FMOD) within 1-2 weeks,
   depending on complexity. You get a playable build with integrated audio for testing."
```

---

### 10. **"Looking for 2026 internship" (ale kiedy dokładnie?)**

**Lokalizacja:** `index.json:17`, `contact.json:10`

```
hero.label: "Looking for internship • Jan-Jun 2026"
contact_subtitle: "Available for game audio internship (Jan-Jun 2026, 3-6 months)"
```

**PROBLEM:**
- Dzisiaj jest listopad 2025
- Jan-Jun 2026 = za 2-7 miesięcy
- Czy jesteś dostępny TERAZ? Czy tylko od stycznia?

**CO WIDZI REKRUTER:**
"Jeśli chcę zatrudnić kogoś teraz (listopad 2025), to czy on jest dostępny?
Jeśli nie, to po co przeglądać portfolio?"

**NAPRAWA:**
```diff
- "Looking for internship • Jan-Jun 2026"
+ "Available for internship starting January 2026 (3-6 months, can start earlier if needed)"

- "Available for game audio internship (Jan-Jun 2026, 3-6 months)"
+ "Seeking game audio internship: January-June 2026 (flexible start date, 3-6 month duration)"
```

---

## 🟡 MEDIUM PRIORITY (Nice to fix)

### 11. **Marketing speak zamiast faktów**

**Przykłady z about.json:**

```
❌ "Specialized in building scalable interactive audio systems"
✅ "Built interactive audio for 4 student games using Wwise and MetaSounds"

❌ "Audio in games needs to be clear"
✅ "Prioritize clarity in mix: UI sounds duck background by -6dB to ensure player feedback"

❌ "I build systems that work in prototype and scale to production without breaking budget"
✅ "Optimize audio: voice limiting (max 32 voices), memory budgets (< 200MB), streaming for large assets"
```

**CO WIDZI REKRUTER:**
"To brzmi jak copywriting, nie jak technical documentation. Czy to AI-generated?"

---

### 12. **Brak social proof (testimonials, recommendations, GitHub stars)**

**BRAKUJE:**
- LinkedIn recommendations (od profesorów, teammates)
- Testimonials od zespołów projektowych
- GitHub stars / forks (dla publicznych tools)
- Itch.io reviews / ratings (dla gier)
- Case studies z real user feedback

**CO WIDZI REKRUTER:**
"Zero external validation. Czy ktokolwiek testował te projekty poza nim?"

---

### 13. **"15+ Student Projects" - gdzie jest lista?**

**Problem:**
- Mówisz o "15+ projects"
- Ale pokazujesz tylko ~6 głównych projektów
- Gdzie są pozostałe 9+?

**NAPRAWA:**
Dodaj sekcję "Additional Projects" z krótkim opisem (1-2 zdania każdy):
```
- Project Name (Role, Duration, Tech)
- Sound design for platformer (contributor, 4 weeks, FMOD)
- Environmental audio for puzzle game (solo, 6 weeks, Wwise)
- etc.
```

---

### 14. **"Tools I Built" - które są dostępne publicznie?**

**Tools wymienione:**
1. Wwise Unreal Fixer
2. Unreal Engine Rebuilder
3. AudioLab
4. AudioQ EQ Plugin

**Problem:**
- Które mogę pobrać?
- Które mają GitHub repo?
- Które są tylko internal tools?

**NAPRAWA:**
Dodaj status do każdego:
```
✅ AudioLab: [GitHub] [Demo]
✅ Wwise Unreal Fixer: [GitHub] (public)
🔒 Unreal Rebuilder: Internal tool (not public)
🚧 AudioQ: Work in progress
```

---

## 📊 PODSUMOWANIE - TOP ACTIONS

### Must Fix Before Industry Review:

| # | Issue | Severity | Fix Time | Impact |
|---|-------|----------|----------|--------|
| 1 | "Shipped Projects" → "Student Projects" | 🔴 CRITICAL | 5 min | HIGH |
| 2 | Dodaj linki do GitHub/itch.io | 🔴 CRITICAL | 30 min | HIGH |
| 3 | Niespójne liczby projektów | 🔴 CRITICAL | 15 min | HIGH |
| 4 | Expert → Advanced/Proficient | 🔴 CRITICAL | 5 min | MEDIUM |
| 5 | Wyjaśnij Thesis = AudioLab? | 🟠 HIGH | 10 min | MEDIUM |
| 6 | Dodaj kontekst do metryk | 🟠 HIGH | 20 min | MEDIUM |
| 7 | Dodaj audio sample do Amorak | 🟠 HIGH | 15 min | HIGH |
| 8 | Precyzuj dostępność (2026) | 🟠 HIGH | 5 min | LOW |

**Total fix time:** ~2 godziny pracy

---

## ✅ CO JEST DOBRE (zachowaj!)

1. **Konkretny tech stack**: Wwise, MetaSounds, C++ - to jest dobrze
2. **Detailed project breakdowns**: Pokazujesz proces myślenia
3. **Technical depth**: Widać że rozumiesz audio middleware
4. **Multilingual**: EN/PL/NL - to jest plus
5. **Clean design**: Strona wygląda profesjonalnie

---

## 🎯 FINAL RECOMMENDATION

**Przed review przez rekrutera:**
1. ✅ Zmień "Shipped" → "Student Projects"
2. ✅ Dodaj linki (GitHub + itch.io + audio samples)
3. ✅ Zweryfikuj skill levels (Expert → Advanced)
4. ✅ Dodaj kontekst do metryk (92% accuracy → "92% on 450 samples")
5. ✅ Wyjaśnij Bachelor Thesis vs AudioLab

**Nice to have:**
- Testimonials od teammates
- GitHub README dla każdego tool
- Audio reel na stronie głównej (nie tylko w projects)

---

**Ogólnie:** Portfolio jest **solidne**, ale ma kilka **red flags które są łatwe do naprawienia**.
Największy problem to **brak weryfikacji** (linki do demo/code) i **overclaiming** (Shipped vs Student, Expert vs Advanced).

Napraw te 5 CRITICAL issues i portfolio będzie professional-grade.
