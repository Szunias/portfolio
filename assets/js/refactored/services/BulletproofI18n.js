/**
 * Bulletproof i18n Service
 * Ultra-minimal, fail-safe translation system (5KB)
 *
 * Features:
 * - 5-layer fallback chain (never crashes)
 * - HTML fallback content (works without JS)
 * - Inline critical translations (0ms load)
 * - Lazy loading with timeout (3s guaranteed)
 * - Error boundaries (try-catch everywhere)
 * - Zero dependencies
 *
 * @author Igor Szuniewicz
 * @version 1.0.0
 * @license MIT
 */

/**
 * BulletproofI18n Class
 * Minimal translation service with maximum reliability
 */
class BulletproofI18n {
  constructor() {
    /**
     * Current language
     * @type {string}
     */
    this.lang = this._getInitialLanguage();

    /**
     * Loaded translations
     * @type {Object}
     */
    this.translations = {};

    /**
     * Loading promises cache
     * @type {Map<string, Promise>}
     */
    this.loadingPromises = new Map();

    /**
     * Supported languages
     * @type {string[]}
     */
    this.supportedLanguages = ['en', 'pl', 'nl'];

    /**
     * Default language
     * @type {string}
     */
    this.defaultLanguage = 'en';

    /**
     * Timeout for translation loading (ms)
     * @type {number}
     */
    this.timeout = 3000;

    /**
     * Debug mode
     * @type {boolean}
     */
    this.debugMode = true;

    /**
     * Inline critical translations
     * @type {Object}
     */
    this.critical = window.__I18N__ || {};

    // Bind methods
    this._handleStorageChange = this._handleStorageChange.bind(this);
  }

  /**
   * Initialize the translation system
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Load translations for current language
      await this.load(this.lang);

      // Apply translations to DOM
      this._applyTranslations();

      // Listen for storage changes (language change in other tabs)
      window.addEventListener('storage', this._handleStorageChange);

      // Listen for language change events
      this._setupLanguageSwitchers();

      this._log('[BulletproofI18n] Initialized successfully');
    } catch (error) {
      console.error('[BulletproofI18n] Initialization failed:', error);
      // Continue anyway - fallback to HTML content
      this._applyTranslations();
    }
  }

  /**
   * Load translations for a language
   * @param {string} lang - Language code
   * @param {string} pathOverride - Optional path to use instead of window.location.pathname
   * @returns {Promise<void>}
   */
  async load(lang, pathOverride = null) {
    // Validate language
    if (!this.supportedLanguages.includes(lang)) {
      this._log(`[BulletproofI18n] Language "${lang}" not supported, using default`);
      lang = this.defaultLanguage;
    }

    // Return cached loading promise if already loading
    if (this.loadingPromises.has(lang)) {
      return this.loadingPromises.get(lang);
    }

    // Already loaded
    if (this.translations[lang]) {
      this.lang = lang;
      return Promise.resolve();
    }

    // Create loading promise with timeout
    const loadingPromise = this._loadWithTimeout(lang, pathOverride);
    this.loadingPromises.set(lang, loadingPromise);

    try {
      const translations = await loadingPromise;
      this.translations[lang] = translations;
      this.lang = lang;

      // Save to localStorage
      this._safeExecute(() => {
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
      });

      this._log(`[BulletproofI18n] Loaded language: ${lang}`);
    } catch (error) {
      console.warn(`[BulletproofI18n] Failed to load "${lang}":`, error);

      // Use critical inline translations as fallback
      this.translations[lang] = this.critical[lang] || {};
      this.lang = lang;

      // CRITICAL FIX: Save to localStorage even when loading fails
      // This ensures language preference is preserved across page navigations
      this._safeExecute(() => {
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
      });
    } finally {
      this.loadingPromises.delete(lang);
    }
  }

  /**
   * Change language
   * @param {string} lang - Language code
   * @returns {Promise<void>}
   */
  async setLanguage(lang) {
    if (lang === this.lang) {
      this._log(`[BulletproofI18n] Already using language: ${lang}`);
      return;
    }

    const previousLanguage = this.lang;

    try {
      await this.load(lang);
      this._applyTranslations();

      // Emit custom event
      this._safeExecute(() => {
        window.dispatchEvent(
          new CustomEvent('languageChanged', {
            detail: { language: lang, previousLanguage }
          })
        );
      });

      this._log(`[BulletproofI18n] Language changed to: ${lang}`);
    } catch (error) {
      console.error('[BulletproofI18n] Failed to change language:', error);
    }
  }

