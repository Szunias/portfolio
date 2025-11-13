/**
 * Unified Translation Utility
 * Consolidates all translation logic into a single reusable module
 *
 * Features:
 * - Automatic translation file detection based on page
 * - Safe localStorage with error handling
 * - Event-driven architecture for language changes
 * - Support for nested translation keys (e.g., "hero.title")
 * - HTML content support for specific elements
 * - Aria-label and placeholder translations
 * - Memory fallback when localStorage unavailable
 *
 * @author Igor Szuniewicz
 * @version 3.0
 */

import storage from './storage.js';
import { IS_DEV } from '../config/constants.js';

class TranslationManager {
  constructor() {
    this.translations = {};
    this.currentLang = storage.get('language', 'en');
    this.isInitialized = false;
    this.translationPath = null;
    this.loadingPromise = null; // Cache loading promise to prevent race conditions
  }

  /**
   * Get nested translation value using dot notation
   * @param {Object} obj - Translation object
   * @param {string} path - Dot-separated path (e.g., "hero.title")
   * @returns {*} Translation value
   */
  getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Detect which translation file to load based on current page
   * @returns {string} Translation file path
   */
  detectTranslationFile() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    // Project-specific translations
    const projectMap = {
      'amorak.html': '../locales/amorak.json',
      'akantilado.html': '../locales/akantilado.json',
      'ray-animation.html': '../locales/ray-animation.json',
      'pawism.html': '../locales/pawism.json',
      'not-today-darling.html': '../locales/not-today-darling.json',
      'environments.html': '../locales/environments.json',
      'audiolab.html': '../locales/audiolab.json',
      'pause-and-deserve.html': '../locales/pause-and-deserve.json',
      'shadow-frames.html': '../locales/shadow-frames.json',
      'middleware-optimization.html': '../locales/middleware-optimization.json',
    };

    if (projectMap[filename]) {
      return projectMap[filename];
    }

    // Main page translations
    const pageMap = {
      'index.html': 'locales/index.json',
      'about.html': 'locales/about.json',
      'contact.html': 'locales/contact.json',
      'music.html': 'locales/music.json',
      '': 'locales/index.json',
      '/': 'locales/index.json',
    };

    // Projects index
    if (path.includes('projects/')) {
      if (filename === 'index.html' || filename === '') {
        return '../locales/projects.json';
      }
    }

