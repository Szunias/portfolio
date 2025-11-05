/**
 * Performance optimizations and prefetching system
 * Implements intelligent page preloading on hover and various performance enhancements
 */

(function() {
  'use strict';

  // Performance utilities
  const perf = {
    // Throttle function for scroll events
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    },

    // Debounce function for search/input events
    debounce: function(func, wait, immediate) {
      let timeout;
      return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    // Request idle callback polyfill
    requestIdleCallback: window.requestIdleCallback || function(cb) {
      const start = Date.now();
      return setTimeout(function() {
        cb({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    },

    // Cancel idle callback polyfill
    cancelIdleCallback: window.cancelIdleCallback || function(id) {
      clearTimeout(id);
    }
  };

  // Intelligent prefetching system
  const prefetcher = {
    cache: new Set(),
    hoverTimeout: null,
    prefetchDelay: 100, // ms to wait before prefetching on hover

    init: function() {
      // Only enable on fast connections and non-mobile
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const isSlowConnection = connection && (connection.saveData || /(2g|slow)/i.test(connection.effectiveType));
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
      
      if (isSlowConnection || isMobile) {
        // Prefetching disabled: slow connection or mobile device
        return;
      }

      this.attachHoverListeners();
      this.prefetchCriticalResources();
    },

    attachHoverListeners: function() {
      // Use event delegation for better performance
      document.addEventListener('mouseover', this.handleMouseOver.bind(this), { passive: true });
      document.addEventListener('mouseout', this.handleMouseOut.bind(this), { passive: true });
    },

    handleMouseOver: function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!this.shouldPrefetch(href)) return;

      // Clear any existing timeout
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }

      // Set timeout to prefetch after hover delay
      this.hoverTimeout = setTimeout(() => {
        this.prefetchPage(href);
      }, this.prefetchDelay);
    },

    handleMouseOut: function(e) {
      // Cancel prefetch if user moves away quickly
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    },

    shouldPrefetch: function(href) {
      if (!href || href === '#' || href.startsWith('#')) return false;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      if (href.startsWith('http') && !href.includes(location.hostname)) return false;
      if (this.cache.has(href)) return false;
      
      // Only prefetch local HTML pages
      const isLocal = !href.startsWith('http') || href.includes(location.hostname);
      const isHtml = href.endsWith('.html') || (!href.includes('.') && !href.includes('?'));
      
      return isLocal && isHtml;
    },

    prefetchPage: function(href) {
      if (this.cache.has(href)) return;
      
      this.cache.add(href);
      
      // Use different strategies based on browser support
      if (this.supportsDNSPrefetch()) {
        this.createPrefetchLink(href, 'prefetch');
      } else {
        // Fallback: invisible iframe preload
        this.createInvisiblePreload(href);
      }

      // Prefetching resource
    },

    supportsDNSPrefetch: function() {
      const link = document.createElement('link');
      return 'relList' in link && link.relList.supports && link.relList.supports('prefetch');
    },

    createPrefetchLink: function(href, rel = 'prefetch') {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.as = 'document';
      
      // Remove link after a while to avoid memory leaks
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 30000);
      
      document.head.appendChild(link);
    },

    createInvisiblePreload: function(href) {
      // Use fetch to preload the page content
      const requestIdleCallback = window.requestIdleCallback || function(cb) {
        setTimeout(cb, 0);
      };
      requestIdleCallback(() => {
        fetch(href, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'force-cache'
        }).catch(() => {
          // Silently fail - prefetching is optional
        });
      });
    },

    prefetchCriticalResources: function() {
      // Prefetch common pages that users are likely to visit
      const criticalPages = ['/about.html', '/projects/', '/music.html', '/contact.html'];
      
      const self = this;
      const requestIdleCallback = window.requestIdleCallback || function(cb) {
        setTimeout(cb, 0);
      };
      requestIdleCallback(() => {
        criticalPages.forEach((page, index) => {
          setTimeout(() => {
            if (!self.cache.has(page)) {
              self.prefetchPage(page);
            }
          }, index * 500); // Stagger the prefetching
        });
      });
    }
  };

  // Image lazy loading optimization
  const imageOptimizer = {
    observer: null,

    init: function() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
          rootMargin: '50px 0px',
          threshold: 0.1
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
          this.observer.observe(img);
        });
      } else {
        // Fallback for older browsers
        this.loadAllImages();
      }
    },

    handleIntersection: function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.observer.unobserve(img);
        }
      });
    },

    loadImage: function(img) {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    },

    loadAllImages: function() {
      document.querySelectorAll('img[data-src]').forEach(this.loadImage);
    }
  };

  // DOM optimization utilities
  const domOptimizer = {
    // Cache frequently used elements
    cache: new Map(),

    get: function(selector) {
      if (!this.cache.has(selector)) {
        this.cache.set(selector, document.querySelector(selector));
      }
      return this.cache.get(selector);
    },

    getAll: function(selector) {
      if (!this.cache.has(selector + '_all')) {
        this.cache.set(selector + '_all', Array.from(document.querySelectorAll(selector)));
      }
      return this.cache.get(selector + '_all');
    },

    // Batch DOM updates
    batchUpdate: function(callback) {
      const requestIdleCallback = window.requestIdleCallback || function(cb) {
        setTimeout(cb, 0);
      };
      requestIdleCallback(() => {
        requestAnimationFrame(callback);
      });
    }
  };

  // Initialize performance optimizations
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize modules
    prefetcher.init();
    imageOptimizer.init();

    // Expose utilities globally for other scripts
    window.PerfUtils = {
      throttle: perf.throttle,
      debounce: perf.debounce,
      requestIdleCallback: window.requestIdleCallback || function(cb) { setTimeout(cb, 0); },
      domCache: domOptimizer
    };

    // Performance optimizations initialized
  }

  // Start initialization
  init();

})();