  /**
   * Translate a key
   * @param {string} key - Translation key (supports dot notation)
   * @param {Object} vars - Variables for interpolation
   * @returns {string} Translated text
   */
  t(key, vars = {}) {
    return this._safeExecute(() => {
      // Layer 1: Try current language
      let value = this._getNestedValue(this.translations[this.lang], key);
      if (value) return this._interpolate(value, vars);

      // Layer 2: Try critical inline
      value = this._getNestedValue(this.critical[this.lang], key);
      if (value) return this._interpolate(value, vars);

      // Layer 3: Try default language (English)
      if (this.lang !== this.defaultLanguage) {
        value = this._getNestedValue(this.translations[this.defaultLanguage], key);
        if (value) return this._interpolate(value, vars);

        value = this._getNestedValue(this.critical[this.defaultLanguage], key);
        if (value) return this._interpolate(value, vars);
      }

      // Layer 4: Try HTML fallback content
      const htmlFallback = this._getHtmlFallback(key);
      if (htmlFallback) return htmlFallback;

      // Layer 5: Return key as last resort
      console.warn(`[BulletproofI18n] Translation missing: ${key}`);
      return key;
    }, key); // Fallback: return key on error
  }

  /**
   * Get current language
   * @returns {string}
   */
  getLanguage() {
    return this.lang;
  }

