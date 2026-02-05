import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation('notFound');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-dots-grid bg-primary">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-accent blur-[60px] opacity-20 animate-pulse"></div>
        <AlertTriangle size={80} className="text-accent relative z-10" />
      </div>
      
      <h1 className="text-6xl font-bold text-white mb-2 font-mono">404</h1>
      <p className="text-xl text-slate-400 mb-8 font-mono">{t('404.title', 'SIGNAL LOST')}</p>
      
      <p className="text-slate-500 max-w-md mb-8">
        {t('404.desc', 'The requested frequency could not be tuned.')}
      </p>

      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-3 bg-secondary border border-slate-700 rounded-full hover:border-accent hover:text-accent transition-all group"
      >
        <Home size={18} />
        <span>{t('404.button', 'Return to Base')}</span>
      </Link>
    </div>
  );
};

export default NotFound;