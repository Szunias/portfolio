import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1">
      {['en', 'pl', 'nl'].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase transition-all duration-200
            ${i18n.language === lng 
              ? 'bg-white text-black shadow-lg transform scale-105' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
            }
          `}
        >
          {lng}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;