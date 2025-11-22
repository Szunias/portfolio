/**
 * Shared Smooth Scroll Module
 * Unified smooth scrolling for anchor links across all pages
 *
 * Usage:
 * 1. Add href="#target-id" to anchor links
 * 2. Call initSmoothScroll() when page loads or after AJAX navigation
 * 3. Event listeners are automatically tracked for cleanup
 */

(function () {
  'use strict';

  // Default configuration
  const DEFAULT_OPTIONS = {
    selector: 'a[href^="#"]',
    behavior: 'smooth',
    block: 'start',
    ignoreEmpty: true
  };

  // Store event listeners for cleanup
  const eventListeners = new Map();

  /**
   * Initialize smooth scroll for anchor links
   * @param {Object} options - Configuration options
   * @param {string} options.selector - CSS selector for anchor links
   * @param {string} options.behavior - Scroll behavior (smooth, auto)
   * @param {string} options.block - Block alignment (start, center, end, nearest)
   * @param {boolean} options.ignoreEmpty - Ignore empty href="#" links
   */
  function initSmoothScroll(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };

    const setup = () => {
      // Clean up existing listeners first
      cleanupSmoothScroll();

      const anchors = document.querySelectorAll(config.selector);

      anchors.forEach((anchor) => {
        const handler = function (e) {
          const href = this.getAttribute('href');

          // Ignore empty or invalid hrefs
          if (config.ignoreEmpty && (!href || href === '#')) {
            return;
          }

          e.preventDefault();

          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: config.behavior,
              block: config.block
            });

            // Update URL hash without jumping
            if (window.history && window.history.pushState) {
              window.history.pushState(null, null, href);
            }
          }
        };

        // Add event listener
        anchor.addEventListener('click', handler);

        // Store for cleanup
        eventListeners.set(anchor, handler);
      });
    };

    // Execute setup based on document state
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup, { once: true });
    } else {
      setup();
    }
  }

  /**
   * Cleanup function to remove all smooth scroll event listeners
   * Automatically called by cleanup-manager.js and before re-initialization
   */
  function cleanupSmoothScroll() {
    eventListeners.forEach((handler, anchor) => {
      if (anchor && handler) {
        anchor.removeEventListener('click', handler);
      }
    });
    eventListeners.clear();
  }

  // Export functions to global scope
  window.initSmoothScroll = initSmoothScroll;
  window.cleanupSmoothScroll = cleanupSmoothScroll;

  // Auto-initialize on first load (can be disabled by setting data-no-auto-init)
  if (!document.documentElement.hasAttribute('data-no-auto-smooth-scroll')) {
    initSmoothScroll();
  }

})();
