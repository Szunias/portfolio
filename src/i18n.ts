import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'pl', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Available translation namespaces
export const namespaces = [
  'common',
  'home',
  'about',
  'contact',
  'projects',
  'music',
  'shadow-frames',
  'transientica',
  'sound-design',
  'middleware-optimization',
  'gradwork'
] as const;

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  // Load all translation files for this locale
  const messages: Record<string, any> = {};

  for (const ns of namespaces) {
    try {
      const nsMessages = (await import(`@/messages/${locale}/${ns}.json`)).default;
      messages[ns] = nsMessages;
    } catch (error) {
      console.warn(`Could not load namespace ${ns} for locale ${locale}`);
    }
  }

  return {
    locale,
    // Merge all namespaces into a single messages object
    messages: {
      ...messages.common,
      ...messages.home,
      ...messages.about,
      ...messages.contact,
      ...messages.projects,
      ...messages.music,
      ...messages['shadow-frames'],
      ...messages.transientica,
      ...messages['sound-design'],
      ...messages['middleware-optimization'],
      ...messages.gradwork,
    },
    timeZone: 'Europe/Brussels',
    now: new Date()
  };
});
