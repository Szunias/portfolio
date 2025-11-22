import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "tooltips": {
            "live_demo": "Live Demo",
            "github_repo": "GitHub Repo",
            "copy_email": "Copy Email",
            "screenshot": "screenshot"
        },
        "player": {
            "cover_alt": "Album Cover"
        }
    },
    "pl": {
        "tooltips": {
            "live_demo": "Demo Live",
            "github_repo": "Repozytorium GitHub",
            "copy_email": "Skopiuj Email",
            "screenshot": "zrzut ekranu"
        },
        "player": {
            "cover_alt": "Okładka Albumu"
        }
    },
    "nl": {
        "tooltips": {
            "live_demo": "Live Demo",
            "github_repo": "GitHub Repo",
            "copy_email": "Kopieer E-mail",
            "screenshot": "screenshot"
        },
        "player": {
            "cover_alt": "Albumhoes"
        }
    }
}

for lang, content in new_keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for section, keys in content.items():
            if section not in data:
                data[section] = {}
            data[section].update(keys)
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
