import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "details": {
            "gallery": "Gallery",
            "links": "Project Links",
            "tech": "Technical Implementation",
            "technologies": "Technologies",
            "tags": "Tags",
            "about": "About the Project"
        }
    },
    "pl": {
        "details": {
            "gallery": "Galeria",
            "links": "Linki Projektu",
            "tech": "Implementacja Techniczna",
            "technologies": "Technologie",
            "tags": "Tagi",
            "about": "O Projekcie"
        }
    },
    "nl": {
        "details": {
            "gallery": "Galerij",
            "links": "Project Links",
            "tech": "Technische Implementatie",
            "technologies": "Technologieën",
            "tags": "Tags",
            "about": "Over het Project"
        }
    }
}

for lang, content in new_keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Merge 'details' object
        if 'details' not in data:
            data['details'] = {}
        data['details'].update(content['details'])
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
