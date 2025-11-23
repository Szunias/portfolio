import json

data_file = 'portfolio-next/src/data/portfolioData.json'

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_project(list_key, pid, updates):
    for p in data.get(list_key, []):
        if p['id'] == pid:
            # Update fields
            if 'media' not in p: p['media'] = {}
            
            if 'thumbnail' in updates:
                p['media']['thumbnail'] = updates['thumbnail']
            
            if 'video' in updates:
                p['media']['video'] = updates['video']
                
            if 'images' in updates:
                # Append or replace images
                p['media']['images'] = updates['images']
                
            print(f"Fixed {pid}")

# 1. Fix AudioLab (Transientica)
# Thumbnail: webm
# Video: Main MP4
# Images: Second MP4 + maybe a pic
update_project('featured_projects', 'transientica_audiolab', {
    "thumbnail": "assets/videos/AudioLab_preview.webm",
    "video": "assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4",
    "images": [
        "assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4"
    ]
})

# 2. Fix AudioQ
# Thumbnail: mp4 (showcase)
update_project('additional_projects', 'audioq', {
    "thumbnail": "assets/images/projects-audioq/AudioQ-Showcase.mp4"
})

# 3. Fix Pause & Deserve (Ensure YouTube link is set, user mentioned it again)
update_project('featured_projects', 'pause_and_deserve', {
    "video": "https://www.youtube.com/embed/bBuhTHrN81k",
    "thumbnail": "assets/images/projects-pausedeserve/pausedeservegif.mp4" # This is likely better than static image if available, or webm
})

# Check if pause_and_deserve has webm
# Using mp4 is safe because ProjectCard handles it.

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
