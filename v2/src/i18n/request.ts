import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en';
  }

  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const home = (await import(`../../messages/${locale}/home.json`)).default;
  const about = (await import(`../../messages/${locale}/about.json`)).default;
  const projects = (await import(`../../messages/${locale}/projects.json`)).default;
  const music = (await import(`../../messages/${locale}/music.json`)).default;
  const contact = (await import(`../../messages/${locale}/contact.json`)).default;

  return {
    locale,
    messages: {
      ...common,
      ...home,
      about,
      projects,
      music,
      contact,
    },
  };
});
