# Jak Wyłączyć Debug Logi w Unreal Engine - Quick Guide

## 🎮 SZYBKIE ROZWIĄZANIE (Podczas Gry)

### 1. Otwórz konsolę w grze:
**Klawisz:** `~` (tylda) lub `` ` `` (backtick) lub `F10`

### 2. Wpisz te komendy (jedna po drugiej):

```
showdebug                  // Wyłącza wszystkie debug info
stat fps off               // Wyłącza FPS counter
stat unit off              // Wyłącza unit stats
stat game off              // Wyłącza game stats
t.MaxFPS 0                 // Usuwa FPS limit (opcjonalne)
```

### 3. Wyłącz Output Log:
```
showlog
```
Lub po prostu zamknij okno Output Log w edytorze.

---

## 🎯 PRZED URUCHOMIENIEM GRY

### Metoda 1: Project Settings (NAJLEPSZE)

1. **Edit → Project Settings**
2. **General Settings → Default**
3. Znajdź sekcję **"Game Viewport Client Class"**
4. Odznacz:
   - ☐ **Show Frame Rate and Memory**
   - ☐ **Show Hit Boxes**
   - ☐ **Show Debug Info**
   - ☐ **Display Safe Zone**

### Metoda 2: Editor Preferences

1. **Edit → Editor Preferences**
2. **Level Editor → Play → Play in Editor**
3. Odznacz:
   - ☐ **Show Floor**
   - ☐ **Show Stat FPS**
   - ☐ **Enable Sound**  *(jeśli nie chcesz dźwięku w edytorze)*

### Metoda 3: World Settings

1. Otwórz **Window → World Settings**
2. W sekcji **World Settings → Game Mode**
3. Wyłącz debug opcje dla twojego GameMode

---

## 📝 Usuń Blueprint Debug Prints

### Jeśli masz "Print String" nodes w Blueprintach:

**Opcja A: Wyłącz globalnie w konsoli:**
```
DisableAllScreenMessages
```

**Opcja B: Usuń Print String nodes (ręcznie):**
1. Otwórz każdy Blueprint
2. Znajdź wszystkie node'y **"Print String"**
3. Usuń je lub odłącz execution pin

**Opcja C: Wyłącz tylko na ekranie (zostaw w logu):**
- W każdym node "Print String":
  - **Print to Screen:** ☐ (odznacz)
  - **Print to Log:** ☑ (zostaw jeśli potrzebujesz)

---

## 🛠️ C++ Logging (jeśli masz kod C++)

### Wyłącz logi w DefaultEngine.ini

**Plik:** `Config/DefaultEngine.ini`

Dodaj te linie na końcu:

```ini
[Core.Log]
LogTemp=Error
LogAudio=Error
LogAkAudio=Error
LogWwiseProjectDatabase=Error
LogWwiseSoundEngine=Error
LogInit=Error
LogNet=Error

[/Script/Engine.Engine]
bUseFixedFrameRate=False
bSmoothFrameRate=True
```

### Lub wyłącz wszystkie logi:

```ini
[Core.Log]
Global=Error
```

---

## 🎬 SHADOW FRAMES Specific (jeśli nagrywasz ten projekt)

### Wwise Debug Info

Jeśli widzisz Wwise debug info:

```cpp
// W konsoli:
ak.wwise.showdebuginfo 0
ak.wwise.showspatialinfo 0
```

### Footstep Debug (jeśli implementowałeś)

Jeśli masz custom debug draw dla footstepów:

```cpp
// W konsoli:
ShowDebug Footsteps
```

Lub w kodzie C++:

```cpp
// FootstepComponent.cpp - zakomentuj te linie:
// DrawDebugLine(GetWorld(), Start, End, FColor::Green, false, 0.1f);
// DrawDebugSphere(GetWorld(), Hit.Location, 10.f, 12, FColor::Red, false, 0.1f);
```

---

## 🚀 QUICK SETUP - Copy-Paste Do Konsoli

Skopiuj i wklej to wszystko naraz (Ctrl+C → otwórz konsolę → Ctrl+V → Enter):

```
showdebug
stat fps off
stat unit off
stat game off
stat none
DisableAllScreenMessages
showlog
t.MaxFPS 0
r.VSync 0
```

---

## 📹 Dla Najlepszej Jakości Nagrania

### Dodatkowe komendy:

```
r.ScreenPercentage 100           // Pełna rozdzielczość
r.PostProcessAAQuality 6         // Najlepszy anti-aliasing
r.TemporalAACurrentFrameWeight 0.04
r.TemporalAASamples 8
sg.ShadowQuality 4               // Najlepsze cienie
sg.PostProcessQuality 4          // Najlepszy post-process
sg.TextureQuality 4              // Najlepsze tekstury
```

### Dla wysokiego FPS:

```
t.MaxFPS 120                     // Ustaw limit FPS
r.VSync 0                        // Wyłącz VSync
```

---

## 🔍 Sprawdź Co Jest Włączone

### Zobacz aktywne debug info:

```
showdebug
```
*(powtórz kilka razy, cyklicznie pokazuje/ukrywa różne tryby)*

### Zobacz wszystkie stat komendy:

```
stat help
```

### Lista wszystkich console commands:

```
?
```

---

## ⚠️ UWAGA

### Po nagraniu przywróć debug:

```
showdebug
stat fps
stat unit
```

### Zapisz konfigurację:

Po ustawieniu wszystkiego:
1. **File → Save All**
2. **Edit → Project Settings → Save Default Config**

---

## 📱 Shortcut dla Standalone Game

### Uruchom od razu z wyłączonymi logami:

**Metoda 1: Command line argument**
```
YourGame.exe -log=off -noscreenmessages
```

**Metoda 2: DefaultGame.ini**

Plik: `Config/DefaultGame.ini`

```ini
[/Script/Engine.GameViewportClient]
bShowFPS=False
bShowHitBoxes=False
bShowDebugInfo=False
```

---

## ✅ CHECKLIST - Przed Nagraniem

- [ ] Console: `showdebug` (wyłączone)
- [ ] Console: `stat fps off`
- [ ] Console: `DisableAllScreenMessages`
- [ ] Output Log zamknięty w edytorze
- [ ] Project Settings → Show Frame Rate (odznaczone)
- [ ] Blueprint Print Strings (wyłączone)
- [ ] Wwise Debug Info (wyłączone - jeśli używasz)
- [ ] C++ Debug Draws (zakomentowane - jeśli używasz)

---

## 🎮 Bonus: Cinematic Mode

Dla profesjonalnego nagrania:

```
ToggleDebugCamera              // Włącz free camera
ShowFlag.Particles 1           // Pokaż particles
ShowFlag.PostProcessing 1      // Pokaż post-processing
ShowFlag.Fog 1                 // Pokaż fog
r.EyeAdaptationQuality 2       // Auto exposure
```

**Klawisz do cinematic mode:** `Ctrl + Shift + H` (ukrywa UI)

---

**NAJWAŻNIEJSZE 3 KOMENDY:**
1. `showdebug` - wyłącza wszystkie debug
2. `DisableAllScreenMessages` - wyłącza Blueprint prints
3. `stat none` - wyłącza wszystkie statystyki

Powodzenia z nagraniem! 🎬
