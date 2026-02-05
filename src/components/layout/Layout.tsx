import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AudioPlayer from '../features/AudioPlayer';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t, i18n } = useTranslation('common');

  return (
    <div className="flex flex-col min-h-screen text-text font-sans overflow-x-hidden relative bg-[#050508]">
      <Helmet htmlAttributes={{ lang: i18n.language }}>
        <title>Igor Szuniewicz | Audio Designer</title>
        <meta name="description" content="Game Audio Designer & Developer. Wwise, FMOD, Unreal Engine implementation." />
      </Helmet>

      <div className="relative z-10 flex flex-col min-h-screen">
        <a 
          href="#main-content" 
          className="skip-to-main"
          aria-label="Skip to main content"
        >
          {t('accessibility.skip_to_main', 'Skip to main content')}
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow pt-16 md:pt-20 pb-20 md:pb-24" role="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
      
      <div className="relative z-20">
        <AudioPlayer />
      </div>
    </div>
  );
};

export default Layout;