// CRITICAL FIX: Removed duplicate header scroll effect
// This functionality is already handled by navigation.js initScrollEffect()
// Keeping it here caused duplicate event listeners on every page load

export function initHeaderScroll() {
  // Function intentionally left empty - navigation.js handles this globally
  // This file is kept to avoid breaking imports in home.js
}