    return pageMap[filename] || 'locales/shared.json';
  }

  /**
   * Apply translations to all elements with data-i18n attributes
   * @param {string} lang - Language code
   */
  applyTranslations(lang = this.currentLang) {
    const langPack = this.translations[lang] || {};

    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translation = this.getNestedTranslation(langPack, key);

      if (translation) {
        // SECURITY: Only allow <br> tags from trusted translation files
        // All other HTML is escaped to prevent XSS
        if (typeof translation === 'string') {
          if (
            (key.includes('.title') || translation.includes('<br>')) &&
            this.isAllowedHtml(translation)
          ) {
            // Only allow safe HTML tags from trusted translations
            el.innerHTML = this.sanitizeTranslationHtml(translation);
          } else {
            el.textContent = translation;
          }
        }
      }
    });

    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const translation = this.getNestedTranslation(langPack, key);

      if (translation) {
        el.setAttribute('aria-label', translation);
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.getNestedTranslation(langPack, key);

      if (translation) {
        el.setAttribute('placeholder', translation);
      }
    });

    // Update language button states
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);

    // Handle tech tags (project pages)
    document.querySelectorAll('[data-tech]').forEach((container) => {
      const key = container.getAttribute('data-tech');
      const techArray = this.getNestedTranslation(langPack, key);

      if (Array.isArray(techArray) && techArray.length > 0) {
        // Build DOM safely without innerHTML
        container.innerHTML = ''; // Clear first
        techArray.forEach((tech) => {
          const span = document.createElement('span');
          span.className = 'project-tech-item';
          span.textContent = tech;
          container.appendChild(span);
        });
        container.style.display = 'flex';
      } else {
        container.style.display = 'none';
      }
    });
  }

  /**
   * Check if HTML content contains only allowed tags
   * @param {string} html
   * @returns {boolean}
   */
  isAllowedHtml(html) {
    // Allow <br>, <span>, and common safe tags from trusted translation files
    // This is safe because translations come from our controlled JSON files
    const allowedTags = ['br', 'span', 'strong', 'em', 'i', 'b'];
    const tagPattern = /<\/?(\w+)[^>]*>/g;
    const matches = html.match(tagPattern);

    if (!matches) return true; // No HTML tags

    // Check if all tags are allowed
    return matches.every((tag) => {
      const tagName = tag.match(/<\/?(\w+)/)?.[1]?.toLowerCase();
      return allowedTags.includes(tagName);
    });
  }

  /**
   * Sanitize translation HTML - only allow safe tags
   * @param {string} html
   * @returns {string}
   */
  sanitizeTranslationHtml(html) {
    // Allow only safe tags: br, span, strong, em, i, b
    // Remove any dangerous attributes (onclick, onerror, etc.)
    const allowedTags = ['br', 'span', 'strong', 'em', 'i', 'b'];

    // Parse and reconstruct only safe tags
    const div = document.createElement('div');
    div.innerHTML = html;

    // Remove dangerous attributes
    const allElements = div.querySelectorAll('*');
    allElements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();

      // Remove if not allowed tag
      if (!allowedTags.includes(tagName)) {
        el.replaceWith(el.textContent);
        return;
      }

      // Remove all attributes except 'class' for span
      Array.from(el.attributes).forEach((attr) => {
        if (!(tagName === 'span' && attr.name === 'class')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return div.innerHTML;
  }

  /**
   * Set language and apply translations
   * @param {string} lang - Language code (en, pl, nl)
   */
  setLanguage(lang) {
    this.currentLang = lang;
    storage.set('language', lang);

    if (Object.keys(this.translations).length > 0) {
      this.applyTranslations(lang);
    }

    // Update modal content if it exists and is open
    if (
      window.TrackInfoModal &&
      typeof window.TrackInfoModal.updateLanguage === 'function'
    ) {
      window.TrackInfoModal.updateLanguage();
    }

    // Refresh music list if present
    if (typeof window.refreshMusicList === 'function') {
      window.refreshMusicList();
    }

    // Mark translations as ready
    requestAnimationFrame(() => {
      document.documentElement.classList.add('translations-ready');

      // Remove preload style after transition
      if (!document.documentElement.classList.contains('smooth-nav-ready')) {
        setTimeout(() => {
          const preloadStyle = document.getElementById('preload-style');
          if (preloadStyle) preloadStyle.remove();
        }, 150);
      }
    });

    // Emit language changed event
    window.dispatchEvent(
      new CustomEvent('languageChanged', { detail: { language: lang } }),
    );
  }

  /**
   * Load translations from JSON file
   * Prevents race conditions by caching the loading promise
   * @param {string} [customPath] - Optional custom translation file path
   * @returns {Promise<void>}
   */
  async loadTranslations(customPath = null) {
    const requestedPath = customPath || this.detectTranslationFile();

    // RACE CONDITION FIX: Return cached promise if already loading same file
    if (this.loadingPromise && this.translationPath === requestedPath) {
      if (IS_DEV) {
        console.log('⚡ Reusing cached translation load promise');
      }
      return this.loadingPromise;
    }

    // Create new loading promise and cache it
    this.loadingPromise = this._doLoadTranslations(requestedPath);
    return this.loadingPromise;
  }

  /**
   * Internal method that actually loads translations
   * @private
   */
  async _doLoadTranslations(requestedPath) {
    try {
      this.translationPath = requestedPath;

      // Try multiple base paths
      let response = null;
      const basePaths = window.location.pathname.includes('projects/')
        ? ['../', './', '../../']
        : ['./', '../', '../../'];

      for (const basePath of basePaths) {
        try {
          const fullPath = this.translationPath.startsWith('locales/')
            ? this.translationPath
            : basePath + this.translationPath;

          response = await fetch(fullPath, {
            cache: 'force-cache',
            priority: 'low',
          });

          if (response.ok) break;
        } catch (_e) {
          continue;
        }
      }

      if (!response?.ok) {
        throw new Error(
          `Failed to load translations from ${this.translationPath}`,
        );
      }

      const translationData = await response.json();

      // Validate translation data structure
      if (!translationData || typeof translationData !== 'object') {
        throw new Error('Invalid translation data format');
      }

      this.translations = translationData;
      this.isInitialized = true;
      this.applyTranslations(this.currentLang);

      // Clear the loading promise cache on success
      this.loadingPromise = null;
    } catch (error) {
      if (IS_DEV) {
        console.error('Failed to load translations:', error);
      }

      // Fallback: create minimal translation structure
      this.translations = {
        en: { error: 'Translation loading failed' },
        pl: { error: 'Błąd ładowania tłumaczeń' },
        nl: { error: 'Vertaling laden mislukt' },
      };

      // Still mark as initialized to prevent infinite loading attempts
      this.isInitialized = true;

      // Try to apply fallback translations
      try {
        this.applyTranslations(this.currentLang);
      } catch (fallbackError) {
        if (IS_DEV) {
          console.error(
            'Fallback translation application failed:',
            fallbackError,
          );
        }
      }

      // Clear the loading promise cache even on error
      this.loadingPromise = null;
    }
  }

  /**
   * Bind language button click handlers
   * Uses event delegation for dynamic buttons
   */
  bindLanguageButtons() {
    document.addEventListener('click', (event) => {
      const langBtn = event.target.closest('.lang-btn');
      if (langBtn && langBtn.dataset.lang) {
        this.setLanguage(langBtn.dataset.lang);
      }
    });
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Get translation by key for current language
   * @param {string} key - Translation key (supports dot notation)
   * @param {*} fallback - Fallback value if translation not found
   * @returns {*} Translation value
   */
  translate(key, fallback = '') {
    return (
      this.getNestedTranslation(this.translations[this.currentLang], key) ||
      fallback
    );
  }

  /**
   * Initialize translation system
   * @param {string} [customPath] - Optional custom translation file path
   * @returns {Promise<void>}
   */
  async init(customPath = null) {
    if (this.isInitialized) {
      if (IS_DEV) {
        console.warn('Translation manager already initialized');
      }
      return;
    }

    this.bindLanguageButtons();
    await this.loadTranslations(customPath);
  }
}

// Create singleton instance
const translationManager = new TranslationManager();

/**
 * Initialize translations for the current page
 * @param {string} [customPath] - Optional custom translation file path
 * @returns {Promise<TranslationManager>}
 */
export async function initTranslations(customPath = null) {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  return new Promise((resolve) => {
    ready(async () => {
      await translationManager.init(customPath);
      resolve(translationManager);
    });
  });
}

/**
 * Set language (exposed for global use)
 * @param {string} lang - Language code
 */
export function setLanguage(lang) {
  translationManager.setLanguage(lang);
}

/**
 * Apply translations (exposed for smooth navigation and dynamic content)
 */
export function applyTranslations() {
  translationManager.applyTranslations();
}

/**
 * Get current language
 * @returns {string}
 */
export function getCurrentLanguage() {
  return translationManager.getCurrentLanguage();
}

/**
 * Get translation by key
 * @param {string} key - Translation key
 * @param {*} fallback - Fallback value
 * @returns {*}
 */
export function translate(key, fallback = '') {
  return translationManager.translate(key, fallback);
}

// Expose functions globally for non-module pages and smooth navigation
if (typeof window !== 'undefined') {
  window.setLanguage = setLanguage;
  window.applyTranslations = applyTranslations;
  window.getCurrentLanguage = getCurrentLanguage;
  window.translate = translate;
}

// Export singleton instance
export { translationManager };
export default translationManager;
