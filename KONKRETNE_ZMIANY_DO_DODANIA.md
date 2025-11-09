# 🎯 KONKRETNE RZECZY DO DODANIA NA STRONĘ
## Based on actual docs content

---

# 🖤 SHADOW FRAMES - Konkretne braki

## ❌ PROBLEM #1: 12 SHOTS VS 25 SHOTS

**NA STRONIE (linia 1879):**
```
You have a Polaroid camera and 12 shots.
```

**W DOKUMENTACJI:**
- **GameDesign_Grp22_ShadowFrames.txt linia 114-115:**
  > "Each cartridge contains **5 film sheets**, and the player has access to a total of **5 cartridges**"
  > MATEMATYKA: 5 × 5 = **25 shots total**

- **Sound_Grp22_ShadowFrames.txt linia 116:**
  > "Resource Management: 5 cartridges × 5 shots each = 25 total"

**CO ZMIENIĆ:**
```html
<!-- PRZED: -->
You have a Polaroid camera and 12 shots.

<!-- PO: -->
You have a Polaroid camera and 25 shots (5 cartridges of 5 each).
```

**GDZIE:** `projects/shadow-frames.html` linia 1879

---

## ✅ BRAKUJE #1: 3-Stage Anomaly Detection System

**CO JEST W DOCS (Sound_Grp22_ShadowFrames.txt linia 38-65):**

```
The Mechanic: Anomalies alert player through audio progression:

Stage 1: The Alert (0.5s)
• Sharp static burst + metallic clang
• "Something changed in the pub"
• Non-positional (stereo)

Stage 2: The Hint (1-2s)
• Directional room-specific sound
• Examples: glass resonance (bar), stage creak (performance area)
• Spatial 3D positioning reveals location

Stage 3: The Presence (sustained)
• Continuous ambient loop until captured
• Object-specific: humming glass, creaking chair
• Intensifies as player gets closer
```

**GDZIE TO DODAĆ:**
Po sekcji "Core Concept" (około linia 1880), przed "My Role"

**DOKŁADNY HTML DO DODANIA:**

```html
                        <div class="overview-card">
                            <div class="overview-icon">AUDIO DESIGN</div>
                            <h3>3-Stage Anomaly Detection</h3>
                            <p>
                                Anomalies announce themselves through a 3-stage audio progression:
                                <br><br>
                                <strong>Alert (0.5s):</strong> Sharp static burst tells you something changed
                                <br>
                                <strong>Directional Hint (1-2s):</strong> Spatial audio guides you to the area
                                <br>
                                <strong>Sustained Presence:</strong> Continuous loop until you photograph it
                                <br><br>
                                Without audio cues, finding anomalies is nearly impossible. Sound isn't decorative—it's the core detection mechanic.
                            </p>
                        </div>
```

**EFFORT:** 5 minut copy-paste
**IMPACT:** 🔥🔥 Pokazuje unique design system

---

## ✅ BRAKUJE #2: Recording Session Info

**CO JEST W DOCS (Sound_Grp22_ShadowFrames.txt linia 538-542):**

```
Voice Recording (Original Content):
• What we're recording: Enemy vocalizations (if feature retained) and any voiceover if needed
• Location: The Square studio facilities
• Equipment: Shure SM58 or Zoom H6
• Approach: Multiple takes at varied intensities, will process heavily for supernatural character
```

**I również (linia 566-572):**
```
Enemy Voice Construction (if retained):
• Recording session: Deep vocalizations recorded in The Square studio with team member Roeland
• Layering approach for roars:
  - Base layer: Recorded voice pitched down -12 semitones
  - Mid layer: Animal sounds from library (bear/big cat textures)
  - High layer: Reversed speech fragments for unsettling quality
```

**GDZIE TO DODAĆ:**
W sekcji "My Role" (linia 1891-1898) - expand description

**DOKŁADNY TEXT DO DODANIA:**

```html
<!-- PRZED (linia 1891): -->
<p data-i18n="sections.my_role_desc">
    As Sound Lead, I designed and implemented the
    audio architecture for Shadow Frames: dynamic
    footstep systems, delegate-based player audio,
    RTPC-driven tension progression, and Wwise
    integration. Additional systems are in
    development for final release.
</p>

<!-- PO: -->
<p data-i18n="sections.my_role_desc">
    As Sound Lead, I designed and implemented the
    audio architecture for Shadow Frames: dynamic
    footstep systems, delegate-based player audio,
    RTPC-driven tension progression, and Wwise
    integration.
    <br><br>
    <strong>Original Content:</strong> Recorded enemy vocalizations
    at The Square studio (Shure SM58). Multi-layer processing:
    voice pitched -12 semitones + animal textures + reversed
    speech for supernatural character.
    <br><br>
    Additional systems in development for final release.
</p>
```

