/**
 * Pause & Deserve Project Module
 * Initializes translations using unified translation system
 */

import { initTranslations } from '../utils/i18n.js';

// Initialize translations with debug logging
console.log('[Pause & Deserve] Initializing translations...');
initTranslations().then(() => {
  console.log('[Pause & Deserve] Translations initialized successfully');
}).catch((error) => {
  console.error('[Pause & Deserve] Translation initialization failed:', error);
});
