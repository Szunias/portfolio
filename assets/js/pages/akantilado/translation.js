/**
 * Akantilado Project Translation Module
 * Uses unified translation utility
 */

import { initTranslations as initI18nTranslations } from "../../utils/i18n.js";

export function initTranslations() {
  // Unified translation system will auto-detect akantilado.json
  return initI18nTranslations();
}
