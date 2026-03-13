import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import Showreel from '../components/features/Showreel';
import Hero from '../components/home/Hero';
import SEO from '../components/layout/SEO';

/** Minimal landing page with hero and showreel. */
const Home = () => {
  useTranslation(['home']);
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);

  useEffect(() => {
    if (!isShowreelOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShowreelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShowreelOpen]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://igorszuniewicz.com",
    "name": "Igor Szuniewicz | Audio Designer & Developer",
    "description": "Portfolio of Igor Szuniewicz - Audio Designer & Developer specializing in Game Audio, Wwise/FMOD implementation, and Interactive Systems."
  };

  return (
    <>
      <SEO />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      <Hero onOpenShowreel={() => setIsShowreelOpen(true)} />

      {isShowreelOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm md:px-8"
          onClick={() => setIsShowreelOpen(false)}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <Showreel mode="modal" onClose={() => setIsShowreelOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Home;
