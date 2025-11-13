/**
 * Analytics Service
 * Handles Google Analytics 4 and custom event tracking
 *
 * @module services/AnalyticsService
 * @example
 * import { analyticsService } from './services/AnalyticsService.js';
 *
 * analyticsService.init('G-XXXXXXXXXX');
 * analyticsService.trackEvent('button_click', { button_name: 'download' });
 */

import { EventEmitter } from '../core/EventEmitter.js';

/**
 * AnalyticsService Class
 * Manages Google Analytics integration and custom event tracking
 *
 * @class AnalyticsService
 * @extends EventEmitter
 */
class AnalyticsService extends EventEmitter {
  constructor() {
    super();

    /**
     * Google Analytics Measurement ID
     * @type {string|null}
     */
    this.measurementId = null;

    /**
     * Whether analytics is initialized
     * @type {boolean}
     */
    this.isInitialized = false;

    /**
     * Whether user has consented to tracking
     * @type {boolean}
     */
    this.hasConsent = false;

    /**
     * Queue for events before initialization
     * @type {Array}
     */
    this.eventQueue = [];

    /**
     * Whether debug mode is enabled
     * @type {boolean}
     */
    this.debugMode = false;
  }

  /**
   * Initialize Google Analytics
   *
   * @param {string} measurementId - Google Analytics Measurement ID (G-XXXXXXXXXX)
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug mode
   * @param {boolean} options.anonymizeIp - Anonymize IP addresses
   * @param {string} options.cookieDomain - Cookie domain
   * @returns {Promise<void>}
   * @example
   * await analyticsService.init('G-XXXXXXXXXX', {
   *   debug: true,
   *   anonymizeIp: true
   * });
   */
  async init(measurementId, options = {}) {
    if (this.isInitialized) {
      console.warn('[AnalyticsService] Already initialized');
      return;
    }

    if (!measurementId || !measurementId.startsWith('G-')) {
      throw new Error('[AnalyticsService] Invalid measurement ID');
    }

    this.measurementId = measurementId;
    this.debugMode = options.debug || false;

    try {
      // Load Google Analytics script
      await this._loadGtagScript(measurementId);

      // Initialize gtag with config
      this._initGtag(measurementId, options);

      this.isInitialized = true;

      // Process queued events
      this._processEventQueue();

      this.emit('initialized', { measurementId });

      if (this.debugMode) {
        console.log(`[AnalyticsService] Initialized with ID: ${measurementId}`);
      }
    } catch (error) {
      console.error('[AnalyticsService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set user consent for analytics
   *
   * @param {boolean} consent - Whether user has consented
   * @example
   * analyticsService.setConsent(true);
   */
  setConsent(consent) {
    this.hasConsent = consent;

    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent ? 'granted' : 'denied',
        ad_storage: consent ? 'granted' : 'denied'
      });
    }

    this.emit('consentChanged', { consent });

    if (this.debugMode) {
      console.log(`[AnalyticsService] Consent set to: ${consent}`);
    }
  }

