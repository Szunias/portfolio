/**
 * Advanced Image Optimization and Lazy Loading
 * Optimizes image loading with WebP support, responsive sizing, and compression
 */

(function() {
  'use strict';

  const ImageOptimizer = {
    // WebP support detection
    supportsWebP: null,

    // Intersection Observer for lazy loading
    observer: null,

    // Image format preferences (best to worst)
    formats: ['webp', 'jpg', 'jpeg', 'png'],

    init: function() {
      // Apply attribute optimizations as early as possible
      this.adjustAttributes();
      this.preloadAboveTheFold();

      this.detectWebPSupport().then(supported => {
        this.supportsWebP = supported;
        // IntersectionObserver-based lazy loading for opt-in images
        this.setupLazyLoading();
        // Nice loading states for all images
        this.optimizeExistingImages();
        // Optional responsive support via data-responsive
        this.addResponsiveImageSupport();
      });
    },

    detectWebPSupport: function() {
      return new Promise(resolve => {
        const webP = new Image();
        webP.onload = webP.onerror = function() {
          resolve(webP.height === 2);
        };
        webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
      });
    },

    setupLazyLoading: function() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        this.loadAllImages();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        // Load images 100px before they enter viewport
        rootMargin: '100px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src
      this.observeImages();
    },

    observeImages: function() {
      // Only observe images specifically marked for lazy loading, exclude critical images
      const images = document.querySelectorAll('img[data-src]:not(.slider img):not(.cv-logo), img[data-srcset]:not(.slider img):not(.cv-logo)');
      images.forEach(img => {
        this.observer.observe(img);
        // Add loading placeholder
        this.addLoadingPlaceholder(img);
      });
    },

    addLoadingPlaceholder: function(img) {
      if (!img.src && !img.classList.contains('has-placeholder')) {
        // Create a tiny, lightweight placeholder
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo=';
        img.classList.add('has-placeholder', 'loading');
      }
    },

    loadImage: function(img) {
      const dataSrc = img.getAttribute('data-src');
      const dataSrcset = img.getAttribute('data-srcset');

      if (dataSrcset) {
        img.srcset = dataSrcset;
      }

      if (dataSrc) {
        // Check if we should use WebP version
        const optimizedSrc = this.getOptimizedImageSrc(dataSrc, img);

        // Preload the image to avoid flash
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = optimizedSrc;
          img.classList.remove('loading');
          img.classList.add('loaded');

          // Clean up data attributes
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
        };

        tempImg.onerror = () => {
          // Fallback to original source
          img.src = dataSrc;
          img.classList.remove('loading');
          img.classList.add('loaded');
        };

        tempImg.src = optimizedSrc;
      }
    },

    getOptimizedImageSrc: function(originalSrc, imgEl) {
      if (!this.supportsWebP) return originalSrc;
      // Only attempt WebP if we explicitly marked the element with data-has-webp
      if (!imgEl || imgEl.getAttribute('data-has-webp') !== 'true') return originalSrc;

      // Try to get WebP version
      const extension = originalSrc.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png'].includes(extension)) {
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return webpSrc;
      }

      return originalSrc;
    },

    // Ensure offscreen images are deprioritized and on-screen prioritized
    adjustAttributes: function() {
      const imgs = Array.from(document.querySelectorAll('img'));
      if (!imgs.length) return;

      // Find first visible image to treat as hero
      let heroAssigned = false;
      const vh = window.innerHeight || 800;

      imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isVisible = rect.top < vh * 0.9 && rect.bottom > 0;

        // Force lazy for offscreen images
        if (!isVisible) {
          if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
          try { img.fetchPriority = 'low'; } catch(_) {}
          img.setAttribute('fetchpriority', 'low');
        } else {
          // First visible becomes hero
          if (!heroAssigned) {
            img.classList.add('critical-image');
            img.setAttribute('loading', 'eager');
            try { img.fetchPriority = 'high'; } catch(_) {}
            img.setAttribute('fetchpriority', 'high');
            heroAssigned = true;
          } else {
            // Other visible images can still be async-decoded
            if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
          }
        }

        // Ensure slider non-active slides are lazy
        if (img.closest('.slide') && !img.closest('.slide').classList.contains('active')) {
          img.setAttribute('loading', 'lazy');
          try { img.fetchPriority = 'low'; } catch(_) {}
          img.setAttribute('fetchpriority', 'low');
        }
      });
    },

    // Preload hero/critical images to speed up visual readiness
    preloadAboveTheFold: function() {
      const firstCritical = document.querySelector('.critical-image');
      if (!firstCritical) return;
      const src = firstCritical.currentSrc || firstCritical.src;
      if (!src) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    },

    optimizeExistingImages: function() {
      // Add loading states and optimize existing images (exclude critical images)
      const images = document.querySelectorAll('img:not([data-src]):not([data-srcset]):not(.slider img):not(.cv-logo)');

      images.forEach(img => {
        if (!img.complete) {
          img.classList.add('loading');

          img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
          };
        } else {
          img.classList.add('loaded');
        }
      });
    },

    addResponsiveImageSupport: function() {
      // Add responsive loading based on device capabilities
      const images = document.querySelectorAll('img[data-responsive]');

      images.forEach(img => {
        const baseSrc = img.getAttribute('data-responsive');
        if (!baseSrc) return;

        let suffix = '';

        // Determine appropriate image size based on device
        const density = window.devicePixelRatio || 1;
        const width = window.innerWidth;

        if (width <= 480) {
          suffix = '_small';
        } else if (width <= 768) {
          suffix = '_medium';
        } else if (width <= 1200) {
          suffix = '_large';
        } else {
          suffix = '_xlarge';
        }

        // Apply retina suffix if needed
        if (density > 1.5) {
          suffix += '@2x';
        }

        const extension = baseSrc.split('.').pop();
        const nameWithoutExt = baseSrc.replace('.' + extension, '');
        const responsiveSrc = `${nameWithoutExt}${suffix}.${extension}`;

        img.setAttribute('data-src', responsiveSrc);
      });
    },

    loadAllImages: function() {
      // Fallback for browsers without IntersectionObserver
      const images = document.querySelectorAll('img[data-src], img[data-srcset]');
      images.forEach(img => this.loadImage(img));
    },

    // Progressive enhancement for critical images
    preloadCriticalImages: function(selector = '.critical-image') {
      const criticalImages = document.querySelectorAll(selector);

      criticalImages.forEach(img => {
        const src = img.getAttribute('data-src') || img.src;
        if (src) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        }
      });
    }
  };

  // CSS for loading states
  const style = document.createElement('style');
  style.textContent = `
    img.loading {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading-shimmer 1.5s infinite;
    }

    img.loaded {
      transition: opacity 0.3s ease-in-out;
    }

    @keyframes loading-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Dark theme adjustments */
    [data-theme="dark"] img.loading {
      background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
      background-size: 200% 100%;
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ImageOptimizer.init());
  } else {
    ImageOptimizer.init();
  }

  // Expose globally
  window.ImageOptimizer = ImageOptimizer;

})();
