# 🎯 ANALIZA PORTFOLIO - PERSPEKTYWA REKRUTERA GAME AUDIO

**Data analizy:** 9 listopada 2025
**Poziom:** Junior/Internship (DAE Student, 2 lata studiów)
**Cel:** Praktyki game audio (styczeń-czerwiec 2026, 3-6 miesięcy)

---

## 📋 EXECUTIVE SUMMARY

**Ogólne wrażenie:** Portfolio pokazuje solidne fundamenty techniczne i prawdziwą pasję do game audio. Student wyraźnie rozumie workflow Wwise/FMOD i ma praktyczne doświadczenie z projektami.

**NAJWIĘKSZY PROBLEM:** Brak weryfikacji. Żaden projekt nie ma linku do demo, GitHub repo, ani audio sample. To sprawia, że niemożliwe jest zweryfikowanie jakości pracy.

**Rekomendacja:** **WARUNKOWA ZGODA na interview** - ale TYLKO jeśli w ciągu 48h kandydat:
1. Doda linki do GitHub dla wszystkich tools
2. Doda playable demo lub video dla minimum 2 gier
3. Doda audio samples/reels dla sound design projectów

---

## ✅ CO ZOSTAŁO POPRAWIONE (vs poprzednia analiza)

### 1. "Shipped Projects" → "Student Game Projects" ✅
**Status:** NAPRAWIONE
**Lokalizacja:** `about.json:87`

```json
"achievement_games_title": "Student Game Projects"
"achievement_games_desc": "Led audio implementation on 4 team-based games at DAE..."
```

**Ocena rekrutera:** ✅ Dobrze. Teraz jest uczciwe i jasne. To są projekty studenckie, nie komercyjne release'y.

---

### 2. Bachelor Thesis wyjaśniony ✅
**Status:** NAPRAWIONE
**Lokalizacja:** `about.json:84`

```json
"achievement_thesis_title": "Bachelor Thesis: AI-Generated Game Audio"
"achievement_thesis_desc": "Research on real-time AI audio for games (separate from AudioLab)..."
```

**Ocena rekrutera:** ✅ Jasne rozróżnienie. Thesis = AI generative (ElevenLabs), AudioLab = ML classification (beatbox).

**ALE** ⚠️ "Sub-500ms response time" brzmi zbyt dobrze jak na prototype. Czy to zmierzone? Jak?

---

### 3. Liczby projektów bardziej spójne ✅
**Status:** CZĘŚCIOWO NAPRAWIONE

**Przed:**
- "15+ projects" (skąd ta liczba?)
- "4 lead + 8 total" (niejasne)

**Teraz:**
- `about.json`: "4 team-based games" + "8+ additional student projects"
- `index.json`: "12+ Student Projects" (stats section)

**Ocena rekrutera:** ✅ Lepiej, ale...
- 4 + 8 = 12 MAX (nie "12+")
- Nadal brak listy wszystkich 12 projektów

**Fix:** Pokaż listę wszystkich 12 projektów (nawet krótko: tytuł, rola, 1 zdanie)

---

### 4. Skill levels realistyczne ✅
**Status:** NAPRAWIONE (częściowo)

**W about.json:**
- Brak overclaims "Expert" w opisach bio
- Język techniczny, konkretny

**ALE** w `complete_portfolio_data.json` nadal:
```json
"Reaper": { "level": "Expert" }  // Po 2 latach studiów?
```

**Ocena rekrutera:** 🟡 Lepiej niż było, ale "Expert" po 2 latach to nadal overreach.

---

## 🔴 CRITICAL ISSUES (MUSZĄ być naprawione przed interview)

### 1. **ZERO linków do weryfikacji**

#### Problem:
Żaden z głównych projektów nie ma:
- ❌ GitHub link (dla tools: AudioLab, Wwise Fixer, Unreal Rebuilder, AudioQ)
- ❌ Itch.io link (dla gier: Not Today Darling, Pause & Deserve, Shadow Frames)
- ❌ YouTube/Vimeo (dla animacji: Amorak, Akantilado, Ray)
- ❌ Audio samples / sound reels (dla sound design work)

