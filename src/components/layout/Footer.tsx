import { useTranslation } from 'react-i18next';
import { Github, Linkedin, Mail, Music } from 'lucide-react';

import { usePortfolioData } from '@/hooks/usePortfolioData';

const Footer = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl text-cream-light mb-4">Igor Szuniewicz</h3>
            <p className="text-dim text-sm leading-relaxed max-w-xs">
              {t('hero.label', 'Audio Designer & Developer')}
            </p>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4 uppercase tracking-wider">{t('footer.connect', 'Connect')}</h4>
            <div className="flex space-x-4">
              <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer me" aria-label="LinkedIn" className="text-dim hover:text-accent transition-all duration-200 hover:scale-110 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Linkedin size={20} />
              </a>
              <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-dim hover:text-accent transition-all duration-200 hover:scale-110 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Github size={20} />
              </a>
              <a href={`mailto:${personal_info.email}`} aria-label="Email" className="text-dim hover:text-accent transition-all duration-200 hover:scale-110 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Mail size={20} />
              </a>
              <a href={personal_info.social_media.spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify" className="text-dim hover:text-accent transition-all duration-200 hover:scale-110 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                <Music size={20} />
              </a>
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4 uppercase tracking-wider">{t('footer.location', 'Location')}</h4>
            <p className="text-cream text-sm">
              {personal_info.location.city}, {personal_info.location.country}
            </p>
            <p className="text-dim text-xs mt-2">
              {t('footer.availability_status', personal_info.availability.status)}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-dim text-xs">
            &copy; {currentYear} Igor Szuniewicz. {t('footer.rights', 'All rights reserved.')}
          </p>
          <p className="text-dim/60 text-xs mt-2 md:mt-0">
            {t('footer.built_with_tech', 'Built with React, TypeScript & Tailwind CSS')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