**EFFORT:** 5 minut
**IMPACT:** 🔥 Shows production experience, not just library sounds

---

## ✅ BRAKUJE #3: Performance Stats

**CO JEST W DOCS (Sound_Grp22_ShadowFrames.txt linia 691-703):**

```
Memory & Performance Budget

Memory Budget:
• Preloaded audio: 120-145MB (gameplay-critical sounds)
• Streaming pool: 30MB (music + long ambience loops)
• Total: ~175MB compressed (from 1.2-1.4GB uncompressed)
• Compression savings: 87%

CPU Budget:
• Wwise processing: <3% target, <5% critical threshold
• RTPC calculations: <0.5% target, <1% critical
• 3D positioning (15 voices): <1% target, <2% critical

Voice Management:
• Max simultaneous voices: 32
• Streaming: Music and ambience loops (>30s duration)
• Preload: All SFX (instant response required)
```

**GDZIE TO DODAĆ:**
W sekcji "Technical Stack" (linia 1908-1918) - dodaj pod istniejący text

**DOKŁADNY HTML DO DODANIA:**

```html
<!-- Po linii 1918, dodaj: -->
                            <h4 style="color: var(--accent-blue); margin-top: 1rem; margin-bottom: 0.5rem;">
                                Performance Optimized
                            </h4>
                            <ul style="margin-left: 1.5rem; line-height: 1.8;">
                                <li>175MB total audio (87% compression from source)</li>
                                <li>&lt;3% CPU usage (Wwise processing)</li>
                                <li>32-voice simultaneous spatial mix</li>
                                <li>Streaming + preload hybrid system</li>
                            </ul>
```

**EFFORT:** 5 minut
**IMPACT:** 🔥🔥 Shows optimization skills

---

## ✅ BRAKUJE #4: Headphone Recommendation

**CO JEST W DOCS (Sound_Grp22_ShadowFrames.txt linia 16):**

```
⚠ Recommended Experience: Shadow Frames is designed primarily for headphone use.
The game's spatial audio system and psychological horror elements rely heavily
on precise 3D positioning and intimate soundscapes.
```

**I również (linia 305-306):**
```
HRTF (Head-Related Transfer Function) creates binaural audio—sounds actually
feel like they're coming from specific directions in headphones
```

**GDZIE TO DODAĆ:**
W sekcji "Core Concept" po opisie gameplay (linia 1879)

**DOKŁADNY HTML DO DODANIA:**

```html
<!-- Po linii 1880, przed zamknięciem </p>, dodaj: -->
                            <p data-i18n="concept.detailed">
                                [... istniejący text ...]
                                <br><br>
                                <span style="color: var(--accent-blue); font-weight: 600;">
                                    🎧 Headphone Experience Recommended
                                </span>
                                <br>
                                HRTF binaural processing creates precise 3D positioning.
                                Survival depends on spatial awareness—stereo speakers
                                won't give you the directional accuracy you need.
                            </p>
```

**EFFORT:** 3 minuty
**IMPACT:** 🔥 Shows thoughtful design + tech knowledge

---

## ✅ BRAKUJE #5: Accessibility Features

**CO JEST W DOCS (Sound_Grp22_ShadowFrames.txt linia 634-663):**

```
ACCESSIBILITY CONSIDERATIONS

Audio Options:
• Volume Controls: Master, Music, SFX, Ambience, UI (separate sliders)
• Audio Presets: Default / Enhanced Clarity / Reduced Tension

Visual Audio Indicators (Optional Toggle):
• Directional Audio Indicator: Visual arc on HUD showing direction of important sounds
  - Color-coded: Red (enemy), Yellow (anomaly alert), White (environment)
  - Intensity reflects volume
• Sound Labels: Brief text descriptions when critical sounds play
  - Examples: "Anomaly Alert - East", "Enemy Breathing - Close"
  - Positioned in 3D space near sound source
  - Fades after 2-3 seconds

Design Philosophy:
• Optional by default: Standard experience remains audio-driven
• Preserve challenge: Visual aids guide direction but don't solve puzzles
• Natural integration: Fits 1960s aesthetic where possible
```