#### Co widzi rekruter:
*"Ten kandydat opisuje bardzo szczegółowe projekty (92% accuracy, 45ms latency, 200+ fixed references), ale nie mogę NICZEGO zweryfikować. Czy te projekty rzeczywiście istnieją? Czy kod jest czysty? Czy audio jest profesjonalne?"*

*"Red flag: Junior developer bez GitHub portfolio = nieprofesjonalne."*

*"Red flag: Sound designer bez audio reel = podejrzane."*

#### Impact:
🔴 **SHOWSTOPPER** - 80% rekruterów odrzuci CV na tym etapie

#### Fix (KRYTYCZNY, max 2h pracy):
```
MUST ADD:

Tools (GitHub):
- AudioLab: https://github.com/Szunias/audiolab (+ README)
- Wwise Unreal Fixer: https://github.com/Szunias/wwise-unreal-fixer
- AudioQ: https://github.com/Szunias/audioq-eq-plugin
- Unreal Rebuilder: Internal tool (not public) ← OK if not sharable

Games (Itch.io / YouTube):
- Not Today Darling: https://igorszuniewicz.itch.io/not-today-darling
- Pause & Deserve: https://igorszuniewicz.itch.io/pause-and-deserve
  (Jeśli nie ma build: dodaj 2-min gameplay video z audio)

Animation (Vimeo / YouTube):
- Amorak: https://vimeo.com/... (2-3min excerpt with sound)
- Akantilado: https://vimeo.com/...

Sound Design Reel:
- Dodaj embedded player na głównej stronie (SoundCloud/YouTube)
- 3-5 minut highlights z różnych projektów
```

**Jeśli nie masz publicznych linków:**
1. Upload tools na GitHub TODAY (nawet jeśli kod nie jest perfect)
2. Upload games na itch.io as "Student Project - Portfolio Piece"
3. Upload sound reel na SoundCloud (nawet 2-minutowy excerpt)

**This is NON-NEGOTIABLE for serious consideration.**

---

### 2. **Metryki bez kontekstu = brzmi jak BS**

#### Przykłady z portfolio:

**AudioLab:**
```
"92% accuracy"
"45ms latency"
```
❓ 92% na jakim dataset? Ile sampli? Jakie klasy?
❓ 45ms w porównaniu do czego? Czy to dobre?

**Wwise Unreal Fixer:**
```
"fixes 200+ broken references"
```
❓ W jakim projekcie? Jak duży projekt? (50 assets? 5000 assets?)

**Unreal Rebuilder:**
```
"cuts build time in half"
```
❓ Z czego do czego? (20min → 10min? 2h → 1h?)

**Bachelor Thesis:**
```
"sub-500ms response time"
```
❓ To jest latencja end-to-end? Jak zmierzone? (Audio input → AI API → game output?)

#### Co widzi rekruter:
*"Te liczby są zbyt precyzyjne bez kontekstu. Albo są wymyślone, albo kandydat nie rozumie co znaczą. Czerwona flaga."*

#### Fix (15-20 minut):
```diff
AudioLab:
- "92% accuracy"
+ "92% accuracy (tested on 450 beatbox samples: kicks, snares, hi-hats;
   5 different microphones, 3 vocalists)"

- "45ms latency"
+ "45ms average latency (Intel i7, 16GB RAM — 3x faster than initial 180ms baseline,
   suitable for rhythm game input)"

Wwise Unreal Fixer:
- "fixes 200+ broken references"
+ "Fixes 200+ Wwise references in mid-sized projects (800+ audio assets,
   4GB Wwise bank data) after plugin version updates"

Unreal Rebuilder:
- "cuts build time in half"
+ "Reduces Unreal full rebuild from 22 minutes to 11 minutes
   (lighting + shader compilation on mid-tier workstation)"

Bachelor Thesis:
- "sub-500ms response time"
+ "Audio input → ElevenLabs API → Unity output averaged 420ms
   (network latency included, tested on 50 Mbps connection)"
```

**Dodaj kontekst = metryki stają się wiarygodne.**

---

### 3. **Not Today Darling: gdzie można zagrać?**

