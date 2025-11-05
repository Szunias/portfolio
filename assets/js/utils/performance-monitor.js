/**
 * Performance Monitoring and Analytics
 * Tracks Core Web Vitals, resource loading, and user experience metrics
 */

(function() {
  'use strict';

  const PerformanceMonitor = {
    // Metrics storage
    metrics: {
      vitals: {},
      resources: [],
      navigation: {},
      custom: {}
    },

    // Configuration
    config: {
      enableAnalytics: true,
      enableConsoleLogging: true,
      enableLocalStorage: true,
      sampleRate: 1.0, // 100% - reduce for production
      maxStoredSessions: 10
    },

    // Performance observers
    observers: {
      lcp: null,
      fid: null,
      cls: null,
      resource: null,
      navigation: null
    },

    init: function() {
      this.setupWebVitalsMonitoring();
      this.setupResourceMonitoring();
      this.setupNavigationMonitoring();
      this.setupCustomMetrics();
      this.scheduleReporting();

      // Performance monitoring initialized
    },

    setupWebVitalsMonitoring: function() {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          this.observers.lcp = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            this.metrics.vitals.lcp = {
              value: lastEntry.startTime,
              element: lastEntry.element?.tagName || 'unknown',
              url: lastEntry.url || '',
              timestamp: Date.now()
            };

            this.logMetric('LCP', lastEntry.startTime);
            this.evaluateVital('lcp', lastEntry.startTime);
          });

          this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP observer not supported
        }

        // First Input Delay (FID)
        try {
          this.observers.fid = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              this.metrics.vitals.fid = {
                value: entry.processingStart - entry.startTime,
                eventType: entry.name,
                timestamp: Date.now()
              };

              this.logMetric('FID', entry.processingStart - entry.startTime);
              this.evaluateVital('fid', entry.processingStart - entry.startTime);
            });
          });

          this.observers.fid.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // FID observer not supported
        }

        // Cumulative Layout Shift (CLS)
        try {
          let clsValue = 0;
          let clsEntries = [];

          this.observers.cls = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                clsEntries.push(entry);
              }
            });

            this.metrics.vitals.cls = {
              value: clsValue,
              entries: clsEntries.length,
              timestamp: Date.now()
            };

            this.logMetric('CLS', clsValue);
            this.evaluateVital('cls', clsValue);
          });

          this.observers.cls.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // CLS observer not supported
        }
      }

      // Fallback metrics for browsers without PerformanceObserver
      this.setupFallbackVitals();
    },

    setupFallbackVitals: function() {
      // Time to First Byte (TTFB)
      if (performance.timing) {
        const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
        this.metrics.vitals.ttfb = {
          value: ttfb,
          timestamp: Date.now()
        };
        this.logMetric('TTFB', ttfb);
      }

      // DOM Content Loaded
      document.addEventListener('DOMContentLoaded', () => {
        if (performance.timing) {
          const dcl = performance.timing.domContentLoadedEventStart - performance.timing.navigationStart;
          this.metrics.vitals.dcl = {
            value: dcl,
            timestamp: Date.now()
          };
          this.logMetric('DCL', dcl);
        }
      });

      // Window Load
      window.addEventListener('load', () => {
        if (performance.timing) {
          const load = performance.timing.loadEventStart - performance.timing.navigationStart;
          this.metrics.vitals.load = {
            value: load,
            timestamp: Date.now()
          };
          this.logMetric('Load', load);
        }
      });
    },

    setupResourceMonitoring: function() {
      if ('PerformanceObserver' in window) {
        try {
          this.observers.resource = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach((entry) => {
              const resource = {
                name: entry.name,
                type: entry.initiatorType,
                size: entry.transferSize || 0,
                duration: entry.duration,
                startTime: entry.startTime,
                timestamp: Date.now()
              };

              this.metrics.resources.push(resource);

              // Check for slow resources
              if (entry.duration > 1000) {
                const duration = Math.round(entry.duration);
                this.logMetric('Slow Resource', `${entry.name} (${duration}ms)`);
              }
            });

            // Keep only last 100 resources to avoid memory issues
            if (this.metrics.resources.length > 100) {
              this.metrics.resources = this.metrics.resources.slice(-100);
            }
          });

          this.observers.resource.observe({ entryTypes: ['resource'] });
        } catch (e) {
          // Resource observer not supported
        }
      }
    },

    setupNavigationMonitoring: function() {
      if ('PerformanceObserver' in window) {
        try {
          this.observers.navigation = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach(entry => {
              this.metrics.navigation = {
                type: entry.type,
                redirectCount: entry.redirectCount,
                startTime: entry.startTime,
                duration: entry.duration,
                domInteractive: entry.domInteractive,
                domComplete: entry.domComplete,
                timestamp: Date.now()
              };
            });
          });

          this.observers.navigation.observe({ entryTypes: ['navigation'] });
        } catch (e) {
          // Navigation observer not supported
        }
      }
    },

    setupCustomMetrics: function() {
      // Track user engagement
      this.trackUserEngagement();

      // Track JavaScript errors
      this.trackJavaScriptErrors();

      // Track memory usage
      this.trackMemoryUsage();

      // Track connection information
      this.trackConnectionInfo();
    },

    trackUserEngagement: function() {
      let interactions = 0;
      let timeOnPage = 0;
      const startTime = Date.now();

      const events = ['click', 'scroll', 'keydown', 'touchstart'];

      events.forEach(event => {
        document.addEventListener(event, () => {
          interactions++;
        }, { passive: true, once: false });
      });

      // Track time on page
      setInterval(() => {
        timeOnPage = Date.now() - startTime;
        this.metrics.custom.engagement = {
          interactions,
          timeOnPage,
          timestamp: Date.now()
        };
      }, 5000);

      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        this.metrics.custom.visibility = {
          visible: !document.hidden,
          timestamp: Date.now()
        };
      });
    },

    trackJavaScriptErrors: function() {
      window.addEventListener('error', (event) => {
        const error = {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: Date.now()
        };

        if (!this.metrics.custom.errors) {
          this.metrics.custom.errors = [];
        }

        this.metrics.custom.errors.push(error);
        this.logMetric('JS Error', event.message);

        // Keep only last 10 errors
        if (this.metrics.custom.errors.length > 10) {
          this.metrics.custom.errors = this.metrics.custom.errors.slice(-10);
        }
      });

      // Track unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = {
          reason: event.reason?.toString() || 'Unknown promise rejection',
          timestamp: Date.now()
        };

        if (!this.metrics.custom.promiseErrors) {
          this.metrics.custom.promiseErrors = [];
        }

        this.metrics.custom.promiseErrors.push(error);
        this.logMetric('Promise Error', error.reason);
      });
    },

    trackMemoryUsage: function() {
      if ('memory' in performance) {
        setInterval(() => {
          this.metrics.custom.memory = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            timestamp: Date.now()
          };
        }, 10000); // Every 10 seconds
      }
    },

    trackConnectionInfo: function() {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (connection) {
        this.metrics.custom.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          timestamp: Date.now()
        };

        // Track connection changes
        connection.addEventListener('change', () => {
          this.metrics.custom.connection = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            timestamp: Date.now()
          };
          this.logMetric('Connection Change', connection.effectiveType);
        });
      }
    },

    evaluateVital: function(vital, value) {
      const thresholds = {
        lcp: { good: 2500, needs_improvement: 4000 },
        fid: { good: 100, needs_improvement: 300 },
        cls: { good: 0.1, needs_improvement: 0.25 },
        ttfb: { good: 800, needs_improvement: 1800 }
      };

      const threshold = thresholds[vital];
      if (!threshold) return;

      let rating = 'poor';
      if (value <= threshold.good) {
        rating = 'good';
      } else if (value <= threshold.needs_improvement) {
        rating = 'needs_improvement';
      }

      this.metrics.vitals[vital].rating = rating;
      this.logMetric(`${vital.toUpperCase()} Rating`, rating);

      // Send to analytics if poor
      if (rating === 'poor' && this.config.enableAnalytics) {
        this.sendAnalytics({
          event: 'poor_web_vital',
          vital: vital,
          value: value,
          rating: rating
        });
      }
    },

    logMetric: function(name, value) {
      if (this.config.enableConsoleLogging) {
        // Debug log removed
      }
    },

    scheduleReporting: function() {
      // Report metrics every 30 seconds
      setInterval(() => {
        this.generateReport();
      }, 30000);

      // Report on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.generateReport();
        }
      });

      // Report before page unload
      window.addEventListener('beforeunload', () => {
        this.generateReport();
      });
    },

    generateReport: function() {
      const report = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        metrics: JSON.parse(JSON.stringify(this.metrics))
      };

      // Store locally
      if (this.config.enableLocalStorage) {
        this.storeReport(report);
      }

      // Send to analytics
      if (this.config.enableAnalytics && Math.random() < this.config.sampleRate) {
        this.sendAnalytics(report);
      }

      return report;
    },

    storeReport: function(report) {
      try {
        const stored = JSON.parse(localStorage.getItem('performance_reports') || '[]');
        stored.push(report);

        // Keep only recent reports
        if (stored.length > this.config.maxStoredSessions) {
          stored.splice(0, stored.length - this.config.maxStoredSessions);
        }

        localStorage.setItem('performance_reports', JSON.stringify(stored));
      } catch (e) {
        console.warn('Failed to store performance report:', e);
      }
    },

    sendAnalytics: function(data) {
      // Send to your analytics service
      // This is a placeholder - implement based on your analytics provider

      if ('navigator' in window && 'sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon('/analytics/performance', blob);
      } else {
        // Fallback to fetch
        fetch('/analytics/performance', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Ignore analytics failures
        });
      }
    },

    // Public API
    getMetrics: function() {
      return JSON.parse(JSON.stringify(this.metrics));
    },

    getStoredReports: function() {
      try {
        return JSON.parse(localStorage.getItem('performance_reports') || '[]');
      } catch (e) {
        return [];
      }
    },

    clearStoredReports: function() {
      localStorage.removeItem('performance_reports');
    },

    // Manual metric tracking
    trackCustomEvent: function(name, data) {
      if (!this.metrics.custom.events) {
        this.metrics.custom.events = [];
      }

      this.metrics.custom.events.push({
        name,
        data,
        timestamp: Date.now()
      });

      this.logMetric('Custom Event', `${name}: ${JSON.stringify(data)}`);
    },

    // Performance debugging tools
    debugPerformance: function() {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.group('Performance Debug Report');
        // Debug log removed
        // Debug log removed
        // Debug log removed
        // Debug log removed
        console.groupEnd();
      }

      return this.getMetrics();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
  } else {
    PerformanceMonitor.init();
  }

  // Expose globally
  window.PerformanceMonitor = PerformanceMonitor;

})();