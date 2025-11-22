# SHADOW FRAMES - KOMPLETNA DOKUMENTACJA PROJEKTU
## Dokumentacja Techniczna Audio i Kodu

**Wersja:** 1.0
**Data utworzenia:** 2025-11-15
**Projekt:** Grp22 Shadow Frames
**Engine:** Unreal Engine 5.5
**Audio Middleware:** Wwise 2024.1.2

---

# SPIS TREŚCI

1. [INFORMACJE PODSTAWOWE](#informacje-podstawowe)
2. [ARCHITEKTURA PROJEKTU](#architektura-projektu)
3. [STRUKTURA KODU ŹRÓDŁOWEGO C++](#struktura-kodu-źródłowego-c)
4. [IMPLEMENTACJA SYSTEMÓW AUDIO](#implementacja-systemów-audio)
5. [PROJEKT WWISE](#projekt-wwise)
6. [ASSETY UNREAL ENGINE](#assety-unreal-engine)
7. [SNIPPETY KODU](#snippety-kodu)
8. [PRZEPŁYW AUDIO W GRZE](#przepływ-audio-w-grze)
9. [PROBLEMY I BRAKI](#problemy-i-braki)
10. [ROADMAP IMPLEMENTACJI](#roadmap-implementacji)

---

# INFORMACJE PODSTAWOWE

## Metadane Projektu

```
Nazwa projektu: Grp22 Shadow Frames
Typ gry: Horror/Psychological Thriller
Platforma: Windows
Engine: Unreal Engine 5.5
Audio Middleware: Wwise v2024.1.2 (build 8726)
Języki: English(US), SFX, Mixed, External
Lokalizacja: D:\iszuniewicz_Group_Projects_Workspace\grpprj22\Dev\
```

## Statystyki Projektu

### Kod C++
- **Pliki źródłowe:** 90 (45 .h + 45 .cpp)
- **Pliki audio-specific:** 12 (6 .h + 6 .cpp)
- **Linie kodu:** ~15,000+ (oszacowanie)

### Wwise
- **Work Units:** 53 (.wwu)
- **Pliki audio źródłowe:** 122 (.wav)
- **Eventy:** 20+
- **Game Parameters (RTPC):** 6
- **Switch Groups:** 6
- **State Groups:** 3 (nieużywane)
- **Containers:** 30+

### Unreal Assets
- **Assety WwiseAudio:** 98 (.uasset)
- **DataAssety audio:** 11
- **Blueprinty audio:** 1

## Kluczowe Cechy Audio

### ✓ Zaimplementowane
- System kroków gracza z detekcją powierzchni
- System obecności wroga z RTPC
- Progresywny ambient sterowany ilością zdjęć
- Strefy ambientowe (5 lokacji)
- System kamery (częściowo)
- System delegatów audio

### ✗ Niezaimplementowane
- 90% anomalii bez audio
- UI audio
- GameMode audio triggers
- Enemy AI audio feedback
- PhotoboardRTPC updates
- AmbienceZone triggers

---

# ARCHITEKTURA PROJEKTU

## Diagram Głównej Struktury

```
Grp22_ShadowFrames/
│
├─── Source/Grp22_ShadowFrames/          [KOD C++]
│    ├── PlayerCharacter (.h/.cpp)       - Główna postać, delegaty audio
│    ├── EnemyCharacter (.h/.cpp)        - Wróg
│    ├── BaseAnomaly (.h/.cpp)           - Bazowa klasa anomalii
│    │
│    ├── Audio Managers                  [SYSTEMY AUDIO]
│    │   ├── FootstepAudioManager        ✓ KOMPLETNY
│    │   ├── EnemyPresenceAudioManager   ✓ KOMPLETNY
│    │   └── AnomalyAudioManager         ◐ CZĘŚCIOWY
│    │
│    ├── Audio Configs                   [DATA ASSETS]
│    │   ├── FootstepAudioConfig
│    │   ├── EnemyPresenceAudioConfig
│    │   ├── AnomalyAudioConfig
│    │   └── AudioGlobalConfig
│    │
│    └── Components                      [KOMPONENTY]
│        ├── FootstepComponent           - Detekcja powierzchni
│        └── EnemyPresenceComponent      - Bliskość wroga
│
├─── Content/                            [ASSETY UNREAL]
│    ├── Audio/DataAssets/               - Konfiguracje audio
│    ├── WwiseAudio/                     - Wygenerowane z Wwise (98)
│    ├── Blueprints/Audio/               - BP audio
│    └── Maps/                           - Poziomy gry
│
├─── Plugins/                            [PLUGINY]
│    ├── Wwise/                          - Główna integracja Wwise
│    │   └── Source/AkAudio/             - 1555+ plików
│    ├── WwiseNiagara/                   - Integracja Niagara
│    └── WwiseSoundEngine/               - Silnik dźwięku
│
└─── Config/                             [KONFIGURACJA]
     └── DefaultEngine.ini               - Ustawienia projektu
```

## Diagram Przepływu Audio

```
┌─────────────────────────────────────────────────────────────────┐
│                        UNREAL ENGINE 5.5                        │
├─────────────────────────────────────────────────────────────────┤
│  PlayerCharacter / Anomaly / Enemy                              │
│       │                                                          │
│       ├─> Delegates Broadcast ──────> Audio Manager            │
│       │                                  │                       │
│       │                                  ├─> Load Config        │
│       │                                  │   (DataAsset)        │
│       │                                  │                       │
│       │                                  ├─> SetSwitch()        │
│       │                                  ├─> SetRTPC()          │
│       │                                  └─> PostEvent()        │
│       │                                       │                  │
│       └─> UAkComponent <────────────────────┘                  │
│                  │                                               │
└──────────────────┼───────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WWISE INTEGRATION PLUGIN                     │
├─────────────────────────────────────────────────────────────────┤
│  AkAudioDevice (Singleton)                                      │
│       │                                                          │
│       └─> Wwise Sound Engine API                               │
│                  │                                               │
└──────────────────┼───────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WWISE PROJECT                              │
├─────────────────────────────────────────────────────────────────┤
│  Events ──> Actor-Mixer Hierarchy                              │
│                  │                                               │
│                  ├─> Sounds (.wav)                              │
│                  ├─> Containers (Switch/Random/Blend)           │
│                  │                                               │
│  RTPC ──────────┼─> Switch Logic                               │
│                  │                                               │
│  Switches ──────┼─> Audio Selection                            │
│                  │                                               │
│                  └─> SoundBanks ──> Runtime Audio Output       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# STRUKTURA KODU ŹRÓDŁOWEGO C++

## Pliki Projektu (Source/Grp22_ShadowFrames/)

### Audio Managers (6 plików)

#### 1. FootstepAudioManager (.h/.cpp)
**Status:** ✓ KOMPLETNY
**Funkcja:** Zarządzanie audio kroków gracza z detekcją powierzchni

**Header (FootstepAudioManager.h):**
```cpp
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FootstepAudioManager.generated.h"

class UAkAudioEvent;
class UAkSwitchValue;
class UFootstepComponent;
class UFootstepAudioConfig;

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class GRP22_SHADOWFRAMES_API UFootstepAudioManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UFootstepAudioManager();

	UFUNCTION(BlueprintCallable, Category = "Audio")
	void BindToFootstepComponent(UFootstepComponent* FootstepComponent);

	void ApplyConfigToFootstepComponent(UFootstepComponent* FootstepComponent);

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnFootstepTriggered(FName SurfaceType);

	UPROPERTY(EditDefaultsOnly, Category = "Audio|Footsteps")
	TObjectPtr<UFootstepAudioConfig> m_AudioConfig{};

private:
	UPROPERTY()
	TObjectPtr<UFootstepComponent> m_BoundFootstepComponent{};
};
```

**Implementation (FootstepAudioManager.cpp):**
```cpp
#include "FootstepAudioManager.h"
#include "FootstepComponent.h"
#include "FootstepAudioConfig.h"
#include "AkGameplayStatics.h"
#include "AkAudioEvent.h"

UFootstepAudioManager::UFootstepAudioManager()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UFootstepAudioManager::BeginPlay()
{
	Super::BeginPlay();

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		UE_LOG(LogTemp, Error, TEXT("[FootstepAudioManager] No owner in BeginPlay!"));
		return;
	}

	UFootstepComponent* FootstepComp = Owner->FindComponentByClass<UFootstepComponent>();
	if (FootstepComp)
	{
		BindToFootstepComponent(FootstepComp);
		ApplyConfigToFootstepComponent(FootstepComp);
	}
}

void UFootstepAudioManager::BindToFootstepComponent(UFootstepComponent* FootstepComponent)
{
	if (!FootstepComponent)
	{
		return;
	}

	if (m_BoundFootstepComponent && m_BoundFootstepComponent != FootstepComponent)
	{
		m_BoundFootstepComponent->OnFootstep.RemoveDynamic(this, &UFootstepAudioManager::OnFootstepTriggered);
	}

	m_BoundFootstepComponent = FootstepComponent;
	m_BoundFootstepComponent->OnFootstep.AddDynamic(this, &UFootstepAudioManager::OnFootstepTriggered);
}

void UFootstepAudioManager::ApplyConfigToFootstepComponent(UFootstepComponent* FootstepComponent)
{
	if (!FootstepComponent || !m_AudioConfig)
	{
		return;
	}

	FootstepComponent->m_FootstepInterval = m_AudioConfig->m_FootstepInterval;
	FootstepComponent->m_MinSpeedForFootsteps = m_AudioConfig->m_MinSpeedForFootsteps;
}

void UFootstepAudioManager::OnFootstepTriggered(FName SurfaceType)
{
	if (!m_AudioConfig)
	{
		return;
	}

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		UE_LOG(LogTemp, Error, TEXT("[FootstepAudioManager] GetOwner() returned nullptr in OnFootstepTriggered!"));
		return;
	}

	UAkSwitchValue* SelectedSwitch = m_AudioConfig->GetSwitchForSurface(SurfaceType);

	if (SelectedSwitch)
	{
		UAkGameplayStatics::SetSwitch(SelectedSwitch, Owner);
	}

	if (m_AudioConfig->m_FootstepEvent)
	{
		UAkGameplayStatics::PostEvent(m_AudioConfig->m_FootstepEvent, Owner, 0, FOnAkPostEventCallback());
	}
}
```

**Wzorzec użycia:**
1. BeginPlay() znajduje FootstepComponent
2. Binduje się do delegata OnFootstep
3. Przy każdym kroku: ustawia switch powierzchni + postuje event
4. Wwise odtwarza odpowiedni RandomContainer (Asphalt/Wood/Tiles)

---

#### 2. EnemyPresenceAudioManager (.h/.cpp)
**Status:** ✓ KOMPLETNY
**Funkcja:** System audio bliskości wroga z RTPC i oddechem

**Header (EnemyPresenceAudioManager.h):**
```cpp
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "EnemyPresenceAudioManager.generated.h"

class UEnemyPresenceComponent;
class UEnemyPresenceAudioConfig;

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class GRP22_SHADOWFRAMES_API UEnemyPresenceAudioManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UEnemyPresenceAudioManager();

	UFUNCTION(BlueprintCallable, Category = "Audio")
	void BindToPresenceComponent(UEnemyPresenceComponent* PresenceComponent);

	void ApplyConfigToPresenceComponent(UEnemyPresenceComponent* PresenceComponent);

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnProximityChanged(float ProximityValue);

	UPROPERTY(EditDefaultsOnly, Category = "Audio|Enemy Presence")
	TObjectPtr<UEnemyPresenceAudioConfig> m_AudioConfig{};

	UPROPERTY(EditAnywhere, Category = "Audio|Enemy Presence|Debug")
	bool m_ShowDebugInfo{};

private:
	void StartDreadLayers();
	void StopDreadLayers();
	void StartBreathing();
	void UpdateProximityRTPC(float ProximityValue);
	void UpdateBreathingStress(float ProximityValue);

	UPROPERTY()
	TObjectPtr<UEnemyPresenceComponent> m_BoundPresenceComponent{};

	bool m_IsDreadLayersPlaying{};
	bool m_IsBreathingPlaying{};
	float m_LastProximityValue{};
};
```

**Kluczowe metody (EnemyPresenceAudioManager.cpp):**
```cpp
void UEnemyPresenceAudioManager::OnProximityChanged(float ProximityValue)
{
	if (!m_AudioConfig)
	{
		return;
	}

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		UE_LOG(LogTemp, Error, TEXT("[EnemyPresenceAudioManager] GetOwner() returned nullptr in OnProximityChanged!"));
		return;
	}

	// Start dread layers jeśli wróg blisko
	if (ProximityValue > 0.f)
	{
		if (!m_IsDreadLayersPlaying)
		{
			StartDreadLayers();
		}
		if (!m_IsBreathingPlaying)
		{
			StartBreathing();
		}
	}
	else if (ProximityValue <= 0.f && m_IsDreadLayersPlaying)
	{
		StopDreadLayers();
	}

	// Aktualizuj RTPC dla dread layers
	if (m_IsDreadLayersPlaying)
	{
		UpdateProximityRTPC(ProximityValue);
	}

	// Aktualizuj oddech gracza
	if (m_IsBreathingPlaying)
	{
		UpdateBreathingStress(ProximityValue);
	}

	m_LastProximityValue = ProximityValue;

	// Debug
	if (m_ShowDebugInfo)
	{
		GEngine->AddOnScreenDebugMessage(
			101,
			0.f,
			FColor::Cyan,
			FString::Printf(TEXT("EnemyPresenceAudio: RTPC=%.1f%% Playing=%s"),
				ProximityValue,
				m_IsDreadLayersPlaying ? TEXT("YES") : TEXT("NO"))
		);
	}
}

void UEnemyPresenceAudioManager::UpdateProximityRTPC(float ProximityValue)
{
	if (!m_AudioConfig || !m_AudioConfig->m_EnemyProximityRTPC)
	{
		return;
	}

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		return;
	}

	// Aktualizuj RTPC_Enemy_Proximity (0-100)
	UAkGameplayStatics::SetRTPCValue(
		m_AudioConfig->m_EnemyProximityRTPC,
		ProximityValue,
		0,
		Owner
	);
}
```

**Wzorzec użycia:**
1. EnemyPresenceComponent oblicza proximity (0.0-1.0) na podstawie dystansu
2. Emituje OnProximityChanged(proximityValue)
3. Manager:
   - Startuje dread layers (jeśli > 0)
   - Aktualizuje RTPC_Enemy_Proximity
   - Startuje breathing loop
   - Kontroluje PlayerStress switch dla oddechu

---

#### 3. AnomalyAudioManager (.h/.cpp)
**Status:** ◐ CZĘŚCIOWY (infrastruktura, brak implementacji)
**Funkcja:** Zarządzanie audio anomalii

**Header (AnomalyAudioManager.h):**
```cpp
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AnomalyAudioManager.generated.h"

class ABaseAnomaly;
class UAnomalyAudioConfig;

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class GRP22_SHADOWFRAMES_API UAnomalyAudioManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UAnomalyAudioManager();

protected:
	virtual void BeginPlay() override;

	// Callbacki delegatów - ZDEFINIOWANE, ALE PUSTE
	UFUNCTION()
	void OnAnomalyActivated(ABaseAnomaly* Anomaly);

	UFUNCTION()
	void OnAnomalyCaptured(ABaseAnomaly* Anomaly);

	UFUNCTION()
	void OnAnomalyDeactivated(ABaseAnomaly* Anomaly);

	UPROPERTY(EditDefaultsOnly, Category = "Audio|Anomaly")
	TObjectPtr<UAnomalyAudioConfig> m_AudioConfig{};

private:
	UPROPERTY()
	TObjectPtr<ABaseAnomaly> m_BoundAnomaly{};
};
```

**PROBLEM:** Metody OnAnomalyActivated/Captured/Deactivated są puste!

---

### Klasy Gameplay

#### 4. PlayerCharacter (.h/.cpp)
**Status:** ◐ CZĘŚCIOWY (delegaty zdefiniowane, OnCameraReload nie broadcastuje)
**Funkcja:** Główna postać gracza z delegatami audio

**Delegaty Audio (PlayerCharacter.h):**
```cpp
// Delegaty kamery
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCameraShutterDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCameraReloadDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCameraEmptyDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCameraPickupDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCameraZoomInDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnCameraZoomOutDelegate);

// Delegaty photoboard
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPhotoboardEnterDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPhotoboardExitDelegate);

// Delegaty notatek
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnNoteInteractionDelegate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnNoteInteractionExitDelegate);

// Properties delegatów
UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnCameraShutterDelegate OnCameraShutter;        // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnCameraReloadDelegate OnCameraReload;          // ✗ NIE BROADCASTUJE!

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnCameraEmptyDelegate OnCameraEmpty;            // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnCameraPickupDelegate OnCameraPickup;          // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnCameraZoomInDelegate OnCameraZoomIn;          // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnCameraZoomOutDelegate OnCameraZoomOut;        // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnPhotoboardEnterDelegate OnPhotoboardEnter;    // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnPhotoboardExitDelegate OnPhotoboardExit;      // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Interaction")
FOnNoteInteractionDelegate OnNoteInteraction;    // ✓ BROADCASTUJE

UPROPERTY(BlueprintAssignable, Category = "Interaction")
FOnNoteInteractionExitDelegate OnNoteInteractionExit; // ✓ BROADCASTUJE
```

**Komponenty Audio:**
```cpp
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
UFootstepComponent* m_FootstepComponent;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
UFootstepAudioManager* m_FootstepAudioManager;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
UEnemyPresenceComponent* m_EnemyPresenceComponent;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
UEnemyPresenceAudioManager* m_EnemyPresenceAudioManager;
```

**KRYTYCZNY BUG - ReloadCartridge() (PlayerCharacter.cpp):**
```cpp
void APlayerCharacter::ReloadCartridge()
{
	m_CartridgesHeld += m_CartridgesGainedOnReload;
	m_CartridgeReloadedTimes++;

	// BRAKUJE: OnCameraReload.Broadcast();
}
```

---

#### 5. BaseAnomaly (.h/.cpp)
**Status:** ◐ CZĘŚCIOWY (infrastruktura gotowa)
**Funkcja:** Bazowa klasa dla wszystkich anomalii

**Delegaty (BaseAnomaly.h):**
```cpp
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAnomalyActivatedDelegate, ABaseAnomaly*, Anomaly);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAnomalyCapturedDelegate, ABaseAnomaly*, Anomaly);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAnomalyDeactivatedDelegate, ABaseAnomaly*, Anomaly);

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnAnomalyActivatedDelegate OnAnomalyActivated;

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnAnomalyCapturedDelegate OnAnomalyCaptured;

UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnAnomalyDeactivatedDelegate OnAnomalyDeactivated;

// Komponenty audio
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Audio")
UAkComponent* m_AkAudioComponent{};

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
UAnomalyAudioManager* m_AnomalyAudioManager;
```

**10 Typów Anomalii:**
```
1. JukeboxAnomaly          - TODO w kodzie
2. RadioAnomaly            - TODO w kodzie
3. RecordPlayerAnomaly     - Animacja, brak audio
4. LevitationAnomaly       - BRAK AUDIO
5. MaterialAnomaly         - BRAK AUDIO
6. SpinningAnomaly         - BRAK AUDIO
7. ClockAnomaly            - BRAK AUDIO
8. TransformationAnomaly   - BRAK AUDIO (potrzebne RTPC)
9. VisibilityAnomaly       - BRAK AUDIO
10. ShadowFigureAnomaly    - BRAK AUDIO
```

---

## Build Configuration

**Grp22_ShadowFrames.Build.cs:**
```csharp
PublicDependencyModuleNames.AddRange(new string[]
{
    "Core",
    "CoreUObject",
    "Engine",
    "InputCore",
    "EnhancedInput",
    "AkAudio",              // Moduł Wwise dla Unreal
    "WwiseSoundEngine",     // Silnik dźwięku Wwise
    "AIModule",
    "NavigationSystem",
    "EngineCameras"
});

PrivateDependencyModuleNames.AddRange(new string[]
{
    "Niagara",
    "AIModule"
});
```

---

# IMPLEMENTACJA SYSTEMÓW AUDIO

## 1. System Kroków Gracza (Footsteps)

### Architektura
```
PlayerCharacter
├── UFootstepComponent (wykrywa powierzchnię, mierzy prędkość)
│   ├── OnFootstep.Broadcast(SurfaceName)
│   └── Tick() - trace dla PhysicalMaterial
│
└── UFootstepAudioManager (odbiera delegat, zarządza audio)
    ├── UFootstepAudioConfig (DataAsset)
    │   ├── m_FootstepEvent → Play_PLYR_Footstep
    │   ├── m_SwitchConcrete → FootstepSurface-Concrete
    │   ├── m_SwitchWood → FootstepSurface-Wood
    │   ├── m_SwitchTiles → FootstepSurface-Tiles
    │   └── m_FootstepInterval = 0.5s
    │
    └── OnFootstepTriggered(SurfaceName)
        ├── SetSwitch("FootstepSurface", Surface)
        └── PostEvent(Play_PLYR_Footstep)