  /**
   * Check if language is supported
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  isSupported(lang) {
    return this.supportedLanguages.includes(lang);
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    window.removeEventListener('storage', this._handleStorageChange);
    this.translations = {};
    this.loadingPromises.clear();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Load translations with timeout protection
   * @private
   * @param {string} lang - Language code
   * @param {string} pathOverride - Optional path to use instead of window.location.pathname
   * @returns {Promise<Object>}
   */
  async _loadWithTimeout(lang, pathOverride = null) {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), this.timeout);
    });

    // Determine which JSON file to load based on current page
    const jsonFile = this._getTranslationFile(pathOverride);
    const path = `/locales/${jsonFile}`;
    this._log(`[_loadWithTimeout] Loading translations for lang="${lang}" from path="${path}"`);

    // Fetch with timeout
    try {
      const response = await Promise.race([fetch(path), timeoutPromise]);
      this._log('[_loadWithTimeout] Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this._log('[_loadWithTimeout] JSON parsed successfully, keys:', Object.keys(data));
      this._log(
        `[_loadWithTimeout] Language data for "${lang}":`,
        data[lang] ? 'EXISTS' : 'MISSING'
      );

      // Extract language-specific data
      const result = data[lang] || {};
      this._log('[_loadWithTimeout] Translation keys loaded:', Object.keys(result).length);
      return result;
    } catch (error) {
      this._log('[_loadWithTimeout] ERROR:', error.message);
      throw new Error(`Failed to load translations: ${error.message}`);
    }
  }

  /**
   * Apply translations to all DOM elements
   * @private
   */
  _applyTranslations() {
    this._safeExecute(() => {
      // Translate text content
      document.querySelectorAll('[data-i18n]').forEach((element) => {
        this._safeExecute(() => {
          const key = element.getAttribute('data-i18n');
          const translation = this.t(key);

          // Only update if different from current content
          if (element.textContent !== translation) {
            // Check if key allows HTML (e.g., titles with <br>)
            if (key.includes('.title') && translation.includes('<br>')) {
              element.innerHTML = translation;
            } else {
              element.textContent = translation;
            }
          }
        });
      });

      // Translate placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        this._safeExecute(() => {
          const key = element.getAttribute('data-i18n-placeholder');
          element.placeholder = this.t(key);
        });
      });

      // Translate ARIA labels
      document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
        this._safeExecute(() => {
          const key = element.getAttribute('data-i18n-aria-label');
          element.setAttribute('aria-label', this.t(key));
        });
      });

      // Translate titles
      document.querySelectorAll('[data-i18n-title]').forEach((element) => {
        this._safeExecute(() => {
          const key = element.getAttribute('data-i18n-title');
          element.setAttribute('title', this.t(key));
        });
      });

      // Update active state of language buttons
      document.querySelectorAll('.lang-btn').forEach((button) => {
        this._safeExecute(() => {
          button.classList.toggle('active', button.dataset.lang === this.lang);
        });
      });

      // Mark translations as ready
      document.documentElement.classList.add('translations-ready');
    });
  }

  /**
   * Get initial language from various sources
   * @private
   * @returns {string}
   */
  _getInitialLanguage() {
    try {
      // 1. Check for preloaded language (from inline script)
      if (window.__preloadedLang) {
        return window.__preloadedLang;
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('language');
      if (saved && this.supportedLanguages.includes(saved)) {
        return saved;
      }

      // 3. Detect from browser
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0]; // 'en-US' -> 'en'

      if (this.supportedLanguages.includes(langCode)) {
        return langCode;
      }
    } catch (error) {
      // localStorage might be disabled
    }

    // 4. Fallback to default
    return this.defaultLanguage;
  }

  /**
   * Determine which translation file to load based on current page
   * @private
   * @param {string} pathOverride - Optional path to use instead of window.location.pathname
   * @returns {string}
   */
  _getTranslationFile(pathOverride = null) {
    const path = pathOverride || window.location.pathname;
    this._log('[_getTranslationFile] Current pathname:', path);
    if (pathOverride) {
      this._log('[_getTranslationFile] Using pathOverride:', pathOverride);
    }

    const filename = path.split('/').pop();
    this._log('[_getTranslationFile] Extracted filename:', filename);

    // Check if we're on a specific project page (e.g., /projects/pawism.html)
    if (path.includes('/projects/') && filename && filename.endsWith('.html')) {
      // Extract project name from filename (e.g., pawism.html -> pawism.json)
      const projectName = filename.replace('.html', '.json');
      this._log('[_getTranslationFile] → Detected project page, returning:', projectName);
      return projectName;
    }

    // Check if we're on the projects directory page
    if (path.includes('/projects') && (!filename || filename === '' || filename === 'index.html')) {
      this._log('[_getTranslationFile] → Detected projects directory, returning: projects.json');
      return 'projects.json';
    }

    // Map HTML files to their JSON translation files
    const fileMap = {
      'index.html': 'index.json',
      'about.html': 'about.json',
      'contact.html': 'contact.json',
      'music.html': 'music.json',
      '': 'index.json',
      '/': 'index.json'
    };

    const result = fileMap[filename] || 'index.json';
    this._log('[_getTranslationFile] → Returning:', result);
    return result;
  }

  /**
   * Get nested value from object using dot notation
   * @private
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path (e.g., 'hero.title')
   * @returns {*} Value or undefined
   */
  _getNestedValue(obj, path) {
    if (!obj || typeof obj !== 'object') return undefined;

    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Interpolate variables in string
   * @private
   * @param {string} text - Text with {{variables}}
   * @param {Object} vars - Variables to interpolate
   * @returns {string}
   */
  _interpolate(text, vars) {
    if (typeof text !== 'string') return text;
    if (Object.keys(vars).length === 0) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  /**
   * Get HTML fallback content for a key
   * @private
   * @param {string} key - Translation key
   * @returns {string|null}
   */
  _getHtmlFallback(key) {
    try {
      const element = document.querySelector(`[data-i18n="${key}"]`);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    } catch (error) {
      // Query selector might fail
    }
    return null;
  }

  /**
   * Setup language switcher buttons
   * @private
   */
  _setupLanguageSwitchers() {
    // Use event delegation for dynamically added buttons
    document.addEventListener('click', (event) => {
      this._safeExecute(() => {
        const button = event.target.closest('.lang-btn');
        if (button && button.dataset.lang) {
          this.setLanguage(button.dataset.lang);
        }
      });
    });
  }

  /**
   * Handle storage change events (language changed in other tab)
   * @private
   * @param {StorageEvent} event
   */
  _handleStorageChange(event) {
    if (event.key === 'language' && event.newValue) {
      const newLanguage = event.newValue;
      if (newLanguage !== this.lang) {
        this._log(`[BulletproofI18n] Language changed in another tab: ${newLanguage}`);
        this.setLanguage(newLanguage);
      }
    }
  }

  /**
   * Safe execute with try-catch
   * @private
   * @param {Function} fn - Function to execute
   * @param {*} fallback - Fallback value on error
   * @returns {*}
   */
  _safeExecute(fn, fallback = undefined) {
    try {
      return fn();
    } catch (error) {
      if (this.debugMode) {
        console.error('[BulletproofI18n] Error:', error);
      }
      return fallback;
    }
  }

  /**
   * Debug logging
   * @private
   */
  _log(...args) {
    if (this.debugMode) {
      console.log(...args);
    }
  }
}

// Create singleton instance
const i18n = new BulletproofI18n();

// Export for module usage
export { i18n, BulletproofI18n };
export default i18n;

// Also expose globally for legacy code
if (typeof window !== 'undefined') {
  window.i18n = i18n;

  // Expose helpers for backward compatibility
  window.setLanguage = (lang) => i18n.setLanguage(lang);
  window.applyTranslations = () => i18n._applyTranslations();
}
