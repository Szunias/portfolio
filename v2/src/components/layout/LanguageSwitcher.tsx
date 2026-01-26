'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/50 transition-colors"
        aria-label="Select language"
      >
        <span className="text-lg">{localeFlags[locale]}</span>
        <span className="text-sm font-medium text-text-secondary hidden sm:inline">
          {locale.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 bg-surface-elevated border border-border rounded-lg shadow-xl overflow-hidden z-50"
          >
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  loc === locale
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                <span className="text-lg">{localeFlags[loc]}</span>
                <span className="text-sm font-medium">{localeNames[loc]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
