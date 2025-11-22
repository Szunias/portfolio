import json

data_file = 'portfolio-next/src/data/portfolioData.json'

richter = {
    "id": "richter",
    "title": "Richter",
    "category": "Film Score",
    "short_description": "Suspense sequence with layered strings and action percussion.",
    "media": { "thumbnail": "assets/images/covers/richter.webp" },
    "technologies": ["Orchestral", "Cubase"],
    "externalLink": "/richter.html",
    "featured": True
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Insert richter before wwise_unreal_fixer
new_list = []
for p in data['featured_projects']:
    if p['id'] == 'wwise_unreal_fixer':
        new_list.append(richter)
    new_list.append(p)

data['featured_projects'] = new_list

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