```

### Flow Execution
```
1. PlayerCharacter::Tick()
   └─> Movement detected

2. FootstepComponent::Tick()
   ├─> Measure velocity
   ├─> Check > MinSpeedForFootsteps (100.0)
   ├─> Timer > FootstepInterval (0.5s)
   └─> Trace ground for PhysicalMaterial
       └─> Get SurfaceName (Tiles/Wood/Concrete...)

3. OnFootstep.Broadcast(SurfaceName)

4. FootstepAudioManager::OnFootstepTriggered(SurfaceName)
   ├─> Look up switch from AudioConfig
   │   └─> GetSwitchForSurface("Tiles") → m_SwitchTiles
   ├─> SetSwitch("FootstepSurface", "Tiles")
   └─> PostEvent(Play_PLYR_Footstep)

5. Wwise Integration
   ├─> Event: Play_PLYR_Footstep
   ├─> Targets: SC_PLYR_Footsteps (SwitchContainer)
   ├─> Check switch: FootstepSurface = "Tiles"
   ├─> Route to: BC_Footsteps_Bathroom
   └─> Play: Water splash sounds (4 variations, random)

6. Audio Output
   └─> 3D positioned at Player location
   └─> Attenuation: 50m range
```

### Wwise Event Chain
```
Play_PLYR_Footstep
└──> SC_PLYR_Footsteps (SwitchContainer)
     ├── Concrete → RC_PLYR_Footsteps_Asphalt
     │              ├── Footstep_Asphalt_01.wav
     │              ├── Footstep_Asphalt_02.wav
     │              ├── Footstep_Asphalt_03.wav
     │              └── Footstep_Asphalt_04.wav (Random)
     │
     ├── Wood → RC_PLYR_Footsteps_Wood
     │          ├── Footstep_Wood_01.wav
     │          ├── Footstep_Wood_02.wav
     │          ├── Footstep_Wood_03.wav
     │          └── Footstep_Wood_04.wav (Random)
     │
     └── Tiles → BC_Footsteps_Bathroom
                 ├── Water_Splash_01.wav
                 ├── Water_Splash_02.wav
                 └── Asphalt_Wet.wav (Blend)
```

---

## 2. System Obecności Wroga (Enemy Presence)

### Architektura
```
PlayerCharacter
├── UEnemyPresenceComponent (oblicza proximity)
│   ├── Tick() - dystans do wroga
│   ├── Normalizuje do 0.0-1.0
│   └── OnProximityChanged.Broadcast(proximityValue)
│
└── UEnemyPresenceAudioManager (odbiera delegat)
    ├── UEnemyPresenceAudioConfig (DataAsset)
    │   ├── m_DreadLayersStartEvent → Play_ENMY_DreadLayers
    │   ├── m_DreadLayersStopEvent → Stop_ENMY_DreadLayers
    │   ├── m_EnemyProximityRTPC → RTPC_Enemy_Proximity
    │   ├── m_BreathingLoopEvent → Play_PLYR_Breathing
    │   ├── m_PlayerStressLevelRTPC → RTPC_Sanity
    │   ├── m_MaxDistance = 3000.0f
    │   └── m_MinDistance = 100.0f
    │
    └── OnProximityChanged(proximityValue)
        ├── StartDreadLayers() (jeśli > 0)
        ├── UpdateProximityRTPC(0-100)
        ├── StartBreathing()
        └── UpdateBreathingStress()
```

### Flow Execution
```
1. EnemyPresenceComponent::Tick()
   ├─> Find closest enemy
   ├─> Calculate distance
   ├─> Normalize to 0.0-1.0
   │   └─> (distance - MinDistance) / (MaxDistance - MinDistance)
   └─> OnProximityChanged.Broadcast(proximityValue)

2. EnemyPresenceAudioManager::OnProximityChanged(proximityValue)
   ├─> If proximityValue > 0.0:
   │   ├─> StartDreadLayers()
   │   │   └─> PostEvent(Play_ENMY_DreadLayers)
   │   └─> StartBreathing()
   │       └─> PostEvent(Play_PLYR_Breathing)
   │
   ├─> UpdateProximityRTPC(proximityValue * 100)
   │   └─> SetRTPCValue(RTPC_Enemy_Proximity, 0-100)
   │
   └─> UpdateBreathingStress(proximityValue * 100)
       └─> SetRTPCValue(RTPC_Sanity, 0-100)

3. Wwise Integration
   ├─> RTPC_Enemy_Proximity controls EnemyPresence Switch
   │   ├─> 0-49.45 → Safe
   │   ├─> 49.45-78.9 → Aware
   │   └─> 78.9-100 → Danger
   │
   └─> Play_PLYR_Breathing uses PlayerStress Switch
       ├─> NoStress → breaths_slow.wav
       ├─> LowStress → breaths_slow.wav
       ├─> MediumStress → breaths_fast.wav
       └─> HighStress1 → breaths_scared_1.wav/2.wav
```

### PROBLEM: EnemyPresence Switch Orphaned
```
RTPC_Enemy_Proximity (0-100)
└──> EnemyPresence Switch
     ├─> Safe (0-49.45)        → BRAK KONTENERÓW AUDIO!
     ├─> Aware (49.45-78.9)    → BRAK KONTENERÓW AUDIO!
     └─> Danger (78.9-100)     → BRAK KONTENERÓW AUDIO!

Switch jest zdefiniowany i podłączony do RTPC,
ale nie kontroluje żadnych obiektów audio w Wwise!
```

---

## 3. System Progresji Ambientu (Progressive Ambience)

### Architektura
```
Photoboard
├── AddPhoto() - dodaje zdjęcie
│   └── POWINNO: UpdatePhotoCountRTPC(PhotoCount)
│
PhotoboardWidget
└── UpdatePhotoCountRTPC(PhotoCount)  ← METODA PUSTA!
    └── POWINNO: SetRTPCValue(RTPC_Photos_OnBoard, PhotoCount)

Wwise
├── RTPC_Photos_OnBoard (1-14)
│   └─> ProgressiveAmbience Switch (11 stanów)
│       └─> SC_AMB_Progressive (SwitchContainer)
│           ├─> InitalState (0) → BC_AMB_BaseLayer
│           ├─> StageOne (1) → + BC_AMB_Stage2_WeirdNoises
│           ├─> StageTwo (2)
│           ├─> StageThree (3) → + BC_AMB_Stage3_GhostlyScreech
│           ├─> StageFour (4) → + BC_AMB_Stage4_Horror
│           ├─> StageFive (5) → + BC_AMB_Stage5_Max
│           ├─> StageSix (6)
│           ├─> StateSeven (7)
│           ├─> StageEight (8)
│           ├─> StageNine (9)
│           └─> StageTen (10+)
│
└── PlayerStress Switch (sterowany tym samym RTPC)
    ├─> NoStress (0-2 zdjęcia)
    ├─> LowStress (3-4)
    ├─> MediumStress (5-6)
    └─> HighStress1 (7+)
```

### Wwise Implementation (Ambiences.wwu)
```xml
<SwitchContainer Name="UNUSED_SC_AMB_Progressive">
  <SwitchGroupRef>ProgressiveAmbience</SwitchGroupRef>
  <DefaultSwitch>InitalState</DefaultSwitch>

  <Children>
    <BlendContainer Name="BC_AMB_BaseLayer">
      <!-- Underwater water sound - zawsze aktywny -->
      <Sound Name="AMB_BaseLayer" Loop="True"/>
    </BlendContainer>

    <BlendContainer Name="BC_AMB_Stage2_WeirdNoises">
      <!-- Sci-fi ambience -->
      <Sound Name="AMB_Stage2_SciFi" Loop="True"/>
    </BlendContainer>

    <Sound Name="AMB_Stage3_GhostlyScreech" Volume="-18dB"/>

    <BlendContainer Name="BC_AMB_Stage4_Horror">
      <Sound Name="AMB_Stage4_HorrorDrone" Loop="True" Volume="-12dB"/>
    </BlendContainer>

    <BlendContainer Name="BC_AMB_Stage5_Max">
      <Sound Name="AMB_Stage5_GhostlyScreech" Volume="-5dB"/>
      <Sound Name="AMB_Stage5_HorrorStinger" Volume="-11dB"/>
    </BlendContainer>

    <Sound Name="HorrorTrailerLogo" Volume="-11dB"/>
    <Sound Name="Horror Background Ambience" Loop="True" Volume="-9dB"/>
  </Children>

  <Groupings>
    <Grouping Switch="InitalState">
      <Items>BC_AMB_BaseLayer</Items>
      <FadeIn>3s</FadeIn>
      <FadeOut>6s</FadeOut>
    </Grouping>

    <Grouping Switch="StageOne">
      <Items>BC_AMB_BaseLayer, BC_AMB_Stage2_WeirdNoises</Items>
    </Grouping>

    <Grouping Switch="StageThree">
      <Items>BC_AMB_BaseLayer, BC_AMB_Stage2_WeirdNoises, AMB_Stage3_GhostlyScreech</Items>
    </Grouping>

    <!-- ... inne grupy ... -->
  </Groupings>
</SwitchContainer>
```

### Flow (POWINIEN BYĆ, ALE NIE DZIAŁA)
```
1. Player adds photo to photoboard
   └─> Photoboard::AddPhoto()

2. POWINNO BYĆ:
   PhotoboardWidget::UpdatePhotoCountRTPC(PhotoCount)
   └─> UAkGameplayStatics::SetRTPCValue("RTPC_Photos_OnBoard", PhotoCount)

3. Wwise evaluates RTPC value:
   ├─> RTPC_Photos_OnBoard = 3
   └─> ProgressiveAmbience Switch → StageThree
       ├─> Fade out: BC_AMB_BaseLayer (jeśli nie w grupie)
       ├─> Fade in: BC_AMB_Stage2_WeirdNoises
       └─> Fade in: AMB_Stage3_GhostlyScreech

4. BlendContainers mix audio layers
   └─> Progresywnie buduje napięcie z każdym zdjęciem
```

---

## 4. System Stref Ambientowych (Ambience Zones)

### Architektura
```
AmbienceZone Switch (5 lokacji)
└──> SC_AMB_Zones (SwitchContainer)
     ├─> MainRoom → BC_AMB_MainRoom
     │              └─> Office hum/ventilation loop
     ├─> Corridor → BC_AMB_Corridor
     │              └─> Empty office room tone loop
     ├─> FemaleBathroom → BC_AMB_Bathroom
     │                    └─> Small bathroom ambience loop
     ├─> MaleBathroom → BC_AMB_Bathroom (ten sam)
     └─> Stage → BC_AMB_Stage
                 └─> Empty gymnasium ambience loop
