import json
import os

target_file = 'portfolio-next/public/locales/pl/translation.json'

# Manual translations map
translations = {
    "project_not_today_darling_short_desc": "Implementacja audio w stylu retro dla chaotycznej gry wyścigowej multiplayer.",
    "project_not_today_darling_full_desc": "3-warstwowa muzyka adaptacyjna w Wwise. Warstwy zmieniają się wraz z liczbą graczy i intensywnością wyścigu. Zachowana spójność muzyczna przy ścisłych limitach głosów.",
    
    "project_amorak_short_desc": "Atmosferyczne pejzaże dźwiękowe i audio bestii do animacji horroru.",
    "project_amorak_full_desc": "Sound design potwora. Ponad 15 wariacji wokalnych, proceduralne kroki, audio środowiskowe reagujące na bliskość bestii. Zbudowane w Reaperze.",
    
    "project_transientica_audiolab_short_desc": "Klasyfikacja beatboxu w czasie rzeczywistym (ML) z opóźnieniem 45ms.",
    "project_transientica_audiolab_full_desc": "Klasyfikator beatboxu w czasie rzeczywistym. 92% dokładności (testowane na 450 próbkach), opóźnienie 45-60ms. Python/scikit-learn, trenowane na ponad 2000 próbek.",
    
    "project_pause_and_deserve_short_desc": "Psychologiczny horror ze strategiczną mechaniką pauzy.",
    "project_pause_and_deserve_full_desc": "Audio horroru, które obserwuje jak pauzujesz. Maszyna stanów audio w Unity. Napięcie rośnie podczas pauzy, muzyka staje się bardziej niepokojąca gdy się wahasz.",
    
    "project_interactive_music_short_desc": "Adaptacyjne systemy audio z warstwowaniem wertykalnym w Wwise.",
    "project_interactive_music_full_desc": "System muzyczny Wwise z warstwowaniem wertykalnym i dynamicznym miksowaniem. Adaptuje się do intensywności rozgrywki i akcji gracza. Mieści się w budżecie pamięci.",
    
    "project_akantilado_short_desc": "Kompletne efekty foley i atmosfera dżungli do animacji 3D.",
    "project_akantilado_full_desc": "Foley i atmosfera do animacji 3D dżungli. 200+ własnych sampli, 5-warstwowa atmosfera przestrzenna, odgłosy stworzeń. Miksowane w 5.1 surround.",
    
    "project_wwise_unreal_fixer_short_desc": "Naprawia integrację Wwise w Unreal Engine. Jedno kliknięcie przywraca brakujące referencje.",
    
    "project_shadow_frames_short_desc": "Gra horror sterowana dźwiękiem. Prototyp gotowy, obecnie w produkcji.",
    
    "project_ray_animation_short_desc": "Muzyka do napisów końcowych w stylu funky. Groovy i jasne brzmienie.",
    
    "project_audioq_short_desc": "Zaawansowana wtyczka EQ z analizą widma. Zbudowana w C++/JUCE.",
    
    "project_pawism_short_desc": "Thriller stworzony w 2 dni. Graj jako ambitny kot.",
    
    "project_unreal_engine_rebuilder_short_desc": "Narzędzie do automatyzacji budowania w Unreal Engine. Skraca czas buildu o połowę."
}

if not os.path.exists(target_file):
    print("File not found!")
    exit()

with open(target_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update keys
updated_count = 0
for k, v in translations.items():
    if k in data:
        data[k] = v
        updated_count += 1
    else:
        # Add if missing
        data[k] = v
        updated_count += 1

with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated {updated_count} translations in {target_file}")