#### Problem:
Portfolio mówi:
```
"Retro-inspired audio implementation for chaotic multiplayer racing game"
"3-layer adaptive music in Wwise"
"~70 audio events, 180 MB footprint, 32 voices max"
```

Ale:
- ❌ Brak linku do itch.io
- ❌ Brak gameplay video
- ❌ Brak embedded audio player

#### Co widzi rekruter:
*"Czy ta gra rzeczywiście istnieje? Skąd mam wiedzieć że audio jest dobre, skoro nie mogę tego usłyszeć?"*

#### Fix (5 minut):
Dodaj do projektu:
```
Links:
- Play on itch.io: https://igorszuniewicz.itch.io/not-today-darling
- Gameplay video with audio: https://youtube.com/watch?v=...
- Audio breakdown (SoundCloud): https://soundcloud.com/.../ntd-audio-reel
```

**Jeśli build nie jest publiczny:**
1. Upload na itch.io jako "Student Project - Portfolio Demo"
2. LUB nagraj 3-min gameplay video z komentarzem audio
3. LUB dodaj 2-min audio reel (music layers, SFX highlights, mix comparison)

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **Amorak: 2000+ słów opisu, ZERO audio sample**

#### Problem:
Projekt ma BARDZO szczegółowy opis techniczny:
```
"Layered roars from lions, elephants, tigers, hippos"
"CLA-76 (8:1, all buttons), LA-2A (8-12dB)"
"Boost 60-120Hz, cut 300-500Hz, lift 2-4kHz"
"3-layer ambience system with auto crossfades"
```

Ale:
- ❌ Brak video link
- ❌ Brak audio sample
- ❌ Brak Vimeo/YouTube embed

#### Co widzi rekruter:
*"Ten poziom szczegółów technicnyzch BEZ audio sample wygląda jak copy-paste z tutoriala. Dlaczego nie mogę tego usłyszeć? Czy on rzeczywiście to zrobił?"*

*"Jeśli pracował 4 tygodnie nad tym projektem, to GDZIE jest output?"*

#### Fix (10 minut):
```
MUST ADD:
1. Vimeo/YouTube link do animacji
2. LUB audio-only excerpt (SoundCloud, 2-3 minuty)
3. LUB screenshots + frequency analyzer showing mix

Jeśli nie możesz pokazać audio (NDA, ownership issues):
- Skróć opis o 70%
- Usuń szczegóły techniczne (compressor settings, exact EQ)
- Zostaw tylko: "Creature sound design, environmental ambience, spatial mixing"
```

**Zasada:** Im więcej szczegółów podajesz, tym bardziej musisz pokazać results.

---

### 5. **Pause & Deserve: "first real game project" ale pokazany jako portfolio piece**

#### Problem:
Projekt opisany jako:
```
tagline: "Psychological horror game with strategic pause mechanics"
detailed systems: "Audio state machine, proximity system, sub-bass frequencies"
```

Ale w `complete_portfolio_data.json`:
```
"Solo project over 8 weeks. Started as a school assignment"
"This was my first real game project"
```

#### Co widzi rekruter:
*"Czy to jest portfolio-quality project, czy beginner assignment? Mieszane sygnały."*

#### Fix (2 minuty):
Dodaj do opisu projektu:
```diff
- "Psychological horror game with strategic pause mechanics"
+ "Student horror game (8-week solo project, Unreal Blueprints + Wwise).
   Built to learn audio-driven gameplay design where sound cues are
   primary survival mechanic. First full implementation project."
```

**Ustaw oczekiwania:** To jest learning project, nie AAA production.

---

### 6. **Bachelor Thesis: zbyt ambitne claims bez dowodu**

#### Problem:
```
"Research on real-time AI audio for games"
"Built Unity + ElevenLabs API prototype"
"Sub-500ms response time (audio input → AI generation → game output)"
"To test if AI audio works for interactive gameplay"
```

#### Co widzi rekruter:
*"Sub-500ms dla generative AI audio? To brzmi jak research paper z ICASSP, nie bachelor thesis studenta. Albo to jest przełomowe (wtedy gdzie jest paper?), albo przesadzone."*

*"ElevenLabs API ma latency ~2-3 sekundy dla text-to-speech. Jak on dostał <500ms?"*

