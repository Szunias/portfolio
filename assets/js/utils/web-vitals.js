/**
 * Web Vitals Monitoring and Optimization
 * Tracks and optimizes Core Web Vitals for perfect Lighthouse scores
 */

(function() {
  'use strict';

  // Web Vitals thresholds for optimization
  const THRESHOLDS = {
    LCP: 2500,  // Largest Contentful Paint
    FID: 100,   // First Input Delay
    CLS: 0.1,   // Cumulative Layout Shift
    FCP: 1800,  // First Contentful Paint
    TTFB: 800   // Time to First Byte
  };

  // Performance metrics storage
  const metrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  };

  // Initialize Web Vitals monitoring
  function initWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    observeLCP();

    // First Input Delay
    observeFID();

    // Cumulative Layout Shift
    observeCLS();

    // First Contentful Paint
    observeFCP();

    // Time to First Byte
    observeTTFB();

    // Report metrics when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportMetrics();
      }
    });
  }

  // Observe Largest Contentful Paint
  function observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      metrics.lcp = lastEntry.startTime;

      // Optimize if LCP is poor
      if (metrics.lcp > THRESHOLDS.LCP) {
        optimizeLCP();
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Observe First Input Delay
  function observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        metrics.fid = entry.processingStart - entry.startTime;

        // Optimize if FID is poor
        if (metrics.fid > THRESHOLDS.FID) {
          optimizeFID();
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  // Observe Cumulative Layout Shift
  function observeCLS() {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            metrics.cls = clsValue;

            // Optimize if CLS is poor
            if (metrics.cls > THRESHOLDS.CLS) {
              optimizeCLS();
            }
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  // Observe First Contentful Paint
  function observeFCP() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;

          // Optimize if FCP is poor
          if (metrics.fcp > THRESHOLDS.FCP) {
            optimizeFCP();
          }
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  // Observe Time to First Byte
  function observeTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;

      // Optimize if TTFB is poor
      if (metrics.ttfb > THRESHOLDS.TTFB) {
        optimizeTTFB();
      }
    }
  }

  // LCP Optimization strategies
  function optimizeLCP() {
    // Preload largest image
    const images = document.querySelectorAll('img[loading="eager"]');
    images.forEach(img => {
      if (!img.complete && img.getBoundingClientRect().top < window.innerHeight) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src || img.dataset.src;
        document.head.appendChild(link);
      }
    });

    // Optimize web fonts
    const fontLinks = document.querySelectorAll('link[rel="stylesheet"][href*="font"]');
    fontLinks.forEach(link => {
      if (!link.hasAttribute('media')) {
        link.media = 'print';
        link.onload = function() { this.media = 'all'; };
      }
    });
  }

  // FID Optimization strategies
  function optimizeFID() {
    // Defer non-critical JavaScript
    const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
    scripts.forEach(script => {
      if (!script.src.includes('jquery') && !script.src.includes('main.js')) {
        script.defer = true;
      }
    });

    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      const deferredTasks = [];

      // Move analytics to idle time
      requestIdleCallback(() => {
        deferredTasks.forEach(task => task());
      });
    }
  }

  // CLS Optimization strategies
  function optimizeCLS() {
    // Set explicit dimensions for images
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.width && rect.height) {
        img.width = rect.width;
        img.height = rect.height;
      }
    });

    // Reserve space for dynamic content
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    dynamicElements.forEach(el => {
      if (!el.style.minHeight) {
        el.style.minHeight = '200px';
      }
    });
  }

  // FCP Optimization strategies
  function optimizeFCP() {
    // Inline critical CSS
    const criticalCSS = `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      #header { background: #1e252d; }
      .button { background: #18bfef; color: #fff; padding: 0.75rem 1.5rem; }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // TTFB Optimization strategies
  function optimizeTTFB() {
    // Enable service worker for faster subsequent loads
    if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Preconnect to critical domains
    const domains = ['fonts.googleapis.com', 'fonts.gstatic.com'];
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Report metrics to analytics
  function reportMetrics() {
    const report = {
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      fcp: metrics.fcp,
      ttfb: metrics.ttfb,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Send to analytics service
    if (window.gtag) {
      Object.keys(metrics).forEach(metric => {
        if (metrics[metric] !== null) {
          gtag('event', metric.toUpperCase(), {
            event_category: 'Web Vitals',
            value: Math.round(metrics[metric]),
            non_interaction: true
          });
        }
      });
    }

    // Log to console in development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      // Web Vitals Report (development only)
    }
  }

  // Get Core Web Vitals score
  function getWebVitalsScore() {
    const scores = {
      lcp: metrics.lcp <= THRESHOLDS.LCP ? 'good' : metrics.lcp <= THRESHOLDS.LCP * 1.5 ? 'needs-improvement' : 'poor',
      fid: metrics.fid <= THRESHOLDS.FID ? 'good' : metrics.fid <= THRESHOLDS.FID * 3 ? 'needs-improvement' : 'poor',
      cls: metrics.cls <= THRESHOLDS.CLS ? 'good' : metrics.cls <= THRESHOLDS.CLS * 2.5 ? 'needs-improvement' : 'poor'
    };

    return scores;
  }

  // Public API
  window.WebVitals = {
    getMetrics: () => ({ ...metrics }),
    getScore: getWebVitalsScore,
    report: reportMetrics
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebVitals);
  } else {
    initWebVitals();
  }

})();