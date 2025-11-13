/**
 * Google Analytics 4 - Simplified Implementation
 * Igor Szuniewicz Portfolio
 */

// Configuration
const GA_CONFIG = {
  measurementId: "G-36J3DWT6QW", // Google Analytics 4 Measurement ID
  anonymizeIp: true,
  debug: false,
};

// Initialize Google Analytics 4
function initializeAnalytics() {
  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_CONFIG.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());

  // Configure GA4 with privacy settings
  gtag("config", GA_CONFIG.measurementId, {
    anonymize_ip: GA_CONFIG.anonymizeIp,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: "SameSite=Strict;Secure",
  });

  if (GA_CONFIG.debug) {
    console.log("Google Analytics 4 initialized");
  }
}

// Track page views
function trackPageView(pagePath, pageTitle) {
  if (window.gtag) {
    gtag("config", GA_CONFIG.measurementId, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

// Track custom events
function trackPortfolioEvent(eventName, parameters = {}) {
  if (window.gtag) {
    gtag("event", eventName, {
      event_category: "portfolio_interaction",
      ...parameters,
    });
  }
}

// Track project views
function trackProjectView(projectName, projectType) {
  trackPortfolioEvent("project_view", {
    project_name: projectName,
    project_type: projectType,
  });
}

// Track audio interactions
function trackAudioInteraction(audioType, action) {
  trackPortfolioEvent("audio_interaction", {
    audio_type: audioType,
    interaction_action: action,
  });
}

// Track CV downloads
function trackCVDownload() {
  trackPortfolioEvent("cv_download", {
    event_category: "conversion",
  });
}

// Track contact form interactions
function trackContactInteraction(action) {
  trackPortfolioEvent("contact_interaction", {
    contact_action: action,
  });
}

// Initialize immediately when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAnalytics);
} else {
  initializeAnalytics();
}

// Export functions for use in other scripts
window.analytics = {
  trackPageView,
  trackProjectView,
  trackAudioInteraction,
  trackCVDownload,
  trackContactInteraction,
};