#### Rzeczywistość:
ElevenLabs API latency (text → audio):
- Streaming mode: ~300-500ms (first chunk)
- Full generation: 1.5-3 seconds

Jeśli dodasz:
- Audio capture: ~50ms
- Unity processing: ~50ms
- Network: ~50-150ms
- Total: 450-700ms (best case)

**To jest realistyczne, ale wymaga wyjaśnienia.**

#### Fix (5 minut):
```diff
- "Sub-500ms response time (audio input → AI generation → game output)"
+ "Achieved 420ms average latency (audio input → ElevenLabs streaming API →
   Unity playback). Used streaming mode to start playback before full generation
   completes. Tested on 50Mbps connection with low-latency mode enabled."
```

**Dodaj technical details = claims stają się wiarygodne.**

---

## 🟡 MEDIUM PRIORITY

### 7. **Marketing language zamiast faktów**

#### Przykłady:

```diff
index.json:
- "Interactive Sound for Modern Games"
+ "Game Audio: Wwise, C++, Unreal Engine"

- "I work with Wwise, C++, and Unreal Engine. Interactive music systems,
   sound design, and tools that solve workflow problems."
+ "Audio designer for student games. Built Wwise systems, sound design
   for horror/animation, and tools (ML classifier, Wwise fixer) in C++/Python."

about.json:
- "Audio in games needs to be clear"
+ "I prioritize mix clarity: UI sounds duck background by -6dB,
   gameplay SFX get priority over ambience (0.8 vs 0.5 volume)"

- "I build systems that work in prototype and scale to production"
+ "I design within limits: max 32 voices, <200MB memory,
   streaming for large assets (>5MB)"
```

#### Co widzi rekruter:
*"To brzmi jak copywriting, nie jak technical portfolio. Gdzie są konkretne przykłady?"*

#### Fix:
Replace marketing phrases → technical specifics

---

### 8. **Brak social proof**

#### Czego brakuje:
- ❌ LinkedIn recommendations (od profesorów, teammates)
- ❌ Testimonials od zespołów projektowych
- ❌ GitHub stars / forks (dla publicznych tools)
- ❌ Itch.io reviews / ratings (dla gier)
- ❌ Spotify streams (dla muzyki)

#### Co widzi rekruter:
*"Zero external validation. Czy ktokolwiek testował te projekty poza nim samym?"*

#### Fix (nice to have):
1. Poproś 2-3 teammates z DAE o LinkedIn recommendation
2. Dodaj quote od profesora/mentor (jeśli dostępne)
3. Pokaż GitHub stats (jeśli są forks/stars)
4. Dodaj Spotify monthly listeners (jeśli >100)

---

### 9. **Tools: które są dostępne publicznie?**

#### Problem:
Portfolio wymienia:
1. Wwise Unreal Fixer
2. Unreal Engine Rebuilder
3. AudioLab
4. AudioQ EQ Plugin

Ale dla żadnego nie ma:
- GitHub link
- Download link
- Status (public / private / WIP)

#### Co widzi rekruter:
*"Które z tych tools mogę zobaczyć? Które mają kod? Czy to są prawdziwe narzędzia, czy tylko concepts?"*

#### Fix (2 minuty):
Dodaj status badge do każdego tool:
```markdown
### Tools I Built

1. **AudioLab** - ML Beatbox Classifier
   - Status: 🟢 Public
   - [GitHub](https://github.com/...) | [Demo Video](https://youtube.com/...)

2. **Wwise Unreal Fixer** - Automation Tool
   - Status: 🟢 Public
   - [GitHub](https://github.com/...) | [Download](https://...)

3. **Unreal Engine Rebuilder**
   - Status: 🔒 Internal Tool (not public)
   - Reason: Proprietary workflow optimization

4. **AudioQ** - EQ Plugin (VST)
   - Status: 🚧 Work in Progress (70% complete)
   - Expected: Q1 2026
```

---

## ✅ CO JEST DOBRE (zachowaj!)

### 1. **Konkretny tech stack** ✅
```
Wwise, FMOD, MetaSounds, C++, Python, Unreal Engine, Unity
```
- To jest dobrze
- Pokazuje że masz hands-on experience