```

### Wwise Implementation
```xml
<SwitchContainer Name="SC_AMB_Zones">
  <SwitchGroupRef>AmbienceZone</SwitchGroupRef>
  <DefaultSwitch>MainRoom</DefaultSwitch>
  <MaxSoundPerInstance>2</MaxSoundPerInstance>
  <IsGlobalLimit>True</IsGlobalLimit>

  <Children>
    <BlendContainer Name="BC_AMB_MainRoom" 3DSpatialization="Position">
      <Sound Name="Office_Hum_Ventilation" Loop="True" Volume="-9dB">
        <AudioFile>Ambience, Room Tone, Empty Office, Hum, Ventilation, 2ch 01 SND36284.wav</AudioFile>
        <LoopBegin>4.908</LoopBegin>
        <LoopEnd>58.91308</LoopEnd>
      </Sound>
    </BlendContainer>

    <BlendContainer Name="BC_AMB_Corridor" 3DSpatialization="Position">
      <Sound Name="AMB_RoomTone" Loop="True" Volume="-2dB">
        <AudioFile>Ambience, Room Tone, Empty Office, Deep, Quiet, 2ch SND36286.wav</AudioFile>
      </Sound>
    </BlendContainer>

    <BlendContainer Name="BC_AMB_Bathroom" 3DSpatialization="Position">
      <Sound Name="Small_Bathroom_Ambience" Loop="True" Volume="-15dB">
        <AudioFile>Mountain Audio - Small Bathroom Ambience 1.wav</AudioFile>
      </Sound>
    </BlendContainer>

    <BlendContainer Name="BC_AMB_Stage" 3DSpatialization="Position" Volume="-4dB">
      <Sound Name="Empty_Gymnasium" Loop="True">
        <AudioFile>Ambience, Room Tone, Interior, Empty Gymnasium A (Ambix B) SND107620 1.wav</AudioFile>
      </Sound>
    </BlendContainer>
  </Children>

  <Groupings>
    <Grouping Switch="MainRoom">
      <Items>BC_AMB_MainRoom</Items>
      <ContinuePlay>True</ContinuePlay>
      <FadeIn>2.5s</FadeIn>
      <FadeOut>2.5s</FadeOut>
    </Grouping>

    <!-- ... inne grupy ... -->
  </Groupings>
</SwitchContainer>
```

### Flow (NIEUŻYWANY - BRAK TRIGGERÓW)
```
POWINIEN BYĆ:
1. Player enters volume trigger (e.g., Bathroom)
   └─> TriggerBox::OnActorBeginOverlap(Player)

2. Set ambience zone switch
   └─> UAkGameplayStatics::SetSwitch("AmbienceZone", "FemaleBathroom", Player)

3. Wwise transitions ambient
   ├─> Fade out: BC_AMB_MainRoom (2.5s)
   └─> Fade in: BC_AMB_Bathroom (2.5s)

ALE: Brak aktorów/blueprintów ustawiających ten switch w Unrealu!
```

---

# PROJEKT WWISE

## Metadata Projektu

**Grp22_ShadowFrames_Wwise.wproj (XML):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<WwiseDocument Type="Project" SchemaVersion="123" WwiseVersion="v2024.1.2" WwiseBuild="8726">
	<ProjectInfo>
		<Project Name="Grp22_ShadowFrames_Wwise" ID="{C03CBB01-830D-4D2E-B6FE-697B2CD61678}">
			<Platforms>
				<Platform Name="Windows" ReferencePlatform="Windows"/>
			</Platforms>
			<LanguageList>
				<Language Name="English(US)"/>
				<Language Name="External"/>
				<Language Name="Mixed"/>
				<Language Name="SFX"/>
			</LanguageList>
			<PropertyList>
				<Property Name="SoundBankHeaderFilePath" Value="..\Grp22_ShadowFrames\Content\WwiseAudio"/>
				<Property Name="SoundBankPaths">
					<Value Platform="Windows">..\Grp22_ShadowFrames\Content\WwiseAudio\Soundbanks\Windows\</Value>
				</Property>
			</PropertyList>
		</Project>
	</ProjectInfo>
</WwiseDocument>
```

## Game Parameters (RTPC)

**Game Parameters/Default Work Unit.wwu:**
```xml
<GameParameters>
	<GameParameter Name="RTPC_Distance" ID="{A446D098-A302-4F91-A4EC-E33D69717573}">
		<Property Name="BindToBuiltInParam" Value="1"/>  <!-- Built-in distance -->
		<Property Name="InitialValue" Value="0"/>
		<Property Name="Max" Value="3000"/>
	</GameParameter>

	<GameParameter Name="RTPC_Enemy_Distance" ID="{2112BB2E-21F8-4B5B-82F6-52BC59D8F6D9}">
		<Property Name="InitialValue" Value="0"/>
		<!-- NIEUŻYWANY -->
	</GameParameter>

	<GameParameter Name="RTPC_Sanity" ID="{0B2BFA29-D1AA-40B0-A0D4-C14E122E7FDE}">
		<Property Name="InitialValue" Value="0"/>
		<!-- NIEUŻYWANY (miał być dla oddechu) -->
	</GameParameter>

	<GameParameter Name="RTPC_Photos_OnBoard" ID="{3ECB215B-B90B-4207-A9AD-A6C41663E540}">
		<Property Name="InitialValue" Value="1"/>
		<Property Name="Max" Value="14"/>
		<!-- UŻYWANY: Kontroluje ProgressiveAmbience i PlayerStress -->
	</GameParameter>

	<GameParameter Name="RTPC_Enemy_Proximity" ID="{8C1B542F-0F1A-49CE-9449-9D7AE36FCA6C}">
		<Property Name="InitialValue" Value="0"/>
		<!-- UŻYWANY: Kontroluje EnemyPresence switch -->
	</GameParameter>

	<GameParameter Name="RTPC_Player_Stress_Level" ID="{B13ABFDC-00A0-4943-AE36-22F36A094F8B}">
		<Property Name="InitialValue" Value="0"/>
		<!-- Zdefiniowany ale nieużywany w projekcie -->
	</GameParameter>
</GameParameters>
```

## Switches

**Switches/Default Work Unit.wwu:**
```xml
<Switches>
	<!-- NIEUŻYWANY -->
	<SwitchGroup Name="PlayerHealth">
		<Switch Name="FullHealth"/>
		<Switch Name="HalfHealth"/>
		<Switch Name="LowHealth"/>
	</SwitchGroup>

	<!-- UŻYWANY: Kontrolowany przez RTPC_Photos_OnBoard -->
	<SwitchGroup Name="ProgressiveAmbience" UseGameParameter="True">
		<SwitchOnRTPC>
			<GameParameterRef>RTPC_Photos_OnBoard</GameParameterRef>
			<Curve>
				<!-- 0 zdjęć → InitalState -->
				<Point XPos="0" YPos="1"/>
				<!-- 1 zdjęcie → StageOne -->
				<Point XPos="1" YPos="2"/>
				<!-- 2 zdjęcia → StageTwo -->
				<Point XPos="2" YPos="3"/>
				<!-- ... -->
				<!-- 10 zdjęć → StageTen -->
				<Point XPos="10" YPos="11"/>
				<!-- 14 zdjęć → Reset do InitalState -->
				<Point XPos="14" YPos="0"/>
			</Curve>
		</SwitchOnRTPC>

		<Switches>
			<Switch Name="InitalState"/>
			<Switch Name="StageOne"/>
			<Switch Name="StageTwo"/>
			<Switch Name="StageThree"/>
			<Switch Name="StageFour"/>
			<Switch Name="StageFive"/>
			<Switch Name="StageSix"/>
			<Switch Name="StateSeven"/>
			<Switch Name="StageEight"/>
			<Switch Name="StageNine"/>
			<Switch Name="StageTen"/>
		</Switches>
	</SwitchGroup>

	<!-- UŻYWANY: Kontrolowany przez RTPC_Photos_OnBoard (ten sam RTPC!) -->
	<SwitchGroup Name="PlayerStress" UseGameParameter="True">
		<SwitchOnRTPC>
			<GameParameterRef>RTPC_Photos_OnBoard</GameParameterRef>
			<Curve>
				<!-- 0-2 zdjęcia → NoStress -->
				<Point XPos="0" YPos="1"/>
				<!-- 3-4 zdjęcia → LowStress -->
				<Point XPos="3" YPos="2"/>
				<!-- 5-6 zdjęć → MediumStress -->
				<Point XPos="5" YPos="3"/>
				<!-- 7+ zdjęć → HighStress1 -->
				<Point XPos="7" YPos="4"/>
				<Point XPos="14" YPos="0"/>
			</Curve>
		</SwitchOnRTPC>

		<Switches>
			<Switch Name="NoStress"/>
			<Switch Name="LowStress"/>
			<Switch Name="MediumStress"/>
			<Switch Name="HighStress1"/>
		</Switches>
	</SwitchGroup>

	<!-- UŻYWANY: Footsteps -->
	<SwitchGroup Name="FootstepSurface">
		<Switch Name="Concrete"/>
		<Switch Name="Wood"/>
		<Switch Name="Tiles"/>
		<Switch Name="CreakyStairs"/>    <!-- Zdefiniowany ale nieużywany -->
		<Switch Name="CreakyWood"/>       <!-- Zdefiniowany ale nieużywany -->
	</SwitchGroup>

	<!-- UŻYWANY: Zone ambience -->
	<SwitchGroup Name="AmbienceZone">
		<Switch Name="MainRoom"/>
		<Switch Name="Corridor"/>
		<Switch Name="FemaleBathroom"/>
		<Switch Name="MaleBathroom"/>
		<Switch Name="Stage"/>
	</SwitchGroup>

	<!-- ORPHANED: Kontrolowany przez RTPC, ALE NIE KONTROLUJE ŻADNYCH KONTENERÓW! -->
	<SwitchGroup Name="EnemyPresence" UseGameParameter="True">
		<SwitchOnRTPC>
			<GameParameterRef>RTPC_Enemy_Proximity</GameParameterRef>
			<Curve>
				<!-- 0-49.45 → Safe -->
				<Point XPos="0" YPos="1"/>
				<Point XPos="49.45552" YPos="1"/>
				<!-- 49.45-78.9 → Aware -->
				<Point XPos="78.91304" YPos="2"/>
				<!-- 78.9-100 → Danger -->
				<Point XPos="90.43478" YPos="3"/>
				<Point XPos="100" YPos="3"/>
			</Curve>
		</SwitchOnRTPC>

		<Switches>
			<Switch Name="Safe"/>
			<Switch Name="Aware"/>
			<Switch Name="Danger"/>
		</Switches>
	</SwitchGroup>

	<!-- Typy anomalii -->
	<SwitchGroup Name="AnomalyType">
		<Switch Name="Jukebox"/>
		<Switch Name="Radio"/>
		<Switch Name="RecordPlayer"/>
		<Switch Name="Levitation"/>
		<Switch Name="Material"/>
		<Switch Name="Spinning"/>
		<Switch Name="Transformation"/>
		<Switch Name="Visibiity"/>
		<Switch Name="ShadowFigure"/>
		<Switch Name="EnvDistortion"/>
	</SwitchGroup>
</Switches>
```

