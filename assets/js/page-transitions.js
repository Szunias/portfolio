/**
 * Page transitions: differentiate NAV swipe vs. generic fade.
 * Swipe reserved for top nav (desktop+mobile), others use subtle fade/scale.
 */

(function() {
  'use strict';

  const DEFAULT_TYPE = 'fade';
  const NAV_SWIPE_SELECTORS = [
    '.nav .nav-links a',
    '.mobile-nav-links a'
  ];

  const config = {
    swipe: { duration: 180, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
    fade:  { duration: 130, easing: 'cubic-bezier(0.2, 0.0, 0.0, 1)' },
    scale: { duration: 160, easing: 'cubic-bezier(0.2, 0.7, 0.0, 1)' }
  };

  const style = document.createElement('style');
  style.textContent = `
    /* Simple transitions - avoid header completely */
    
    /* Only transition main content, never body or header */
    main.page-transitioning--swipe { opacity: 0; transform: translateX(-20px); }
    main.page-entering--swipe { opacity: 0; transform: translateX(20px); }
    
    main.page-transitioning--fade { opacity: 0; }
    main.page-entering--fade { opacity: 0; }
    
    main.page-transitioning--scale { opacity: 0; transform: scale(0.98); }
    main.page-entering--scale { opacity: 0; transform: scale(1.02); }
  `;
  document.head.appendChild(style);

  // Utility: determine transition type for a link
  function getTransitionType(link) {
    // 1) Explicit override via data-transition
    const explicit = link.getAttribute('data-transition');
    if (explicit === 'none') return null;
    if (explicit === 'swipe' || explicit === 'fade' || explicit === 'scale') return explicit;

    // 2) By selector: nav links => swipe
    for (const sel of NAV_SWIPE_SELECTORS) {
      if (link.matches(sel) || link.closest(sel?.replace(' a',''))) return 'swipe';
    }

    // 3) Project cards => scale
    if (link.classList.contains('project-card') || link.closest('.project-card')) return 'scale';

    // 4) Default
    return DEFAULT_TYPE;
  }

  // Apply entry class to main element instead of body
  // Wait for translations to be ready before showing transition
  function initPageEntry() {
    const lastType = sessionStorage.getItem('pageTransitionType') || DEFAULT_TYPE;
    const main = document.querySelector('main') || document.body;
    
    if (main) {
      main.classList.add(`page-entering--${lastType}`);
      
      // Use RAF for smooth animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          main.classList.remove(`page-entering--${lastType}`);
        });
      });
    }
  }
  
  // Wait for both DOM and translations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageEntry);
  } else {
    initPageEntry();
  }

  // Intercept internal navigations
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')) {
      return;
    }

    const type = getTransitionType(link);
    if (!type) return; // data-transition="none"

    e.preventDefault();
    const cfg = config[type] || config[DEFAULT_TYPE];

    // Add transition class to main element instead of body
    sessionStorage.setItem('pageTransitionType', type);
    
    const main = document.querySelector('main');
    if (main) {
      main.classList.add(`page-transitioning--${type}`);
    }
    setTimeout(() => { window.location.href = href; }, cfg.duration);
  });

  // bfcache restore: remove classes from main
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const main = document.querySelector('main');
      if (main) {
        main.classList.remove('page-transitioning--swipe','page-entering--swipe','page-transitioning--fade','page-entering--fade','page-transitioning--scale','page-entering--scale');
      }
    }
  });
})();