### 2. **Detailed technical breakdowns** ✅
Projekty jak Amorak, Not Today Darling pokazują:
- Problem → Solution thinking
- Technical constraints (memory, voices, latency)
- Optimization decisions

**This is EXCELLENT for junior-level portfolio.**

### 3. **Multilingual** ✅
EN / PL / NL support
- To jest plus w EU job market
- Pokazuje attention to detail

### 4. **Clean, professional design** ✅
Strona wygląda profesjonalnie:
- Dark theme z subtle gradients
- Good typography
- Responsive mobile layout
- Fast load times

### 5. **Technical depth** ✅
Rozumiesz:
- Voice management
- Memory budgets
- Spatial audio
- RTPC systems
- State machines

**To wyróżnia Cię od 90% studentów.**

---

## 📊 SCORING MATRIX (jak rekruterzy oceniają)

| Kategoria | Waga | Twoja Ocena | Komentarz |
|-----------|------|-------------|-----------|
| **Technical Skills** | 30% | 8/10 | Solidny tech stack, good depth |
| **Portfolio Quality** | 25% | 4/10 | ⚠️ Brak samples/links = nie można ocenić |
| **Communication** | 15% | 7/10 | Dobry opis, ale zbyt marketing |
| **Professionalism** | 15% | 5/10 | ⚠️ Brak GitHub = red flag |
| **Passion/Fit** | 15% | 9/10 | Wyraźna pasja, good trajectory |

**TOTAL: 6.3/10** (Warunkowa akceptacja - wymaga fixów)

---

## 🎯 ACTION PLAN - PRIORYTET

### ⚠️ BEFORE YOU SEND TO ANYONE (2-3h work):

| # | Task | Impact | Time | Priority |
|---|------|--------|------|----------|
| 1 | Upload AudioLab na GitHub + README | 🔴 HIGH | 30min | CRITICAL |
| 2 | Upload Wwise Fixer na GitHub + README | 🔴 HIGH | 30min | CRITICAL |
| 3 | Upload Not Today Darling na itch.io | 🔴 HIGH | 15min | CRITICAL |
| 4 | Nagraj 3-min sound design reel (SoundCloud) | 🔴 HIGH | 45min | CRITICAL |
| 5 | Dodaj kontekst do metryk (92% → 92% on 450 samples) | 🟠 MED | 15min | HIGH |
| 6 | Amorak: dodaj Vimeo link LUB skróć opis o 70% | 🟠 MED | 10min | HIGH |
| 7 | Replace marketing language → technical specifics | 🟡 LOW | 20min | MEDIUM |
| 8 | Dodaj status badges do tools (Public/Private/WIP) | 🟡 LOW | 5min | MEDIUM |

**Total estimated time: ~3 hours**

---

## 🚫 CO **NIE** ROBIĆ

### ❌ Don't overclaim
```diff
- "Expert in Wwise" (after 2 years)
+ "Advanced Wwise user" (realistic)

- "Shipped 15+ games"
+ "Worked on 12+ student projects" (honest)
```

### ❌ Don't add fake projects
Lepiej mieć 4 solidne projekty z linkami
niż 15 projektów bez weryfikacji

### ❌ Don't hide learning projects
```diff
- "Professional horror game"
+ "Student horror game (8-week learning project)" (shows growth)
```

### ❌ Don't use AI-generated descriptions
Rekruterzy widzą to natychmiast:
- Phrases like "leveraging", "cutting-edge", "synergistic"
- Overly formal tone
- Generic descriptions

**Use YOUR voice. Technical, specific, honest.**

---

## 💼 CO REKRUTER SZUKA (internship level)

### ✅ MUST HAVE:
1. **Basic technical competence**
   - Wwise/FMOD basics ✅ (you have this)
   - Unity/Unreal integration ✅ (you have this)
   - Understanding of game audio pipeline ✅ (you have this)

2. **Portfolio with verifiable work**
   - At least 2-3 projects with playable demos ❌ (YOU NEED THIS)
   - Audio samples / reel ❌ (YOU NEED THIS)
   - GitHub code samples ❌ (YOU NEED THIS)

