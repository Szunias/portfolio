import { useTranslation } from 'react-i18next';
import { Github, Linkedin, Mail, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

import { usePortfolioData } from '@/hooks/usePortfolioData';

const Footer = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: personal_info.social_media.linkedin,
      icon: Linkedin,
      label: 'LinkedIn',
      rel: 'noopener noreferrer me'
    },
    {
      href: personal_info.social_media.github,
      icon: Github,
      label: 'GitHub',
      rel: 'noopener noreferrer'
    },
    {
      href: `mailto:${personal_info.email}`,
      icon: Mail,
      label: 'Email',
      rel: undefined
    },
    {
      href: personal_info.social_media.spotify,
      icon: Music,
      label: 'Spotify',
      rel: 'noopener noreferrer'
    }
  ];

  const navLinks = [
    { to: '/projects', label: t('nav.projects', 'Projects') },
    { to: '/about', label: t('nav.about', 'About') },
    { to: '/music', label: t('nav.music', 'Music') },
    { to: '/contact', label: t('nav.contact', 'Contact') }
  ];

  return (
    <footer className="bg-surface-raised border-t border-border">
      <div className="max-w-content-wide mx-auto px-4 md:px-8 py-12">

        {/* Main footer content - more minimal/editorial */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">

          {/* Brand + Social */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-display text-h4 text-text-primary mb-2">Igor Szuniewicz</h3>
              <p className="text-text-secondary text-body-sm max-w-xs">
                {t('hero.label', 'Audio Designer & Developer')}
              </p>
            </div>

            {/* Social links - prominent with good touch targets */}
            <div className="flex gap-3">
              {socialLinks.map(({ href, icon: Icon, label, rel }) => (
                <a
                  key={label}
                  href={href}
                  target={rel ? '_blank' : undefined}
                  rel={rel}
                  aria-label={label}
                  className="flex items-center justify-center w-11 h-11 text-text-secondary hover:text-accent transition-colors rounded-md hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-3" aria-label={t('footer.nav_label', 'Footer navigation')}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-text-secondary hover:text-accent transition-colors text-body-sm w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised rounded-sm"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Location */}
          <div className="text-body-sm">
            <p className="text-text-primary font-medium mb-1">
              {personal_info.location.city}, {personal_info.location.country}
            </p>
            <p className="text-text-tertiary">
              {t('footer.timezone', 'CET/CEST (UTC+1/+2)')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-8">
          <Link
            to="/contact"
            className="text-text-secondary hover:text-accent transition-colors text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised rounded-sm"
          >
            {t('footer.cta', "Let's create something together \u2192")}
          </Link>
        </div>

        {/* Bottom bar - minimal */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-text-tertiary text-caption">
            &copy; {currentYear} Igor Szuniewicz. {t('footer.rights', 'All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
