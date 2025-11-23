import json
import os

base_path = 'portfolio-next/public/locales'

new_keys = {
    "en": {
        "contact_form_title": "Send a Message",
        "contact_form_name": "Your Name",
        "contact_form_email": "Email Address",
        "contact_form_subject": "Subject",
        "contact_form_message": "Your Message",
        "contact_form_submit": "Send Message"
    },
    "pl": {
        "contact_form_title": "Wyślij Wiadomość",
        "contact_form_name": "Twoje Imię",
        "contact_form_email": "Adres Email",
        "contact_form_subject": "Temat",
        "contact_form_message": "Twoja Wiadomość",
        "contact_form_submit": "Wyślij Wiadomość"
    },
    "nl": {
        "contact_form_title": "Stuur een bericht",
        "contact_form_name": "Uw naam",
        "contact_form_email": "E-mailadres",
        "contact_form_subject": "Onderwerp",
        "contact_form_message": "Uw bericht",
        "contact_form_submit": "Bericht versturen"
    }
}

for lang, keys in new_keys.items():
    path = os.path.join(base_path, lang, 'translation.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data.update(keys)
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {lang}")
