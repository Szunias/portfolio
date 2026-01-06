import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Github, Linkedin } from 'lucide-react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import LanguageSwitcher from './LanguageSwitcher';
import { ROUTES } from '../../constants/routes';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { personal_info } = usePortfolioData();

  // Precision scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('nav')) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const navLinks = [
    { name: t('nav.home', 'Home'), path: ROUTES.HOME },
    { name: t('nav.projects', 'Projects'), path: ROUTES.PROJECTS },
    { name: t('nav.music', 'Music'), path: ROUTES.MUSIC },
    { name: t('nav.about', 'About'), path: ROUTES.ABOUT },
    { name: t('nav.contact', 'Contact'), path: ROUTES.CONTACT },
  ];

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${scrolled 
          ? 'bg-primary/95 backdrop-blur-xl border-white/10 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
          : 'bg-primary/70 backdrop-blur-md border-transparent py-6'
        }
      `}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo - Enhanced */}
          <Link to={ROUTES.HOME} className="group flex flex-col" aria-label="Home">
            <span className="font-display font-bold text-xl text-white tracking-tight group-hover:text-accent transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              IGOR SZUNIEWICZ
            </span>
            <span className="text-[10px] text-dim uppercase tracking-[0.2em] font-mono group-hover:text-accent/80 transition-colors duration-300">
              {t('nav.role_label', 'Audio Designer')}
            </span>
          </Link>

          {/* Desktop Navigation - Clean, spaced out */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-8 mr-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      text-sm font-medium transition-all duration-300 relative py-1
                      ${isActive ? 'text-white font-semibold' : 'text-dim hover:text-white'}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.name}
                    {/* Active Indicator Underline - Enhanced */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent rounded-full shadow-[0_0_12px_rgba(56,189,248,0.6)] animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="h-6 w-px bg-white/10 mr-4" aria-hidden="true"></div>

            {/* Socials - Subtle */}
            <div className="flex items-center gap-4 mr-4">
              <a 
                href={personal_info.social_media.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-dim hover:text-white transition-colors"
                aria-label="GitHub Profile"
              >
                <Github size={18} />
              </a>
              <a 
                href={personal_info.social_media.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-dim hover:text-white transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin size={18} />
              </a>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none p-2 focus:ring-2 focus:ring-accent rounded-md"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Full screen overlay style */}
      {isOpen && (
        <>
          {/* Solid background overlay */}
          <div 
            className="md:hidden fixed inset-0 z-[10000]"
            style={{ backgroundColor: '#050505' }}
            onClick={() => setIsOpen(false)}
          />
          {/* Menu content */}
          <div 
            id="mobile-menu"
            className="md:hidden fixed inset-0 z-[10001] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="min-h-full w-full backdrop-blur-2xl transition-opacity duration-300 pt-24 px-6 pb-12"
              style={{ backgroundColor: '#050505' }}
            >
              <div className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      text-2xl font-display font-bold py-2 transition-all duration-300
                      ${location.pathname === link.path 
                        ? 'text-accent drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                        : 'text-dim hover:text-white'
                      }
                    `}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;