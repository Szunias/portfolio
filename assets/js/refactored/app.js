/**
 * Main Application Entry Point
 * Initializes all core services and components
 *
 * @module app
 * @example
 * import { app } from './app.js';
 *
 * await app.init({
 *   analyticsId: 'G-XXXXXXXXXX',
 *   defaultLanguage: 'en'
 * });
 */

import { EventEmitter } from './core/EventEmitter.js';
import { translationService } from './services/TranslationService.js';
import { analyticsService } from './services/AnalyticsService.js';
import { Navigation } from './components/Navigation.js';
import { toast } from './components/Toast.js';

/**
 * Application Class
 * Main application controller that manages initialization and lifecycle
 *
 * @class App
 * @extends EventEmitter
 */
class App extends EventEmitter {
  constructor() {
    super();

    /**
     * Whether app is initialized
     * @type {boolean}
     */
    this.isInitialized = false;

    /**
     * App configuration
     * @type {Object}
     */
    this.config = {};

    /**
     * Initialized components
     * @type {Map<string, Object>}
     */
    this.components = new Map();

    /**
     * Services
     * @type {Object}
     */
    this.services = {
      translation: translationService,
      analytics: analyticsService
    };
  }

  /**
   * Debug logging helper
   * Only logs when debugMode is enabled
   * @private
   * @param {...any} args - Arguments to log
   */
  _log(...args) {
    if (this.config.debugMode) {
      console.log(...args);
    }
  }

