#!/usr/bin/env python3
"""
Automated HTML Migration Script: Old i18n → BulletproofI18n
Migrates all HTML files to use the new bulletproof translation system
"""

import os
import re
import glob

# Inline critical translations snippet
INLINE_CRITICAL = '''        <!-- CRITICAL 1.5: Inline Critical Translations - Bulletproof i18n (0ms load) -->
        <script>
            /**
             * Critical translations inline for instant loading
             * Ensures navigation/footer work immediately, even if JSON fails
             * Size: ~2KB | Load time: 0ms (already in HTML)
             */
            window.__I18N__ = {
                "en": {
                    "nav": {"home": "Home", "work": "Work", "about": "About", "projects": "Projects", "music": "Music", "contact": "Contact"},
                    "footer": {"projects": "Projects", "music": "Music", "about": "About", "contact": "Contact"},
                    "error": {"loading": "Loading...", "failed": "Failed to load content", "retry": "Retry"}
                },
                "pl": {
                    "nav": {"home": "Start", "work": "Portfolio", "about": "O mnie", "projects": "Projekty", "music": "Muzyka", "contact": "Kontakt"},
                    "footer": {"projects": "Projekty", "music": "Muzyka", "about": "O mnie", "contact": "Kontakt"},
                    "error": {"loading": "Ładowanie...", "failed": "Nie udało się załadować treści", "retry": "Spróbuj ponownie"}
                },
                "nl": {
                    "nav": {"home": "Home", "work": "Portfolio", "about": "Over", "projects": "Projecten", "music": "Muziek", "contact": "Contact"},
                    "footer": {"projects": "Projecten", "music": "Muziek", "about": "Over", "contact": "Contact"},
                    "error": {"loading": "Laden...", "failed": "Inhoud kan niet worden geladen", "retry": "Opnieuw proberen"}
                }
            };
        </script>
'''

# BulletproofI18n init script
BULLETPROOF_INIT = '''        <!-- Bulletproof i18n System - 5-layer fallback, never crashes -->
        <script type="module">
            import i18n from '/assets/js/refactored/services/BulletproofI18n.js';
            i18n.init().catch(error => {
                console.error('i18n initialization failed:', error);
                // Page still works with inline critical translations!
            });
        </script>'''

def migrate_html_file(filepath):
    """Migrate a single HTML file to BulletproofI18n"""
    print(f"Migrating: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already migrated
    if 'BulletproofI18n' in content or 'window.__I18N__' in content:
        print(f"  ✓ Already migrated, skipping")
        return False

    # Check if has old translations.js
    if 'translations.js' not in content:
        print(f"  ✓ No translations.js, skipping")
        return False

    original_content = content

    # Step 1: Add inline critical translations after language preload script
    # Find the language preload script and add inline critical after it
    preload_pattern = r'(window\.__preloadedLang\s*=\s*savedLang;[\s\S]*?}\)\(\);[\s\n]*</script>)'

    if re.search(preload_pattern, content):
        content = re.sub(
            preload_pattern,
            r'\1\n' + INLINE_CRITICAL,
            content,
            count=1
        )
        print("  ✓ Added inline critical translations")
    else:
        print("  ⚠ Could not find preload script pattern")

    # Step 2: Remove preload link to translations.js
    content = re.sub(
        r'\s*<link\s+rel="preload"\s+href="[^"]*translations\.js"[^>]*>\s*\n?',
        '',
        content
    )
    print("  ✓ Removed preload link")

    # Step 3: Replace translations.js script with BulletproofI18n
    content = re.sub(
        r'<script\s+type="module"\s+src="[^"]*translations\.js"[^>]*>\s*</script>',
        BULLETPROOF_INIT,
        content
    )
    print("  ✓ Replaced translations.js with BulletproofI18n")

    # Only write if content changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Migration complete!")
        return True
    else:
        print(f"  ⚠ No changes made")
        return False

def main():
    """Main migration script"""
    print("=" * 70)
    print("HTML Migration Script: Old i18n → BulletproofI18n")
    print("=" * 70)
    print()

    # Find all HTML files
    html_files = []

    # Root HTML files
    html_files.extend(glob.glob('*.html'))

    # Project HTML files
    html_files.extend(glob.glob('projects/*.html'))

    # Exclude index.html (already migrated)
    html_files = [f for f in html_files if not f.endswith('index.html') or 'projects' in f]

    print(f"Found {len(html_files)} HTML files to migrate")
    print()

    migrated = 0
    skipped = 0

    for filepath in sorted(html_files):
        if migrate_html_file(filepath):
            migrated += 1
        else:
            skipped += 1
        print()

    print("=" * 70)
    print(f"Migration complete!")
    print(f"  ✅ Migrated: {migrated} files")
    print(f"  ⏭  Skipped: {skipped} files")
    print("=" * 70)

if __name__ == '__main__':
    main()
