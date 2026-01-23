import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Import all messages statically
import enCommon from '../messages/en/common.json';
import enHome from '../messages/en/home.json';
import enAbout from '../messages/en/about.json';
import enContact from '../messages/en/contact.json';
import enProjects from '../messages/en/projects.json';
import enMusic from '../messages/en/music.json';
import enShadowFrames from '../messages/en/shadow-frames.json';
import enTransientica from '../messages/en/transientica.json';
import enSoundDesign from '../messages/en/sound-design.json';
import enMiddlewareOpt from '../messages/en/middleware-optimization.json';
import enGradwork from '../messages/en/gradwork.json';

import plCommon from '../messages/pl/common.json';
import plHome from '../messages/pl/home.json';
import plAbout from '../messages/pl/about.json';
import plContact from '../messages/pl/contact.json';
import plProjects from '../messages/pl/projects.json';
import plMusic from '../messages/pl/music.json';
import plShadowFrames from '../messages/pl/shadow-frames.json';
import plTransientica from '../messages/pl/transientica.json';
import plSoundDesign from '../messages/pl/sound-design.json';
import plMiddlewareOpt from '../messages/pl/middleware-optimization.json';
import plGradwork from '../messages/pl/gradwork.json';

import nlCommon from '../messages/nl/common.json';
import nlHome from '../messages/nl/home.json';
import nlAbout from '../messages/nl/about.json';
import nlContact from '../messages/nl/contact.json';
import nlProjects from '../messages/nl/projects.json';
import nlMusic from '../messages/nl/music.json';
import nlShadowFrames from '../messages/nl/shadow-frames.json';
import nlTransientica from '../messages/nl/transientica.json';
import nlSoundDesign from '../messages/nl/sound-design.json';
import nlMiddlewareOpt from '../messages/nl/middleware-optimization.json';
import nlGradwork from '../messages/nl/gradwork.json';

export const locales = ['en', 'pl', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const messages = {
  en: {
    ...enCommon,
    ...enHome,
    ...enAbout,
    ...enContact,
    ...enProjects,
    ...enMusic,
    ...enShadowFrames,
    ...enTransientica,
    ...enSoundDesign,
    ...enMiddlewareOpt,
    ...enGradwork,
  },
  pl: {
    ...plCommon,
    ...plHome,
    ...plAbout,
    ...plContact,
    ...plProjects,
    ...plMusic,
    ...plShadowFrames,
    ...plTransientica,
    ...plSoundDesign,
    ...plMiddlewareOpt,
    ...plGradwork,
  },
  nl: {
    ...nlCommon,
    ...nlHome,
    ...nlAbout,
    ...nlContact,
    ...nlProjects,
    ...nlMusic,
    ...nlShadowFrames,
    ...nlTransientica,
    ...nlSoundDesign,
    ...nlMiddlewareOpt,
    ...nlGradwork,
  },
};

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: messages[locale as Locale],
    timeZone: 'Europe/Brussels',
    now: new Date()
  };
});
