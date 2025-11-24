import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'
base_path = 'portfolio-next/public/locales'

# Read Matrix Data
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

matrix = data.get('technical_skills_matrix', {})

new_keys = {}

for cat, cat_data in matrix.items():
    for tool, details in cat_data['tools'].items():
        # Create slug (e.g., "Unreal_Engine" -> "unreal_engine")
        slug = tool.replace('_', ' ').replace(' ', '').lower() # Matches code logic roughly
        
        # Correction to match code logic: name.replace(/\s+/g, '').toLowerCase()
        # If name was "C++", slug is "c++"
        name = tool.replace('_', ' ')
        if tool == 'C_Plus_Plus': name = 'C++'
        if tool == 'C_Sharp': name = 'C#'
        
        clean_slug = name.replace(' ', '').lower()
        
        key_desc = f"tech_{clean_slug}_desc"
        key_level = f"level_{details['level'].lower()}"
        
        new_keys[key_desc] = details['description']
        # new_keys[key_level] = details['level'] # Levels like "Advanced" are likely shared

# Translations for levels
levels = {
    "en": { "level_expert": "Expert", "level_advanced": "Advanced", "level_proficient": "Proficient", "level_intermediate": "Intermediate" },
    "pl": { "level_expert": "Ekspert", "level_advanced": "Zaawansowany", "level_proficient": "Biegły", "level_intermediate": "Średniozaawansowany" },
    "nl": { "level_expert": "Expert", "level_advanced": "Gevorderd", "level_proficient": "Bekwaam", "level_intermediate": "Gemiddeld" }
}

# Specific Polish translations for tools (Manual override for quality)
pl_descriptions = {
    "tech_wwise_desc": "RTPC, States/Switches, miksowanie HDR, krzywe tłumienia, projektowanie systemów muzycznych.",
    "tech_fmod_desc": "Implementacja oparta na eventach, parametry, muzyka adaptacyjna, przestrzenna 3D.",
    "tech_metasounds_desc": "Audio proceduralne, parametryczny sound design, systemy modulacji w czasie rzeczywistym.",
    "tech_unrealengine_desc": "Sound Cues, Blueprints, Submixy, Konkurencja, Tłumienie, integracja MetaSounds.",
    "tech_unity_desc": "Audio Mixer, skrypty C# dla audio, integracja middleware (Wwise/FMOD).",
    "tech_reaper_desc": "Sound design, edycja SFX, przetwarzanie wsadowe, własne skrypty, workflow audio do gier.",
    "tech_protools_desc": "Miksowanie, edycja, workflow post-produkcji.",
    "tech_logicpro_desc": "Kompozycja muzyczna, sekwencjonowanie MIDI, aranżacje orkiestrowe.",
    "tech_python_desc": "Analiza audio (LibROSA), modele ML (scikit-learn), narzędzia automatyzacji, OSC.",
    "tech_c#_desc": "Skrypty audio w Unity, własne narzędzia audio, integracja middleware.",
    "tech_blueprints_desc": "Triggery audio, kontrola parametrów, systemy eventów, integracja z gameplayem.",
    "tech_c++_desc": "Framework JUCE do tworzenia wtyczek VST.",
    "tech_maxmsp_desc": "DSP w czasie rzeczywistym, audio generatywne, prototypowanie.",
    "tech_izotoperx_desc": "Restauracja audio, czyszczenie dialogów, edycja spektralna.",
    "tech_fabfilter_desc": "Pro-Q 3, Pro-L 2, Pro-MB – miksowanie, mastering, rzeźbienie częstotliwości."
}

# Function to update file
def update_file(lang, extra_data=None):
    path = os.path.join(base_path, lang, 'translation.json')
    if not os.path.exists(path): return

    with open(path, 'r', encoding='utf-8') as f:
        content = json.load(f)
    
    # Add levels
    content.update(levels[lang])
    
    # Add descriptions (English defaults)
    for k, v in new_keys.items():
        if k not in content:
            content[k] = v
            
    # Apply Manual Polish overrides
    if lang == 'pl' and extra_data:
        content.update(extra_data)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
    print(f"Updated {lang}")

update_file('en')
update_file('pl', pl_descriptions)
update_file('nl')
