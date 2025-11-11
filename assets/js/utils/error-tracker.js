/**
 * Error Tracking & Monitoring System
 * Catches and logs errors in production for debugging
 * Lightweight alternative to Sentry
 */

import { IS_DEV, IS_PROD } from '../config/constants.js';

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors in memory
    this.endpoint = '/api/log-error.php'; // Optional backend endpoint
    this.initialized = false;
  }

  /**
   * Initialize error tracking
   */
  init() {
    if (this.initialized) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandledRejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
      });
    });

    // Console error override (optional - captures console.error calls)
    if (IS_PROD) {
      const originalError = console.error;
      console.error = (...args) => {
        this.logError({
          type: 'console.error',
          message: args.map(arg => String(arg)).join(' '),
          timestamp: Date.now(),
        });
        originalError.apply(console, args);
      };
    }

    this.initialized = true;

    if (IS_DEV) {
      console.log('✓ Error tracking initialized');
    }
  }

  /**
   * Log an error
   * @param {Object} errorInfo
   */
  logError(errorInfo) {
    // Add context
    const enrichedError = {
      ...errorInfo,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: errorInfo.timestamp || Date.now(),
    };

    // Store in memory
    this.errors.push(enrichedError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest
    }

    // Log to console in development
    if (IS_DEV) {
      console.group('🐛 Error Tracked');
      console.error('Message:', errorInfo.message);
      console.log('Type:', errorInfo.type);
      console.log('Location:', `${errorInfo.filename}:${errorInfo.line}:${errorInfo.column}`);
      console.log('Stack:', errorInfo.stack);
      console.log('Full Details:', enrichedError);
      console.groupEnd();
    }

    // Send to backend in production (optional)
    if (IS_PROD && this.endpoint) {
      this.sendToBackend(enrichedError);
    }

    // Store in localStorage for debugging
    this.saveToLocalStorage(enrichedError);
  }

  /**
   * Send error to backend
   * @param {Object} error
   */
  async sendToBackend(error) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (e) {
      // Silently fail - don't want error tracking to cause more errors
      if (IS_DEV) {
        console.warn('Failed to send error to backend:', e);
      }
    }
  }

  /**
   * Save errors to localStorage for local debugging
   * @param {Object} error
   */
  saveToLocalStorage(error) {
    try {
      const stored = JSON.parse(localStorage.getItem('errorLog') || '[]');
      stored.push(error);

      // Keep only last 20 errors
      if (stored.length > 20) {
        stored.splice(0, stored.length - 20);
      }

      localStorage.setItem('errorLog', JSON.stringify(stored));
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Get all logged errors
   * @returns {Array}
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get errors from localStorage
   * @returns {Array}
   */
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('errorLog') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    try {
      localStorage.removeItem('errorLog');
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Manually track an error
   * @param {Error|string} error
   * @param {Object} context - Additional context
   */
  track(error, context = {}) {
    const errorInfo = {
      type: 'manual',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: Date.now(),
    };

    this.logError(errorInfo);
  }

  /**
   * Track performance issues
   * @param {string} metric - Metric name (FCP, LCP, etc.)
   * @param {number} value - Metric value
   */
  trackPerformance(metric, value) {
    // Only track poor performance
    const thresholds = {
      FCP: 2500, // First Contentful Paint
      LCP: 4000, // Largest Contentful Paint
      FID: 300,  // First Input Delay
      CLS: 0.25, // Cumulative Layout Shift
    };

    if (value > (thresholds[metric] || Infinity)) {
      this.track('Performance Issue', {
        metric,
        value,
        threshold: thresholds[metric],
      });
    }
  }

  /**
   * Export errors for debugging
   * @returns {string} JSON string
   */
  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => errorTracker.init());
  } else {
    errorTracker.init();
  }
}

// Expose globally for debugging in console
if (IS_DEV) {
  window.errorTracker = errorTracker;
  console.log('💡 Tip: Use window.errorTracker.getErrors() to see all errors');
}

export default errorTracker;
export { errorTracker, ErrorTracker };
