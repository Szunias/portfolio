import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "errors": {
            "project_not_found": "Project not found"
        },
        "code": {
            "live_server": "LIVE SERVER"
        },
        "nav": {
            "role_label": "Audio Designer"
        }
    },
    "pl": {
        "errors": {
            "project_not_found": "Projekt nie znaleziony"
        },
        "code": {
            "live_server": "SERWER AKTYWNY"
        },
        "nav": {
            "role_label": "Projektant Dźwięku"
        }
    },
    "nl": {
        "errors": {
            "project_not_found": "Project niet gevonden"
        },
        "code": {
            "live_server": "LIVE SERVER"
        },
        "nav": {
            "role_label": "Audio Ontwerper"
        }
    }
}

for lang, content in new_keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Merge
        for section, keys in content.items():
            if section not in data:
                data[section] = {}
            data[section].update(keys)
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
