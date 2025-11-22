import json

data_file = 'portfolio-next/src/data/portfolioData.json'

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_project(list_key, pid, updates):
    for p in data.get(list_key, []):
        if p['id'] == pid:
            p.update(updates)
            print(f"Fixed {pid}")

update_project('featured_projects', 'middleware_optimization', {
    "externalLink": "/projects/middleware-optimization.html"
})

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
