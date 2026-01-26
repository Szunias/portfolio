export const locales = ['en', 'pl', 'nl'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
  nl: 'Nederlands',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pl: '🇵🇱',
  nl: '🇳🇱',
};
