/**
 * Translation Service
 * Handles internationalization (i18n) for the application
 *
 * @module services/TranslationService
 * @example
 * import { translationService } from './services/TranslationService.js';
 *
 * await translationService.loadLanguage('en');
 * const translated = translationService.translate('nav.home');
 */

import { EventEmitter } from '../core/EventEmitter.js';
import { Storage } from '../utils/storage.js';

/**
 * Translation paths for different languages
 * @const {Object}
 */
const TRANSLATION_PATHS = {
  en: '/locales/en/translations.json',
  pl: '/locales/pl/translations.json',
  nl: '/locales/nl/translations.json'
};

/**
 * Storage key for saved language preference
 * @const {string}
 */
const STORAGE_KEY_LANGUAGE = 'language';

/**
 * Default language fallback
 * @const {string}
 */
const DEFAULT_LANGUAGE = 'en';

/**
 * Supported languages
 * @const {Array<string>}
 */
const SUPPORTED_LANGUAGES = ['en', 'pl', 'nl'];

/**
 * TranslationService Class
 * Manages loading, caching, and applying translations
 *
 * @class TranslationService
 * @extends EventEmitter
 */
class TranslationService extends EventEmitter {
  constructor() {
    super();

    /**
     * Current active language
     * @type {string}
     */
    this.currentLanguage = DEFAULT_LANGUAGE;

    /**
     * Loaded translations cache
     * @type {Map<string, Object>}
     */
    this.translations = new Map();

    /**
     * Loading states for languages
     * @type {Map<string, Promise>}
     */
    this.loadingPromises = new Map();

    /**
     * Whether service is initialized
     * @type {boolean}
     */
    this.isInitialized = false;

    /**
     * Debug mode flag
     * @type {boolean}
     */
    this.debugMode = false;

    // Bind methods
    this._handleStorageChange = this._handleStorageChange.bind(this);
  }

  /**
   * Debug logging helper
   * Only logs when debugMode is enabled
   * @private
   * @param {...any} args - Arguments to log
   */
  _log(...args) {
    if (this.debugMode) {
      console.log(...args);
    }
  }

  /**
   * Initialize the translation service
   * Loads saved language or detects browser language
   *
   * @returns {Promise<void>}
   * @example
   * await translationService.init();
   */
  async init() {
    if (this.isInitialized) {
      console.warn('[TranslationService] Already initialized');
      return;
    }

    try {
      // Check for preloaded language from inline script
      const preloadedLang = window.__preloadedLang;

      // Get saved language or detect from browser
      const savedLanguage = preloadedLang ||
                           Storage.get(STORAGE_KEY_LANGUAGE) ||
                           this._detectBrowserLanguage();

      // Load the language
      await this.loadLanguage(savedLanguage);

      // Listen for storage changes (language changes in other tabs)
      window.addEventListener('storage', this._handleStorageChange);

      this.isInitialized = true;
      this.emit('initialized', { language: this.currentLanguage });

      this._log(`[TranslationService] Initialized with language: ${this.currentLanguage}`);
    } catch (error) {
      console.error('[TranslationService] Initialization failed:', error);
      // Fall back to default language
      await this.loadLanguage(DEFAULT_LANGUAGE);
    }
  }

  /**
   * Load translations for a specific language
   *
   * @param {string} language - Language code (en, pl, nl)
   * @returns {Promise<void>}
   * @throws {Error} If language is not supported or loading fails
   * @example
   * await translationService.loadLanguage('pl');
   */
  async loadLanguage(language) {
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      console.warn(`[TranslationService] Language "${language}" not supported, falling back to ${DEFAULT_LANGUAGE}`);
      language = DEFAULT_LANGUAGE;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }

    // Return immediately if already loaded
    if (this.translations.has(language)) {
      this._setCurrentLanguage(language);
      return Promise.resolve();
    }

    // Create loading promise
    const loadingPromise = this._fetchTranslations(language);
    this.loadingPromises.set(language, loadingPromise);

