import json
import os

target_file = 'portfolio-next/public/locales/pl/translation.json'

new_translations = {
    "project_not_today_darling_full_desc": "Samodzielny projektant dźwięku w 6-osobowym zespole. 320+ zdarzeń audio, w całości zbudowane w MetaSounds.\n\nParametry sterują modulacją w czasie rzeczywistym, a system miksowania oparty na priorytetach utrzymuje chaos pod kontrolą. Wydane na itch.io w maju 2025.",
    "project_amorak_full_desc": "Budowanie świata poprzez immersyjny sound design i sygnatury dźwiękowe stworzeń. Horror Atmosferyczny.\n\nKażdy warknięcie bestii, warstwa otoczenia i detal przestrzenny zostały stworzone, by budować immersyjne napięcie, które skaluje się dynamicznie wraz z wizualiami.",
    "project_transientica_audiolab_full_desc": "System detekcji beatboxu w czasie rzeczywistym oparty na ML. Steruj grami rytmicznymi za pomocą głosu.\n\nZoptymalizowane bufory audio i pipeline wnioskowania ML pozwalają zejść poniżej progu 60ms. Odkodowana analiza w Pythonie i rozgrywka w Unity komunikują się przez UDP/OSC bez gubienia klatek."
}

if os.path.exists(target_file):
    with open(target_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data.update(new_translations)
    
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Updated PL translations.")
