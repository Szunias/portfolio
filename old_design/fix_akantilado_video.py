import json

data_file = 'portfolio-next/src/data/portfolioData.json'

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find and update Akantilado
for p in data.get('featured_projects', []) + data.get('additional_projects', []):
    if p['id'] == 'akantilado':
        p['links']['video'] = 'https://www.youtube.com/watch?v=ALQy5r7B1Bw'
        p['media']['video'] = 'https://www.youtube.com/embed/ALQy5r7B1Bw'
        print("Updated Akantilado video to YouTube link.")
        break

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
