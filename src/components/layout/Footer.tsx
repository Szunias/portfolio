import { Github, Linkedin, Mail, Music } from 'lucide-react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Igor Szuniewicz</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t('hero.label', 'Audio Designer & Developer')}
            </p>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.connect', 'Connect')}</h4>
            <div className="flex space-x-4">
              <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-accent transition-all duration-300 p-2 bg-primary rounded-full hover:bg-accent hover:text-primary hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Linkedin size={20} />
              </a>
              <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-slate-400 hover:text-accent transition-all duration-300 p-2 bg-primary rounded-full hover:bg-accent hover:text-primary hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Github size={20} />
              </a>
              <a href={`mailto:${personal_info.email}`} aria-label="Email" className="text-slate-400 hover:text-accent transition-all duration-300 p-2 bg-primary rounded-full hover:bg-accent hover:text-primary hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Mail size={20} />
              </a>
               <a href={personal_info.social_media.spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify" className="text-slate-400 hover:text-accent transition-all duration-300 p-2 bg-primary rounded-full hover:bg-accent hover:text-primary hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Music size={20} />
              </a>
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.location', 'Location')}</h4>
            <p className="text-slate-300 text-sm">
              {personal_info.location.city}, {personal_info.location.country}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              {t('footer.availability_status', personal_info.availability.status)}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear} Igor Szuniewicz. {t('footer.rights', 'All rights reserved.')}
          </p>
          <p className="text-slate-600 text-xs mt-2 md:mt-0">
            {t('footer.built_with_tech', 'Built with React, TypeScript & Tailwind CSS')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;