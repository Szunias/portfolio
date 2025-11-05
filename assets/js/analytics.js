/**
 * Google Analytics 4 - Privacy-Friendly Implementation
 * Igor Szuniewicz Portfolio
 * 
 * Features:
 * - Privacy-first approach (minimal data collection)
 * - GDPR compliant
 * - No personal data tracking
 * - Performance optimized
 */

// Configuration
const GA_CONFIG = {
  measurementId: 'G-36J3DWT6QW', // Google Analytics 4 Measurement ID
  anonymizeIp: true,
  allowGoogleAnalytics: false, // Default to false, user can opt-in
  debug: false // Set to true for development
};

// Check if user has consented to analytics
function hasAnalyticsConsent() {
  // Check localStorage for user preference
  const consent = localStorage.getItem('analytics-consent');
  return consent === 'true';
}

// Set analytics consent
function setAnalyticsConsent(consent) {
  localStorage.setItem('analytics-consent', consent.toString());
  if (consent) {
    initializeAnalytics();
  } else {
    // Disable analytics if user opts out
    window['ga-disable-' + GA_CONFIG.measurementId] = true;
  }
}

// Initialize Google Analytics 4
function initializeAnalytics() {
  if (!GA_CONFIG.allowGoogleAnalytics || !hasAnalyticsConsent()) {
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_CONFIG.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  
  // Configure GA4 with privacy settings
  gtag('config', GA_CONFIG.measurementId, {
    anonymize_ip: GA_CONFIG.anonymizeIp,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Strict;Secure',
    // Custom parameters for audio portfolio
    custom_map: {
      'custom_parameter_1': 'project_type',
      'custom_parameter_2': 'audio_category'
    }
  });

  if (GA_CONFIG.debug) {
    console.log('Google Analytics 4 initialized with privacy settings');
  }
}

// Track page views (only if consent given)
function trackPageView(pagePath, pageTitle) {
  if (!hasAnalyticsConsent()) return;
  
  if (window.gtag) {
    gtag('config', GA_CONFIG.measurementId, {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
}

// Track custom events (portfolio specific)
function trackPortfolioEvent(eventName, parameters = {}) {
  if (!hasAnalyticsConsent()) return;
  
  if (window.gtag) {
    gtag('event', eventName, {
      event_category: 'portfolio_interaction',
      ...parameters
    });
  }
}

// Track project views
function trackProjectView(projectName, projectType) {
  trackPortfolioEvent('project_view', {
    project_name: projectName,
    project_type: projectType
  });
}

// Track audio interactions
function trackAudioInteraction(audioType, action) {
  trackPortfolioEvent('audio_interaction', {
    audio_type: audioType,
    interaction_action: action
  });
}

// Track CV downloads
function trackCVDownload() {
  trackPortfolioEvent('cv_download', {
    event_category: 'conversion'
  });
}

// Track contact form interactions
function trackContactInteraction(action) {
  trackPortfolioEvent('contact_interaction', {
    contact_action: action
  });
}

// Show analytics consent banner (if not already set) - ONLY on index.html
// Google Analytics icon by Freepik from Flaticon (https://www.flaticon.com/free-icons/google)
function showAnalyticsConsentBanner() {
  // Only show on index.html (main page)
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
    return;
  }
  
  if (localStorage.getItem('analytics-consent') !== null) {
    return; // User already made a choice
  }

  // Check if banner was already shown in this session
  if (sessionStorage.getItem('analytics-banner-shown') === 'true') {
    return; // Banner already shown in this session
  }

  // Wait for translations to load
  if (!window.translations || Object.keys(window.translations).length === 0) {
    setTimeout(showAnalyticsConsentBanner, 200);
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'analytics-consent-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 220px;
    background: linear-gradient(135deg, rgba(30, 41, 57, 0.95), rgba(15, 23, 42, 0.95));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 6px;
    padding: 8px 10px;
    color: #e2e8f0;
    font-family: 'Poppins', sans-serif;
    font-size: 10px;
    z-index: 10000;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    line-height: 1.2;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  // Get current language
  const currentLang = localStorage.getItem('language') || 'en';
  
  // Get translations with better fallback
  const analyticsTitle = window.translations?.[currentLang]?.analytics?.title || 
                        window.translations?.en?.analytics?.title || 
                        'Analytics';
  const analyticsMessage = window.translations?.[currentLang]?.analytics?.message || 
                          window.translations?.en?.analytics?.message || 
                          'No personal data • Site only';

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
      <svg width="12" height="12" viewBox="0 0 24 24" style="opacity: 0.9;">
        <!-- Google Analytics icon by Freepik from Flaticon -->
        <path fill="#ea4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#4285f4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span style="font-weight: 500; font-size: 9px; letter-spacing: 0.3px; text-transform: uppercase; opacity: 0.9;">${analyticsTitle}</span>
    </div>
    <div style="font-size: 9px; opacity: 0.8; line-height: 1.1;">
      <span style="color: #60a5fa; font-weight: 500;">${analyticsMessage}</span>
    </div>
  `;

  document.body.appendChild(banner);

  // Mark banner as shown in this session
  sessionStorage.setItem('analytics-banner-shown', 'true');

  // Function to update banner text when language changes
  function updateBannerText() {
    const currentLang = localStorage.getItem('language') || 'en';
    const analyticsTitle = window.translations?.[currentLang]?.analytics?.title || 
                          window.translations?.en?.analytics?.title || 
                          'Analytics';
    const analyticsMessage = window.translations?.[currentLang]?.analytics?.message || 
                            window.translations?.en?.analytics?.message || 
                            'No personal data • Site only';
    
    const titleEl = banner.querySelector('span');
    const messageEl = banner.querySelector('div:last-child');
    
    if (titleEl) titleEl.textContent = analyticsTitle;
    if (messageEl) messageEl.innerHTML = `<span style="color: #60a5fa; font-weight: 500;">${analyticsMessage}</span>`;
  }

  // Listen for language changes
  window.addEventListener('languageChanged', updateBannerText);

  // Smooth slide up from bottom
  requestAnimationFrame(() => {
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';
  });

  // Auto-hide after 4 seconds
  let autoHideTimer = setTimeout(() => {
    if (banner.isConnected) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(() => banner.remove(), 300);
    }
  }, 4000);

  // Hover to pause auto-hide
  banner.addEventListener('mouseenter', () => {
    // Pause auto-hide on hover
    clearTimeout(autoHideTimer);
  });

  banner.addEventListener('mouseleave', () => {
    // Resume auto-hide after 2 seconds
    autoHideTimer = setTimeout(() => {
      if (banner.isConnected) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        setTimeout(() => banner.remove(), 300);
      }
    }, 2000);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    showAnalyticsConsentBanner();
    // Auto-initialize if user previously consented
    if (hasAnalyticsConsent()) {
      initializeAnalytics();
    }
  });
} else {
  showAnalyticsConsentBanner();
  if (hasAnalyticsConsent()) {
    initializeAnalytics();
  }
}

// Export functions for use in other scripts
window.analytics = {
  trackPageView,
  trackProjectView,
  trackAudioInteraction,
  trackCVDownload,
  trackContactInteraction,
  setAnalyticsConsent,
  hasAnalyticsConsent
};
