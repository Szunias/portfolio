import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'
pl_file = 'portfolio-next/public/locales/pl/translation.json'

updates = {
    "pause_and_deserve": {
        "code_snippets": [
            {
                "title": "Audio State Machine (C#)",
                "language": "csharp",
                "description": "Handles the transition between 'Gameplay' and 'Pause' states. The pause state isn't silence—it triggers a Snapshot that low-passes the mix and introduces a Shepard Tone to build tension.",
                "code": "public void TogglePauseState(bool isPaused)\n{\n    if (isPaused)\n    {\n        // Transition to 'Dread' Snapshot\n        audioMixer.TransitionToSnapshot(pausedSnapshot, 0.5f);\n        \n        // Start rising tension drone\n        tensionSource.Play();\n        StartCoroutine(FadeInTension(2.0f));\n    }\n    else\n    {\n        // Snap back to reality\n        audioMixer.TransitionToSnapshot(gameplaySnapshot, 0.1f);\n        tensionSource.Stop();\n        PlayStinger(resumeStinger);\n    }\n}"
            }
        ],
        "media": {
            "thumbnail": "assets/images/projects/deserve.webp",
            "video": "assets/images/projects-pausedeserve/pausedeservegif.mp4",
            "images": [
                "assets/images/projects-pausedeserve/redcorridor.png",
                "assets/images/projects-pausedeserve/caughtbydeath.png",
                "assets/images/projects-pausedeserve/deathapproaches.png",
                "assets/images/projects-pausedeserve/trytofindthekeyhint.png",
                "assets/images/projects-pausedeserve/pausedeservetitle.png"
            ]
        }
    },
    "pawism": {
        "code_snippets": [
            {
                "title": "Animation Event Hooks (C#)",
                "language": "csharp",
                "description": "Simple but effective system to sync foley with cat animation frames.",
                "code": "public void PlayFootstep()\n{\n    // Randomize pitch for variety\n    audioSource.pitch = Random.Range(0.9f, 1.1f);\n    \n    // Select surface texture\n    AudioClip clip = surfaceDetector.GetSurfaceClip();\n    \n    audioSource.PlayOneShot(clip, 0.6f);\n}\n\npublic void Meow()\n{\n    // Trigger 'Meow' with probability check to avoid spam\n    if (Random.value > 0.7f) return;\n    audioSource.PlayOneShot(meowClips[Random.Range(0, meowClips.Length)]);\n}"
            }
        ]
    },
    "akantilado": {
        "full_description": "Complete foley and jungle ambience for a 3D animation.\n\nMixed in 5.1 Surround. I recorded over 200 custom foley samples to bring the characters to life and designed a 5-layer spatial ambience system that adapts to camera perspective. The goal was to create a breathing, living jungle that feels dense but leaves frequency space for the subtle creature vocals.",
        "code_snippets": [
            {
                "title": "5.1 Mix Routing Specification",
                "language": "yaml",
                "description": "Channel layout strategy for the cinematic mix.",
                "code": "Center Channel: \n  - Creature Vocals (Direct)\n  - Key Foley (Footsteps, Interactions)\n\nL/R Mains:\n  - Stereo Ambience (Trees, Wind)\n  - Music Score (Wide)\n  - Pan-automated SFX (Movement)\n\nLs/Rs Surrounds:\n  - Distant Wildlife (Birds, Insects)\n  - Jungle Reverb Returns\n  - Wind gusts (Fly-bys)\n\nLFE (.1):\n  - Creature Growls (<80Hz)\n  - Impact Thuds"
            }
        ],
        "media": {
            "thumbnail": "assets/images/projects/AkantiladoGIF.webm",
            "video": "assets/images/projects/AkantiladoGIF.mp4",
            "images": [
                "assets/images/projects-akantilado/jungleviewfromtopshot.webp",
                "assets/images/projects-akantilado/pinkcatalikecreature.webp",
                "assets/images/projects-akantilado/orangecatalikecreaturewithgoldenball.webp",
                "assets/images/projects-akantilado/junglewithbranchesfromnormalview.webp",
                "assets/images/projects-akantilado/background/Jungle.webp"
            ]
        }
    },
    "ray_animation": {
        "media": {
            "thumbnail": "assets/images/projects/RayGIF.webm",
            "video": "assets/images/projects/RayGIF.mp4",
            "images": [
                "assets/images/projects-ray/rayaloneinthecave.png",
                "assets/images/projects-ray/raylightsincave.png",
                "assets/images/projects-ray/rayinlight.png",
                "assets/images/projects-ray/raycredits.png",
                "assets/images/projects-ray/raytitleinstones.png"
            ]
        },
        "code_snippets": [
             {
                "title": "Credits Music Harmony",
                "language": "text",
                "description": "Harmonic structure for the funk-inspired credits theme.",
                "code": "Key: E Dorian\n\nA Section (Groove):\n| Em7   | A13   | Em7   | A13   |\n(Classic Dorian vamp, emphasizing the C# color tone)\n\nB Section (Turnaround):\n| Cmaj7 | B7#9  |\n(Chromatic approach to the turnaround)\n\nInstrumentation:\n- Fender Rhodes (Chords)\n- Electric Bass (Slap style, syncopated)\n- Drum Kit (Tight room reverb)"
            }
        ]
    }
}

# --- EXECUTION ---

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_projects(list_key):
    for p in data.get(list_key, []):
        pid = p['id']
        if pid in updates:
            p.update(updates[pid])
            print(f"Polished: {pid}")

update_projects('featured_projects')
update_projects('additional_projects')

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# --- PL TRANSLATIONS UPDATE ---
pl_new_descs = {
    "project_akantilado_full_desc": "Kompletny foley i ambiencja dżungli do animacji 3D.\n\nZmiksowane w formacie 5.1 Surround. Nagrałem ponad 200 własnych sampli foley i zaprojektowałem 5-warstwowy system przestrzenny. Celem było stworzenie oddychającej, żywej dżungli, która pozostawia miejsce w paśmie dla subtelnych odgłosów stworzeń.",
    "project_pause_and_deserve_full_desc": "Psychologiczny horror, w którym pauzowanie ma swoją cenę.\n\nZaprojektowałem reaktywny system w Unity, gdzie dźwięk zmienia się wraz z wahaniem gracza. Pauza wyzwala Snapshot miksera, który obcina wysokie tony i wprowadza Ton Sheparda, budując nieskończone napięcie."
}

if os.path.exists(pl_file):
    with open(pl_file, 'r', encoding='utf-8') as f:
        pl_data = json.load(f)
    
    pl_data.update(pl_new_descs)
    
    with open(pl_file, 'w', encoding='utf-8') as f:
        json.dump(pl_data, f, indent=2, ensure_ascii=False)
    print("Updated PL Translations for polished projects.")

print("Ultimate Polish Complete.")