    try {
      const translations = await loadingPromise;
      this.translations.set(language, translations);
      this._setCurrentLanguage(language);

      this.emit('languageLoaded', { language, translations });
      this._log(`[TranslationService] Language "${language}" loaded successfully`);
    } catch (error) {
      console.error(`[TranslationService] Failed to load language "${language}":`, error);

      // Try to fall back to default language
      if (language !== DEFAULT_LANGUAGE) {
        this._log(`[TranslationService] Falling back to ${DEFAULT_LANGUAGE}`);
        await this.loadLanguage(DEFAULT_LANGUAGE);
      } else {
        throw new Error('Failed to load default language translations');
      }
    } finally {
      this.loadingPromises.delete(language);
    }
  }

  /**
   * Change the current language
   *
   * @param {string} language - Language code to switch to
   * @returns {Promise<void>}
   * @example
   * await translationService.changeLanguage('pl');
   */
  async changeLanguage(language) {
    if (language === this.currentLanguage) {
      this._log(`[TranslationService] Already using language "${language}"`);
      return;
    }

    const previousLanguage = this.currentLanguage;

    try {
      await this.loadLanguage(language);
      this._applyTranslations();

      // Update HTML lang attribute
      document.documentElement.setAttribute('lang', language);

      this.emit('languageChanged', {
        language,
        previousLanguage
      });

      this._log(`[TranslationService] Language changed from "${previousLanguage}" to "${language}"`);
    } catch (error) {
      console.error('[TranslationService] Failed to change language:', error);
      throw error;
    }
  }

  /**
   * Translate a key to current language
   *
   * @param {string} key - Translation key (dot notation)
   * @param {Object} variables - Variables to interpolate
   * @returns {string} Translated text or key if not found
   * @example
   * translationService.translate('nav.home'); // 'Home'
   * translationService.translate('greeting', { name: 'Igor' }); // 'Hello, Igor!'
   */
  translate(key, variables = {}) {
    const translations = this.translations.get(this.currentLanguage);

    if (!translations) {
      console.warn(`[TranslationService] No translations loaded for "${this.currentLanguage}"`);
      return key;
    }

    // Get nested value using dot notation
    const value = this._getNestedValue(translations, key);

    if (value === undefined) {
      console.warn(`[TranslationService] Translation key "${key}" not found`);
      return key;
    }

    // Interpolate variables
    return this._interpolate(value, variables);
  }

  /**
   * Get current language code
   *
   * @returns {string} Current language code
   * @example
   * const lang = translationService.getCurrentLanguage(); // 'en'
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get all supported languages
   *
   * @returns {Array<string>} Array of supported language codes
   * @example
   * const languages = translationService.getSupportedLanguages(); // ['en', 'pl', 'nl']
   */
  getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
  }

  /**
   * Check if a language is supported
   *
   * @param {string} language - Language code to check
   * @returns {boolean} Whether language is supported
   * @example
   * translationService.isLanguageSupported('pl'); // true
   */
  isLanguageSupported(language) {
    return SUPPORTED_LANGUAGES.includes(language);
  }

  /**
   * Apply translations to all elements with data-i18n attributes
   *
   * @private
   */
  _applyTranslations() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.translate(key);
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.translate(key);
    });

    // Translate ARIA labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', this.translate(key));
    });

    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.setAttribute('title', this.translate(key));
    });

    // Mark translations as ready (removes visibility: hidden)
    document.documentElement.classList.add('translations-ready');
  }

  /**
   * Fetch translations from JSON file
   *
   * @private
   * @param {string} language - Language code
   * @returns {Promise<Object>} Translations object
   */
  async _fetchTranslations(language) {
    const path = TRANSLATION_PATHS[language];

    if (!path) {
      throw new Error(`No translation path configured for language "${language}"`);
    }

    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const translations = await response.json();
      return translations;
    } catch (error) {
      throw new Error(`Failed to fetch translations for "${language}": ${error.message}`);
    }
  }

  /**
   * Set current language and save to storage
   *
   * @private
   * @param {string} language - Language code
   */
  _setCurrentLanguage(language) {
    this.currentLanguage = language;
    Storage.set(STORAGE_KEY_LANGUAGE, language);
    document.documentElement.setAttribute('lang', language);
  }

  /**
   * Detect browser language
   *
   * @private
   * @returns {string} Detected language code or default
   */
  _detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const languageCode = browserLang.split('-')[0]; // 'en-US' -> 'en'

    if (SUPPORTED_LANGUAGES.includes(languageCode)) {
      return languageCode;
    }

    return DEFAULT_LANGUAGE;
  }

  /**
   * Get nested value from object using dot notation
   *
   * @private
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @returns {*} Value or undefined
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Interpolate variables in translation string
   *
   * @private
   * @param {string} text - Text with {{variables}}
   * @param {Object} variables - Variables to interpolate
   * @returns {string} Interpolated text
   */
  _interpolate(text, variables) {
    if (typeof text !== 'string') return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * Handle storage change events (language changed in another tab)
   *
   * @private
   * @param {StorageEvent} event - Storage event
   */
  _handleStorageChange(event) {
    if (event.key === STORAGE_KEY_LANGUAGE && event.newValue) {
      const newLanguage = event.newValue;

      if (newLanguage !== this.currentLanguage) {
        this._log(`[TranslationService] Language changed in another tab to "${newLanguage}"`);
        this.changeLanguage(newLanguage);
      }
    }
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    window.removeEventListener('storage', this._handleStorageChange);
    this.translations.clear();
    this.loadingPromises.clear();
    this.isInitialized = false;

    this._log('[TranslationService] Service destroyed');
  }
}

// Create singleton instance
const translationService = new TranslationService();

// Export both the instance and class
export { translationService, TranslationService };
export default translationService;