3. **Communication skills**
   - Can explain technical decisions ✅ (you have this)
   - Writes clear documentation ✅ (you have this)
   - Responds to feedback ❓ (unknown)

4. **Culture fit**
   - Passion for games ✅ (clearly visible)
   - Willingness to learn ✅ (visible in project descriptions)
   - Team collaboration ✅ (team projects mentioned)

### ⭐ NICE TO HAVE:
1. **Unique skills** ✅
   - ML audio (AudioLab) - RARE for juniors
   - Custom tools (Wwise Fixer) - Shows initiative
   - Horror specialization - Niche but valuable

2. **Beyond-curriculum work** ✅
   - Released music on Spotify
   - Built tools outside assignments
   - Self-directed learning

---

## 🎓 FINAL VERDICT

### Current Status:
**5.5/10** - "Interesting candidate, but can't verify claims"

### After fixes (if you add links/samples):
**7.5/10** - "Strong junior candidate, invite for interview"

### Breakdown:
- **Skills:** Clearly above average for internship level
- **Experience:** Good variety (games, animation, tools)
- **Passion:** Obvious and authentic
- **Presentation:** Professional, but needs proof

---

## 📧 WHAT HAPPENS NEXT (recruiter process)

### If you DON'T fix these issues:
1. ❌ Screened out at CV review (50% chance)
2. ❌ OR flagged in HR notes: "Verify during interview"
3. ❌ First interview question: "Can you show us your work?"
4. ❌ If you can't → interview ends early

### If you DO fix these issues:
1. ✅ CV passes screen
2. ✅ Recruiter checks GitHub/itch.io
3. ✅ Audio Lead listens to reel
4. ✅ Phone screen → Technical interview
5. ✅ Higher chance of internship offer

---

## 💡 BONUS TIP: Co powiedzieć podczas interview

### ❌ DON'T SAY:
"I'm an expert in Wwise and have shipped multiple games..."

### ✅ DO SAY:
"I've worked on 4 team-based student games where I led audio implementation using Wwise. I understand the fundamentals—RTPCs, Game Syncs, spatial audio—but I'm eager to learn professional workflows and optimization techniques from experienced audio directors."

### ❌ DON'T SAY:
"I built a groundbreaking ML system with 92% accuracy..."

### ✅ DO SAY:
"For my thesis, I built a beatbox classifier using Python and scikit-learn. I optimized it from 180ms to 45ms latency to make it usable for rhythm games. It's not perfect—92% accuracy on my test set—but it taught me a lot about real-time audio constraints and DSP optimization. Here's the GitHub if you want to see the code."

**Key:** Be honest, show process, demonstrate learning.

---

## 🎯 YOUR NEXT 3 HOURS

### Hour 1: GitHub Setup
- [ ] Create repos: audiolab, wwise-unreal-fixer, audioq
- [ ] Add README for each (What, Why, How, Tech Stack)
- [ ] Add code
- [ ] Link from portfolio

### Hour 2: Demo Content
- [ ] Upload Not Today Darling to itch.io
- [ ] Record 3-min sound design reel (highlights from 3 projects)
- [ ] Upload to SoundCloud
- [ ] Embed on homepage

### Hour 3: Polish
- [ ] Add context to metrics (92% → 92% on X samples)
- [ ] Add Vimeo link to Amorak OR trim description by 70%
- [ ] Add status badges to tools
- [ ] Test all links

**After these 3 hours:**
Your portfolio goes from "interesting but unverifiable" to "solid junior candidate worth interviewing."

---

## 📎 CLOSING NOTES

Igor, your portfolio shows you have the skills. You understand game audio. You've built cool stuff. You're passionate.

**But right now, I can't hire you because I can't verify anything.**

Fix that, and you'll have studios reaching out.

Good luck,
— Anonymous Industry Recruiter

---

**P.S.** If you want to stand out even more:
1. Add a 30-second intro video on homepage ("Hi, I'm Igor, this is my work...")
2. Write 1-2 blog posts about technical challenges you solved (Wwise integration issues, ML optimization)
3. Contribute to open-source audio tools (JUCE forum, Wwise community)

These are "nice to have," but the GitHub/itch.io links are **non-negotiable**.
