/**
 * Privacy-First Website Analytics
 * Lightweight tracking without cookies or personal data
 */

(function() {
  'use strict';

  // Configuration
  const ANALYTICS_ENDPOINT = '/api/analytics.php'; // Backend endpoint
  const SESSION_KEY = 'analytics_session';
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds

  // Generate anonymous session ID (changes on browser restart)
  function generateSessionId() {
    return 'anon_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }

  // Get or create session ID (stored in sessionStorage, not localStorage)
  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  // Get visitor info (no personal data)
  function getVisitorInfo() {
    const nav = navigator;
    const screen = window.screen;

    return {
      // Page info
      page: location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
      title: document.title,

      // Technical info (anonymous)
      language: nav.language || nav.userLanguage,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,

      // Device info (general)
      is_mobile: /Mobi|Android|iPhone|iPad|iPod/i.test(nav.userAgent),
      browser: getBrowserInfo(),

      // Session info
      session_id: getSessionId(),
      timestamp: Date.now(),

      // Performance (if available)
      load_time: getLoadTime()
    };
  }

  // Detect browser (general categories)
  function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Other';
  }

  // Get page load time
  function getLoadTime() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      return navigation ? Math.round(navigation.loadEventEnd - navigation.navigationStart) : null;
    } catch (e) {
      return null;
    }
  }

  // Send analytics data
  function sendAnalytics(eventType, data = {}) {
    const payload = {
      event: eventType,
      ...getVisitorInfo(),
      ...data
    };

    // Try to send via sendBeacon (preferred) or fetch
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
      } else {
        fetch(ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {}); // Fail silently
      }
    } catch (e) {
      // Store in localStorage as fallback for offline processing
      try {
        const stored = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        stored.push(payload);
        if (stored.length > 50) stored.shift(); // Keep only last 50 events
        localStorage.setItem('analytics_queue', JSON.stringify(stored));
      } catch (storageError) {
        // If localStorage is not available, fail silently
      }
    }
  }

  // Track page view
  function trackPageView() {
    sendAnalytics('page_view');
  }

  // Track time on page (heartbeat)
  let timeOnPage = 0;
  function trackTimeOnPage() {
    timeOnPage += HEARTBEAT_INTERVAL / 1000;
    sendAnalytics('heartbeat', { time_on_page: timeOnPage });
  }

  // Track clicks on important elements
  function trackInteractions() {
    // Track music plays
    document.addEventListener('click', (e) => {
      if (e.target.closest('.mi-play') || e.target.closest('.pb-play')) {
        sendAnalytics('music_play', {
          track_id: e.target.closest('.music-item')?.dataset?.id || 'unknown'
        });
      }

      // Track project clicks
      if (e.target.closest('a[href*="projects/"]')) {
        const projectLink = e.target.closest('a');
        sendAnalytics('project_click', {
          project_url: projectLink.href
        });
      }

      // Track external links
      if (e.target.closest('a[href^="http"]') && !e.target.closest('a[href*="igorszuniewicz.com"]')) {
        const externalLink = e.target.closest('a');
        sendAnalytics('external_link', {
          url: externalLink.href,
          text: externalLink.textContent.trim()
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.closest('form')) {
        sendAnalytics('form_submit', {
          form_action: e.target.action || 'unknown'
        });
      }
    });
  }

  // Track scroll depth
  let maxScrollDepth = 0;
  function trackScrollDepth() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;

      // Send scroll milestones
      if ([25, 50, 75, 90].includes(scrollPercent)) {
        sendAnalytics('scroll_depth', { depth: scrollPercent });
      }
    }
  }

  // Initialize analytics
  function initAnalytics() {
    // Track page view immediately
    trackPageView();

    // Set up periodic heartbeat
    setInterval(trackTimeOnPage, HEARTBEAT_INTERVAL);

    // Track interactions
    trackInteractions();

    // Track scroll depth
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 100);
    }, { passive: true });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      sendAnalytics('page_unload', {
        time_on_page: timeOnPage,
        max_scroll_depth: maxScrollDepth
      });
    });

    // Try to send queued analytics on page load
    window.addEventListener('load', () => {
      try {
        const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        if (queue.length > 0) {
          queue.forEach(item => {
            sendAnalytics('queued_event', item);
          });
          localStorage.removeItem('analytics_queue');
        }
      } catch (e) {
        // Fail silently
      }
    });
  }

  // Privacy compliance
  function shouldTrackUser() {
    // Respect Do Not Track
    if (navigator.doNotTrack === '1') return false;

    // Check for localhost/development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return false;

    // Check for bot user agents
    const botPattern = /bot|crawler|spider|scraper/i;
    if (botPattern.test(navigator.userAgent)) return false;

    return true;
  }

  // Start tracking only if allowed
  if (shouldTrackUser()) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
      initAnalytics();
    }
  }

  // Expose minimal API for custom events
  window.trackEvent = function(eventName, data = {}) {
    if (shouldTrackUser()) {
      sendAnalytics('custom_event', { event_name: eventName, ...data });
    }
  };

})();