## Actor-Mixer Hierarchy

### Work Units Struktura
```
Actor-Mixer Hierarchy/
├── Default Work Unit.wwu            - TESTY DO USUNIĘCIA
│   ├── _TEST_CameraBeep             [DELETE]
│   ├── _TEST_CameraBeep_01          [DELETE]
│   └── _TEST_AMB_Spatial            [DELETE]
│
├── Ambiences.wwu (43KB)             - SYSTEM AMBIENTU
│   ├── SC_AMB_Progressive           - Progresywny ambient
│   └── SC_AMB_Zones                 - Strefy lokalizacyjne
│
├── Anomalies.wwu (14KB)             - ANOMALIE
│   ├── RC_Anomalies                 - Szepty (150m range)
│   └── RC_AlwaysAudibleWhisperCue   - Szepty globalne (1000m)
│
├── PlayerBehaviour.wwu (20KB)       - ZACHOWANIA GRACZA
│   └── SC_PLYR_Breathing            - Oddech sterowany stresem
│
├── PlayerActions.wwu (41KB)         - AKCJE GRACZA
│   └── PLYR_Camera                  - System kamery
│
├── PlayerLocomotion.wwu (684B)      - LOKOMOCJA GRACZA
│   └── SC_PLYR_Footsteps            - GŁÓWNY system kroków
│
├── PlayerFootsteps.wwu (30KB)       - DUPLIKAT! (Enemy WU)
│   └── SC_PLYR_Footsteps            [DUPLICATE]
│
├── PlayerNoteInteraction.wwu        - Interakcja z notatkami
│   └── BC_PLYR_NotePlace
│
├── Enemy.wwu (7KB)                  - WRÓG
├── EnemyFootsteps.wwu (13KB)        - Kroki wroga
├── Environment.wwu (5KB)            - ŚRODOWISKO
│   ├── BC_Faucet_Drip              - Kropla wody (50m, 3D)
│   └── BC_Toilet                    - Toaleta (30m, 3D)
│
└── Anomaly_WRK_CURR.wwu (24KB)      - Anomalie w budowie
```

## Events

### Eventy Lista
```
Events/
├── Ambience.wwu
│   ├── Play_AMB_Progressive
│   ├── Play_AMB_Zone_Global
│   ├── Play_AMB_Corridor
│   ├── Stop_AMB_MainRoom
│   ├── Stop_AMB_Corridor
│   └── Play_AMB_Test              [DELETE]
│
├── Anomalies.wwu
│   └── Play_ANMLY_Spawn
│
├── PlayerLocomotion.wwu
│   └── Play_PLYR_Footstep
│
├── PlayerBehaviour.wwu
│   └── Play_PLYR_Breathing
│
├── PlayerActions.wwu
│   ├── Play_PLYR_TakePhoto
│   ├── Play_PLYR_EnterPhotoBoard
│   └── Play_PLYR_ExitPhotoBoard
│
├── CameraCartridge.wwu
│   ├── Play_PLYR_Camera_Empty
│   ├── Play_PLYR_Camera_Reload
│   ├── Play_PLYR_Camera_Pickup
│   ├── Play_PLYR_Camera_Zoom_In
│   └── Play_PLYR_Camera_Zoom_Out
│
├── Notes.wwu
├── Environment.wwu
├── Enemy.wwu
└── TestEvents.wwu                 [DELETE CAŁOŚĆ]
```

## Pliki Audio Źródłowe

**Originals/SFX/ (122 pliki WAV):**
```
Originals/SFX/
├── Footsteps (16+)
│   ├── Footstep_Asphalt_01-04.wav
│   ├── Footstep_Wood_01-04.wav
│   ├── Water_Splash_01-04.wav
│   └── ...
│
├── Ambience (10+)
│   ├── WATRUndwtr_Water Underwater Tonal_PE112959.wav
│   ├── SciFiAmbience_DIGIZ04-53-01.wav
│   ├── Horror Background Ambience.wav
│   ├── Ambience, Room Tone, Empty Office...
│   └── ...
│
├── Camera (8+)
│   ├── Communications, Camera, Photo, Analogue, Polaroid, Single Shot 01-04.wav
│   ├── Bullets, Shell, Cartridge, Drop, Concrete 01-04.wav
│   └── ...
│
├── Ghost/Horror (10+)
│   ├── ANMLY_Ghost_Whisper_01-06.wav
│   ├── ANMLY_Whisper_01-04.wav
│   ├── Designed, Drone, Horror, Dark Atmosphere 05 SND34782.wav
│   ├── Ambience, Designed, Horror, Ghostly Screeching SND66510.wav
│   └── ...
│
└── Environment (20+)
    ├── Faucet_Drip_01-03.wav
    ├── Toilet_Flush_01-02.wav
    └── ...
```

---

# ASSETY UNREAL ENGINE

## Content/Audio/DataAssets/

### DA_AudioGlobalConfig.uasset
**Funkcja:** Globalna konfiguracja audio (reset RTPC)

### AnomaliesConfigurations/ (10 DataAssetów)
```
DA_EnvDistortion_AudioConfig.uasset
DA_Jukebox_AudioConfig.uasset
DA_Levitation_AudioConfig.uasset
DA_Material_AudioConfig.uasset
DA_Radio_AudioConfig.uasset
DA_RecordPlayer_AudioConfig.uasset
DA_ShadowFigure_AudioConfig.uasset
DA_Spinning_AudioConfig.uasset
DA_Transformation_AudioConfig.uasset
DA_Visibility_AudioConfig.uasset
```

## Content/WwiseAudio/ (98 assetów)

### Struktura
```
WwiseAudio/
├── InitBank.uasset                              - Bank inicjalizacyjny
├── WwiseMultiReferenceAssetLibrary.uasset
│
├── Events/                                      - EVENTY (20+)
│   ├── Ambience/
│   │   └── Play_AMB_Progressive.uasset
│   ├── Default_Work_Unit/
│   │   ├── Anomalies/Play_ANMLY_Spawn.uasset
│   │   ├── Play_PLYR_Footstep.uasset
│   │   └── ...
│   ├── Player/
│   │   ├── CameraCartridge/*.uasset (5)
│   │   ├── Notes/*.uasset
│   │   ├── PlayerActions/*.uasset
│   │   └── PlayerBehaviour/*.uasset
│   └── ...
│
├── Game_Parameters/                             - RTPC (6)
│   └── Default_Work_Unit/
│       ├── RTPC_Distance.uasset
│       ├── RTPC_Enemy_Distance.uasset
│       ├── RTPC_Enemy_Proximity.uasset
│       ├── RTPC_Photos_OnBoard.uasset
│       ├── RTPC_Sanity.uasset
│       └── RTPC_Player_Stress_Level.uasset
│
├── Switches/                                    - SWITCHE (6 grup)
│   └── Default_Work_Unit/
│       ├── AmbienceZone/*.uasset (5)
│       ├── AnomalyType/*.uasset (10)
│       ├── EnemyPresence/*.uasset (3)
│       ├── FootstepSurface/*.uasset (5)
│       ├── PlayerHealth/*.uasset (3)
│       ├── PlayerStress/*.uasset (4)
│       └── ProgressiveAmbience/*.uasset (11)
│
├── States/                                      - STANY (NIEUŻYWANE)
│   └── Default_Work_Unit/
│       ├── GameState/*.uasset (3)
│       ├── PlayerState/*.uasset (3)
│       └── PlayerStateGame/*.uasset (3)
│
└── Soundbanks/
    └── Windows/English(US)/
```

## Content/Blueprints/Audio/

### BP_PlayerAudioManager.uasset
**Funkcja:** Blueprint menedżera audio gracza (używany?)

---

# SNIPPETY KODU

## Audio Manager Pattern

### Template Audio Manager
```cpp
// MyAudioManager.h
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "MyAudioManager.generated.h"

class UMyAudioConfig;

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class GRP22_SHADOWFRAMES_API UMyAudioManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UMyAudioManager();

protected:
	virtual void BeginPlay() override;

	// Callback delegata
	UFUNCTION()
	void OnMyEvent(params...);

	// Konfiguracja (DataAsset)
	UPROPERTY(EditDefaultsOnly, Category = "Audio")
	TObjectPtr<UMyAudioConfig> m_AudioConfig{};

private:
	// Cached references
};

// MyAudioManager.cpp
#include "MyAudioManager.h"
#include "MySourceComponent.h"
#include "MyAudioConfig.h"
#include "AkGameplayStatics.h"
#include "AkAudioEvent.h"

UMyAudioManager::UMyAudioManager()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UMyAudioManager::BeginPlay()
{
	Super::BeginPlay();

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		UE_LOG(LogTemp, Error, TEXT("[MyAudioManager] No owner in BeginPlay!"));
		return;
	}

	// Znajdź source component
	UMySourceComponent* SourceComp = Owner->FindComponentByClass<UMySourceComponent>();
	if (SourceComp)
	{
		// Bind do delegata
		SourceComp->OnMyDelegate.AddDynamic(this, &UMyAudioManager::OnMyEvent);
	}
}

void UMyAudioManager::OnMyEvent(params...)
{
	if (!m_AudioConfig)
	{
		return;
	}

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		UE_LOG(LogTemp, Error, TEXT("[MyAudioManager] GetOwner() returned nullptr!"));
		return;
	}

	// Ustawić switch jeśli potrzeba
	if (m_AudioConfig->m_MySwitch)
	{
		UAkGameplayStatics::SetSwitch(m_AudioConfig->m_MySwitch, Owner);
	}

	// Ustawić RTPC jeśli potrzeba
	if (m_AudioConfig->m_MyRTPC)
	{
		UAkGameplayStatics::SetRTPCValue(
			m_AudioConfig->m_MyRTPC,
			value,
			0,
			Owner
		);
	}

	// Post event
	if (m_AudioConfig->m_MyEvent)
	{
		UAkGameplayStatics::PostEvent(
			m_AudioConfig->m_MyEvent,
			Owner,
			0,
			FOnAkPostEventCallback()
		);
	}
}
```

