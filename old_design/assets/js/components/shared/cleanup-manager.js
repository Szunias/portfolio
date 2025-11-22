/**
 * Shared Cleanup Manager
 * Unified cleanup system for all pages to prevent memory leaks
 *
 * Features:
 * 1. Automatically cleans up shared modules (scroll-reveal, smooth-scroll, lazy-images)
 * 2. Calls page-specific cleanup functions if they exist
 * 3. Integrates with AJAX navigation system
 * 4. Tracks cleanup state to prevent double-cleanup
 *
 * Usage:
 * - Cleanup is automatically triggered on AJAX navigation and page unload
 * - Can be manually called: window.cleanupCurrentPage()
 * - Page-specific cleanup should be exposed as window.__cleanup[PageName]
 */

(function () {
  'use strict';

  // Track cleanup state
  let isCleanedUp = false;

  /**
   * Determine current page name based on URL
   * @returns {string} Page name (Index, About, Projects, Music, Contact)
   */
  function determinePageName() {
    const path = window.location.pathname;

    if (path === '/' || path.includes('index.html')) return 'Index';
    if (path.includes('about')) return 'About';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('music')) return 'Music';
    if (path.includes('contact')) return 'Contact';

    return 'Index'; // Default fallback
  }

  /**
   * Main cleanup function for current page
   * Cleans up both shared modules and page-specific code
   */
  function cleanupCurrentPage() {
    // Prevent double cleanup
    if (isCleanedUp) {
      console.log('[CleanupManager] Already cleaned up, skipping');
      return;
    }

    const pageName = determinePageName();
    console.log(`[CleanupManager] Cleaning up ${pageName} page`);

    try {
      // 1. Cleanup shared modules (if functions exist)
      cleanupSharedModules();

      // 2. Cleanup page-specific code
      cleanupPageSpecific(pageName);

      // 3. Cleanup observer arrays
      cleanupObserverArrays(pageName);

      isCleanedUp = true;
      console.log(`[CleanupManager] ${pageName} page cleanup completed`);
    } catch (error) {
      console.error('[CleanupManager] Cleanup error:', error);
    }
  }

  /**
   * Cleanup all shared modules
   */
  function cleanupSharedModules() {
    // Scroll reveal
    if (typeof window.cleanupScrollReveal === 'function') {
      try {
        window.cleanupScrollReveal();
      } catch (error) {
        console.warn('[CleanupManager] cleanupScrollReveal error:', error);
      }
    }

    // Smooth scroll
    if (typeof window.cleanupSmoothScroll === 'function') {
      try {
        window.cleanupSmoothScroll();
      } catch (error) {
        console.warn('[CleanupManager] cleanupSmoothScroll error:', error);
      }
    }

    // Lazy images
    if (typeof window.cleanupLazyImages === 'function') {
      try {
        window.cleanupLazyImages();
      } catch (error) {
        console.warn('[CleanupManager] cleanupLazyImages error:', error);
      }
    }
  }

  /**
   * Cleanup page-specific code
   * @param {string} pageName - Name of the current page
   */
  function cleanupPageSpecific(pageName) {
    const cleanupFunctionName = `__cleanup${pageName}Page`;

    if (typeof window[cleanupFunctionName] === 'function') {
      try {
        window[cleanupFunctionName]();
        console.log(`[CleanupManager] ${cleanupFunctionName}() executed`);
      } catch (error) {
        console.warn(`[CleanupManager] ${cleanupFunctionName}() error:`, error);
      }
    }
  }

  /**
   * Cleanup observer arrays for the current page
   * @param {string} pageName - Name of the current page
   */
  function cleanupObserverArrays(pageName) {
    const observerArrayName = `__${pageName.toLowerCase()}PageObservers`;

    if (window[observerArrayName]) {
      window[observerArrayName].forEach((observer) => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      });
      window[observerArrayName] = [];
    }
  }

  /**
   * Reset cleanup state (called after new page loads)
   */
  function resetCleanupState() {
    isCleanedUp = false;
    console.log('[CleanupManager] Cleanup state reset');
  }

  /**
   * Initialize cleanup manager
   * Sets up event listeners for automatic cleanup
   */
  function initCleanupManager() {
    // Cleanup before page unload (browser navigation)
    window.addEventListener('beforeunload', cleanupCurrentPage);

    // Reset cleanup state after new page content is loaded (AJAX navigation)
    window.addEventListener('pageContentLoaded', resetCleanupState);

    console.log('[CleanupManager] Initialized');
  }

  // Export functions to global scope
  window.cleanupCurrentPage = cleanupCurrentPage;
  window.resetCleanupState = resetCleanupState;

  // Auto-initialize cleanup manager
  initCleanupManager();

})();
