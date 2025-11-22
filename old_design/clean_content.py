import json

data_file = 'portfolio-next/src/data/portfolioData.json'
tracks_file = 'portfolio-next/public/assets/audio/tracks.json'

# 1. FIX PROJECTS DATA
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_project(pid, desc):
    for p in data.get('featured_projects', []) + data.get('additional_projects', []):
        if p['id'] == pid:
            # Remove fake code snippets
            if 'code_snippets' in p:
                del p['code_snippets']
            # Reset description to verified simple version
            if desc:
                p['full_description'] = desc
            print(f"Cleaned {pid}")

# Ray Animation - Pure Sound Design/Music
clean_project("ray_animation", "Funky credits theme with groove and luminous cadence.\n\nSound design and music composition for an animated short. Balancing the lighthearted musical tone with the solitary visual atmosphere.")

# Akantilado - Sound Design (No code)
clean_project("akantilado", "Complete foley and jungle ambience for a 3D animation.\n\nMixed in 5.1 Surround. Recorded custom foley samples to bring the characters to life. 5-layer spatial ambience system.")

# Amorak - Sound Design (No code unless verified)
clean_project("amorak", "Atmospheric soundscapes and creature audio for horror animation.\n\nCreature Design: Layered roars from lions, elephants, tigers, and hippos.\nEnvironment: Dripping water, creaking wood, distant echoes.")

# Richter - Music (No code)
clean_project("richter", "Suspense sequence with layered strings and action percussion.")

# Save Data
with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)


# 2. FIX MUSIC TRACKS
with open(tracks_file, 'r', encoding='utf-8') as f:
    tracks = json.load(f)

for t in tracks:
    if "Psychedelic" in t['title'] or "psy" in t['id']:
        t['title'] = "psy"
        t['tags'] = ["alt rock", "instrumental"]
        t['desc'] = {
            "en": "Alt Rock instrumental.",
            "pl": "Instrumentalny Alt Rock.",
            "nl": "Alt Rock instrumentaal."
        }
        print("Fixed 'psy' track.")

# Save Tracks
with open(tracks_file, 'w', encoding='utf-8') as f:
    json.dump(tracks, f, indent=2, ensure_ascii=False)

print("Content cleaned.")
