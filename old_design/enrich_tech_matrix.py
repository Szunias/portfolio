import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'
locales_path = 'portfolio-next/public/locales'

# 1. Load Translations
translations = {}
for lang in ['en', 'pl', 'nl']:
    path = os.path.join(locales_path, lang, 'about.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            translations[lang] = json.load(f)

# Helper to get translation
def t(key, lang='en'):
    return translations.get(lang, {}).get(key, "")

# 2. Define Skill Data (Manually ported from skill-modal-system.js)
skill_data = {
    "Wwise": {
        "cat": "middleware",
        "projects": [
            ("Shadow Frames", "modal_shadow_frames"),
            ("Pause & Deserve", "modal_pause_deserve"),
            ("Music for Games", "modal_music_games"),
            ("Middleware Optimization", "modal_middleware_opt")
        ]
    },
    "FMOD": {
        "cat": "middleware",
        "projects": [("Previous Experience", "modal_fmod_exp")]
    },
    "Unreal Engine": { # Mapped from 'unreal'
        "cat": "game_engines",
        "projects": [
            ("Shadow Frames", "modal_shadow_frames"),
            ("Not Today Darling", "modal_not_today"),
            ("Pause & Deserve", "modal_pause_deserve")
        ]
    },
    "Unity": {
        "cat": "game_engines",
        "projects": [("AudioLab", "modal_unity_audiolab")]
    },
    "Reaper": {
        "cat": "daw",
        "projects": [
            ("Not Today Darling", "modal_reaper_ntd"),
            ("Ray Animation", "modal_reaper_ray"),
            ("All Projects", "modal_reaper_all")
        ]
    },
    "Ableton": { # Mapped from 'ableton'
        "cat": "daw",
        "projects": [
            ("Music for Games", "modal_ableton_music"),
            ("Sound Design", "modal_ableton_sound")
        ]
    },
    "Logic Pro": {
        "cat": "daw",
        "projects": [("Amorak", "modal_logic_amorak")]
    },
    "Studio One": {
        "cat": "daw",
        "projects": [
            ("Ray Animation", "modal_studio_ray"),
            ("Amorak", "modal_studio_amorak"),
            ("Akantilado", "modal_studio_akantilado")
        ]
    },
    "Cubase": {
        "cat": "daw",
        "projects": [("Music Composition", "modal_cubase_music")]
    },
    "C++": { # Mapped from cpp
        "cat": "programming",
        "projects": [
            ("Shadow Frames", "modal_cpp_shadow"),
            ("Not Today Darling", "modal_cpp_ntd"),
            ("Custom Audio Plugins", "modal_cpp_plugins")
        ]
    },
    "C#": {
        "cat": "programming",
        "projects": [
            ("AudioLab", "modal_csharp_audiolab"),
            ("Unity Tools", "modal_csharp_tools")
        ]
    },
    "Python": {
        "cat": "programming",
        "projects": [
            ("AudioLab", "modal_python_audiolab"),
            ("AudioQ", "modal_python_audioq"),
            ("Wwise Unreal Fixer", "modal_wwise_fixer"),
            ("Unreal Engine Rebuilder", "modal_ue_rebuilder")
        ]
    },
    "Blueprints": {
        "cat": "programming",
        "projects": [
            ("Shadow Frames", "modal_blueprints_shadow"),
            ("Pause & Deserve", "modal_blueprints_pause")
        ]
    },
    "Perforce": {
        "cat": "tools",
        "projects": [("Large-Scale Projects", "modal_perforce_projects")]
    },
    "GitHub": { # Mapped from git
        "cat": "tools",
        "projects": [("All Projects", "modal_git_all")]
    },
    "JUCE": {
        "cat": "programming",
        "projects": [("Audio Plugin Development", "modal_juce_plugins")]
    },
    "3D Audio": { # Mapped from spatial
        "cat": "middleware",
        "projects": [("Shadow Frames", "modal_spatial_shadow")]
    },
    "Pure Data": {
        "cat": "programming",
        "projects": [("Audio Synthesis", "modal_puredata_synthesis")]
    }
}

# 3. Load existing data
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ensure matrix structure exists
if "technical_skills_matrix" not in data:
    data["technical_skills_matrix"] = {}

# 4. Enrich Data
for tool_name, info in skill_data.items():
    # Find where to put it (we might need to create category if missing, or find matching one)
    # In About.tsx we iterate all categories, so structure matters less than key matching
    
    # Let's update 'core_skills' or specific categories if they exist, else 'general'
    
    # Construct Description
    # We need multilingual descriptions for the matrix? The matrix structure in portfolioData usually has string values or objects.
    # Let's assume we update the EN description for now, or create a multilingual structure if About.tsx supports it.
    # About.tsx uses `getTechDescription` which returns a string. It doesn't seem to support switching lang dynamically for the *data* unless the data itself is localized or we use keys.
    # But About.tsx `getTechDescription` just returns `value.description`.
    
    # Wait, if I hardcode English descriptions here, they won't translate.
    # The previous system used keys.
    # I should probably store the KEYS in the matrix, and update About.tsx to translate them.
    
    # But the user wants "rich info".
    # Let's Generate a rich string for each language and store it in a new "descriptions" object in the matrix tool.
    
    rich_desc = {}
    for lang in ['en', 'pl', 'nl']:
        lines = []
        for proj_name, proj_key in info['projects']:
            desc = t(proj_key, lang)
            if desc:
                lines.append(f"• {proj_name}: {desc}")
        rich_desc[lang] = "\n".join(lines)

    # Update Matrix
    # We need to find the tool in the matrix. It's nested: category -> tools -> ToolName
    found = False
    for cat_key, cat_val in data["technical_skills_matrix"].items():
        if "tools" in cat_val:
            # Check exact or fuzzy
            for k in list(cat_val["tools"].keys()):
                if k.lower() == tool_name.lower() or tool_name.lower() in k.lower():
                    # Update
                    if isinstance(cat_val["tools"][k], str):
                         cat_val["tools"][k] = { "desc": cat_val["tools"][k] }
                    
                    # Add rich descriptions
                    cat_val["tools"][k]["rich_descriptions"] = rich_desc
                    # Default description (EN)
                    cat_val["tools"][k]["description"] = rich_desc['en']
                    found = True
                    print(f"Updated {tool_name} in {cat_key}")
                    break
    
    if not found:
        # Add to a 'general' category if not found (so it appears)
        if "general" not in data["technical_skills_matrix"]:
             data["technical_skills_matrix"]["general"] = { "title": "General", "tools": {} }
        
        data["technical_skills_matrix"]["general"]["tools"][tool_name] = {
            "description": rich_desc['en'],
            "rich_descriptions": rich_desc
        }
        print(f"Added {tool_name} to general")

# Save
with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
