import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'

# Exact mapping from old index.html
# Paths cleaned (removed ../)
mapping = {
    "shadow_frames": {
        "thumbnail": "assets/images/projects-shadowframes/Menugif.mp4" 
        # Original used video on hover, poster PhotosOnBoard.png. My card prefers video if avail.
    },
    "gradwork": { # AI Audio Research
        "thumbnail": "assets/images/projects-gradwork/image/aiaudiogradwork.png"
    },
    "amorak": {
        "thumbnail": "assets/images/projects/AmorakGIF.mp4" 
        # webm also avail
    },
    "transientica_audiolab": { # "audiolab" in html link
        "thumbnail": "assets/videos/AudioLab_preview.webm"
    },
    "audioq": {
        "thumbnail": "assets/images/projects-audioq/AudioQLogo.jpeg"
    },
    "middleware_optimization": {
        "thumbnail": "assets/images/projects/musicforgames.png"
    },
    "not_today_darling": {
        "thumbnail": "assets/images/projects/NotTodayGIF.mp4"
    },
    "pause_and_deserve": {
        "thumbnail": "assets/images/projects-pausedeserve/pausedeservegif.mp4"
    },
    "sound_design": {
        "thumbnail": "assets/images/projects-sounddesign/sounddesignprojectcover.png"
    },
    "interactive_music": {
        "thumbnail": "assets/images/projects/musicforgames.png" 
        # Same as middleware in old site visually
    },
    "ray_animation": {
        "thumbnail": "assets/images/projects/RayGIF.mp4"
    },
    "akantilado": {
        "thumbnail": "assets/images/projects/AkantiladoGIF.mp4" 
        # using mp4 version of AkantiladoGIF_compressed
    },
    "richter": {
        "thumbnail": "assets/images/covers/richter.webp"
    },
    "wwise_unreal_fixer": {
        "thumbnail": "assets/images/projects-wwisefixer/wwisefixerlogo.jpeg"
    },
    "unreal_engine_rebuilder": {
        "thumbnail": "assets/images/projects-unrealrebuilder/UnrealRebuilderlogo.jpeg"
    },
    "pawism": {
        # Not in index.html list explicitly? Found in data before. Keeping old or setting safe default.
        "thumbnail": "assets/images/projects-pawism/AdobeStock_1676516316.webp"
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_list(lst):
    for p in lst:
        pid = p['id']
        # Handle potential ID mismatches (data ID vs html link name)
        # e.g. html has "audiolab.html", data has "transientica_audiolab"
        
        lookup_id = pid
        if pid == "transientica_audiolab": lookup_id = "transientica_audiolab" # handled in map
        
        if lookup_id in mapping:
            if 'media' not in p: p['media'] = {}
            
            # Update thumbnail specifically
            p['media']['thumbnail'] = mapping[lookup_id]['thumbnail']
            print(f"Fixed thumbnail for {pid}")

update_list(data.get('featured_projects', []))
update_list(data.get('additional_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Thumbnails matched to original site.")
