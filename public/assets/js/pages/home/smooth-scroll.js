// CRITICAL FIX: Removed duplicate smooth scroll functionality
// This is handled globally by enhanced-smooth-navigation.js
// Duplicate implementations caused memory leaks from accumulated event listeners

export function initSmoothScroll() {
  // Function intentionally left empty - enhanced-smooth-navigation.js handles this globally
  // This file is kept to avoid breaking imports in home.js
}
