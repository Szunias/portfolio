import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import Showreel from '../components/features/Showreel';
import Hero from '../components/home/Hero';
import SEO from '../components/layout/SEO';

/** Minimal landing page with hero and showreel. */
const Home = () => {
  const { t } = useTranslation('home');
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);
  const showreelDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isShowreelOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShowreelOpen(false);
        return;
      }
      if (event.key === 'Tab' && showreelDialogRef.current) {
        const focusable = showreelDialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), iframe',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShowreelOpen]);

  useEffect(() => {
    if (isShowreelOpen && showreelDialogRef.current) {
      const firstFocusable = showreelDialogRef.current.querySelector<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"]), iframe'
      );
      firstFocusable?.focus();
    }
  }, [isShowreelOpen]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://igorszuniewicz.com",
    "name": "Igor Szuniewicz | Audio Designer & Developer",
    "description": t('hero.description', 'I make sound for games. Footsteps, ambience, enemy audio. If it plays during gameplay, I probably made it.')
  };

  return (
    <>
      <SEO />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      {/* Hero pinned behind page content — footer slides over it on scroll */}
      <div className="fixed inset-0 z-0">
        <Hero onOpenShowreel={() => setIsShowreelOpen(true)} />
      </div>

      {/* Spacer matches hero height so footer starts below the fold */}
      <div className="h-dvh" aria-hidden="true" />

      {isShowreelOpen ? (
        <div
          ref={showreelDialogRef}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm md:px-8"
          onClick={() => setIsShowreelOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('hero.showreel_title', 'Showreel')}
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
