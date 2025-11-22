import json
import os

target_file = 'portfolio-next/public/locales/pl/translation.json'

new_translations = {
    "project_shadow_frames_title": "Shadow Frames",
    "project_shadow_frames_short_desc": "Psychologiczny horror w irlandzkim pubie lat 60. Dźwięk to główna mechanika.",
    "project_shadow_frames_full_desc": "Psychologiczny horror osadzony w irlandzkim pubie z lat 60. Dźwięk to nie tylko atmosfera — to główna mechanika detekcji.\n\nStworzony we współpracy z RITCS (Narracja) i KASK (Muzyka). Moja rola obejmowała pełny pipeline audio: od nagrywania foley po implementację złożonych systemów Wwise w Unreal Engine C++."
}

if os.path.exists(target_file):
    with open(target_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data.update(new_translations)
    
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Updated PL translations.")
else:
    print("File not found.")

