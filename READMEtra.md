# Transientica Rebirth

A beatbox rhythm game built in Unity that uses real-time microphone input and machine learning (KNN classification) to recognize beatbox sounds — kick, snare, and hi-hat — and judge player performance against beatmapped songs.

## How It Works

The player beatboxes into a microphone. The game captures audio in real-time, detects percussive onsets, extracts spectral features, classifies the sound type, and evaluates timing accuracy against a scrolling beatmap — all within a single frame.

```
Microphone (44.1 kHz)
    │
    ▼
MicrophoneCapture ── lock-free ring buffer
    │
    ▼
OnsetDetector ── RMS threshold + first-derivative gate
    │               adaptive noise floor, 200ms cooldown
    │               onset backdating (~5.8ms)
    ▼
FFTProcessor ── Radix-2 Cooley-Tukey, 512-sample Hann window
    │
    ▼
FeatureExtractor ── 7-element feature vector:
    │                 spectral centroid, rolloff, flux,
    │                 ZCR, RMS, attack time, spectral flatness
    ▼
AudioClassifier ── KNN (K=5), inverse-distance weighted voting
    │               min-max normalization, confidence scoring
    │               heuristic fallback if no trained model
    ▼
EventBus.OnBeatboxInput(soundType, dspTime, confidence)
    │
    ▼
HitJudge ── matches input to nearest active note
             Perfect (±60ms) / Great (±130ms) / Good (±200ms) / Miss
```

All timing-critical operations use `AudioSettings.dspTime` for sub-frame precision. The audio hot path (FFT, feature extraction, onset detection) is zero-allocation to avoid GC spikes during gameplay.

## Technologies

| Technology | Version | Purpose |
|---|---|---|
| Unity | 6000.3.8f1 | Game engine |
| C# | .NET Standard 2.1 | All game logic |
| Universal Render Pipeline | 17.3.0 | Rendering |
| Unity Input System | 1.18.0 | Input handling |
| Unity Timeline | 1.8.10 | Animation support |
| Unity Legacy UI | 2.0.0 | All UI (no TextMeshPro) |

No external ML frameworks — the KNN classifier and FFT are implemented from scratch in pure C#.

## Project Structure

```
Assets/_Project/
├── Data/Beatmaps/          ScriptableObject beatmap assets
├── Scenes/
│   ├── MainMenu.unity      Title screen, song select, settings
│   ├── Training.unity      Classifier training flow
│   ├── Gameplay.unity      Active rhythm game session
│   └── Results.unity       Post-gameplay stats and grade
├── Scripts/
│   ├── Audio/              Audio pipeline (10 scripts)
│   ├── Core/               Game state, events, persistence (6 scripts)
│   ├── Gameplay/           Beatmap, notes, scoring, judging (8 scripts)
│   ├── Training/           Sample recording, KNN training (4 scripts)
│   ├── UI/                 All screens, built at runtime (8 scripts)
│   └── Visuals/            Effects, animations, feedback (7 scripts)
└── Shaders/

Assets/Resources/Sound/
├── UI/                     UIClick.wav, UIHover.wav
└── GameStart/              Countdown sounds (3, 2, 1, Go)

Assets/Sound/               Original sound assets (source copies)
```

## Architecture

### Core Patterns

**State Machines** drive all major systems:
- `GameManager`: MainMenu → Training → SongSelect → Gameplay → Results
- `GameplayManager`: Countdown → Playing → Ending → Paused
- `TrainingManager`: Idle → Recording → Processing → Complete / Error

**Static Event Bus** (`EventBus.cs`) decouples all systems — audio, gameplay, UI, and training communicate exclusively through publish-subscribe events. No direct cross-system dependencies.

**Singletons** with `DontDestroyOnLoad`: `GameManager` (game state + player profile), `ScreenTransition` (scene fades), `UISoundManager` (UI audio).

**Object Pooling**: `NoteSpawner` maintains three per-type pools (Kick/Snare/HiHat, 20 each) to eliminate GC during gameplay.

**Runtime UI Construction**: All UI screens build their elements entirely in code — no prefabs, no Inspector wiring, no TextMeshPro. Uses Unity's legacy `Text` component and `UIThemeColors` for consistent neon-cyberpunk theming.

### Audio Pipeline

The pipeline chains five components, each zero-allocation on the hot path:

