import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

import { Button } from '../components/ui/Button';
import SEO from '../components/layout/SEO';

/** 404 page with audio-themed "Dead Air" message and waveform flatline animation. */
const NotFound = () => {
  const { t } = useTranslation('notFound');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-surface pt-32">
      <SEO title="404" noindex />

      {/* Waveform Flatline - 5 bars with low amplitude */}
      <div className="flex items-end gap-1.5 mb-8 h-10" role="presentation" aria-hidden="true">
        <div className="w-1.5 bg-accent/50 rounded-full animate-waveform-1 origin-bottom" style={{ height: '24px', animationDuration: '2.5s' }}></div>
        <div className="w-1.5 bg-accent/50 rounded-full animate-waveform-2 origin-bottom" style={{ height: '32px', animationDuration: '2.5s' }}></div>
        <div className="w-1.5 bg-accent/50 rounded-full animate-waveform-3 origin-bottom" style={{ height: '20px', animationDuration: '2.5s' }}></div>
        <div className="w-1.5 bg-accent/50 rounded-full animate-waveform-4 origin-bottom" style={{ height: '28px', animationDuration: '2.5s' }}></div>
        <div className="w-1.5 bg-accent/50 rounded-full animate-waveform-5 origin-bottom" style={{ height: '24px', animationDuration: '2.5s' }}></div>
      </div>

      <h1 className="text-hero font-display text-text-primary mb-2 leading-none">404</h1>
      <p className="text-xl text-text-secondary mb-4 font-mono tracking-widest uppercase">{t('404.title', 'DEAD AIR')}</p>

      <p className="text-text-secondary max-w-md mb-8 text-body">
        {t('404.desc', 'The requested frequency could not be tuned.')}
      </p>

      <Link to="/">
        <Button variant="secondary" size="lg" className="gap-2" tabIndex={-1}>
          <Home size={18} />
          <span>{t('404.button', 'Return to Base')}</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