### Audio Config DataAsset Pattern
```cpp
// MyAudioConfig.h
#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "MyAudioConfig.generated.h"

class UAkAudioEvent;
class UAkSwitchValue;
class UAkRtpc;

UCLASS(BlueprintType)
class GRP22_SHADOWFRAMES_API UMyAudioConfig : public UDataAsset
{
	GENERATED_BODY()

public:
	// Eventy
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Audio|Events")
	TObjectPtr<UAkAudioEvent> m_StartEvent;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Audio|Events")
	TObjectPtr<UAkAudioEvent> m_StopEvent;

	// Switche
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Audio|Switches")
	TObjectPtr<UAkSwitchValue> m_SwitchValue;

	// RTPC
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Audio|RTPC")
	TObjectPtr<UAkRtpc> m_MyRTPC;

	// Parametry
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Audio|Parameters")
	float m_MaxDistance = 3000.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Audio|Parameters")
	float m_MinDistance = 100.f;
};
```

## Delegate Pattern

### Deklaracja i Użycie
```cpp
// 1. Deklaracja delegata (w header klasy źródłowej)
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMyEvent, int32, Value);

// 2. Delegate property
UPROPERTY(BlueprintAssignable, Category = "Audio")
FOnMyEvent OnMyEvent;

// 3. Broadcast (w source class)
void MyClass::DoSomething()
{
	// ... logic ...
	OnMyEvent.Broadcast(myValue);
}

// 4. Bind (w audio manager BeginPlay)
SourceObject->OnMyEvent.AddDynamic(this, &UMyAudioManager::OnMyEventHandler);

// 5. Handler
void UMyAudioManager::OnMyEventHandler(int32 Value)
{
	// React to event
	UE_LOG(LogTemp, Log, TEXT("Event received with value: %d"), Value);
}
```

## Wwise API Usage

### Podstawowe Operacje
```cpp
#include "AkGameplayStatics.h"
#include "AkAudioEvent.h"
#include "AkRtpc.h"
#include "AkSwitchValue.h"

// Post Event
UAkGameplayStatics::PostEvent(
	EventAsset,           // UAkAudioEvent*
	Actor,                // AActor* - emitter
	0,                    // Flags
	FOnAkPostEventCallback() // Callback (optional)
);

// Set RTPC
UAkGameplayStatics::SetRTPCValue(
	RtpcAsset,            // UAkRtpc*
	Value,                // float - wartość
	0,                    // Interpolation time (ms)
	Actor                 // AActor* - target
);

// Set Switch
UAkGameplayStatics::SetSwitch(
	SwitchValueAsset,     // UAkSwitchValue*
	Actor                 // AActor* - target
);

// Set State (global)
UAkGameplayStatics::SetState(
	StateValueAsset       // UAkStateValue*
);
```

### Callback Pattern
```cpp
void MyClass::PlaySoundWithCallback()
{
	FOnAkPostEventCallback Callback;
	Callback.BindUFunction(this, FName("OnSoundFinished"));

	UAkGameplayStatics::PostEvent(
		m_MyEvent,
		GetOwner(),
		int32(AkCallbackType::AK_EndOfEvent),
		Callback
	);
}

UFUNCTION()
void MyClass::OnSoundFinished(EAkCallbackType CallbackType, UAkCallbackInfo* CallbackInfo)
{
	UE_LOG(LogTemp, Log, TEXT("Sound finished playing!"));
	// ... follow-up logic ...
}
```

## Debugging

### On-Screen Debug Messages
```cpp
if (m_ShowDebugInfo)
{
	GEngine->AddOnScreenDebugMessage(
		-1,                  // Key (-1 = auto)
		5.f,                 // Duration (seconds)
		FColor::Green,
		FString::Printf(TEXT("Proximity: %.2f"), ProximityValue)
	);
}
```

### Logging
```cpp
UE_LOG(LogTemp, Log, TEXT("Normal log message"));
UE_LOG(LogTemp, Warning, TEXT("Warning: %s"), *SomeString);
UE_LOG(LogTemp, Error, TEXT("Error: Value=%d"), SomeInt);
```

---

# PRZEPŁYW AUDIO W GRZE

## End-to-End Flow: Krok Gracza

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GAMEPLAY - Player Movement                                  │
└─────────────────────────────────────────────────────────────────┘
   PlayerCharacter::Tick(DeltaTime)
   └─> Velocity detected
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 2. COMPONENT - Footstep Detection                              │
└─────────────────────────────────────────────────────────────────┘
   FootstepComponent::Tick(DeltaTime)
   ├─> Measure velocity magnitude
   ├─> Check > MinSpeedForFootsteps (100.0)
   ├─> Timer > FootstepInterval (0.5s)
   ├─> LineTrace to ground
   │   └─> Hit PhysicalMaterial
   ├─> Map PhysicalMaterial → SurfaceName (FName)
   │   └─> e.g., "Tiles", "Wood", "Concrete"
   └─> OnFootstep.Broadcast(SurfaceName)
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 3. AUDIO MANAGER - Footstep Audio Manager                      │
└─────────────────────────────────────────────────────────────────┘
   FootstepAudioManager::OnFootstepTriggered(SurfaceName)
   ├─> Load m_AudioConfig (UFootstepAudioConfig DataAsset)
   ├─> GetSwitchForSurface("Tiles")
   │   └─> Returns m_SwitchTiles (UAkSwitchValue)
   ├─> UAkGameplayStatics::SetSwitch(
   │      m_SwitchTiles,
   │      GetOwner()  // PlayerCharacter
   │   )
   └─> UAkGameplayStatics::PostEvent(
          m_FootstepEvent,  // Play_PLYR_Footstep
          GetOwner(),
          0,
          FOnAkPostEventCallback()
       )
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 4. WWISE INTEGRATION - AkAudio Plugin                          │
└─────────────────────────────────────────────────────────────────┘
   UAkComponent (attached to PlayerCharacter)
   └─> AkAudioDevice::PostEvent()
       ├─> Resolve Event ID from name "Play_PLYR_Footstep"
       ├─> Get current Switch state: FootstepSurface = "Tiles"
       ├─> Get 3D position from PlayerCharacter
       └─> Call Wwise Sound Engine API
           │
┌──────▼──────────────────────────────────────────────────────────┐
│ 5. WWISE SOUND ENGINE - Event Processing                       │
└─────────────────────────────────────────────────────────────────┘
   Event: Play_PLYR_Footstep
   ├─> Target: SC_PLYR_Footsteps (SwitchContainer)
   ├─> Read Switch state: FootstepSurface = "Tiles"
   ├─> Route to child: BC_Footsteps_Bathroom (BlendContainer)
   ├─> Evaluate BlendContainer
   │   ├─> Mix: Water_Splash_01.wav (randomized)
   │   └─> Mix: Asphalt_Wet.wav
   ├─> Apply 3D spatialization
   │   ├─> Position: PlayerCharacter location
   │   ├─> Attenuation: 50m range
   │   └─> Volume rolloff
   └─> Output to Master Audio Bus
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 6. AUDIO OUTPUT - Windows Audio                                │
└─────────────────────────────────────────────────────────────────┘
   Wwise SoundBank → WEM file playback
   └─> DirectSound/WASAPI → Speakers/Headphones
```

## End-to-End Flow: Progresja Ambientu

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GAMEPLAY - Player Adds Photo                                │
└─────────────────────────────────────────────────────────────────┘
   Photoboard::AddPhoto(PhotoTexture)
   └─> m_PhotoCount++ (1-14)
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 2. UI - Photoboard Widget (POWINNO BYĆ, ALE BRAK)              │
└─────────────────────────────────────────────────────────────────┘
   PhotoboardWidget::UpdatePhotoCountRTPC(PhotoCount)  ← PUSTA METODA
   └─> POWINNO: UAkGameplayStatics::SetRTPCValue(
                   RTPC_Photos_OnBoard,
                   float(PhotoCount),
                   0,
                   PlayerCharacter
                )
       │
       ▼ (GDYBY DZIAŁAŁO)
┌─────────────────────────────────────────────────────────────────┐
│ 3. WWISE SOUND ENGINE - RTPC Evaluation                        │
└─────────────────────────────────────────────────────────────────┘
   RTPC_Photos_OnBoard = 3.0
   ├─> ProgressiveAmbience Switch evaluates curve
   │   └─> XPos=3 → YPos=4 (StageThree)
   ├─> PlayerStress Switch evaluates curve
   │   └─> XPos=3 → YPos=2 (LowStress)
   └─> Triggers switch changes
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 4. WWISE CONTAINERS - Progressive Ambience                     │
└─────────────────────────────────────────────────────────────────┘
   SC_AMB_Progressive (SwitchContainer)
   ├─> Current state: InitalState
   ├─> New state: StageThree
   ├─> Grouping behavior:
   │   ├─> FadeOut (6s): (none, BaseLayer continues)
   │   └─> FadeIn (3s): BC_AMB_Stage2_WeirdNoises
   │                    AMB_Stage3_GhostlyScreech
   └─> Active children:
       ├─> BC_AMB_BaseLayer (always playing, underwater loop)
       ├─> BC_AMB_Stage2_WeirdNoises (sci-fi ambience)
       └─> AMB_Stage3_GhostlyScreech (ghostly screech, -18dB)
           │
┌──────▼──────────────────────────────────────────────────────────┐
│ 5. AUDIO MIX - BlendContainers Mix Layers                      │
└─────────────────────────────────────────────────────────────────┘
   Combined output:
   ├─> WATRUndwtr_Water Underwater Tonal (loop, base)
   ├─> SciFiAmbience_DIGIZ04-53-01 (loop, weird noises)
   └─> Ghostly Screeching SND66510 (one-shot, -18dB)
       │
┌──────▼──────────────────────────────────────────────────────────┐
│ 6. BREATHING UPDATE - PlayerStress Switch                      │
└─────────────────────────────────────────────────────────────────┘
   SC_PLYR_Breathing (SwitchContainer)
   ├─> Current state: NoStress
   ├─> New state: LowStress
   └─> No change (both use breaths_slow.wav)
```

---

# PROBLEMY I BRAKI

## Krytyczne Braki

### 1. OnCameraReload NIE BROADCASTUJE
**Lokalizacja:** `PlayerCharacter.cpp::ReloadCartridge()`
**Opis:** Delegat OnCameraReload jest zdefiniowany, ale nigdy nie broadcastuje
**Wpływ:** Event Play_PLYR_Camera_Reload nigdy się nie odtwarza
**Fix:**
```cpp
void APlayerCharacter::ReloadCartridge()
{
	m_CartridgesHeld += m_CartridgesGainedOnReload;
	m_CartridgeReloadedTimes++;

	// FIX: Dodać broadcast
	OnCameraReload.Broadcast();
}
```
**Czas:** 30 minut

---

