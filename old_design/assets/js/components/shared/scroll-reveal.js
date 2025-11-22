/**
 * Shared Scroll Reveal Module
 * Unified scroll reveal animation for all pages
 *
 * Usage:
 * 1. Add class 'fade-in' to elements you want to animate
 * 2. Call initScrollReveal() when page loads or after AJAX navigation
 * 3. Observers are automatically tracked for cleanup
 */

(function () {
  'use strict';

  // Default configuration
  const DEFAULT_OPTIONS = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    selector: '.fade-in',
    unobserveAfterReveal: true
  };

  /**
   * Initialize scroll reveal animations
   * @param {Object} options - Configuration options
   * @param {number} options.threshold - Intersection threshold (0-1)
   * @param {string} options.rootMargin - Root margin for observer
   * @param {string} options.selector - CSS selector for elements to observe
   * @param {boolean} options.unobserveAfterReveal - Whether to unobserve after reveal
   * @param {string} options.observerArrayName - Name of global observer array (auto-generated if not provided)
   */
  function initScrollReveal(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };

    // Determine which page we're on and use appropriate observer array
    const pageName = determinePageName();
    const observerArrayName = config.observerArrayName || `__${pageName}PageObservers`;

    // Initialize observer array if it doesn't exist
    if (!window[observerArrayName]) {
      window[observerArrayName] = [];
    }

    const setup = () => {
      const observerOptions = {
        threshold: config.threshold,
        rootMargin: config.rootMargin
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (config.unobserveAfterReveal) {
              observer.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);

      // Track observer for cleanup
      window[observerArrayName].push(observer);

      // Observe all matching elements
      const elements = document.querySelectorAll(config.selector);
      elements.forEach((el) => observer.observe(el));

      // Return observer for manual control if needed
      return observer;
    };

    // Execute setup based on document state
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup, { once: true });
    } else {
      return setup();
    }
  }

  /**
   * Determine current page name for observer array naming
   * @returns {string} Page name (index, about, projects, music, contact)
   */
  function determinePageName() {
    const path = window.location.pathname;

    if (path === '/' || path.includes('index.html')) return 'index';
    if (path.includes('about')) return 'about';
    if (path.includes('projects')) return 'projects';
    if (path.includes('music')) return 'music';
    if (path.includes('contact')) return 'contact';

    return 'index'; // Default fallback
  }

  /**
   * Cleanup function to disconnect all scroll reveal observers
   * Automatically called by cleanup-manager.js
   */
  function cleanupScrollReveal() {
    const pageName = determinePageName();
    const observerArrayName = `__${pageName}PageObservers`;

    if (window[observerArrayName]) {
      window[observerArrayName].forEach((observer) => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      });
      window[observerArrayName] = [];
    }
  }

  // Export functions to global scope
  window.initScrollReveal = initScrollReveal;
  window.cleanupScrollReveal = cleanupScrollReveal;

  // Auto-initialize on first load (can be disabled by setting data-no-auto-init)
  if (!document.documentElement.hasAttribute('data-no-auto-scroll-reveal')) {
    initScrollReveal();
  }

})();