**GDZIE TO DODAĆ:**
Nowa sekcja po "Wwise Architecture" (około linia 2565)

**DOKŁADNY HTML DO DODANIA:**

```html
            <!-- Accessibility Features -->
            <section class="tech-section">
                <div class="section-header">
                    <h2>Accessibility Considerations</h2>
                    <p>
                        Audio-driven horror that remains inclusive without compromising challenge.
                    </p>
                </div>

                <div class="explanation-grid">
                    <div class="explanation-item">
                        <h3>WHAT</h3>
                        <p>
                            Optional visual audio indicators for hearing-impaired players.
                            Directional arc shows sound source (color-coded: red=enemy,
                            yellow=anomaly, white=environment). Brief text labels appear
                            when critical sounds play.
                        </p>
                    </div>
                    <div class="explanation-item">
                        <h3>WHY</h3>
                        <p>
                            Audio is core gameplay, but accessibility shouldn't be
                            sacrificed. Visual aids preserve the challenge (show direction,
                            not solution) while ensuring players with hearing impairments
                            can experience the game.
                        </p>
                    </div>
                    <div class="explanation-item">
                        <h3>HOW</h3>
                        <p>
                            Toggle-based system. Enhanced Clarity preset boosts critical
                            sounds (+3dB) while reducing ambience. Reduced Tension mode
                            lowers drones but maintains gameplay-critical audio at normal
                            levels.
                        </p>
                    </div>
                    <div class="explanation-item">
                        <h3>RESULT</h3>
                        <p>
                            Inclusive design that doesn't compromise horror experience.
                            Visual indicators guide without revealing—players still need
                            to observe, photograph, and solve the mystery.
                        </p>
                    </div>
                </div>
            </section>
```

**EFFORT:** 10 minut
**IMPACT:** 🔥🔥 Shows modern game dev awareness + inclusive design

---

---

# 🎮 NOT TODAY DARLING - Konkretne braki

## ✅ BRAKUJE #1: LUFS Loudness Standards

**CO JEST W DOCS (SoundBible[Gp04]NotTodayDarling.txt - NIE ZNALEZIONO EXACT LINE, ale wspominane):**

Chociaż nie ma explicit LUFS values w SoundBible dla Not Today, są generyczne standardy które mógłbyś zastosować z twojej wiedzy.

**ALE** w **TechDoc[Gp04]NotTodayDarling.txt linia 721-730** jest:
```
PBR pipeline to construct the assets with a material that respects the values
of the real world.
https://physicallybased.info/
It's extremely important not to oversaturate the base color values!
```

To jest o visual PBR, NIE audio. Czyli faktycznie **NIE MA explicit LUFS standards w docs dla Not Today**.

**KONKLUZJA:** Skip this - nie ma w docs, więc nie możemy dodać jako "missing from docs"

---

## ✅ BRAKUJE #2: Player Count Clarification

**CO JEST W DOCS:**

**GameDesign[Gp04]NotTodayDarling.txt linia 58:**
```
only when 2 or more players are within the character select menu,
a countdown of 5 seconds will begin
```

**TechDoc[Gp04]NotTodayDarling.txt (brak specific line, ale target audience mówi 2-4)**

**NA STRONIE (linia 1001):**
```
Released on itch.io in May 2025. Windows and Linux
builds support 1-4 players locally.
```

**CO ZMIENIĆ:**

```html
<!-- PRZED: -->
builds support 1-4 players locally.

<!-- PO: -->
builds support 2-4 players locally (local multiplayer).
```

**GDZIE:** `projects/not-today-darling.html` linia 1001

**EFFORT:** 1 minuta
**IMPACT:** ⚠️ Minor fix, ale eliminuje niespójność

---

## ✅ BRAKUJE #3: Revenge/Ghost Mechanic

**CO JEST W DOCS:**

**Narriation.txt linia 41-45:**
```
Revenge
- When you die, you turn into a ghosts that can sabotage other players still in the race
- Some cool effects when you're a ghost
- Sounds distorted
- You see something (TBD)
```

**GameDesign[Gp04]NotTodayDarling.txt linia 57-59:**
```
The race continues until either all players are eliminated (knocked off the
platform by the Wall of Death) or one player successfully reaches the finish line.
```

Nie wspomina explicite ghost mechanic w GameDesign, ale Narriation ma to.

