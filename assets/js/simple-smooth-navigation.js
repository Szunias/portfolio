/**
 * Simple Smooth Navigation
 * Uses full page reloads but with smooth visual transitions
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__simpleSmoothNavInitialized) return;
  window.__simpleSmoothNavInitialized = true;

  // Add fade-out class before navigation
  function handleNavigation(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore special links
    if (href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.hasAttribute('target') ||
        link.hasAttribute('download')) {
      return;
    }

    // Prevent default and add fade effect
    e.preventDefault();

    // Add fade-out class to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease';

    // Navigate after fade
    setTimeout(() => {
      window.location.href = link.href;
    }, 200);
  }

  // Initialize
  function init() {
    // Add fade-in on page load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    // Fade in when ready
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 50);
    });

    // Handle link clicks
    document.addEventListener('click', handleNavigation);

    // Handle back/forward buttons
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // Page was loaded from cache
        document.body.style.opacity = '1';
      }
    });

    console.log('[SimpleSmoothNav] Initialized - using full page reloads with transitions');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