### 2. 90% Anomalii Bez Audio
**Opis:** 9 z 10 typów anomalii nie ma implementacji audio
**Anomalie bez audio:**
```cpp
// TODO w kodzie:
JukeboxAnomaly.cpp      // TODO: Add audio playback logic
RadioAnomaly.cpp        // TODO: Implement radio static audio

// Brak audio w ogóle:
LevitationAnomaly
MaterialAnomaly
SpinningAnomaly
ClockAnomaly
TransformationAnomaly   // Potrzebuje RTPC dla transformacji
VisibilityAnomaly
ShadowFigureAnomaly
EnvironmentDistortionAnomaly  // Pusta implementacja
```

**Infrastruktura gotowa:**
- BaseAnomaly ma delegaty: OnAnomalyActivated, OnAnomalyCaptured, OnAnomalyDeactivated
- Każda anomalia ma UAkComponent i UAnomalyAudioManager
- DataAssety konfiguracyjne dla każdego typu (10 sztuk)
- AnomalyType Switch w Wwise (10 wartości)

**Brakuje:**
- Implementacja OnAnomalyActivated() w AnomalyAudioManager
- Implementacja OnAnomalyCaptured()
- Implementacja OnAnomalyDeactivated()
- Eventy Wwise dla większości anomalii
- Kontenery audio w Actor-Mixer Hierarchy

**Czas:** 12-15 godzin (1.5-2h każda)

---

### 3. Photoboard RTPC Nie Aktualizowane
**Lokalizacja:** `PhotoboardWidget.cpp::UpdatePhotoCountRTPC()`
**Opis:** Metoda jest pusta, RTPC_Photos_OnBoard nigdy nie jest ustawiane
**Wpływ:** Progresywny ambient NIE działa w grze
**Fix:**
```cpp
void UPhotoboardWidget::UpdatePhotoCountRTPC(int32 PhotoCount)
{
	if (!m_PhotoCountRTPC)
	{
		UE_LOG(LogTemp, Warning, TEXT("[PhotoboardWidget] m_PhotoCountRTPC is null!"));
		return;
	}

	AActor* Player = GetOwningPlayerPawn();
	if (!Player)
	{
		UE_LOG(LogTemp, Warning, TEXT("[PhotoboardWidget] No owning player!"));
		return;
	}

	UAkGameplayStatics::SetRTPCValue(
		m_PhotoCountRTPC,      // RTPC_Photos_OnBoard
		float(PhotoCount),     // 1-14
		0,                     // Interpolation time
		Player                 // Target actor
	);

	UE_LOG(LogTemp, Log, TEXT("[PhotoboardWidget] Set RTPC_Photos_OnBoard to %d"), PhotoCount);
}
```
**Dodatkowo:** Wywołać tę metodę w `Photoboard::AddPhoto()` i `Photoboard::RemovePhoto()`
**Czas:** 2 godziny

---

### 4. EnemyPresence Switch ORPHANED
**Lokalizacja:** Wwise - `Switches/EnemyPresence`
**Opis:** Switch jest zdefiniowany, RTPC podłączone, ALE nie kontroluje żadnych kontenerów audio!
**Wpływ:** RTPC_Enemy_Proximity (0-100) ustawiane, ale brak reakcji audio

**Wwise XML:**
```xml
<SwitchGroup Name="EnemyPresence" UseGameParameter="True">
	<SwitchOnRTPC>
		<GameParameterRef>RTPC_Enemy_Proximity</GameParameterRef>
		<Curve>
			<!-- 0-49.45 → Safe -->
			<Point XPos="0" YPos="1"/>
			<!-- 49.45-78.9 → Aware -->
			<Point XPos="78.91304" YPos="2"/>
			<!-- 78.9-100 → Danger -->
			<Point XPos="100" YPos="3"/>
		</Curve>
	</SwitchOnRTPC>

	<!-- Switch values istnieją, ale nic nie kontrolują! -->
</SwitchGroup>
```

**Fix:** Stworzyć SwitchContainer w Actor-Mixer Hierarchy z dread layers:
```
SC_ENMY_DreadLayers (SwitchContainer)
├─> SwitchGroupRef: EnemyPresence
├─> Safe → (silence)
├─> Aware → BC_ENMY_Aware (low tension drone)
└─> Danger → BC_ENMY_Danger (high tension drone + heartbeat)
```
**Czas:** 3-4 godziny

---

### 5. AmbienceZone Triggers Brakujące
**Lokalizacja:** Unreal - Level Design
**Opis:** Switch AmbienceZone zdefiniowany w Wwise, eventy gotowe, ALE brak triggerów w Unrealu
**Wpływ:** Strefy ambientowe nie przełączają się podczas gry

**System gotowy w Wwise:**
```
SC_AMB_Zones (SwitchContainer)
├─> MainRoom → BC_AMB_MainRoom
├─> Corridor → BC_AMB_Corridor
├─> FemaleBathroom → BC_AMB_Bathroom
├─> MaleBathroom → BC_AMB_Bathroom
└─> Stage → BC_AMB_Stage
```

**Brakuje:** Trigger Volumes w każdej strefie:
```cpp
// TriggerBox::OnActorBeginOverlap
void AAmbienceZoneTrigger::OnPlayerEnter(AActor* OverlappedActor)
{
	APlayerCharacter* Player = Cast<APlayerCharacter>(OverlappedActor);
	if (!Player)
	{
		return;
	}

	UAkGameplayStatics::SetSwitch(
		m_AmbienceZoneSwitch,  // e.g., AmbienceZone-FemaleBathroom
		Player
	);

	UE_LOG(LogTemp, Log, TEXT("Entered ambience zone: %s"), *m_ZoneName.ToString());
}
```

**Fix:**
1. Stworzyć Blueprint BP_AmbienceZoneTrigger
2. Dodać TriggerBox component
3. Dodać UAkSwitchValue property (AmbienceZone switch)
4. Implementować OnActorBeginOverlap
5. Rozstawić w każdej strefie na mapie

**Czas:** 2-3 godziny

---

## Błędy Nazewnictwa

### Obiekty do Usunięcia (4)
```
Default Work Unit.wwu:
├── _TEST_CameraBeep
├── _TEST_CameraBeep_01
└── _TEST_AMB_Spatial

Events/TestEvents.wwu (CAŁY PLIK)
```

### Obiekty do Przemianowania (~50)
**Library Names → Standardized Prefixes:**
```
Aktualne                          → Docelowe
──────────────────────────────────────────────────────────
breaths_slow                      → PLYR_Breath_Slow
breaths_heavy                     → PLYR_Breath_Heavy
breaths_fast                      → PLYR_Breath_Fast
breaths_scared_1                  → PLYR_Breath_Scared_01
breaths_scared_2                  → PLYR_Breath_Scared_02

whisper1                          → ANMLY_Whisper_01
whisper2                          → ANMLY_Whisper_02
whisper3                          → ANMLY_Whisper_03
whisper4                          → ANMLY_Whisper_04

(+ 40+ innych obiektów)
```

**Czas:** 2-3 godziny

---

## Duplikaty

### PlayerFootsteps Duplicate
**Lokalizacja:**
- `Actor-Mixer Hierarchy/PlayerLocomotion.wwu`: SC_PLYR_Footsteps
- `Actor-Mixer Hierarchy/PlayerFootsteps.wwu`: SC_PLYR_Footsteps (DUPLICATE)

**Różnice:**
- PlayerFootsteps_01.wwu (duplicate):
  - Volume: -13dB (oryginał: 0dB)
  - Dodatkowy dźwięk: Dirt (1 plik)
  - Znajduje się w Enemy Work Unit!

**Możliwe wyjaśnienia:**
1. Enemy footsteps (ale powinno być przemianowane na SC_ENMY_Footsteps)
2. Spatial variant player footsteps
3. Legacy/unused duplicate

**Do wyjaśnienia:** Skontaktować się z audio designerem
**Czas:** 30 minut

---

## Nieużywane Elementy

### States (3 grupy - WSZYSTKIE nieużywane)
```xml
<StateGroup Name="GameState">           <!-- UNUSED -->
	<State Name="None"/>
	<State Name="InGame"/>
	<State Name="InMenu"/>
</StateGroup>

<StateGroup Name="PlayerState">         <!-- UNUSED -->
	<State Name="None"/>
	<State Name="Alive"/>
	<State Name="Dead"/>
</StateGroup>

<StateGroup Name="PlayerStateGame">     <!-- UNUSED -->
	<State Name="None"/>
	<State Name="Normal"/>
	<State Name="InPhotoBoard"/>
</StateGroup>
```

**Rekomendacja:** Usunąć lub zaimplementować

---

### Switches Nieużywane (2 grupy)
```xml
<SwitchGroup Name="PlayerHealth">       <!-- UNUSED -->
	<Switch Name="FullHealth"/>
	<Switch Name="HalfHealth"/>
	<Switch Name="LowHealth"/>
</SwitchGroup>

<SwitchGroup Name="EnemyPresence">      <!-- ORPHANED - switch istnieje, RTPC podłączone, ale nic nie kontroluje -->
	<Switch Name="Safe"/>
	<Switch Name="Aware"/>
	<Switch Name="Danger"/>
</SwitchGroup>
```

---

### RTPC Nieużywane (2)
```xml
<GameParameter Name="RTPC_Enemy_Distance"/>  <!-- UNUSED -->
<GameParameter Name="RTPC_Sanity"/>           <!-- UNUSED (miał być dla oddechu) -->
```

---

## Brakujące Delegaty

### Powinny Istnieć, Ale Nie Istnieją
```cpp
// EnemyAIController - audio feedback dla AI
FOnChaseStartedDelegate OnChaseStarted;
FOnChaseStoppedDelegate OnChaseStopped;
FOnEnemySpottedPlayerDelegate OnEnemySpottedPlayer;
FOnEnemyLostPlayerDelegate OnEnemyLostPlayer;

// Photoboard - audio feedback dla interakcji
FOnPhotoPlacedDelegate OnPhotoPlaced;
FOnPhotoRemovedDelegate OnPhotoRemoved;
FOnPhotoSelectedDelegate OnPhotoSelected;

// MainGameModeBase - globalne eventy gry
FOnAnomalySpawnedDelegate OnAnomalySpawned;
FOnEnemySpawnedDelegate OnEnemySpawned;
FOnGameWonDelegate OnGameWon;
FOnGameLostDelegate OnGameLost;
```

**Wpływ:** Brak audio feedbacku dla kluczowych eventów gameplay
**Czas:** 4-6 godzin (wszystkie)

---

# ROADMAP IMPLEMENTACJI

## TIER 1: Krytyczne (6-8 godzin)

