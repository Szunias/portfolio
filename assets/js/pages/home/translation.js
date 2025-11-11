/**
 * Homepage Translation Module
 * Uses unified translation utility
 */

import { initTranslations } from "../../utils/i18n.js";

export function initTranslation() {
  // Unified translation system will auto-detect index.json
  return initTranslations();
}
