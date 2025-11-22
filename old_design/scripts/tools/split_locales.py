import json
import os

# Paths
source_file = 'portfolio-next/public/locales/shared.json'
output_base = 'portfolio-next/public/locales'

# Read source
with open(source_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Languages found in the file
langs = data.keys() # "en", "pl", "nl"

for lang in langs:
    # Create dir e.g. locales/en
    lang_dir = os.path.join(output_base, lang)
    os.makedirs(lang_dir, exist_ok=True)
    
    # Content for this language
    content = data[lang]
    
    # Write to translation.json (default namespace)
    out_path = os.path.join(lang_dir, 'translation.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
        
    print(f"Created {out_path}")
