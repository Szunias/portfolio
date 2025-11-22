import json

data_file = 'portfolio-next/src/data/portfolioData.json'

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_project(list_key, pid, updates):
    for p in data.get(list_key, []):
        if p['id'] == pid:
            if 'media' not in p: p['media'] = {}
            if 'thumbnail' in updates: p['media']['thumbnail'] = updates['thumbnail']
            if 'video' in updates: p['media']['video'] = updates['video']
            if 'images' in updates: p['media']['images'] = updates['images']
            print(f"Fixed {pid}")

# AudioQ is likely in featured_projects now due to previous reorder
update_project('featured_projects', 'audioq', {
    "thumbnail": "assets/images/projects-audioq/AudioQ-Showcase.mp4"
})

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
