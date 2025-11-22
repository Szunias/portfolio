import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'

# Map project IDs to their asset files
# Using paths relative to 'public/'
media_map = {
    "not_today_darling": {
        "thumbnail": "assets/images/projects/NotTodayGameScreenshot.webp",
        "video": "assets/images/projects/NotTodayGIF.mp4",
        "images": ["assets/images/projects/NotTodayPic1.webp", "assets/images/projects/NotTodayPic2.webp"]
    },
    "amorak": {
        "thumbnail": "assets/images/projects/amorak.webp",
        "video": "assets/images/projects/AmorakGIF.mp4",
        "images": ["assets/images/projects-amorak/amoraktitle.png"]
    },
    "transientica_audiolab": {
        "thumbnail": "assets/images/projects/AudioLabGif.webm", # Using webm as thumb might work if handled, otherwise use video
        "video": "assets/images/projects/AudioLabGif.mp4"
    },
    "pause_and_deserve": {
        "thumbnail": "assets/images/projects/deserve.webp",
        "video": "assets/images/projects-pausedeserve/pausedeservegif.mp4",
        "images": ["assets/images/projects-pausedeserve/redcorridor.png"]
    },
    "interactive_music": {
        "thumbnail": "assets/images/projects/musicforgames.png"
    },
    "akantilado": {
        "thumbnail": "assets/images/projects/AkantiladoGIF.webm",
        "video": "assets/images/projects/AkantiladoGIF.mp4",
        "images": ["assets/images/projects-akantilado/jungleviewfromtopshot.webp"]
    },
    "wwise_unreal_fixer": {
        "thumbnail": "assets/images/projects-wwisefixer/wwisefixerlogo.jpeg"
    },
    "shadow_frames": {
        "thumbnail": "assets/images/projects-shadowframes/shadowframesconceptmenu.png",
        "video": "assets/images/projects-shadowframes/Menugif.mp4"
    },
    "ray_animation": {
        "thumbnail": "assets/images/projects/RayGIF.webm",
        "video": "assets/images/projects/RayGIF.mp4"
    },
    "audioq": {
        "thumbnail": "assets/images/projects-audioq/AudioQPicture.png",
        "video": "assets/images/projects-audioq/AudioQ-Showcase.mp4"
    },
    "pawism": {
        "thumbnail": "assets/images/projects-pawism/AdobeStock_1676516316.webp"
    },
    "unreal_engine_rebuilder": {
        "thumbnail": "assets/images/projects-unrealrebuilder/UnrealRebuilderlogo.jpeg"
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_projects(project_list):
    for p in project_list:
        pid = p['id']
        if pid in media_map:
            p['media'] = media_map[pid]
            print(f"Updated media for {pid}")
        else:
            # Fallback placeholder if needed, or leave empty
            print(f"No media found for {pid}")

update_projects(data.get('featured_projects', []))
update_projects(data.get('additional_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done updating media paths.")