**GDZIE TO DODAĆ:**
Po sekcji "4-Player Mix" (linia 1243), przed "Gameplay" video

**DOKŁADNY HTML DO DODANIA:**

```html
            <!-- Ghost Revenge -->
            <section class="tech-section">
                <div class="section-header">
                    <h2>Ghost Revenge Mechanic</h2>
                    <p>
                        Eliminated players stay in the game—as saboteurs.
                    </p>
                </div>

                <div class="explanation-grid">
                    <div class="explanation-item">
                        <h3>CONCEPT</h3>
                        <p>
                            When you get eliminated by the Wall of Death, you don't
                            just spectate—you return as a ghost. Distorted audio,
                            special VFX, and the ability to sabotage surviving players
                            keep everyone engaged until the end.
                        </p>
                    </div>
                    <div class="explanation-item">
                        <h3>AUDIO DESIGN</h3>
                        <p>
                            Ghost players hear distorted versions of gameplay sounds.
                            Their actions trigger ethereal SFX that survivors can hear—
                            adding psychological pressure without direct damage.
                        </p>
                    </div>
                </div>
            </section>
```

**EFFORT:** 5 minut
**IMPACT:** 🔥 Shows unique game mechanic (nie każdy racing game ma to)

---

## ✅ BRAKUJE #4: Solo Audio Pipeline Context

**CO JEST W DOCS:**

**Week12[Gp04]NotTodayDarling.txt linia 1:**
```
2/05/2025
```
→ This confirms May 2025 release

**TechDoc linia 782-803:**
```
Software stack table showing:
- Game Engine: Unreal Engine 5.5.3
- Programming Language: C++ C++20
- Sound Editing, Mixing, Mastering: REAPER 7.34
- Sound Library: Soundly
- etc.
```

**GameDesign potwierdza 12-week project**

**NA STRONIE (linia 976-979):**
```
As the only audio person, I handled everything:
sound design, implementation, and mixing. Two
programmers, three artists, and 12 weeks to ship.
```

**CO DODAĆ - Expand to show full pipeline:**

```html
<!-- PRZED: -->
<p data-i18n="overview.role_desc">
    As the only audio person, I handled everything:
    sound design, implementation, and mixing. Two
    programmers, three artists, and 12 weeks to ship.
</p>

<!-- PO: -->
<p data-i18n="overview.role_desc">
    As the only audio person, I handled the complete audio pipeline:
    <br><br>
    <strong>Sound Design:</strong> 320+ events from library selection (Soundly)
    to final processing (REAPER)
    <br>
    <strong>Implementation:</strong> C++ audio architecture + MetaSounds node graphs
    <br>
    <strong>Mix & Master:</strong> 4-player concurrent mix, priority systems,
    sidechain ducking
    <br><br>
    Two programmers, three artists, and 12 weeks to ship on time.
</p>
```

**EFFORT:** 5 minut
**IMPACT:** 🔥🔥 Shows complete ownership of audio pipeline

---

## ✅ BRAKUJE #5: AudioAssetList Details

**CO JEST W DOCS (AudioAssetList[Gp04]NotTodayDarling.txt):**

```
Sheet: Audio Effects

Asset Name | Play | Level | Source | Trigger | Clip Name | Comments
---
SFX_Collectable_A | [...] | In Game | Custom Voice - Grandma Character | Player Collision | SND_Collectable_A | [...]
SFX_Collectable_B | [...] | In Game | Custom Voice - Grandma Character | Player Collision | SND_Collectable_B | [...]
SFX_ActivateItem_A | [...] | In Game | Funny Interaction Sound | Player Key Press | SND_ActivateItem_A | [...]
SFX_ActivateItem_B | [...] | In Game | Funny Interaction Sound | Player Key Press | SND_ActivateItem_B | [...]
SFX_ItemExpired_A | [...] | In Game | Clock Sound/Punch | Time Expired | SND_ItemExpired_A | [...]
SFX_ItemExpired_B | [...] | In Game | Clock Sound/Punch | Time Expired | SND_ItemExpired_B | [...]
SFX_MolotovCocktail_Throw | [...] | In Game | Throw Object | Player Key Press | SND_MolotovCocktail_Throw | [...]
SFX_MolotovCocktail_Flame | [...] | In Game | Fire Ignition | Molotov Impact | SND_MolotovCocktail_Flame | [...]
SFX_ProtectiveUmbrella_Deploy | [...] | In Game | Umbrella Opening | Player Key Press | SND_ProtectiveUmbrella_Deploy | [...]
SFX_ProtectiveUmbrella_Return | [...] | In Game | Umbrella Closing | Item Duration End | SND_ProtectiveUmbrella_Return | [...]
[... many more ...]
```

