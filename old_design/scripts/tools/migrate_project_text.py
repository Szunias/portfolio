import json
import os

# Paths
data_file = 'portfolio-next/src/data/portfolioData.json'
locales_dir = 'portfolio-next/public/locales'

# Load Data
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

projects = data.get('featured_projects', []) + data.get('additional_projects', [])

# Prepare new keys
new_translations = {}

for p in projects:
    p_id = p['id']
    key_base = f"project_{p_id}"
    
    new_translations[f"{key_base}_title"] = p['title']
    
    # Handle different description keys
    desc = p.get('short_description') or p.get('description') or ""
    new_translations[f"{key_base}_short_desc"] = desc
    
    # Only add full/detailed desc if it exists
    # featured_projects have 'detailed_description'
    full = p.get('detailed_description') or p.get('full_description') or ""
    if full:
        new_translations[f"{key_base}_full_desc"] = full

# Function to update a translation file
def update_locale_file(lang_code):
    path = os.path.join(locales_dir, lang_code, 'translation.json')
    if not os.path.exists(path):
        return

    with open(path, 'r', encoding='utf-8') as f:
        trans_data = json.load(f)
    
    # Merge new keys
    for k, v in new_translations.items():
        if k not in trans_data:
            trans_data[k] = v
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(trans_data, f, indent=2, ensure_ascii=False)
    print(f"Updated {lang_code}")

# Update all languages
for lang in ['en', 'pl', 'nl']:
    update_locale_file(lang)