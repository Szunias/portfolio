import json

data_file = 'portfolio-next/src/data/portfolioData.json'
pl_file = 'portfolio-next/public/locales/pl/translation.json'

updates = {
    "ray_animation": {
        "links": {
            "video": "https://www.youtube.com/watch?v=NhH4dNcfxZg"
        },
        "media": {
            "video": "https://www.youtube.com/embed/NhH4dNcfxZg",
            "thumbnail": "assets/images/projects/RayGIF.mp4", # Keep mp4 preview
            "images": [
                 "assets/images/projects-ray/rayaloneinthecave.png",
                 "assets/images/projects-ray/raylightsincave.png",
                 "assets/images/projects-ray/rayinlight.png",
                 "assets/images/projects-ray/raycredits.png"
            ]
        }
    },
    "middleware_optimization": {
        "externalLink": "/projects/middleware2.html", # Changed from musicforgames
        "media": {
            "thumbnail": "assets/images/projects-middleware2/ellen.png" # Better thumb from middleware2
        }
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_list(lst):
    for p in lst:
        pid = p['id']
        if pid in updates:
            # Merge updates
            for k, v in updates[pid].items():
                if isinstance(v, dict) and k in p and isinstance(p[k], dict):
                    p[k].update(v)
                else:
                    p[k] = v
            print(f"Fixed {pid}")

update_list(data.get('featured_projects', []))
update_list(data.get('additional_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
