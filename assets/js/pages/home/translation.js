const LANG_KEY = 'language';
const TRANSLATION_URL = 'locales/index.json';

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function initTranslation() {
  let translations = {};
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  function applyTranslations(lang) {
    const langPack = translations[lang] || {};
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translation = getNestedTranslation(langPack, key);
      if (typeof translation === 'string') {
        if (translation.includes('<br>') || translation.includes('<span')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.documentElement.setAttribute('lang', lang);
  }

  async function loadTranslations() {
    try {
      const response = await fetch(TRANSLATION_URL, {
        cache: 'force-cache',
        priority: 'low'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      translations = await response.json();
      applyTranslations(currentLang);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load homepage translations', error);
    }
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    if (Object.keys(translations).length) {
      applyTranslations(currentLang);
    }
  }

  function getCurrentLanguage() {
    return currentLang;
  }

  function bindLanguageButtons() {
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('.lang-btn');
      if (!btn) return;
      const lang = btn.dataset.lang;
      if (!lang) return;
      setLanguage(lang);
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(() => {
    bindLanguageButtons();
    loadTranslations();
  });

  return { setLanguage, getCurrentLanguage };
}
