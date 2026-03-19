import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Linkedin } from 'lucide-react';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { ROUTES } from '@/constants/routes';
import { stagger } from '@/constants/motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation('common');
  const location = useLocation();
  const { personal_info } = usePortfolioData();

  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Close menu on escape key + focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  // Scroll detection (RAF-throttled)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home', 'Home'), path: ROUTES.HOME },
    { name: t('nav.projects', 'Projects'), path: ROUTES.PROJECTS },
    { name: t('nav.music', 'Music'), path: ROUTES.MUSIC },
    { name: t('nav.about', 'About'), path: ROUTES.ABOUT },
    { name: t('nav.contact', 'Contact'), path: ROUTES.CONTACT },
  ];

  const isLinkActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        aria-label={t('accessibility.main_navigation', 'Main navigation')}
        className={`fixed top-0 left-0 right-0 z-nav transition-all duration-300 border-b ${
          scrolled
            ? 'bg-surface/80 backdrop-blur-xl border-border py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-content-wide mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
              <span className="font-display text-[15px] font-semibold uppercase text-text-primary tracking-[0.22em] leading-none">IGOR SZUNIEWICZ</span>
              <span className="text-[9px] text-accent uppercase tracking-[0.35em] font-mono mt-1.5">{t('brand.tagline', 'Audio Designer')}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group relative text-xs uppercase tracking-wider transition-colors duration-200 font-mono pb-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${active ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-accent transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                );
              })}
              <div className="h-4 w-px bg-border"></div>
              <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface" aria-label="GitHub"><Github size={16} /></a>
              <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer me" className="text-text-secondary hover:text-accent transition-colors duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <LanguageSwitcher />
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-text-primary p-3 rounded-md border border-border hover:border-border-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label={isOpen ? t('accessibility.close_menu', 'Close menu') : t('accessibility.open_menu', 'Open menu')}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-menu"
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
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              id="mobile-nav-menu"
              className="md:hidden fixed inset-y-0 right-0 w-80 max-w-full z-nav bg-surface border-l border-border flex flex-col pt-20 px-6"
              role="dialog"
              aria-modal="true"
              aria-label={t('accessibility.navigation_menu', 'Main navigation menu')}
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * stagger.navItems }}
                  >
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      className={`text-2xl font-display py-3 border-b border-border block transition-colors duration-200 ${
                        isLinkActive(link.path) ? 'text-accent' : 'text-text-primary hover:text-accent-hover'
                      }`}
                      aria-current={isLinkActive(link.path) ? 'page' : undefined}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto mb-8 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent p-3 transition-colors duration-200" aria-label="GitHub"><Github size={24} /></a>
                  <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer me" className="text-text-secondary hover:text-accent p-3 transition-colors duration-200" aria-label="LinkedIn"><Linkedin size={24} /></a>
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
