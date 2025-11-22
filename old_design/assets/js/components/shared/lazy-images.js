/**
 * Shared Lazy Images Module
 * Unified image lazy loading and fallback handling for all pages
 *
 * Features:
 * 1. Lazy loading with IntersectionObserver (data-src → src)
 * 2. Image fallback on error (data-fallback)
 * 3. Prevents duplicate loading
 *
 * Usage:
 * - For lazy loading: <img data-src="image.jpg" class="lazy-img" />
 * - For fallback: <img src="main.jpg" data-fallback="backup.jpg" />
 * - Call initLazyImages() when page loads or after AJAX navigation
 */

(function () {
  'use strict';

  // Default configuration
  const DEFAULT_OPTIONS = {
    lazySelector: 'img.lazy-img[data-src]',
    fallbackSelector: 'img[data-fallback]',
    threshold: 0.1,
    rootMargin: '50px'
  };

  // Store observers for cleanup
  const observers = [];

  /**
   * Initialize lazy image loading with IntersectionObserver
   * @param {Object} options - Configuration options
   */
  function initLazyImages(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };

    const setup = () => {
      // 1. Initialize lazy loading with data-src
      initLazyLoading(config);

      // 2. Initialize fallback handling with data-fallback
      initFallbackHandling(config);
    };

    // Execute setup based on document state
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup, { once: true });
    } else {
      setup();
    }
  }

  /**
   * Initialize lazy loading for images with data-src attribute
   * @param {Object} config - Configuration
   */
  function initLazyLoading(config) {
    const lazyImages = document.querySelectorAll(config.lazySelector);

    if (lazyImages.length === 0) return;

    // Feature detection
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(loadImageImmediately);
      return;
    }

    const observerOptions = {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;

          // Skip if already loaded by another system
          if (img.dataset.lazyLoaded === 'true') {
            observer.unobserve(img);
            return;
          }

          // Mark as loading to prevent duplicate loads
          img.dataset.lazyLoaded = 'true';

          // Load the image
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          // Unobserve after loading
          observer.unobserve(img);
        }
      });
    }, observerOptions);

    // Track observer for cleanup
    observers.push(observer);

    // Observe all lazy images
    lazyImages.forEach((img) => {
      // Skip if already loaded
      if (img.dataset.lazyLoaded !== 'true') {
        observer.observe(img);
      }
    });
  }

  /**
   * Initialize fallback handling for images with data-fallback attribute
   * @param {Object} config - Configuration
   */
  function initFallbackHandling(config) {
    const fallbackImages = document.querySelectorAll(config.fallbackSelector);

    fallbackImages.forEach((img) => {
      // Skip if already has error handler
      if (img.dataset.fallbackInitialized === 'true') {
        return;
      }

      img.addEventListener('error', function () {
        const fallback = this.getAttribute('data-fallback');

        // Only use fallback if available and not already using it
        if (fallback && this.src !== fallback) {
          this.src = fallback;
        }
      }, { once: true });

      // Mark as initialized
      img.dataset.fallbackInitialized = 'true';
    });
  }

  /**
   * Load image immediately (fallback for browsers without IntersectionObserver)
   * @param {HTMLImageElement} img - Image element
   */
  function loadImageImmediately(img) {
    if (img.dataset.lazyLoaded === 'true') return;

    img.dataset.lazyLoaded = 'true';
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
  }

  /**
   * Cleanup function to disconnect all lazy image observers
   * Automatically called by cleanup-manager.js
   */
  function cleanupLazyImages() {
    observers.forEach((observer) => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    observers.length = 0; // Clear array
  }

  // Export functions to global scope
  window.initLazyImages = initLazyImages;
  window.cleanupLazyImages = cleanupLazyImages;

  // Auto-initialize on first load (can be disabled by setting data-no-auto-init)
  if (!document.documentElement.hasAttribute('data-no-auto-lazy-images')) {
    initLazyImages();
  }

})();
