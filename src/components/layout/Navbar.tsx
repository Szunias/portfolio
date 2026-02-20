import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Github, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import LanguageSwitcher from './LanguageSwitcher';
import { ROUTES } from '../../constants/routes';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation('common');
  const location = useLocation();
  const { personal_info } = usePortfolioData();

  const closeMenu = () => setIsOpen(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Body scroll lock on mobile menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home', 'Home'), path: ROUTES.HOME },
    { name: t('nav.projects', 'Projects'), path: ROUTES.PROJECTS },
    { name: t('nav.music', 'Music'), path: ROUTES.MUSIC },
    { name: t('nav.about', 'About'), path: ROUTES.ABOUT },
    { name: t('nav.contact', 'Contact'), path: ROUTES.CONTACT },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-primary border-border py-3'
            : 'bg-primary/80 border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex flex-col">
              <span className="font-display text-lg text-cream-light tracking-wide">IGOR SZUNIEWICZ</span>
              <span className="text-[10px] text-dim uppercase tracking-wider font-mono">{t('brand.tagline', 'Audio Designer')}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm transition-colors duration-200 ${isActive ? 'text-cream font-medium' : 'text-dim hover:text-cream'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={isActive ? 'border-b border-accent pb-0.5' : ''}>
                      {link.name}
                    </span>
                  </Link>
                );
              })}
              <div className="h-4 w-px bg-border"></div>
              <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-cream transition-colors duration-200" aria-label="GitHub"><Github size={16} /></a>
              <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer me" className="text-dim hover:text-cream transition-colors duration-200" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <LanguageSwitcher />
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-cream p-3 rounded-sm border border-border hover:border-border-hover transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 right-0 w-80 max-w-full z-50 bg-primary border-l border-border flex flex-col pt-20 px-6"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation menu"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      className={`text-2xl font-display py-3 border-b border-border block ${
                        location.pathname === link.path ? 'text-accent' : 'text-cream hover:text-accent-light'
                      }`}
                      aria-current={location.pathname === link.path ? 'page' : undefined}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto mb-8 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-cream p-3 transition-colors" aria-label="GitHub"><Github size={24} /></a>
                  <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer me" className="text-dim hover:text-cream p-3 transition-colors" aria-label="LinkedIn"><Linkedin size={24} /></a>
                </div>
                <LanguageSwitcher dropUp />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
