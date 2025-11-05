const TRANSLATION_PATH = '../locales/not-today-darling.json';

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setLanguage(lang) {
  window.currentLang = lang;
  localStorage.setItem('language', lang);

  const translations = window.translations?.[lang] || {};

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = getNestedTranslation(translations, key);
    if (translation) {
      element.textContent = translation;
    }
  });

  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === lang);
  });
}

async function loadTranslations() {
  try {
    const response = await fetch(TRANSLATION_PATH);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    window.translations = await response.json();
    setLanguage(window.currentLang);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load translations for Not Today, Darling!', error);
  }
}

export function initTranslations() {
  window.translations = window.translations || {};
  window.currentLang = localStorage.getItem('language') || 'pl';

  document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();

    document.querySelectorAll('.lang-btn').forEach((button) => {
      button.addEventListener('click', () => {
        setLanguage(button.dataset.lang);
      });
    });
  });
}
