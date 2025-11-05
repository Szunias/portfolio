#!/usr/bin/env python3
"""
Translation Validation Script
Validates consistency across en/pl/nl translations in all locale files
"""

import json
import os
from pathlib import Path
from collections import defaultdict

def load_json(filepath):
    """Load JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_keys(obj, prefix=''):
    """Recursively get all keys from nested dict"""
    keys = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.extend(get_all_keys(v, new_prefix))
            else:
                keys.append(new_prefix)
    return keys

def validate_file(filepath):
    """Validate a single locale file"""
    issues = []
    filename = os.path.basename(filepath)
    
    try:
        data = load_json(filepath)
        
        # Check if all three languages exist
        languages = ['en', 'pl', 'nl']
        missing_langs = [lang for lang in languages if lang not in data]
        if missing_langs:
            issues.append(f"❌ {filename}: Missing languages: {', '.join(missing_langs)}")
            return issues
        
        # Get keys for each language
        en_keys = set(get_all_keys(data['en']))
        pl_keys = set(get_all_keys(data['pl']))
        nl_keys = set(get_all_keys(data['nl']))
        
        # Check for missing keys
        missing_in_pl = en_keys - pl_keys
        missing_in_nl = en_keys - nl_keys
        extra_in_pl = pl_keys - en_keys
        extra_in_nl = nl_keys - en_keys
        
        if missing_in_pl:
            issues.append(f"⚠️  {filename}: Polish missing keys: {', '.join(sorted(missing_in_pl)[:5])}")
        if missing_in_nl:
            issues.append(f"⚠️  {filename}: Dutch missing keys: {', '.join(sorted(missing_in_nl)[:5])}")
        if extra_in_pl:
            issues.append(f"⚠️  {filename}: Polish extra keys: {', '.join(sorted(extra_in_pl)[:5])}")
        if extra_in_nl:
            issues.append(f"⚠️  {filename}: Dutch extra keys: {', '.join(sorted(extra_in_nl)[:5])}")
        
        if not issues:
            issues.append(f"✅ {filename}: All keys match across languages")
            
    except json.JSONDecodeError as e:
        issues.append(f"❌ {filename}: JSON parse error: {e}")
    except Exception as e:
        issues.append(f"❌ {filename}: Error: {e}")
    
    return issues

def main():
    """Main validation function"""
    locales_dir = Path('locales')
    
    if not locales_dir.exists():
        print("❌ locales directory not found")
        return
    
    print("🔍 Validating translation files...\n")
    
    all_issues = []
    json_files = sorted(locales_dir.glob('*.json'))
    
    for filepath in json_files:
        issues = validate_file(filepath)
        all_issues.extend(issues)
        for issue in issues:
            print(issue)
    
    print(f"\n📊 Summary:")
    print(f"   Files checked: {len(json_files)}")
    error_count = sum(1 for i in all_issues if i.startswith('❌'))
    warning_count = sum(1 for i in all_issues if i.startswith('⚠️'))
    success_count = sum(1 for i in all_issues if i.startswith('✅'))
    
    print(f"   ✅ Valid: {success_count}")
    print(f"   ⚠️  Warnings: {warning_count}")
    print(f"   ❌ Errors: {error_count}")
    
    if error_count == 0 and warning_count == 0:
        print("\n✨ All translations are consistent!")
    else:
        print("\n⚠️  Some issues found - review above")

if __name__ == '__main__':
    main()