  /**
   * Track a custom event
   *
   * @param {string} eventName - Event name
   * @param {Object} parameters - Event parameters
   * @example
   * analyticsService.trackEvent('button_click', {
   *   button_name: 'download',
   *   button_location: 'hero'
   * });
   */
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) {
      this.eventQueue.push({ eventName, parameters });
      if (this.debugMode) {
        console.log(`[AnalyticsService] Event queued: ${eventName}`, parameters);
      }
      return;
    }

    if (!this.hasConsent && !this.debugMode) {
      if (this.debugMode) {
        console.log(`[AnalyticsService] Event not tracked (no consent): ${eventName}`);
      }
      return;
    }

    try {
      window.gtag('event', eventName, parameters);

      this.emit('eventTracked', { eventName, parameters });

      if (this.debugMode) {
        console.log(`[AnalyticsService] Event tracked: ${eventName}`, parameters);
      }
    } catch (error) {
      console.error(`[AnalyticsService] Failed to track event "${eventName}":`, error);
    }
  }

  /**
   * Track a page view
   *
   * @param {string} pagePath - Page path
   * @param {string} pageTitle - Page title
   * @example
   * analyticsService.trackPageView('/about', 'About - Igor Szuniewicz');
   */
  trackPageView(pagePath, pageTitle) {
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href
    });
  }

  /**
   * Track audio playback
   *
   * @param {string} trackTitle - Track title
   * @param {string} artist - Artist name
   * @param {number} duration - Track duration in seconds
   * @example
   * analyticsService.trackAudioPlay('Sample Track', 'Igor Szuniewicz', 180);
   */
  trackAudioPlay(trackTitle, artist, duration) {
    this.trackEvent('audio_play', {
      track_title: trackTitle,
      artist: artist,
      duration: duration
    });
  }

  /**
   * Track project view
   *
   * @param {string} projectName - Project name
   * @param {string} projectCategory - Project category
   * @example
   * analyticsService.trackProjectView('Akantilado', 'Game Audio');
   */
  trackProjectView(projectName, projectCategory) {
    this.trackEvent('project_view', {
      project_name: projectName,
      project_category: projectCategory
    });
  }

  /**
   * Track file download
   *
   * @param {string} fileName - File name
   * @param {string} fileType - File type
   * @example
   * analyticsService.trackDownload('resume.pdf', 'PDF');
   */
  trackDownload(fileName, fileType) {
    this.trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    });
  }

  /**
   * Track external link click
   *
   * @param {string} url - External URL
   * @param {string} linkText - Link text
   * @example
   * analyticsService.trackOutboundLink('https://github.com/user', 'GitHub');
   */
  trackOutboundLink(url, linkText) {
    this.trackEvent('outbound_link_click', {
      link_url: url,
      link_text: linkText
    });
  }

  /**
   * Track form submission
   *
   * @param {string} formId - Form identifier
   * @param {string} formType - Form type
   * @example
   * analyticsService.trackFormSubmit('contact-form', 'contact');
   */
  trackFormSubmit(formId, formType) {
    this.trackEvent('form_submit', {
      form_id: formId,
      form_type: formType
    });
  }

  /**
   * Track search
   *
   * @param {string} searchTerm - Search term
   * @param {number} resultsCount - Number of results
   * @example
   * analyticsService.trackSearch('wwise', 5);
   */
  trackSearch(searchTerm, resultsCount) {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  /**
   * Track language change
   *
   * @param {string} language - New language code
   * @param {string} previousLanguage - Previous language code
   * @example
   * analyticsService.trackLanguageChange('pl', 'en');
   */
  trackLanguageChange(language, previousLanguage) {
    this.trackEvent('language_change', {
      language: language,
      previous_language: previousLanguage
    });
  }

  /**
   * Track error
   *
   * @param {string} errorMessage - Error message
   * @param {string} errorLocation - Where error occurred
   * @param {boolean} fatal - Whether error is fatal
   * @example
   * analyticsService.trackError('Failed to load audio', 'AudioPlayer', false);
   */
  trackError(errorMessage, errorLocation, fatal = false) {
    this.trackEvent('error', {
      error_message: errorMessage,
      error_location: errorLocation,
      fatal: fatal
    });
  }

  /**
   * Track performance metric
   *
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Unit of measurement
   * @example
   * analyticsService.trackPerformance('page_load_time', 1250, 'ms');
   */
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      value: value,
      unit: unit
    });
  }

  /**
   * Set user properties
   *
   * @param {Object} properties - User properties
   * @example
   * analyticsService.setUserProperties({
   *   user_type: 'visitor',
   *   preferred_language: 'en'
   * });
   */
  setUserProperties(properties) {
    if (!this.isInitialized) {
      console.warn('[AnalyticsService] Cannot set user properties before initialization');
      return;
    }

    try {
      window.gtag('set', 'user_properties', properties);

      this.emit('userPropertiesSet', { properties });

      if (this.debugMode) {
        console.log('[AnalyticsService] User properties set:', properties);
      }
    } catch (error) {
      console.error('[AnalyticsService] Failed to set user properties:', error);
    }
  }

  /**
   * Enable or disable analytics
   *
   * @param {boolean} enabled - Whether analytics should be enabled
   * @example
   * analyticsService.setEnabled(false);
   */
  setEnabled(enabled) {
    if (!this.isInitialized) {
      console.warn('[AnalyticsService] Cannot enable/disable before initialization');
      return;
    }

    window[`ga-disable-${this.measurementId}`] = !enabled;

    this.emit('enabledChanged', { enabled });

    if (this.debugMode) {
      console.log(`[AnalyticsService] Analytics ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Load Google Analytics gtag.js script
   *
   * @private
   * @param {string} measurementId - Measurement ID
   * @returns {Promise<void>}
   */
  _loadGtagScript(measurementId) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.gtag) {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

      script.onload = () => {
        // Initialize gtag function
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());

        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Analytics script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initialize gtag with configuration
   *
   * @private
   * @param {string} measurementId - Measurement ID
   * @param {Object} options - Configuration options
   */
  _initGtag(measurementId, options) {
    const config = {
      send_page_view: false, // We'll track page views manually
      anonymize_ip: options.anonymizeIp !== false,
      cookie_domain: options.cookieDomain || 'auto',
      cookie_flags: 'SameSite=None;Secure'
    };

    if (this.debugMode) {
      config.debug_mode = true;
    }

    window.gtag('config', measurementId, config);

    // Set default consent state
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500
    });
  }

  /**
   * Process queued events
   *
   * @private
   */
  _processEventQueue() {
    while (this.eventQueue.length > 0) {
      const { eventName, parameters } = this.eventQueue.shift();
      this.trackEvent(eventName, parameters);
    }
  }

  /**
   * Cleanup and disable analytics
   */
  destroy() {
    this.setEnabled(false);
    this.eventQueue = [];
    this.isInitialized = false;

    if (this.debugMode) {
      console.log('[AnalyticsService] Service destroyed');
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export both the instance and class
export { analyticsService, AnalyticsService };
export default analyticsService;
