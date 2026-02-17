import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/layout/SEO';

const NotFound = () => {
  const { t } = useTranslation('notFound');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <SEO title="404" noindex />

      <h1 className="text-[8rem] font-display text-cream-light mb-2 leading-none">404</h1>
      <p className="text-xl text-dim mb-8 font-mono">{t('404.title', 'SIGNAL LOST')}</p>

      <p className="text-dim max-w-md mb-8">
        {t('404.desc', 'The requested frequency could not be tuned.')}
      </p>

      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 border border-border rounded-sm text-cream hover:border-border-hover hover:text-accent transition-colors duration-200"
      >
        <Home size={18} />
        <span>{t('404.button', 'Return to Base')}</span>
      </Link>
    </div>
  );
};

export default NotFound;
