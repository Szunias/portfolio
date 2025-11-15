/**
 * Script Reinitialization Module
 * Handles reinitializing scripts, translations, and animations after AJAX navigation
 */

export class ScriptReinitializer {
  constructor(logger, cleanupManager, mediaLoader) {
    this.log = logger;
    this.cleanupManager = cleanupManager;
    this.mediaLoader = mediaLoader;
  }

  /**
   * Main script reinitialization function
   */
  reinitializeScripts(pageData, currentPath) {
    this.log('Reinitializing scripts (optimized)');

    // 1. Animacje scroll-based
    this.reinitializeScrollAnimations();

    // 2. Execute head scripts FIRST (critical inline scripts like window.__I18N__)
    if (pageData.headScripts && pageData.headScripts.length > 0) {
      this.log('  → Executing head scripts (window.__I18N__, etc.)');
      pageData.headScripts.forEach((script) => {
        try {
          eval(script);
          this.log('    ✓ Head script executed');
        } catch (error) {
          this.log('    ✗ Head script execution failed:', error);
        }
      });
    }

    // 3. Event listeners specyficzne dla strony
    this.reinitializeEventListeners();

    // 4. Wykonaj custom scripts
    if (pageData.scripts && pageData.scripts.length > 0) {
      pageData.scripts.forEach((script) => {
        try {
          eval(script);
        } catch (error) {
          this.log('Script execution failed:', error);
        }
      });
    }

    // 5. Notify performance-boost.js that content has changed
    if (typeof window.optimizeImages === 'function') {
      window.optimizeImages();
    }
    window.dispatchEvent(new CustomEvent('contentUpdated'));
  }

  /**
   * Reinitialize scroll-based animations
   */
  reinitializeScrollAnimations() {
    // Intersection Observer dla .fade-in elementów
    const fadeElements = document.querySelectorAll('.fade-in, .animate-on-scroll');

    if (fadeElements.length === 0) return;

    // Utwórz nowy observer
    const scrollAnimationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Track observer for cleanup
    this.cleanupManager.setScrollAnimationObserver(scrollAnimationObserver);

    // Obserwuj wszystkie elementy
    fadeElements.forEach((el) => {
      el.classList.remove('visible');
      scrollAnimationObserver.observe(el);
    });
  }

  /**
   * Reinitialize event listeners
   */
  reinitializeEventListeners() {
    // Mobile menu - używamy event delegation więc nie trzeba reinicjalizować
    // Główny click handler już obsługuje wszystkie kliknięcia

    // Zamknij mobile menu po nawigacji
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileToggle?.classList.remove('active');
      mobileMenu.classList.remove('active');
      mobileOverlay?.classList.remove('active');
      document.body.classList.remove('mobile-menu-open');
    }
  }

  /**
   * Reinitialize translations system
   */
  reinitializeTranslations(pathOverride) {
    const currentLang = localStorage.getItem('language') || 'en';
    const targetPath = pathOverride || window.location.pathname;

    this.log('━━━ Reinitializing translations ━━━');
    this.log('  Current language:', currentLang);
    this.log('  Target path:', targetPath);

    // Reinicjalizuj BulletproofI18n (singleton instance)
    if (window.i18n && typeof window.i18n.load === 'function') {
      this.log('  → Using BulletproofI18n system');

      // Load translations for current language and path
      return window.i18n
        .load(currentLang, targetPath)
        .then(() => {
          this.log('  ✓ Translations loaded for:', currentLang);
          this.log(
            '  ✓ Translation keys available:',
            window.i18n.translations[currentLang]
              ? Object.keys(window.i18n.translations[currentLang]).length
              : 0
          );

          // Apply translations to DOM
          if (
            window.i18n._applyTranslations &&
            typeof window.i18n._applyTranslations === 'function'
          ) {
            this.log('  → Calling _applyTranslations()');
            window.i18n._applyTranslations();
            this.log('  ✓ Translations applied to DOM');
          }

          // CRITICAL: Render tech badges after translations load
          if (typeof window.renderProjectTechTags === 'function') {
            this.log('  → Calling renderProjectTechTags() after translations loaded');
            window.renderProjectTechTags();
          }
        })
        .catch((err) => {
          this.log('  ✗ Translation reload failed:', err);
          // Fallback: apply whatever translations we have
          if (window.i18n._applyTranslations) {
            window.i18n._applyTranslations();
          }
          if (typeof window.renderProjectTechTags === 'function') {
            window.renderProjectTechTags();
          }
        });
    }

    // Fallback: stary system tłumaczeń
    else if (window.setLanguage && typeof window.setLanguage === 'function') {
      this.log('  → Using legacy translation system');
      window.setLanguage(currentLang);
      return Promise.resolve();
    } else {
      this.log('  ⚠ No translation system found');
      return Promise.resolve();
    }
  }
}