| Component | Role |
|---|---|
| `MicrophoneCapture` | Lock-free ring buffer capturing at 44.1 kHz with device fallback and auto-restart |
| `OnsetDetector` | RMS-threshold + first-derivative onset detection with adaptive noise-floor calibration (first 40 buffers) |
| `FFTProcessor` | Radix-2 Cooley-Tukey FFT with Hann windowing and pre-computed twiddle factors |
| `FeatureExtractor` | Extracts 7-element vector: spectral centroid, rolloff, flux, ZCR, RMS, attack time, spectral flatness |
| `AudioClassifier` | KNN (K=5) with inverse-distance weighted voting and min-max normalization |

If no trained model exists, a heuristic classifier uses spectral rules as fallback — the game is always playable.

### Scoring System

| Judgment | Timing Window | Points |
|---|---|---|
| Perfect | ±60 ms | 300 |
| Great | ±130 ms | 200 |
| Good | ±200 ms | 100 |
| Miss | beyond ±200 ms | 0 |

Combo multipliers scale with consecutive hits: 1x (0-9), 2x (10-24), 4x (25-49), 8x (50+). Accuracy is a weighted rolling average across all judgments.

Letter grades: S (98%+), A (95%+), B (90%+), C (80%+), D (70%+), F (<70%).

### Latency Compensation

Base compensation of 120 ms plus a user-calibrated offset. The calibration UI plays scheduled clicks at 100 BPM while the player beatboxes on beat — measured deltas are trimmed, and the median becomes the offset. Manual ±1/±10 ms fine-tuning is also available.

Onset timestamps are backdated by ~5.8 ms (half of one FFT window at 512 samples / 44.1 kHz) to account for analysis latency.

## Training

The classifier requires 10+ labeled samples per sound type (kick, snare, hi-hat). Training flow:

1. **Record** — Player beatboxes each sound type while the UI shows progress per type. Freely switch between types using tab buttons. Onset detection + feature extraction runs automatically with a 0.3s cooldown between samples.
2. **Train** — KNN computes min-max normalization bounds across all samples. Leave-one-out cross-validation measures accuracy.
3. **Validate** — If accuracy ≥ 70%, the model is usable. Below that, the user is prompted to record clearer samples.
4. **Save** — Serialized to `training_data.json` in `Application.persistentDataPath`. Loaded automatically on next launch.

The trained model is lightweight (just stored samples + normalization bounds) and trains in milliseconds. No GPU or external ML infrastructure required.

## Beatmap Format

Beatmaps are Unity `ScriptableObject` assets (`BeatmapData`):

```csharp
[CreateAssetMenu(menuName = "Transientica/Beatmap")]
public class BeatmapData : ScriptableObject
{
    public string songName;
    public float bpm;
    public float audioOffset;     // seconds before beat 1
    public AudioClip audioClip;
    public List<NoteEvent> notes; // each: beat number, SoundType, sector
}
```

Notes are defined by beat number (converted to seconds via BPM + audio offset). Three sectors correspond to three sound types, arranged radially on screen.

## Persistence

All user data is stored as JSON in `Application.persistentDataPath`:

| File | Contents |
|---|---|
| `player_profile.json` | Player name, per-song high scores, training metadata, audio preferences (mic device, latency offset) |
| `training_data.json` | KNN samples (feature vectors + labels) and normalization bounds |

## Game Flow

```
┌─────────────┐
│  Main Menu   │──── Settings (mic device, latency calibration)
│              │──── Train → Training Scene
│  Song Select │
└──────┬──────┘
       │ Start
       ▼
┌─────────────┐
│  Countdown   │  3 - 2 - 1 - GO!
│  (4 seconds) │  Notes begin spawning during countdown
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Gameplay    │  Beatbox into mic → onset detection → classification
│              │  → timing judgment → score/combo updates
│  ESC: Pause  │  Resume / Quit
└──────┬──────┘
       │ Song ends
       ▼
┌─────────────┐
│  Results     │  Animated reveal: grade, score, accuracy,
│              │  hit breakdown, max combo, high score check
│  Retry/Menu  │
└─────────────┘
```

## Scripts Reference

### Audio (`Assets/_Project/Scripts/Audio/`)

