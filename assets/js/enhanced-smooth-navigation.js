/**
 * Enhanced Smooth Navigation System
 * Main entry point - uses modular architecture
 *
 * Eliminuje "flashing" przy przejściach między stronami poprzez:
 * - AJAX navigation bez przeładowania strony
 * - View Transition API dla nowoczesnych przeglądarek
 * - Zachowanie nawigacji i headera (bez re-render)
 * - Preloading stron przy hover
 * - Cache dla instant navigation
 * - Pełna integracja z systemem tłumaczeń
 */

import { CacheManager } from './ajax/cache.js';
import { CleanupManager } from './ajax/cleanup.js';
import { MediaLoader } from './ajax/media-loader.js';
import { ScriptReinitializer } from './ajax/script-reinit.js';
import { PageHandlers } from './ajax/page-handlers.js';
import { NavigationCore } from './ajax/core.js';

(function () {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const CONFIG = {
    // Animation durations (ms)
    fadeOutDuration: 150,
    fadeInDuration: 200,

    // Preloading
    preloadDelay: 50,
    preloadOnHover: true,

    // Cache
    cacheSize: 10,
    cacheCritical: true,

    // Debug - auto-detect localhost
    debug:
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('.local')
  };

  // ============================================================================
  // LOGGING
  // ============================================================================

  function log(...args) {
    if (CONFIG.debug) {
      console.log('[SmoothNav]', ...args);
    }
  }

  // ============================================================================
  // INITIALIZE MODULES
  // ============================================================================

  log('Initializing Enhanced Smooth Navigation (Modular)');

  // Create module instances
  const cacheManager = new CacheManager(CONFIG, log);
  const cleanupManager = new CleanupManager(log);
  const mediaLoader = new MediaLoader(log);
  const scriptReinitializer = new ScriptReinitializer(log, cleanupManager, mediaLoader);
  const pageHandlers = new PageHandlers(log, cleanupManager);
  const navigationCore = new NavigationCore(
    CONFIG,
    log,
    cacheManager,
    cleanupManager,
    scriptReinitializer,
    mediaLoader,
    pageHandlers
  );

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function init() {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('Enhanced Smooth Navigation - Modular Architecture');
    log('Version: 2.0.0');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Initialize core navigation
    navigationCore.init();

    // Initialize lazy loading on initial page load
    log('━━━ INITIAL PAGE LOAD ━━━');
    log('Running lazy loading for initial page content...');
    mediaLoader.initializeUniversalLazyLoading();

    log('━━━ INITIALIZATION COMPLETE ━━━');
  }

  // ============================================================================
  // START
  // ============================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================================================
  // GLOBAL LANGUAGE CHANGE HANDLER
  // ============================================================================

  if (!window.__smoothNavLanguageListenerSetup) {
    window.__smoothNavLanguageListenerSetup = true;

    window.addEventListener('languageChanged', (e) => {
      const newLang = e.detail?.language;
      log(`Language changed to: ${newLang}`);

      // Apply translations immediately
      if (window.i18n && window.i18n._applyTranslations) {
        log('Calling _applyTranslations() for language change');
        setTimeout(() => {
          window.i18n._applyTranslations();
          log('Translations reapplied after language change');
        }, 10);
      }

      // Special handling for music page
      if (window.location.pathname.includes('music') && window.refreshMusicList) {
        log('Refreshing music playlist for new language');
        setTimeout(() => {
          window.refreshMusicList();
        }, 50);
      }
    });

    log('Global language change listener set up');
  }

  // ============================================================================
  // EXPORT PUBLIC API
  // ============================================================================

  window.smoothNav = {
    navigate: (url) => navigationCore.navigateToPage(url),
    preload: (url) => cacheManager.schedulePreload(url, (u) => navigationCore.loadPage(u)),
    clearCache: () => cacheManager.clear(),
    cache: cacheManager,
    config: CONFIG,

    // Module access for debugging
    modules: {
      cache: cacheManager,
      cleanup: cleanupManager,
      media: mediaLoader,
      scriptReinit: scriptReinitializer,
      pageHandlers: pageHandlers,
      core: navigationCore
    }
  };

  log('Enhanced Smooth Navigation loaded (Modular v2.0.0)');
})();
