import { Github, Linkedin, Mail, Music } from 'lucide-react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation();
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
              <a href={personal_info.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-accent transition p-2 bg-primary rounded-full hover:bg-slate-800">
                <Linkedin size={20} />
              </a>
              <a href={personal_info.social_media.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-accent transition p-2 bg-primary rounded-full hover:bg-slate-800">
                <Github size={20} />
              </a>
              <a href={`mailto:${personal_info.email}`} className="text-slate-400 hover:text-accent transition p-2 bg-primary rounded-full hover:bg-slate-800">
                <Mail size={20} />
              </a>
               <a href={personal_info.social_media.spotify} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-accent transition p-2 bg-primary rounded-full hover:bg-slate-800">
                <Music size={20} />
              </a>
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.location', 'Location')}</h4>
            <p className="text-slate-400 text-sm">
              {personal_info.location.city}, {personal_info.location.country}
            </p>
            <p className="text-slate-500 text-xs mt-2">
              {personal_info.availability.status}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear} Igor Szuniewicz. {t('footer.rights', 'All rights reserved.')}
          </p>
          <p className="text-slate-600 text-xs mt-2 md:mt-0">
            {t('footer.built_with', 'Built with')} React, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;