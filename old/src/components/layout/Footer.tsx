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
    <footer className="relative z-10 rounded-t-2xl border-t border-border bg-surface shadow-[0_-8px_30px_rgb(0,0,0,0.3)]">
      <div className="max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 py-12">

        {/* Main footer content - 2-column: Brand+nav (left) + Social (right) */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">

          {/* Brand + Navigation */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-display text-h4 text-text-primary mb-2">Igor Szuniewicz</h3>
              <p className="text-text-secondary text-body-sm max-w-xs">
                {t('nav.role_label', 'Audio Designer')}
              </p>
            </div>

            {/* Navigation links - horizontal */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label={t('footer.nav_label', 'Footer navigation')}>
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-text-secondary hover:text-accent transition-colors text-body-sm w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social icons */}
          <div className="flex gap-3">
            {socialLinks.map(({ href, icon: Icon, label, rel }) => (
              <a
                key={label}
                href={href}
                target={rel ? '_blank' : undefined}
                rel={rel}
                aria-label={label}
                className="flex items-center justify-center w-11 h-11 text-text-secondary hover:text-accent transition-colors rounded-md hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar - minimal */}
        <div className="border-t border-border pt-6">
          <p className="text-text-tertiary text-caption">
            &copy; {currentYear} Igor Szuniewicz. {t('footer.rights', 'All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
