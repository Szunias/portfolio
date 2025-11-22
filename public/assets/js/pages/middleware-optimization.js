/**
 * Middleware Optimization (Three Wwise Projects) Module
 * Initializes translations using unified translation system
 */

import { initTranslations } from '../utils/i18n.js';

// Initialize translations with debug logging
console.log('[Middleware Optimization] Initializing translations...');
initTranslations().then(() => {
  console.log('[Middleware Optimization] Translations initialized successfully');
}).catch((error) => {
  console.error('[Middleware Optimization] Translation initialization failed:', error);
});