  /**
   * Initialize the application
   *
   * @param {Object} options - Configuration options
   * @param {string} options.analyticsId - Google Analytics Measurement ID
   * @param {string} options.defaultLanguage - Default language (en, pl, nl)
   * @param {boolean} options.enableAnalytics - Enable analytics (default: true)
   * @param {boolean} options.debugMode - Enable debug mode (default: false)
   * @returns {Promise<void>}
   * @example
   * await app.init({
   *   analyticsId: 'G-XXXXXXXXXX',
   *   defaultLanguage: 'en',
   *   enableAnalytics: true,
   *   debugMode: false
   * });
   */
  async init(options = {}) {
    if (this.isInitialized) {
      console.warn('[App] Already initialized');
      return;
    }

    const startTime = performance.now();

    try {
      // Merge options with defaults
      this.config = {
        analyticsId: options.analyticsId || null,
        defaultLanguage: options.defaultLanguage || 'en',
        enableAnalytics: options.enableAnalytics !== false,
        debugMode: options.debugMode || false,
        ...options
      };

      this._log('[App] Initializing application...');

      // Initialize services in parallel
      await this._initializeServices();

      // Initialize core components
      await this._initializeComponents();

      // Setup global error handling
      this._setupErrorHandling();

      // Setup performance monitoring
      this._setupPerformanceMonitoring();

      // Mark app as initialized
      this.isInitialized = true;

      const initTime = Math.round(performance.now() - startTime);

      this.emit('initialized', {
        initTime,
        config: this.config
      });

      this._log(`[App] Initialization complete in ${initTime}ms`);

      // Track initialization in analytics
      if (this.config.enableAnalytics) {
        analyticsService.trackPerformance('app_init_time', initTime, 'ms');
      }

      // Show welcome notification in debug mode
      if (this.config.debugMode) {
        toast.info(`App initialized in ${initTime}ms`, {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('[App] Initialization failed:', error);

      // Show error toast
      toast.error('Failed to initialize application. Please refresh the page.');

      this.emit('error', { error, phase: 'initialization' });

      throw error;
    }
  }

  /**
   * Initialize all services
   *
   * @private
   * @returns {Promise<void>}
   */
  async _initializeServices() {
    this._log('[App] Initializing services...');

    // Initialize translation service
    await translationService.init();

    // Initialize analytics if enabled
    if (this.config.enableAnalytics && this.config.analyticsId) {
      try {
        await analyticsService.init(this.config.analyticsId, {
          debug: this.config.debugMode,
          anonymizeIp: true
        });

        // Set initial consent (can be updated based on cookie consent banner)
        analyticsService.setConsent(true);

        // Track initial page view
        analyticsService.trackPageView(
          window.location.pathname,
          document.title
        );
      } catch (error) {
        console.error('[App] Analytics initialization failed:', error);
        // Don't fail app initialization if analytics fails
      }
    }

    // Listen for translation service events
    translationService.on('languageChanged', ({ language, previousLanguage }) => {
      // Track language change in analytics
      if (this.config.enableAnalytics) {
        analyticsService.trackLanguageChange(language, previousLanguage);
      }

      // Emit app-level event
      this.emit('languageChanged', { language, previousLanguage });

      // Show notification
      toast.success(`Language changed to ${language.toUpperCase()}`, {
        duration: 2000
      });
    });

    this._log('[App] Services initialized');
  }

  /**
   * Initialize core components
   *
   * @private
   * @returns {Promise<void>}
   */
  async _initializeComponents() {
    this._log('[App] Initializing components...');

    // Initialize Navigation component if header exists
    const headerElement = document.querySelector('.header');
    if (headerElement) {
      const navigation = new Navigation({
        currentLang: translationService.getCurrentLanguage()
      });

      navigation.init();

      // Listen for language changes from navigation
      navigation.on('languageChange', async ({ language }) => {
        try {
          await translationService.changeLanguage(language);
        } catch (error) {
          console.error('[App] Failed to change language:', error);
          toast.error('Failed to change language. Please try again.');
        }
      });

      this.components.set('navigation', navigation);
    }

    this._log('[App] Components initialized');
  }

  /**
   * Setup global error handling
   *
   * @private
   */
  _setupErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[App] Unhandled promise rejection:', event.reason);

      // Track error in analytics
      if (this.config.enableAnalytics) {
        analyticsService.trackError(
          event.reason?.message || 'Unhandled promise rejection',
          'window.unhandledrejection',
          false
        );
      }

      this.emit('error', {
        error: event.reason,
        type: 'unhandled-rejection'
      });

      // Don't show toast for every error in production
      if (this.config.debugMode) {
        toast.error('An error occurred. Check console for details.');
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('[App] Global error:', event.error);

      // Track error in analytics
      if (this.config.enableAnalytics) {
        analyticsService.trackError(
          event.message || 'Global error',
          event.filename || 'unknown',
          false
        );
      }

      this.emit('error', {
        error: event.error,
        type: 'global-error'
      });
    });
  }

  /**
   * Setup performance monitoring
   *
   * @private
   */
  _setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('PerformanceObserver' in window) {
      try {
        // Monitor navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const metrics = {
                domContentLoaded: Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
                loadComplete: Math.round(entry.loadEventEnd - entry.loadEventStart),
                domInteractive: Math.round(entry.domInteractive)
              };

              this._log('[App] Performance metrics:', metrics);

              // Track in analytics
              if (this.config.enableAnalytics) {
                analyticsService.trackPerformance('dom_content_loaded', metrics.domContentLoaded, 'ms');
                analyticsService.trackPerformance('load_complete', metrics.loadComplete, 'ms');
              }

              this.emit('performanceMetrics', metrics);
            }
          }
        });

        navObserver.observe({ entryTypes: ['navigation'] });

        // Monitor largest contentful paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);

          this._log('[App] Largest Contentful Paint:', lcp, 'ms');

          if (this.config.enableAnalytics) {
            analyticsService.trackPerformance('lcp', lcp, 'ms');
          }
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('[App] Performance monitoring setup failed:', error);
      }
    }
  }

  /**
   * Get a component by name
   *
   * @param {string} name - Component name
   * @returns {Object|null} Component instance or null
   * @example
   * const navigation = app.getComponent('navigation');
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }

  /**
   * Get a service by name
   *
   * @param {string} name - Service name (translation, analytics)
   * @returns {Object|null} Service instance or null
   * @example
   * const translation = app.getService('translation');
   */
  getService(name) {
    return this.services[name] || null;
  }

  /**
   * Check if app is initialized
   *
   * @returns {boolean} Whether app is initialized
   * @example
   * if (app.isReady()) { }
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Get app configuration
   *
   * @returns {Object} App configuration
   * @example
   * const config = app.getConfig();
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Cleanup and destroy app
   */
  destroy() {
    this._log('[App] Destroying application...');

    // Destroy all components
    this.components.forEach((component, name) => {
      if (typeof component.destroy === 'function') {
        component.destroy();
        this._log(`[App] Destroyed component: ${name}`);
      }
    });

    this.components.clear();

    // Destroy services
    if (translationService.destroy) {
      translationService.destroy();
    }

    if (analyticsService.destroy) {
      analyticsService.destroy();
    }

    this.isInitialized = false;

    this._log('[App] Application destroyed');
  }
}

// Create singleton instance
const app = new App();

// Auto-initialize if data-auto-init attribute is present
if (document.documentElement.hasAttribute('data-auto-init')) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const analyticsId = document.documentElement.getAttribute('data-analytics-id');
      app.init({ analyticsId });
    });
  } else {
    const analyticsId = document.documentElement.getAttribute('data-analytics-id');
    app.init({ analyticsId });
  }
}

// Export both the instance and class
export { app, App };
export default app;
