import json

data_file = 'portfolio-next/src/data/portfolioData.json'

# Desired Order (IDs)
order = [
    "shadow_frames",
    "gradwork",
    "amorak",
    "transientica_audiolab",
    "audioq",
    "middleware_optimization", # Was musicforgames in file copy
    "not_today_darling",
    "pause_and_deserve",
    "sound_design",
    "interactive_music",
    "ray_animation",
    "akantilado",
    "richter",
    "wwise_unreal_fixer",
    "unreal_engine_rebuilder"
]

# Missing projects data to inject
missing_data = {
    "gradwork": {
        "id": "gradwork",
        "title": "AI Audio Research",
        "category": "Research",
        "short_description": "Graduate research exploring real-time AI audio generation in games.",
        "media": { "thumbnail": "assets/images/projects-gradwork/image/aiaudiogradwork.png" },
        "technologies": ["Python", "PyTorch", "AudioLDM", "MusicGen"],
        "externalLink": "/gradwork.html",
        "featured": True
    },
    "sound_design": {
        "id": "sound_design",
        "title": "Sound Design Showcase",
        "category": "Sound Design",
        "short_description": "Professional audio post-production and DAW workflow showcase.",
        "media": { "thumbnail": "assets/images/projects-sounddesign/sounddesignprojectcover.png" },
        "technologies": ["Reaper", "Pro Tools", "iZotope RX"],
        "externalLink": "/sound-design.html",
        "featured": True
    },
    "middleware_optimization": {
        "id": "middleware_optimization",
        "title": "Wwise Projects Portfolio",
        "category": "Middleware",
        "short_description": "Three Wwise projects solving real production problems.",
        "media": { "thumbnail": "assets/images/projects/musicforgames.png" },
        "technologies": ["Wwise", "Unreal Engine"],
        "externalLink": "/musicforgames.html",
        "featured": True
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Flatten current projects
current_projects = {p['id']: p for p in data.get('featured_projects', []) + data.get('additional_projects', [])}

# Merge missing
for pid, pdata in missing_data.items():
    if pid not in current_projects:
        current_projects[pid] = pdata
    else:
        # Update existing with external link if needed
        current_projects[pid].update(pdata)

# Reconstruct lists
new_featured = []
new_additional = [] # Keeping empty, putting everything in featured for simplicity as per 'exact order' request

for pid in order:
    if pid in current_projects:
        new_featured.append(current_projects[pid])
    else:
        print(f"Warning: Project {pid} not found in data!")

# Update Data
data['featured_projects'] = new_featured
data['additional_projects'] = [] # Clear additional, use single list

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Reordered projects.")
