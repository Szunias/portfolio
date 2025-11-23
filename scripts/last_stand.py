import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "footer": {
            "rights": "All rights reserved.",
            "built_with": "Built with"
        },
        "projects": {
            "no_results": "No projects found in this category."
        }
    },
    "pl": {
        "footer": {
            "rights": "Wszelkie prawa zastrzeżone.",
            "built_with": "Zbudowane w"
        },
        "projects": {
            "no_results": "Nie znaleziono projektów w tej kategorii."
        }
    },
    "nl": {
        "footer": {
            "rights": "Alle rechten voorbehouden.",
            "built_with": "Gemaakt met"
        },
        "projects": {
            "no_results": "Geen projecten gevonden in deze categorie."
        }
    }
}

for lang, content in new_keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Merge footer
        if 'footer' not in data: data['footer'] = {}
        data['footer'].update(content['footer'])

        # Merge projects
        if 'projects' not in data: data['projects'] = {}
        data['projects'].update(content['projects'])
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
