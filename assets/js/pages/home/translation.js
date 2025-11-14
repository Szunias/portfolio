/**
 * Homepage Translation Module
 * Uses unified translation utility
 */

import {
  initTranslations,
  setLanguage,
  getCurrentLanguage
} from "../../utils/i18n.js";

export function initTranslation() {
  // Initialize translations asynchronously
  initTranslations();

  // Return utility functions immediately (they'll work once initialized)
  return {
    setLanguage,
    getCurrentLanguage
  };
}
