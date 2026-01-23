import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n';
import Layout from '@/components/layout/Layout';
import {AudioProvider} from '@/context/AudioContext';

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>Igor Szuniewicz - Audio Designer</title>
        <meta name="description" content="Game Audio Designer & Developer. Wwise, FMOD, Unreal Engine implementation." />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AudioProvider>
            <Layout>{children}</Layout>
          </AudioProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
