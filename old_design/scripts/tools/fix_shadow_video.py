import json

data_file = 'portfolio-next/src/data/portfolioData.json'

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find and update Shadow Frames video
for p in data.get('additional_projects', []):
    if p['id'] == 'shadow_frames':
        p['media']['video'] = 'assets/images/projects-shadowframes/videodemoprod3withwwiseprofiler.mp4'
        print("Updated video path.")
        break

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
