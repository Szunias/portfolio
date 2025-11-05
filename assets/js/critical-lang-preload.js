/**
 * CRITICAL: Language Preload - Prevents Language Flicker
 *
 * This script MUST execute synchronously in <head> before any content renders.
 * It sets the correct language attribute immediately to prevent showing
 * English text before translations load.
 *
 * Performance: <1ms execution time, blocks rendering intentionally
 * Size: ~200 bytes minified
 *
 * @author Igor Szuniewicz
 * @version 2.0
 */
(function() {
    'use strict';

    // Get saved language or default to English
    const savedLang = localStorage.getItem('language') || 'en';

    // Set HTML lang attribute immediately (before ANY rendering)
    document.documentElement.setAttribute('lang', savedLang);

    // Store for translation system (prevents duplicate localStorage read)
    window.__preloadedLang = savedLang;

    // Add marker class for CSS (used for opacity transition)
    document.documentElement.classList.add('lang-preloaded');
})();
