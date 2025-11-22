import json

file_path = 'portfolio-next/public/locales/shared.json'

# New keys to add
new_keys = {
    "en": {
        "footer": {
            "connect": "Connect",
            "location": "Location"
        },
        "hero": {
            "download_cv": "Download CV"
        },
        "skills": {
            "title": "Technical Skills"
        }
    },
    "pl": {
        "footer": {
            "connect": "Połącz",
            "location": "Lokalizacja"
        },
        "hero": {
            "download_cv": "Pobierz CV"
        },
        "skills": {
            "title": "Umiejętności Techniczne"
        }
    },
    "nl": {
        "footer": {
            "connect": "Verbinden",
            "location": "Locatie"
        },
        "hero": {
            "download_cv": "Download CV"
        },
        "skills": {
            "title": "Technische Vaardigheden"
        }
    }
}

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Deep merge function
def deep_merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        else:
            # Only set if not exists (optional, but safer) or force update
            destination[key] = value
    return destination

# Update data
deep_merge(new_keys, data)

# Save back
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated shared.json with new keys.")
