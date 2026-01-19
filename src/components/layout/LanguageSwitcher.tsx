import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
  { code: 'nl', label: 'NL' },
];

interface LanguageSwitcherProps {
  dropUp?: boolean;
}

const LanguageSwitcher = ({ dropUp = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      {/* Trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-accent/50 bg-white/5 hover:bg-white/10 transition-all duration-300"
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xs font-bold text-white tracking-wider">
          {currentLang.label}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="text-dim" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: dropUp ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dropUp ? 4 : -4 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 z-[150] p-1 bg-[#111] border border-white/10 rounded-xl shadow-xl ${
                dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}
            >
              {languages.map((lang) => {
                const isActive = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`
                      w-full px-4 py-2 rounded-lg text-xs font-bold tracking-wider text-left transition-all duration-150
                      ${isActive 
                        ? 'bg-accent text-black' 
                        : 'text-dim hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
