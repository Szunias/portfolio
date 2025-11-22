import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "links": {
            "demo": "Live Demo",
            "video": "Watch Video",
            "repo": "Source Code",
            "docs": "Documentation"
        },
        "music": {
            "subtitle": "Original compositions, game soundtracks, and sonic experiments."
        },
        "card": {
            "no_preview": "No Preview"
        },
        "timeline": {
            "graduated": "graduated"
        }
    },
    "pl": {
        "links": {
            "demo": "Demo Live",
            "video": "Obejrzyj Wideo",
            "repo": "Kod Źródłowy",
            "docs": "Dokumentacja"
        },
        "music": {
            "subtitle": "Oryginalne kompozycje, ścieżki dźwiękowe do gier i eksperymenty soniczne."
        },
        "card": {
            "no_preview": "Brak Podglądu"
        },
        "timeline": {
            "graduated": "ukończone"
        }
    },
    "nl": {
        "links": {
            "demo": "Live Demo",
            "video": "Bekijk Video",
            "repo": "Broncode",
            "docs": "Documentatie"
        },
        "music": {
            "subtitle": "Originele composities, game soundtracks en sonische experimenten."
        },
        "card": {
            "no_preview": "Geen Voorbeeld"
        },
        "timeline": {
            "graduated": "afgestudeerd"
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
