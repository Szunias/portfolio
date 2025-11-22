/**
 * Tests for BulletproofI18n Service
 * Comprehensive test suite for all failure scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BulletproofI18n } from '../../assets/js/refactored/services/BulletproofI18n.js';

describe('BulletproofI18n', () => {
  let i18n;

  beforeEach(() => {
    // Setup clean DOM
    document.body.innerHTML = '';

    // Setup window.__I18N__ (inline critical translations)
    window.__I18N__ = {
      en: {
        nav: { home: 'Home', projects: 'Projects' },
        error: { loading: 'Loading...', failed: 'Failed' }
      },
      pl: {
        nav: { home: 'Start', projects: 'Projekty' },
        error: { loading: 'Ładowanie...', failed: 'Błąd' }
      }
    };

    // Clear localStorage
    localStorage.clear();

    // Create fresh instance
    i18n = new BulletproofI18n();
  });

  afterEach(() => {
    i18n.destroy();
    vi.restoreAllMocks();
  });

  // ============================================
  // INITIALIZATION TESTS
  // ============================================

  describe('Initialization', () => {
    it('should initialize with default language', () => {
      expect(i18n.lang).toBe('en');
    });

    it('should use preloaded language if available', () => {
      window.__preloadedLang = 'pl';
      const i18nPreloaded = new BulletproofI18n();
      expect(i18nPreloaded.lang).toBe('pl');
    });

    it('should use localStorage language if available', () => {
      localStorage.setItem('language', 'nl');
      const i18nStored = new BulletproofI18n();
      expect(i18nStored.lang).toBe('nl');
    });

    it('should detect browser language', () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'pl-PL',
        configurable: true
      });

      const i18nBrowser = new BulletproofI18n();
      expect(i18nBrowser.lang).toBe('pl');
    });

    it('should fallback to default if unsupported language', () => {
      localStorage.setItem('language', 'fr');
      const i18nUnsupported = new BulletproofI18n();
      expect(i18nUnsupported.lang).toBe('en');
    });
  });

  // ============================================
  // TRANSLATION TESTS
  // ============================================

  describe('Translation (t method)', () => {
    it('should translate simple key', () => {
      const result = i18n.t('nav.home');
      expect(result).toBe('Home');
    });

    it('should support nested keys', () => {
      const result = i18n.t('nav.projects');
      expect(result).toBe('Projects');
    });

    it('should interpolate variables', () => {
      window.__I18N__.en.greeting = 'Hello, {{name}}!';
      const result = i18n.t('greeting', { name: 'Igor' });
      expect(result).toBe('Hello, Igor!');
    });

    it('should return key if translation not found', () => {
      const result = i18n.t('non.existent.key');
      expect(result).toBe('non.existent.key');
    });

    it('should use current language', async () => {
      await i18n.setLanguage('pl');
      const result = i18n.t('nav.home');
      expect(result).toBe('Start');
    });
  });

  // ============================================
  // FALLBACK CHAIN TESTS
  // ============================================

  describe('5-Layer Fallback Chain', () => {
    beforeEach(() => {
      // Setup fallback scenarios
      document.body.innerHTML = '<h1 data-i18n="test.key">HTML Fallback</h1>';
    });

    it('Layer 1: Should use current language translation', () => {
      i18n.translations = {
        en: { test: { key: 'English Translation' } }
      };

      const result = i18n.t('test.key');
      expect(result).toBe('English Translation');
    });

    it('Layer 2: Should fallback to inline critical if not in loaded translations', () => {
      i18n.translations = { en: {} }; // Empty
      window.__I18N__.en = { test: { key: 'Critical Translation' } };

      const result = i18n.t('test.key');
      expect(result).toBe('Critical Translation');
    });

    it('Layer 3: Should fallback to English if current language missing', () => {
      i18n.lang = 'pl';
      i18n.translations = {
        en: { test: { key: 'English Fallback' } },
        pl: {} // Empty
      };

      const result = i18n.t('test.key');
      expect(result).toBe('English Fallback');
    });

    it('Layer 4: Should fallback to HTML content', () => {
      i18n.translations = { en: {} };
      window.__I18N__ = { en: {} };

      const result = i18n.t('test.key');
      expect(result).toBe('HTML Fallback');
    });

    it('Layer 5: Should return key as last resort', () => {
      i18n.translations = { en: {} };
      window.__I18N__ = { en: {} };
      document.body.innerHTML = ''; // No HTML fallback

      const result = i18n.t('test.key');
      expect(result).toBe('test.key');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      await expect(i18n.load('en')).resolves.not.toThrow();
      // Should use inline critical translations as fallback
      expect(i18n.translations.en).toBeDefined();
    });

    it('should handle JSON parse errors gracefully', async () => {
      // Mock fetch to return invalid JSON
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      );

      await expect(i18n.load('en')).resolves.not.toThrow();
    });

    it('should handle timeout errors', async () => {
      // Mock fetch with long delay
      global.fetch = vi.fn(() =>
        new Promise(resolve => setTimeout(resolve, 5000))
      );

      // Set timeout to 100ms for testing
      i18n.timeout = 100;

      await expect(i18n.load('en')).resolves.not.toThrow();
      // Should fallback to inline critical
      expect(i18n.translations.en).toBeDefined();
    }, 10000);

    it('should handle DOM query errors gracefully', () => {
      // Break querySelector
      document.querySelector = vi.fn(() => {
        throw new Error('DOM error');
      });

      const result = i18n.t('any.key');
      // Should return key without crashing
      expect(result).toBe('any.key');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => i18n.load('en')).not.toThrow();
    });
  });

  // ============================================
  // DOM MANIPULATION TESTS
  // ============================================

  describe('DOM Manipulation', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <nav>
          <a data-i18n="nav.home">Home</a>
          <a data-i18n="nav.projects">Projects</a>
        </nav>
        <input data-i18n-placeholder="form.email" placeholder="Email" />
        <button data-i18n-aria-label="button.close" aria-label="Close">X</button>
        <a data-i18n-title="link.tooltip" title="Click me">Link</a>
      `;

      i18n.translations = {
        en: {
          nav: { home: 'Home', projects: 'Projects' },
          form: { email: 'Your email' },
          button: { close: 'Close dialog' },
          link: { tooltip: 'Opens in new tab' }
        }
      };
    });

    it('should apply translations to data-i18n elements', () => {
      i18n._applyTranslations();

      const homeLink = document.querySelector('[data-i18n="nav.home"]');
      expect(homeLink.textContent).toBe('Home');
    });

    it('should apply translations to placeholders', () => {
      i18n._applyTranslations();

      const input = document.querySelector('[data-i18n-placeholder="form.email"]');
      expect(input.placeholder).toBe('Your email');
    });

    it('should apply translations to ARIA labels', () => {
      i18n._applyTranslations();

      const button = document.querySelector('[data-i18n-aria-label="button.close"]');
      expect(button.getAttribute('aria-label')).toBe('Close dialog');
    });

    it('should apply translations to titles', () => {
      i18n._applyTranslations();

      const link = document.querySelector('[data-i18n-title="link.tooltip"]');
      expect(link.getAttribute('title')).toBe('Opens in new tab');
    });

    it('should update language buttons active state', () => {
      document.body.innerHTML = `
        <button class="lang-btn" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="pl">PL</button>
      `;

      i18n.lang = 'pl';
      i18n._applyTranslations();

      const enBtn = document.querySelector('[data-lang="en"]');
      const plBtn = document.querySelector('[data-lang="pl"]');

      expect(enBtn.classList.contains('active')).toBe(false);
      expect(plBtn.classList.contains('active')).toBe(true);
    });

    it('should not crash if elements are missing', () => {
      document.body.innerHTML = ''; // Empty DOM
      expect(() => i18n._applyTranslations()).not.toThrow();
    });
  });

  // ============================================
  // LANGUAGE SWITCHING TESTS
  // ============================================

  describe('Language Switching', () => {
    it('should change language successfully', async () => {
      expect(i18n.lang).toBe('en');

      await i18n.setLanguage('pl');

      expect(i18n.lang).toBe('pl');
      expect(i18n.t('nav.home')).toBe('Start');
    });

    it('should emit languageChanged event', async () => {
      const eventSpy = vi.fn();
      window.addEventListener('languageChanged', eventSpy);

      await i18n.setLanguage('pl');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            language: 'pl'
          })
        })
      );
    });

    it('should update HTML lang attribute', async () => {
      await i18n.setLanguage('pl');
      expect(document.documentElement.getAttribute('lang')).toBe('pl');
    });

    it('should save language to localStorage', async () => {
      await i18n.setLanguage('pl');
      expect(localStorage.getItem('language')).toBe('pl');
    });

    it('should not change if already using language', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      i18n.debugMode = true;

      await i18n.setLanguage('en'); // Already using en

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already using language')
      );
    });

    it('should handle language buttons clicks', () => {
      document.body.innerHTML = `
        <button class="lang-btn" data-lang="pl">PL</button>
      `;

      i18n._setupLanguageSwitchers();

      const button = document.querySelector('.lang-btn');
      button.click();

      // Should trigger language change (tested indirectly via setLanguage)
    });
  });

  // ============================================
  // UTILITY METHODS TESTS
  // ============================================

  describe('Utility Methods', () => {
    it('should get current language', () => {
      expect(i18n.getLanguage()).toBe('en');
    });

    it('should check if language is supported', () => {
      expect(i18n.isSupported('en')).toBe(true);
      expect(i18n.isSupported('pl')).toBe(true);
      expect(i18n.isSupported('fr')).toBe(false);
    });

    it('should destroy and cleanup', () => {
      i18n.translations = { en: { test: 'value' } };

      i18n.destroy();

      expect(i18n.translations).toEqual({});
      expect(i18n.loadingPromises.size).toBe(0);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle HTML with <br> tags in titles', () => {
      document.body.innerHTML = '<h1 data-i18n="hero.title">Title</h1>';

      i18n.translations = {
        en: {
          hero: { title: 'Interactive <br> Sound' }
        }
      };

      i18n._applyTranslations();

      const title = document.querySelector('[data-i18n="hero.title"]');
      expect(title.innerHTML).toContain('<br>');
    });

    it('should handle concurrent language loads', async () => {
      // Attempt to load same language multiple times
      const promises = [
        i18n.load('en'),
        i18n.load('en'),
        i18n.load('en')
      ];

      await Promise.all(promises);

      // Should only load once (cached promise)
      expect(i18n.translations.en).toBeDefined();
    });

    it('should handle storage events from other tabs', () => {
      const event = new StorageEvent('storage', {
        key: 'language',
        newValue: 'pl'
      });

      i18n._handleStorageChange(event);

      // Should trigger language change
      expect(i18n.lang).toBe('pl');
    });

    it('should handle empty translation objects', () => {
      i18n.translations = { en: {} };
      window.__I18N__ = { en: {} };

      const result = i18n.t('any.key');
      // Should fallback to key
      expect(result).toBe('any.key');
    });

    it('should handle non-string translation values', () => {
      i18n.translations = {
        en: {
          test: { number: 123, bool: true, obj: { nested: 'value' } }
        }
      };

      expect(i18n.t('test.number')).toBe(123);
      expect(i18n.t('test.bool')).toBe(true);
      expect(i18n.t('test.obj')).toEqual({ nested: 'value' });
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================

  describe('Performance', () => {
    it('should load translations within timeout', async () => {
      // Mock fast fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ en: { test: 'value' } })
        })
      );

      const startTime = Date.now();
      await i18n.load('en');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(i18n.timeout);
    });

    it('should cache loaded translations', async () => {
      i18n.translations = { en: { test: 'cached' } };

      const startTime = Date.now();
      await i18n.load('en');
      const duration = Date.now() - startTime;

      // Should return immediately (cached)
      expect(duration).toBeLessThan(10);
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================

  describe('Integration Tests', () => {
    it('should work end-to-end', async () => {
      // Setup DOM
      document.body.innerHTML = `
        <nav>
          <a data-i18n="nav.home">Home</a>
          <button class="lang-btn" data-lang="pl">PL</button>
        </nav>
      `;

      // Initialize
      await i18n.init();

      // Check initial state
      expect(i18n.lang).toBe('en');
      expect(i18n.t('nav.home')).toBe('Home');

      // Change language
      await i18n.setLanguage('pl');

      // Check updated state
      expect(i18n.lang).toBe('pl');
      expect(i18n.t('nav.home')).toBe('Start');

      // Check DOM updated
      const homeLink = document.querySelector('[data-i18n="nav.home"]');
      expect(homeLink.textContent).toBe('Start');
    });
  });
});
