import json
import os

base_path = 'portfolio-next/public/locales'

keys = {
    "en": {
        "SYSTEM_ALL": "SYSTEM: ALL",
        "MODULE_AUDIO": "MODULE: AUDIO",
        "MODULE_DEV": "MODULE: DEV",
        "MODULE_PROD": "MODULE: PROD",
        "skills": { "title": "TECHNICAL ARSENAL" }
    },
    "pl": {
        "SYSTEM_ALL": "SYSTEM: WSZYSTKO",
        "MODULE_AUDIO": "MODUŁ: AUDIO",
        "MODULE_DEV": "MODUŁ: DEV",
        "MODULE_PROD": "MODUŁ: PROD",
        "skills": { "title": "ARSENAŁ TECHNICZNY" }
    },
    "nl": {
        "SYSTEM_ALL": "SYSTEEM: ALLE",
        "MODULE_AUDIO": "MODULE: AUDIO",
        "MODULE_DEV": "MODULE: DEV",
        "MODULE_PROD": "MODULE: PROD",
        "skills": { "title": "TECHNISCH ARSENAAL" }
    }
}

for lang, new_data in keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Merge
        data.update(new_data)
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
