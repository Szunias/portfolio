import json
import os

# Files
data_file = 'portfolio-next/src/data/portfolioData.json'
pl_file = 'portfolio-next/public/locales/pl/translation.json'

# --- DATA TO INJECT ---
# Maps project ID to rich content
project_data = {
    "pause_and_deserve": {
        "media": {
            "thumbnail": "assets/images/projects/deserve.webp",
            "video": "assets/images/projects-pausedeserve/pausedeservegif.mp4",
            "images": [
                "assets/images/projects-pausedeserve/redcorridor.png",
                "assets/images/projects-pausedeserve/caughtbydeath.png",
                "assets/images/projects-pausedeserve/deathapproaches.png"
            ]
        },
        "full_description": "Psychological horror game where every pause comes with a price.\n\nI designed a reactive audio system in Unity where the soundscape shifts based on the player's hesitation. The 'Pause' mechanic isn't just UI—it triggers time-manipulation audio effects, pitch-shifting downward and extending reverb tails to build dread.",
        "pl_desc": "Psychologiczny horror, w którym każda pauza ma swoją cenę.\n\nZaprojektowałem reaktywny system audio w Unity, gdzie pejzaż dźwiękowy zmienia się w zależności od wahania gracza. Mechanika 'Pauzy' to nie tylko UI — wyzwala efekty manipulacji czasem, obniżając wysokość dźwięku i wydłużając pogłosy, by budować grozę."
    },
    "interactive_music": {
        "media": {
            "thumbnail": "assets/images/projects/musicforgames.png",
            "images": [
                "assets/images/projects-nottoday/SoundClasses.png" # Reuse generic wwise screens if specific missing
            ]
        },
        "full_description": "Advanced interactive music systems designed in Wwise.\n\nFeatures vertical layering (stems reacting to game state intensity) and horizontal re-sequencing (seamless transitions between level sections). Demonstrates complex RTPC control over musical elements.",
        "pl_desc": "Zaawansowane interaktywne systemy muzyczne zaprojektowane w Wwise.\n\nWykorzystuje warstwowanie wertykalne (ścieżki reagujące na intensywność gry) i re-sekwencjonowanie horyzontalne (płynne przejścia między sekcjami poziomu). Demonstruje złożoną kontrolę RTPC nad elementami muzycznymi."
    },
    "akantilado": {
        "media": {
            "thumbnail": "assets/images/projects/AkantiladoGIF.webm",
            "video": "assets/images/projects/AkantiladoGIF.mp4",
            "images": [
                "assets/images/projects-akantilado/jungleviewfromtopshot.webp",
                "assets/images/projects-akantilado/pinkcatalikecreature.webp"
            ]
        },
        "full_description": "Complete foley and jungle ambience for a 3D animation.\n\nMixed in 5.1 Surround. I recorded over 200 custom foley samples to bring the characters to life and designed a 5-layer spatial ambience system that adapts to camera perspective.",
        "pl_desc": "Kompletne efekty foley i atmosfera dżungli do animacji 3D.\n\nMiksowane w 5.1 Surround. Nagrałem ponad 200 własnych próbek foley, aby ożywić postacie, i zaprojektowałem 5-warstwowy system przestrzenny otoczenia, który adaptuje się do perspektywy kamery."
    },
    "wwise_unreal_fixer": {
        "media": {
            "thumbnail": "assets/images/projects-wwisefixer/wwisefixerlogo.jpeg",
            "images": []
        },
        "full_description": "Automation tool that saves hours of development time.\n\nFixes broken Wwise integration references in Unreal Engine projects automatically. Built with Python and batch scripting to detect corrupted paths and restore them with one click.",
        "pl_desc": "Narzędzie do automatyzacji oszczędzające godziny pracy.\n\nAutomatycznie naprawia zepsute referencje integracji Wwise w projektach Unreal Engine. Zbudowane w Pythonie i skryptach wsadowych, by wykrywać uszkodzone ścieżki i przywracać je jednym kliknięciem."
    },
    "ray_animation": {
        "media": {
            "thumbnail": "assets/images/projects/RayGIF.webm",
            "video": "assets/images/projects/RayGIF.mp4",
            "images": [
                "assets/images/projects-ray/rayaloneinthecave.png",
                "assets/images/projects-ray/raylightsincave.png"
            ]
        },
        "full_description": "Sound design and music composition for an animated short.\n\nFeatures a groovy, funk-inspired credits theme and atmospheric cave soundscapes. The challenge was balancing the lighthearted musical tone with the solitary visual atmosphere.",
        "pl_desc": "Sound design i kompozycja muzyki do filmu animowanego.\n\nZawiera groovy, funkowy motyw napisów końcowych i atmosferyczne pejzaże dźwiękowe jaskini. Wyzwaniem było zbalansowanie lekkiego tonu muzycznego z samotną atmosferą wizualną."
    },
    "audioq": {
        "media": {
            "thumbnail": "assets/images/projects-audioq/AudioQPicture.png",
            "video": "assets/images/projects-audioq/AudioQ-Showcase.mp4",
            "images": [
                "assets/images/projects-audioq/AudioQLogo.jpeg"
            ]
        },
        "full_description": "A fully functional VST Equalizer plugin built with C++ and JUCE.\n\nFeatures real-time spectrum analysis, parametric EQ bands, and a custom GUI. Developed to understand the low-level DSP mathematics behind digital audio processing.",
        "pl_desc": "W pełni funkcjonalna wtyczka VST Equalizer zbudowana w C++ i JUCE.\n\nOferuje analizę widma w czasie rzeczywistym, parametryczne pasma EQ i własne GUI. Stworzona, by zrozumieć niskopoziomową matematykę DSP stojącą za cyfrowym przetwarzaniem dźwięku."
    },
    "pawism": {
        "media": {
            "thumbnail": "assets/images/projects-pawism/AdobeStock_1676516316.webp",
            "images": [
                "assets/images/projects-pawism/logoproject/Whisk_ccf973736ef31469945498bde4dc903fdr.jpeg"
            ]
        },
        "full_description": "A thriller game made in 48 hours for a Game Jam.\n\nYou play as an ambitious cat. I handled all sound design and implementation under tight time constraints, focusing on impactful UI sounds and tension-building ambience.",
        "pl_desc": "Thriller stworzony w 48 godzin na Game Jam.\n\nGrasz jako ambitny kot. Odpowiadałem za cały sound design i implementację pod dużą presją czasu, skupiając się na mocnych dźwiękach UI i budującej napięcie atmosferze."
    },
    "unreal_engine_rebuilder": {
        "media": {
            "thumbnail": "assets/images/projects-unrealrebuilder/UnrealRebuilderlogo.jpeg",
            "images": [
                "assets/images/projects-unrealrebuilder/appscreenshot.png"
            ]
        },
        "full_description": "DevOps tool for Unreal Engine developers.\n\nAutomates the clean/rebuild process, deleting intermediate files and regenerating project files. Reduces build times and fixes common linker errors automatically.",
        "pl_desc": "Narzędzie DevOps dla developerów Unreal Engine.\n\nAutomatyzuje proces czyszczenia/przebudowy (clean/rebuild), usuwając pliki pośrednie i regenerując pliki projektu. Skraca czas budowania i automatycznie naprawia typowe błędy linkera."
    }
}

# --- EXECUTION ---

# 1. Update portfolioData.json
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_projects(list_key):
    for p in data.get(list_key, []):
        pid = p['id']
        if pid in project_data:
            # Update Fields
            p['media'] = project_data[pid]['media']
            p['full_description'] = project_data[pid]['full_description']
            # Ensure links object exists
            if 'links' not in p:
                p['links'] = {}
            print(f"Updated Data: {pid}")

update_projects('featured_projects')
update_projects('additional_projects')

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# 2. Update PL translations
if os.path.exists(pl_file):
    with open(pl_file, 'r', encoding='utf-8') as f:
        pl_data = json.load(f)
    
    for pid, info in project_data.items():
        key = f"project_{pid}_full_desc"
        pl_data[key] = info['pl_desc']
        # Also update title/short if missing (optional safety)
    
    with open(pl_file, 'w', encoding='utf-8') as f:
        json.dump(pl_data, f, indent=2, ensure_ascii=False)
    print("Updated PL Translations")

print("Fill Complete.")
