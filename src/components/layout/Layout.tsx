import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import AudioPlayer from '../features/AudioPlayer';
import ScrollProgress from '../ui/ScrollProgress';
import Footer from './Footer';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

/** Root layout shell: skip-link, navbar, main content area, footer, and the fixed audio player. */
const Layout = ({ children }: LayoutProps) => {
  const { t, i18n } = useTranslation('common');

  return (
    <div className="flex flex-col min-h-screen text-text-primary font-sans overflow-x-clip relative bg-surface">
      <Helmet htmlAttributes={{ lang: i18n.language }} />
      <ScrollProgress />
      <div className="bg-noise" aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <a
          href="#main-content"
          className="skip-to-main"
          aria-label={t('accessibility.skip_to_content')}
        >
          {t('accessibility.skip_to_main', 'Skip to main content')}
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow pb-24" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>

      <div className="relative z-audio-player">
        <AudioPlayer />
      </div>
    </div>
  );
};

export default Layout;