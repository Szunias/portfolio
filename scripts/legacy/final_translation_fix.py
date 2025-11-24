import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "404": {
            "title": "SIGNAL LOST",
            "desc": "The requested frequency could not be tuned. The page you are looking for might have been moved, deleted, or does not exist.",
            "button": "Return to Base"
        },
        "player": {
            "time": "TIME"
        },
        "timeline": {
            "ongoing": "ongoing"
        }
    },
    "pl": {
        "404": {
            "title": "SYGNAŁ UTRACONY",
            "desc": "Nie udało się dostroić żądanej częstotliwości. Strona, której szukasz, mogła zostać przeniesiona, usunięta lub nie istnieje.",
            "button": "Powrót do Bazy"
        },
        "player": {
            "time": "CZAS"
        },
        "timeline": {
            "ongoing": "w trakcie"
        }
    },
    "nl": {
        "404": {
            "title": "SIGNAAL VERLOREN",
            "desc": "De gevraagde frequentie kon niet worden afgestemd. De pagina die u zoekt is mogelijk verplaatst, verwijderd of bestaat niet.",
            "button": "Terug naar Basis"
        },
        "player": {
            "time": "TIJD"
        },
        "timeline": {
            "ongoing": "lopend"
        }
    }
}

for lang, content in new_keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Merge top-level keys
        for section, keys in content.items():
            if section not in data:
                data[section] = {}
            data[section].update(keys)
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
