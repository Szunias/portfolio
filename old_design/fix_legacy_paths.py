import json

data_file = 'portfolio-next/src/data/portfolioData.json'

updates = {
    "gradwork": { "externalLink": "/projects/gradwork.html" },
    "middleware_optimization": { "externalLink": "/projects/middleware2.html" },
    "richter": { "externalLink": "/projects/richter.html" },
    "sound_design": { "externalLink": "/sound-design.html" }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_list(lst):
    for p in lst:
        if p['id'] in updates:
            p.update(updates[p['id']])
            print(f"Fixed path for {p['id']}")

update_list(data.get('featured_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
