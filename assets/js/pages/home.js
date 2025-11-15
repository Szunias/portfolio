// DISABLED: Using BulletproofI18n instead (loaded globally)
// import { initTranslation } from './home/translation.js';
import { initVimeoFallback } from './home/vimeo.js';
import { initTimestamps } from './home/timestamps.js';
import { initTimelineNav } from './home/timeline-nav.js';
import { initHeaderScroll } from './home/header-scroll.js';
import { initScrollReveal } from './home/scroll-reveal.js';
import { initCounters } from './home/counter.js';
import { initSmoothScroll } from './home/smooth-scroll.js';
import { initCursorGlow } from './home/cursor-glow.js';
import { initProjectCardHover } from './home/project-hover.js';
import { initLanguagePrompt } from './home/language-prompt.js';
// Mobile menu is initialized globally by navigation.js - no need to import here
import { initCvDropdown } from './home/cv-dropdown.js';

// Use BulletproofI18n instead of old translation system
const setLanguage = (lang) => window.i18n?.setLanguage(lang);
const getCurrentLanguage = () => window.i18n?.getLanguage() || 'en';

// CRITICAL FIX: Store cleanup functions for all modules
const cleanupFunctions = [];

initVimeoFallback();
initTimestamps();

// CRITICAL FIX: Store cleanup function from timeline-nav
const timelineNavCleanup = initTimelineNav();
if (timelineNavCleanup) cleanupFunctions.push(timelineNavCleanup);

initHeaderScroll(); // Now empty - navigation.js handles it
initScrollReveal();
initCounters();
initSmoothScroll(); // Now empty - enhanced-smooth-navigation handles it

// CRITICAL FIX: Store cleanup function from cursor-glow
const cursorGlowCleanup = initCursorGlow();
if (cursorGlowCleanup) cleanupFunctions.push(cursorGlowCleanup);

// CRITICAL FIX: Store cleanup function from project-hover
const projectHoverCleanup = initProjectCardHover();
if (projectHoverCleanup) cleanupFunctions.push(projectHoverCleanup);

initLanguagePrompt({ setLanguage, getCurrentLanguage });
// initMobileMenu() - removed, handled by navigation.js
initCvDropdown();

// CRITICAL FIX: Global cleanup function for index page
function cleanupIndexPage() {
  console.log('[Index] cleanupIndexPage() called');

  // 1. Call all stored cleanup functions (cursor-glow, timeline-nav, project-hover)
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      console.warn('[Index] Cleanup error:', error);
    }
  });
  cleanupFunctions.length = 0;

  // 2. Disconnect all tracked IntersectionObservers (scroll-reveal, counter)
  if (window.__indexPageObservers) {
    window.__indexPageObservers.forEach((observer) => {
      observer.disconnect();
    });
    window.__indexPageObservers = [];
  }

  console.log('[Index] cleanupIndexPage() completed');
}

// Expose cleanup function globally
window.__cleanupIndexPage = cleanupIndexPage;

// CRITICAL FIX: Cleanup on page unload (when navigating away from index)
window.addEventListener('beforeunload', cleanupIndexPage);

// CRITICAL FIX: Cleanup when clicking links to navigate away from index
// This is crucial because AJAX is disabled for index.html
document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !link.href) return;

  // If clicking a link that leads away from index page, cleanup first
  const href = link.getAttribute('href');
  if (href && !href.startsWith('#') && href !== '/' && href !== '/index.html' && href !== 'index.html') {
    // User is navigating away from index - cleanup before browser navigates
    console.log('[Index] Navigating away detected, running cleanup');
    cleanupIndexPage();
  }
}, { capture: true });
