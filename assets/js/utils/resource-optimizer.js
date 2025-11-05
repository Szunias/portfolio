/**
 * Resource Optimizer - Handles dynamic loading and caching of CSS/JS resources
 * Implements intelligent bundling and progressive enhancement
 */

(function() {
  'use strict';

  const ResourceOptimizer = {
    // Cache for loaded resources
    loadedResources: new Set(),

    // Resource priorities
    priorities: {
      critical: ['critical.css', 'performance.js'],
      high: ['main.css', 'main.js'],
      medium: [
        'custom/core/foundations.css',
        'custom/components/navigation.css',
        'custom/components/media-player.css',
        'custom/components/music-experience.css',
        'custom/components/genre-carousel.css',
        'custom/patterns/content-sections.css',
        'custom/patterns/engagement-and-projects.css',
        'custom/patterns/interactive-visuals.css',
        'custom/patterns/professional-profile.css',
        'custom/pages/contact.css',
        'pro-theme.css'
      ],
      low: ['fontawesome-all.min.css', 'global/noscript.css']
    },

    // Connection and device info
    connectionInfo: null,

    init: function() {
      this.detectConnection();
      this.loadCriticalResources();
      this.setupProgressiveLoading();
      this.implementCaching();
    },

    detectConnection: function() {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      this.connectionInfo = {
        effectiveType: connection ? connection.effectiveType : '4g',
        downlink: connection ? connection.downlink : 10,
        saveData: connection ? connection.saveData : false,
        rtt: connection ? connection.rtt : 50
      };

      // Adjust loading strategy based on connection
      if (this.connectionInfo.saveData || this.connectionInfo.effectiveType === '2g') {
        this.enableDataSaver();
      }
    },

    enableDataSaver: function() {
      // Data saver mode enabled

      // Disable non-essential animations
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        .bg-orbs, .bg-waves, .bg-eq { display: none !important; }
        video { display: none !important; }
      `;
      document.head.appendChild(style);

      // Skip heavy resources
      this.priorities.low = [];
    },

    loadCriticalResources: function() {
      // Load critical CSS inline if not already present
      if (!document.querySelector('link[href*="critical.css"]')) {
        this.loadCSS('assets/css/critical.css', true);
      }

      // Preload critical JS
      this.priorities.critical.forEach(resource => {
        if (resource.endsWith('.js')) {
          this.preloadScript(resource);
        }
      });
    },

    setupProgressiveLoading: function() {
      // Load resources based on priority and user interaction
      this.loadResourcesByPriority('high');

      // Load medium priority on idle
      this.onIdle(() => {
        this.loadResourcesByPriority('medium');
      });

      // Load low priority on user interaction or after delay
      this.onInteraction(() => {
        this.loadResourcesByPriority('low');
      });

      // Fallback: load remaining after 3 seconds
      setTimeout(() => {
        this.loadResourcesByPriority('low');
      }, 3000);
    },

    loadResourcesByPriority: function(priority) {
      const resources = this.priorities[priority] || [];

      resources.forEach(resource => {
        if (this.loadedResources.has(resource)) return;

        if (resource.endsWith('.css')) {
          this.loadCSS(`assets/css/${resource}`);
        } else if (resource.endsWith('.js')) {
          this.loadScript(`assets/js/${resource}`);
        }
      });
    },

    loadCSS: function(href, critical = false) {
      if (this.loadedResources.has(href)) return;

      const link = document.createElement('link');
      link.rel = critical ? 'stylesheet' : 'preload';
      link.as = critical ? undefined : 'style';
      link.href = href;
      link.onload = () => {
        if (!critical) {
          link.rel = 'stylesheet';
        }
        this.loadedResources.add(href);
      };

      // Add to head
      const insertBefore = critical ?
        document.head.firstChild :
        document.head.querySelector('link[rel="stylesheet"]:last-of-type');

      document.head.insertBefore(link, insertBefore ? insertBefore.nextSibling : null);
    },

    loadScript: function(src) {
      if (this.loadedResources.has(src)) return;

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          this.loadedResources.add(src);
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    preloadScript: function(src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = `assets/js/${src}`;
      document.head.appendChild(link);
    },

    implementCaching: function() {
      // Service Worker for advanced caching (if supported)
      if ('serviceWorker' in navigator) {
        this.registerServiceWorker();
      }

      // Local Storage caching for small resources
      this.setupLocalStorageCache();
    },

    registerServiceWorker: function() {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      }).then(registration => {
        // ServiceWorker registered successfully
      }).catch(error => {
        // ServiceWorker registration failed
      });
    },

    setupLocalStorageCache: function() {
      // Cache small CSS/JS files in localStorage for instant loading
      const cacheableResources = [
        'assets/css/critical.css',
        'assets/js/performance.js'
      ];

      cacheableResources.forEach(resource => {
        this.cacheResourceInLocalStorage(resource);
      });
    },

    cacheResourceInLocalStorage: function(url) {
      const cacheKey = `cache_${url}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        // Use cached version
        this.injectCachedResource(url, cached);
      } else {
        // Fetch and cache
        fetch(url)
          .then(response => response.text())
          .then(content => {
            try {
              localStorage.setItem(cacheKey, content);
              this.injectCachedResource(url, content);
            } catch (e) {
              // Storage quota exceeded, fallback to normal loading
              // Storage quota exceeded, using normal loading
            }
          })
          .catch(() => {
            // Fetch failed, load normally
            if (url.endsWith('.css')) {
              this.loadCSS(url);
            } else if (url.endsWith('.js')) {
              this.loadScript(url);
            }
          });
      }
    },

    injectCachedResource: function(url, content) {
      if (url.endsWith('.css')) {
        const style = document.createElement('style');
        style.textContent = content;
        document.head.appendChild(style);
      } else if (url.endsWith('.js')) {
        const script = document.createElement('script');
        script.textContent = content;
        document.head.appendChild(script);
      }

      this.loadedResources.add(url);
    },

    onIdle: function(callback) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 2000 });
      } else {
        setTimeout(callback, 1000);
      }
    },

    onInteraction: function(callback) {
      const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
      const fired = { value: false };

      const handler = () => {
        if (fired.value) return;
        fired.value = true;

        events.forEach(event => {
          document.removeEventListener(event, handler, { passive: true });
        });

        callback();
      };

      events.forEach(event => {
        document.addEventListener(event, handler, { passive: true });
      });
    },

    // Resource bundling for production
    createBundle: function(resources) {
      const bundle = {
        css: '',
        js: ''
      };

      return Promise.all(
        resources.map(resource =>
          fetch(resource).then(r => r.text())
        )
      ).then(contents => {
        contents.forEach((content, index) => {
          const resource = resources[index];
          if (resource.endsWith('.css')) {
            bundle.css += content + '\n';
          } else if (resource.endsWith('.js')) {
            bundle.js += content + '\n';
          }
        });

        return bundle;
      });
    },

    // Performance monitoring
    measureResourceTiming: function() {
      if (!('performance' in window)) return;

      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(r => r.duration > 1000);

        if (slowResources.length > 0) {
          // Slow loading resources detected
        }

        // Log largest contentful paint
        if ('LargestContentfulPaint' in window) {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            // LCP measurement recorded
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        }
      }, 1000);
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ResourceOptimizer.init();
      ResourceOptimizer.measureResourceTiming();
    });
  } else {
    ResourceOptimizer.init();
    ResourceOptimizer.measureResourceTiming();
  }

  // Expose globally
  window.ResourceOptimizer = ResourceOptimizer;

})();
