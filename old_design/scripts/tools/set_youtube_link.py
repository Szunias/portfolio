import json

data_file = 'portfolio-next/src/data/portfolioData.json'
youtube_link = "https://www.youtube.com/watch?v=RoB4O4JjPAw"

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find and update Shadow Frames video
found = False
for p in data.get('additional_projects', []):
    if p['id'] == 'shadow_frames':
        p['media']['video'] = youtube_link
        found = True
        print("Updated Shadow Frames video to YouTube link.")
        break

if not found:
    print("Project not found.")

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
