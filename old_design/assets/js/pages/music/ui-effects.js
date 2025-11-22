// CRITICAL FIX: Track observers for cleanup
window.__musicPageObservers = window.__musicPageObservers || [];

// CRITICAL FIX: Removed duplicate header scroll effect
// This functionality is already handled by navigation.js initScrollEffect()
// Keeping it here caused duplicate event listeners on every AJAX navigation

function initScrollReveal() {
  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px 100px 0px'
  };

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // CRITICAL FIX: Unobserve after adding class to prevent unnecessary checks
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // CRITICAL FIX: Track observer for cleanup
  window.__musicPageObservers.push(observer);

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

// CRITICAL FIX: Removed smooth scroll functionality
// This is handled globally by enhanced-smooth-navigation.js
// Duplicate implementations caused memory leaks from accumulated event listeners

export function initPageEffects() {
  // CRITICAL FIX: Only call initScrollReveal once, removed multiple DOMContentLoaded/load listeners
  // The function is already called during page init, no need for duplicate event listeners
  initScrollReveal();
}
