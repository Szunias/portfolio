import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { i18n } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Normalize language code (e.g., 'en-GB' -> 'en') for matching
  const baseLang = i18n.language.split('-')[0];
  const currentLang = languages.find(l => l.code === baseLang) || languages[0];

  return (
    <div className="relative">
      {/* Trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-border hover:border-border-hover bg-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        whileTap={{ scale: 0.95 }}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-xs font-medium text-cream tracking-wider font-label">
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
              className={`absolute right-0 z-[150] p-1 bg-secondary border border-border rounded-sm ${
                dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}
              role="listbox"
              aria-label="Language selector"
            >
              {languages.map((lang) => {
                const isActive = baseLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`
                      w-full px-4 py-2 rounded-sm text-xs font-medium tracking-wider text-left transition-colors duration-150 font-label
                      ${isActive
                        ? 'bg-accent text-primary'
                        : 'text-dim hover:text-cream hover:bg-tertiary'
                      }
                    `}
                    role="option"
                    aria-selected={isActive}
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