### 1. OnCameraReload Fix (30 min)
**Priorytet:** KRYTYCZNY
**Opis:** Dodać `OnCameraReload.Broadcast();` w `PlayerCharacter::ReloadCartridge()`
**Pliki:** `PlayerCharacter.cpp:170`
**Test:** Przeładować kamerę w grze, sprawdzić czy event się odtwarza

---

### 2. Jukebox Audio (2-3h)
**Priorytet:** WYSOKI
**Opis:** Implementacja audio dla JukeboxAnomaly
**Zadania:**
1. Stworzyć event w Wwise: `Play_ANMLY_Jukebox_Start`
2. Stworzyć RandomContainer z muzyka retro (3-5 utworów)
3. Implementować `AnomalyAudioManager::OnAnomalyActivated()` dla Jukebox
4. Testować w grze

**Pliki:**
- `JukeboxAnomaly.cpp` (usunąć TODO)
- `AnomalyAudioManager.cpp`
- Wwise: `Anomalies.wwu`, `Events/Anomalies.wwu`

---

### 3. Radio Audio (2-3h)
**Priorytet:** WYSOKI
**Opis:** Implementacja audio dla RadioAnomaly
**Zadania:**
1. Stworzyć event w Wwise: `Play_ANMLY_Radio_Static`
2. Stworzyć loop z szumem radiowym + przypadkowe voice snippets
3. Implementować `AnomalyAudioManager::OnAnomalyActivated()` dla Radio
4. Testować w grze

**Pliki:**
- `RadioAnomaly.cpp` (usunąć TODO)
- `AnomalyAudioManager.cpp`
- Wwise: `Anomalies.wwu`, `Events/Anomalies.wwu`

---

### 4. Photoboard RTPC (2h)
**Priorytet:** KRYTYCZNY
**Opis:** Implementacja `PhotoboardWidget::UpdatePhotoCountRTPC()`
**Zadania:**
1. Implementować metodę (snippet powyżej)
2. Wywołać w `Photoboard::AddPhoto()`
3. Wywołać w `Photoboard::RemovePhoto()`
4. Testować progresję ambientu

**Pliki:**
- `PhotoboardWidget.cpp`
- `Photoboard.cpp`

---

### 5. EnemyAI Audio Delegates (2-3h)
**Priorytet:** WYSOKI
**Opis:** Dodać delegaty audio do EnemyAIController
**Zadania:**
1. Zdefiniować delegaty: OnChaseStarted, OnChaseStopped
2. Stworzyć EnemyAIAudioManager
3. Broadcastować delegaty w odpowiednich miejscach
4. Stworzyć eventy w Wwise
5. Testować w grze

**Pliki:**
- `EnemyAIController.h/.cpp`
- Nowy plik: `EnemyAIAudioManager.h/.cpp`
- Wwise: `Enemy.wwu`, `Events/Enemy.wwu`

---

## TIER 2: Ważne (12-15 godzin)

### 6-13. Pozostałe Anomalie (po 1.5-2h każda)
**Priorytet:** ŚREDNI
**Lista:**
- RecordPlayerAnomaly (ma animację, dodać audio)
- LevitationAnomaly (dźwięk lewitacji, whoosh)
- MaterialAnomaly (texture sound change)
- SpinningAnomaly (spinning whoosh)
- ClockAnomaly (ticking, chimes)
- VisibilityAnomaly (fade in/out sound)
- ShadowFigureAnomaly (whispers, footsteps)
- TransformationAnomaly (z RTPC dla progresji transformacji, ~3h)

**Wzorzec implementacji:** (patrz Jukebox/Radio powyżej)

---

### 14. UI Audio (2-3h)
**Priorytet:** ŚREDNI
**Opis:** Dodać audio feedback dla UI
**Zadania:**
1. SettingsWidget - slidery, checkboxy, przyciski
2. PhotoWidget - hover, click
3. Stworzyć eventy w Wwise: Play_UI_Click, Play_UI_Hover, etc.
4. Testować

**Pliki:**
- `SettingsWidget.cpp`
- `PhotoWidget.cpp`
- Wwise: nowy plik `UI.wwu`, `Events/UI.wwu`

---

### 15. Photoboard Delegates (2h)
**Priorytet:** ŚREDNI
**Opis:** Dodać delegaty audio do Photoboard
**Zadania:**
1. Zdefiniować: OnPhotoPlaced, OnPhotoRemoved, OnPhotoSelected
2. Broadcastować w odpowiednich miejscach
3. Stworzyć PhotoboardAudioManager
4. Stworzyć eventy w Wwise
5. Testować

**Pliki:**
- `Photoboard.h/.cpp`
- Nowy plik: `PhotoboardAudioManager.h/.cpp`

---

## TIER 3: Polish (8-10 godzin)

### 16. GameMode Audio (2-3h)
**Priorytet:** NISKI
**Opis:** Globalne eventy gry
**Zadania:**
1. Zdefiniować delegaty: OnGameWon, OnGameLost, OnAnomalySpawned, OnEnemySpawned
2. Broadcastować w MainGameModeBase
3. Stworzyć GameModeAudioManager
4. Stworzyć eventy w Wwise (music stingers)
5. Testować

---

### 17. AmbienceZone Triggers (2-3h)
**Priorytet:** ŚREDNI
**Opis:** Rozstawić trigger boxy dla stref ambientowych
**Zadania:**
1. Stworzyć BP_AmbienceZoneTrigger
2. Implementować SetSwitch w OnActorBeginOverlap
3. Rozstawić w każdej strefie na mapie (5 lokacji)
4. Testować przejścia między strefami

---

### 18. EnvironmentDistortion Anomaly (3-4h)
**Priorytet:** NISKI
**Opis:** Kompletna implementacja anomalii + audio
**Zadania:**
1. Dokończyć gameplay implementation
2. Dodać audio (distortion effect)
3. Testować

**Pliki:**
- `EnvironmentDistortionAnomaly.cpp` (pusta implementacja)

---

### 19. CustomPlayerCameraManager Audio (2h)
**Priorytet:** NISKI
**Opis:** Efekty dźwiękowe dla kamery
**Zadania:**
1. Dodać delegaty dla camera transitions
2. Stworzyć audio feedback
3. Testować

---

## TIER 4: Cleanup (2-3 godziny)

### 20. Usunąć Testy (30 min)
- _TEST_CameraBeep, _TEST_CameraBeep_01, _TEST_AMB_Spatial
- TestEvents.wwu (cały plik)

### 21. Przemianować Obiekty (2-3h)
- ~50 obiektów (library names → standardized prefixes)

### 22. Wyjaśnić Duplikaty (30 min)
- PlayerFootsteps_01.wwu - enemy footsteps?

### 23. Dokumentacja (1h)
- Zaktualizować dokumenty
- Stworzyć Audio Design Doc

---

## Szacowany Czas Całkowity: 30-40 GODZIN

### Podział:
- TIER 1 (Krytyczne): 6-8h
- TIER 2 (Ważne): 12-15h
- TIER 3 (Polish): 8-10h
- TIER 4 (Cleanup): 2-3h

---

# PODSUMOWANIE

## Co Działa ✓

1. **Wwise Integration** - Plugin zintegrowany, SoundBanki generowane
2. **Footstep Audio System** - Kompletny system z detekcją powierzchni
3. **Enemy Presence Audio System** - Kompletny system z RTPC
4. **Delegate Infrastructure** - Wzorce delegatów działają
5. **Audio Manager Pattern** - Wzorzec menedżerów zdefiniowany
6. **Progressive Ambience (Wwise)** - System gotowy w Wwise
7. **Zone Ambience (Wwise)** - System gotowy w Wwise

## Co Nie Działa ✗

1. **OnCameraReload broadcast** - Delegat nigdy nie broadcastuje
2. **90% anomalii bez audio** - Tylko infrastruktura, brak implementacji
3. **Photoboard RTPC** - Metoda pusta, progresja ambientu nie działa w Unrealu
4. **EnemyPresence switch** - Orphaned (switch istnieje, ale nic nie kontroluje)
5. **AmbienceZone triggers** - Brak triggerów w Unrealu
6. **UI audio** - Brak feedback dla UI
7. **GameMode audio** - Brak globalnych eventów

## Statystyki Końcowe

| Kategoria | Gotowość | Czas do ukończenia |
|-----------|----------|-------------------|
| **Systemy Core** | 40% | 8h |
| **Anomalie** | 10% | 15h |
| **UI/Feedback** | 5% | 5h |
| **Polish** | 20% | 10h |
| **Cleanup** | N/A | 3h |
| **TOTAL** | ~25% | **30-40h** |

---

## Kluczowe Pliki do Edycji

### C++ (Top Priority)
```
1. PlayerCharacter.cpp (OnCameraReload)
2. PhotoboardWidget.cpp (UpdatePhotoCountRTPC)
3. AnomalyAudioManager.cpp (OnAnomalyActivated/Captured/Deactivated)
4. EnemyAIController.h/.cpp (nowe delegaty)
5. Photoboard.cpp (wywołania UpdatePhotoCountRTPC)
```

### Wwise (Top Priority)
```
1. Anomalies.wwu (nowe kontenery dla 9 anomalii)
2. Events/Anomalies.wwu (nowe eventy)
3. Events/Enemy.wwu (chase eventy)
4. Actor-Mixer Hierarchy/Enemy.wwu (EnemyPresence kontenery)
5. Events/UI.wwu (nowy plik - UI feedback)
```

### Blueprints (Top Priority)
```
1. BP_AmbienceZoneTrigger (nowy - zone triggers)
2. BP_PlayerAudioManager (do sprawdzenia czy używany)
```

---

## Kontakt i Zasoby

### Dokumentacja Lokalna
- `AUDIO_GAPS_QUICK_REFERENCE.txt` - Najlepszy punkt startowy
- `AUDIO_IMPLEMENTATION_EXAMPLES.md` - Przykłady kodu
- `WWISE_QUICK_REFERENCE.md` - Wwise at-a-glance
- **TEN DOKUMENT** - Kompletna dokumentacja projektu

### Dokumentacja Online
- Wwise SDK: https://www.audiokinetic.com/library/
- Wwise Unreal Integration: https://www.audiokinetic.com/integrations/unreal/
- Unreal Delegates: https://docs.unrealengine.com/en-US/ProgrammingAndScripting/ProgrammingWithCPP/UnrealArchitecture/Delegates/

---

**KONIEC DOKUMENTACJI**

---

*Dokument wygenerowany automatycznie na podstawie analizy kodu i projektu Wwise.*
*Zawiera pełną mapę implementacji audio w projekcie Shadow Frames.*
*Dla pytań lub wyjaśnień, sprawdź pliki kodu źródłowego lub dokumentację Wwise.*
