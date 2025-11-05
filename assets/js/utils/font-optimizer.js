/**
 * Font Loading Optimization
 * Implements advanced font loading strategies with fallbacks and preloading
 */

(function() {
  'use strict';

  const FontOptimizer = {
    // Font configurations
    fonts: {
      primary: {
        family: 'Spline Sans',
        weights: [300, 400, 600, 700],
        fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'swap'
      },
      heading: {
        family: 'Outfit',
        weights: [600, 700, 800],
        fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'swap'
      }
    },

    // Font loading state
    loadingState: {
      loaded: new Set(),
      failed: new Set(),
      loading: new Set()
    },

    // Performance settings
    settings: {
      preloadCritical: true,
      enableSubsetLoading: true,
      fontTimeout: 3000, // 3 seconds
      enableFontDisplay: true
    },

    init: function() {
      this.detectFontSupport();
      this.setupFontFaces();
      this.preloadCriticalFonts();
      this.setupFontLoadingStrategy();
      this.addFontLoadingCSS();
    },

    detectFontSupport: function() {
      // Check for font loading API support
      this.supportsNativeFontLoading = 'fonts' in document;

      // Check for variable font support
      this.supportsVariableFonts = CSS.supports && CSS.supports('font-variation-settings', '"wght" 400');

      // Check for font-display support
      this.supportsFontDisplay = CSS.supports && CSS.supports('font-display', 'swap');

      // Font support detected
        fontDisplay: this.supportsFontDisplay
      });
    },

    setupFontFaces: function() {
      // Generate CSS for font faces with optimized loading
      const fontCSS = this.generateFontCSS();

      // Inject font CSS
      const style = document.createElement('style');
      style.id = 'font-optimizer-css';
      style.textContent = fontCSS;
      document.head.appendChild(style);
    },

    generateFontCSS: function() {
      let css = '';

      Object.entries(this.fonts).forEach(([key, font]) => {
        font.weights.forEach(weight => {
          css += this.generateFontFace(font.family, weight, font.display);
        });
      });

      return css;
    },

    generateFontFace: function(family, weight, display = 'swap') {
      const familySlug = family.toLowerCase().replace(/\s+/g, '-');
      const baseUrl = 'https://fonts.gstatic.com/s';

      return `
        @font-face {
          font-family: '${family}';
          font-style: normal;
          font-weight: ${weight};
          font-display: ${display};
          src: local('${family} ${weight}'),
               local('${family}-${weight}'),
               url('${baseUrl}/${familySlug}/v1/${familySlug}-${weight}-latin.woff2') format('woff2'),
               url('${baseUrl}/${familySlug}/v1/${familySlug}-${weight}-latin.woff') format('woff');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
      `;
    },

    preloadCriticalFonts: function() {
      if (!this.settings.preloadCritical) return;

      // Preload most important font weights
      const criticalFonts = [
        { family: 'Spline Sans', weight: 400 },
        { family: 'Outfit', weight: 700 }
      ];

      criticalFonts.forEach(font => {
        this.preloadFont(font.family, font.weight);
      });
    },

    preloadFont: function(family, weight) {
      const familySlug = family.toLowerCase().replace(/\s+/g, '-');
      const href = `https://fonts.gstatic.com/s/${familySlug}/v1/${familySlug}-${weight}-latin.woff2`;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;

      document.head.appendChild(link);

      // Preloading font
    },

    setupFontLoadingStrategy: function() {
      if (this.supportsNativeFontLoading) {
        this.useNativeFontLoading();
      } else {
        this.useFallbackFontLoading();
      }
    },

    useNativeFontLoading: function() {
      Object.entries(this.fonts).forEach(([key, font]) => {
        font.weights.forEach(weight => {
          const fontFace = new FontFace(
            font.family,
            `url(https://fonts.gstatic.com/s/${font.family.toLowerCase().replace(/\s+/g, '-')}/v1/${font.family.toLowerCase().replace(/\s+/g, '-')}-${weight}-latin.woff2)`,
            {
              weight: weight.toString(),
              display: font.display
            }
          );

          this.loadingState.loading.add(`${font.family}-${weight}`);

          fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont);
            this.loadingState.loaded.add(`${font.family}-${weight}`);
            this.loadingState.loading.delete(`${font.family}-${weight}`);
            this.onFontLoaded(font.family, weight);
          }).catch(error => {
            this.loadingState.failed.add(`${font.family}-${weight}`);
            this.loadingState.loading.delete(`${font.family}-${weight}`);
            this.onFontFailed(font.family, weight, error);
          });
        });
      });

      // Set timeout for font loading
      setTimeout(() => {
        this.onFontLoadingTimeout();
      }, this.settings.fontTimeout);
    },

    useFallbackFontLoading: function() {
      // Fallback method using CSS and DOM observation
      const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';

      Object.entries(this.fonts).forEach(([key, font]) => {
        font.weights.forEach(weight => {
          this.testFontLoading(font.family, weight, testString);
        });
      });
    },

    testFontLoading: function(family, weight, testString) {
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        visibility: hidden;
        white-space: nowrap;
        font-size: 72px;
        font-weight: ${weight};
      `;

      const fallbackSpan = document.createElement('span');
      fallbackSpan.style.fontFamily = 'monospace';
      fallbackSpan.textContent = testString;

      const testSpan = document.createElement('span');
      testSpan.style.fontFamily = `"${family}", monospace`;
      testSpan.textContent = testString;

      container.appendChild(fallbackSpan);
      container.appendChild(testSpan);
      document.body.appendChild(container);

      const fallbackWidth = fallbackSpan.offsetWidth;
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals

      const checkFont = () => {
        attempts++;
        const testWidth = testSpan.offsetWidth;

        if (testWidth !== fallbackWidth) {
          // Font has loaded
          document.body.removeChild(container);
          this.loadingState.loaded.add(`${family}-${weight}`);
          this.onFontLoaded(family, weight);
        } else if (attempts >= maxAttempts) {
          // Timeout
          document.body.removeChild(container);
          this.loadingState.failed.add(`${family}-${weight}`);
          this.onFontFailed(family, weight, new Error('Font loading timeout'));
        } else {
          setTimeout(checkFont, 100);
        }
      };

      setTimeout(checkFont, 100);
    },

    onFontLoaded: function(family, weight) {
      // Font loaded successfully

      // Update CSS classes for progressive enhancement
      document.documentElement.classList.add(`font-${family.toLowerCase().replace(/\s+/g, '-')}-${weight}-loaded`);

      // Check if all critical fonts are loaded
      this.checkCriticalFontsLoaded();
    },

    onFontFailed: function(family, weight, error) {
      // Font failed to load

      // Ensure fallback fonts are applied
      document.documentElement.classList.add('fonts-fallback');
    },

    onFontLoadingTimeout: function() {
      // Font loading timeout reached

      // Apply fallback class
      document.documentElement.classList.add('fonts-timeout');

      // Stop loading fonts that are still in progress
      this.loadingState.loading.forEach(fontKey => {
        this.loadingState.failed.add(fontKey);
      });
      this.loadingState.loading.clear();
    },

    checkCriticalFontsLoaded: function() {
      const criticalFonts = ['Spline Sans-400', 'Outfit-700'];
      const allCriticalLoaded = criticalFonts.every(font =>
        this.loadingState.loaded.has(font)
      );

      if (allCriticalLoaded) {
        document.documentElement.classList.add('critical-fonts-loaded');
        // All critical fonts loaded
      }
    },

    addFontLoadingCSS: function() {
      const css = `
        /* Font loading states */
        html {
          font-family: ${this.fonts.primary.fallback};
        }

        /* Hide text until fonts load (optional - remove if FOIT is undesirable) */
        .font-loading {
          visibility: hidden;
        }

        /* Progressive enhancement classes */
        .critical-fonts-loaded {
          font-family: "${this.fonts.primary.family}", ${this.fonts.primary.fallback};
        }

        .critical-fonts-loaded h1,
        .critical-fonts-loaded h2,
        .critical-fonts-loaded h3,
        .critical-fonts-loaded h4,
        .critical-fonts-loaded h5,
        .critical-fonts-loaded h6 {
          font-family: "${this.fonts.heading.family}", ${this.fonts.heading.fallback};
        }

        /* Fallback state */
        .fonts-fallback,
        .fonts-timeout {
          font-family: ${this.fonts.primary.fallback};
        }

        .fonts-fallback h1,
        .fonts-fallback h2,
        .fonts-fallback h3,
        .fonts-timeout h1,
        .fonts-timeout h2,
        .fonts-timeout h3 {
          font-family: ${this.fonts.heading.fallback};
        }

        /* Smooth transitions when fonts load */
        body,
        h1, h2, h3, h4, h5, h6 {
          transition: font-family 0.2s ease-out;
        }

        /* Reduce layout shift */
        @media (prefers-reduced-motion: no-preference) {
          .critical-fonts-loaded * {
            transition: font-family 0.1s ease-out;
          }
        }
      `;

      const style = document.createElement('style');
      style.id = 'font-loading-css';
      style.textContent = css;
      document.head.appendChild(style);
    },

    // Public API
    loadFont: function(family, weight) {
      const fontKey = `${family}-${weight}`;

      if (this.loadingState.loaded.has(fontKey)) {
        return Promise.resolve();
      }

      if (this.loadingState.failed.has(fontKey)) {
        return Promise.reject(new Error('Font previously failed to load'));
      }

      if (this.loadingState.loading.has(fontKey)) {
        // Return a promise that resolves when the font loads
        return new Promise((resolve, reject) => {
          const checkLoaded = () => {
            if (this.loadingState.loaded.has(fontKey)) {
              resolve();
            } else if (this.loadingState.failed.has(fontKey)) {
              reject(new Error('Font failed to load'));
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        });
      }

      // Start loading the font
      this.preloadFont(family, weight);
      return this.loadFont(family, weight);
    },

    getFontLoadingState: function() {
      return {
        loaded: Array.from(this.loadingState.loaded),
        failed: Array.from(this.loadingState.failed),
        loading: Array.from(this.loadingState.loading)
      };
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FontOptimizer.init());
  } else {
    FontOptimizer.init();
  }

  // Expose globally
  window.FontOptimizer = FontOptimizer;

})();