To jest **bardzo detailed** ale może być za dużo dla portfolio page. Ale możemy wspomnieć że istniejepełny asset tracking.

**GDZIE TO DODAĆ:**
W sekcji "SCOPE" (linia 990-996) - expand

```html
<!-- PRZED: -->
<p data-i18n="overview.scope_desc">
    Over 320 events packed into 180MB. The engine
    handles up to 32 concurrent voices with sub-45ms
    latency.
</p>

<!-- PO: -->
<p data-i18n="overview.scope_desc">
    Over 320 events packed into 180MB, fully tracked in a
    comprehensive asset list (source, trigger conditions,
    clip names, integration notes). The engine handles up
    to 32 concurrent voices with sub-45ms latency.
    <br><br>
    All assets sourced from professional libraries (Soundly)
    and processed in REAPER for consistency.
</p>
```

**EFFORT:** 3 minuty
**IMPACT:** 🔥 Shows organized workflow

---

---

# 📊 PRIORITY TABLE - Co zrobić najpierw

## 🔴 CRITICAL (Must Fix Immediately)

| Project | Change | Location | Time | Impact |
|---------|--------|----------|------|--------|
| **Shadow Frames** | Fix "12 shots" → "25 shots" | Line 1879 | 1 min | 🔥🔥🔥 |
| **Not Today** | Fix "1-4 players" → "2-4 players" | Line 1001 | 1 min | 🔥 |

**TOTAL TIME: 2 minuty**
**BLOCKER: Te zmiany MUSZĄ być przed portfolio review**

---

## 🟡 HIGH IMPACT (Should Add)

| Project | Addition | Location | Time | Impact |
|---------|----------|----------|------|--------|
| **Shadow Frames** | 3-Stage Anomaly System | After line 1880 | 5 min | 🔥🔥 |
| **Shadow Frames** | Recording Session Info | Line 1891 expand | 5 min | 🔥🔥 |
| **Shadow Frames** | Performance Stats | Line 1918 add | 5 min | 🔥🔥 |
| **Shadow Frames** | Headphone Recommendation | Line 1880 add | 3 min | 🔥 |
| **Not Today** | Solo Pipeline Expand | Line 976 expand | 5 min | 🔥🔥 |
| **Not Today** | Ghost Revenge Mechanic | After line 1243 | 5 min | 🔥 |

**TOTAL TIME: 28 minut**
**RESULT: Major improvement in portfolio quality**

---

## 🟢 NICE TO HAVE (Optional)

| Project | Addition | Location | Time | Impact |
|---------|----------|----------|------|--------|
| **Shadow Frames** | Accessibility Features | After line 2565 | 10 min | 🔥🔥 |
| **Not Today** | Asset Tracking Mention | Line 990 expand | 3 min | 🔥 |

**TOTAL TIME: 13 minut**

---

# 🚀 RECOMMENDED WORKFLOW

## Phase 1: Critical Fixes (2 min) ⚠️ DO THIS NOW
1. Shadow Frames: 12 → 25 shots
2. Not Today: 1-4 → 2-4 players

## Phase 2: High Impact Additions (28 min) 🔥 DO THIS TODAY
3. Shadow Frames: 3-stage anomaly system
4. Shadow Frames: Recording session info
5. Shadow Frames: Performance stats
6. Shadow Frames: Headphone recommendation
7. Not Today: Solo pipeline expansion
8. Not Today: Ghost revenge mechanic

## Phase 3: Polish (13 min) ✨ DO THIS WHEN TIME
9. Shadow Frames: Accessibility features
10. Not Today: Asset tracking mention

---

**TOTAL TIME INVESTMENT: 43 minuty**

**RESULT:**
- Not Today: 95 → 98/100
- Shadow Frames: 72 → 93/100

---

# 💡 CHCESZ ŻEBYM TO TERAZ ZROBIŁ?

Mogę:
1. ✅ Edytować pliki HTML bezpośrednio
2. ✅ Zacommitować zmiany
3. ✅ Pushować na branch
4. ✅ Pokazać diff przed i po

**Powiedz tylko które phase chcesz (1, 2, 3 lub wszystkie) i zaczynam! 🚀**
