const TRANSLATION_PATH = '../locales/ray-animation.json';

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function applyTranslations(translations, lang) {
  const langTranslations = translations[lang] || {};

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = getNestedTranslation(langTranslations, key);
    if (translation) {
      element.textContent = translation;
    }
  });

  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === lang);
  });
}

export function initTranslations() {
  document.addEventListener('DOMContentLoaded', async () => {
    const storedLang = localStorage.getItem('language') || 'en';
    let translations = {};

    try {
      const response = await fetch(TRANSLATION_PATH);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      translations = await response.json();
      applyTranslations(translations, storedLang);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load Ray Animation translations', error);
    }

    document.querySelectorAll('.lang-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const lang = button.dataset.lang;
        localStorage.setItem('language', lang);
        applyTranslations(translations, lang);
      });
    });
  });
}