| Script | Purpose |
|---|---|
| `AudioPipeline.cs` | Top-level orchestrator chaining mic → onset → FFT → features → classifier |
| `MicrophoneCapture.cs` | Lock-free ring buffer microphone input at 44.1 kHz |
| `OnsetDetector.cs` | RMS-threshold onset detection with adaptive noise floor |
| `FFTProcessor.cs` | Radix-2 Cooley-Tukey FFT with Hann windowing |
| `FeatureExtractor.cs` | 7-element spectral feature vector extraction |
| `AudioClassifier.cs` | KNN (K=5) classifier with cross-validation |
| `AudioSettings.cs` | Central constants: sample rate, FFT size, timing windows, KNN params |
| `CalibrationManager.cs` | Quick-calibration profiles for latency compensation |
| `RuntimeAudioSettings.cs` | Applies user preferences (mic device, latency offset) at runtime |

### Core (`Assets/_Project/Scripts/Core/`)

| Script | Purpose |
|---|---|
| `GameManager.cs` | Singleton managing global game state and player profile |
| `EventBus.cs` | Static publish-subscribe event hub for decoupled communication |
| `PlayerProfile.cs` | Persistent save data serialized to JSON |
| `AudioPreferences.cs` | Serializable user audio settings |
| `SceneLoader.cs` | Async scene loading with fade transitions |
| `DebugKeyboardInput.cs` | Keyboard simulation of beatbox sounds (K/S/H keys) |

### Gameplay (`Assets/_Project/Scripts/Gameplay/`)

| Script | Purpose |
|---|---|
| `GameplayManager.cs` | Session state machine: countdown → playing → ending → paused |
| `NoteSpawner.cs` | Object-pooled note spawning driven by DSP time |
| `NoteController.cs` | Individual note interpolation and approach animation |
| `HitJudge.cs` | Timing judgment: matches input to nearest active note |
| `ScoringSystem.cs` | Score, combo multiplier, rolling accuracy tracking |
| `SectorManager.cs` | Three radial sectors for sound type lane assignment |
| `BeatmapData.cs` | ScriptableObject: song metadata + note events |
| `BeatmapLoader.cs` | Converts beat numbers to seconds using BPM + offset |

### Training (`Assets/_Project/Scripts/Training/`)

| Script | Purpose |
|---|---|
| `TrainingManager.cs` | Training state machine and classifier orchestration |
| `SampleRecorder.cs` | Bridges audio features to classifier with labeled samples |
| `TrainingDataStore.cs` | JSON serialization of KNN training data |
| `TrainingUI.cs` | Runtime-built training UI with per-type progress |

### UI (`Assets/_Project/Scripts/UI/`)

| Script | Purpose |
|---|---|
| `MainMenuUI.cs` | Title animation, Play/Train/Settings/Quit, song carousel |
| `GameplayUI.cs` | HUD: countdown, score, combo, accuracy, pause menu |
| `ResultsUI.cs` | Animated post-gameplay stats, grade, high score notification |
| `SettingsUI.cs` | Mic device selection, latency calibration, preferences |
| `LatencyCalibrationUI.cs` | Interactive latency measurement and offset calibration |
| `SongSelectUI.cs` | Song selection carousel |
| `UISoundManager.cs` | Singleton SFX: button hover/click, countdown audio |
| `ScreenTransition.cs` | Fade-in/fade-out scene transition overlay |
| `UIThemeColors.cs` | Centralized neon-cyberpunk color constants |

### Visuals (`Assets/_Project/Scripts/Visuals/`)

| Script | Purpose |
|---|---|
| `ComboFlash.cs` | Feedback animation on combo milestones |
| `HitZoneRing.cs` | Radial hit-zone ring visualization |
| `MicInputVisualizer.cs` | Real-time waveform/RMS meter |
| `WaveformVisualizer.cs` | Waveform display |
| `NoteVisuals.cs` | Per-note brightness/scale feedback |
| `HitEffectSpawner.cs` | Hit feedback particles on judgments |
| `BackgroundPulse.cs` | Background pulse synchronized to beats |

## Key Design Decisions

- **No TextMeshPro** — Legacy `Text` component for zero external UI dependencies
- **Pure C# ML** — KNN classifier and FFT implemented from scratch; no ML frameworks needed
- **Zero-Allocation Audio** — All hot-path buffers pre-allocated to avoid GC during gameplay
- **Heuristic Fallback** — Spectral-rule classifier works without training, so the game is always playable
- **DSP Timing** — `AudioSettings.dspTime` for sub-frame precision in all critical timing
- **JSON Persistence** — `JsonUtility` for cross-platform save data; no external serialization
- **Onset Backdating** — Compensates for FFT analysis latency (~5.8 ms) for accurate hit detection
- **Adaptive Noise Floor** — First 40 audio buffers calibrate the onset threshold to ambient noise
