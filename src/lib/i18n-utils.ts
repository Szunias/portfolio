/**
 * Helper utilities for next-intl migration
 * These utilities help bridge the gap between react-i18next and next-intl APIs
 */

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Wrapper that mimics react-i18next's useTranslation API
 * Usage: Replace `useTranslation()` with `useTranslationsLegacy()`
 *
 * For new code, prefer using `useTranslations('namespace')` directly
 */
export function useTranslationsLegacy(namespace?: string) {
  const t = useNextIntlTranslations(namespace || '');

  return {
    t,
    // react-i18next compatibility
    i18n: {
      language: 'en', // This will be handled by next-intl automatically
      changeLanguage: () => {}, // Language changes handled by Next.js routing
    },
  };
}

/**
 * Helper to get translation function for a specific namespace
 */
export function useTranslations(ns: string) {
  return useNextIntlTranslations(ns);
}
