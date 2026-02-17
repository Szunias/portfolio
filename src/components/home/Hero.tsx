import { ArrowRight, Download, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePortfolioData } from '../../hooks/usePortfolioData';

const HERO_TECH_STACK = ['Wwise', 'FMOD', 'Unreal Engine 5', 'C++', 'Reaper', 'Unity'];

const Hero = () => {
  const { t } = useTranslation('home');
  const { personal_info } = usePortfolioData();

  const techStack = (personal_info as unknown as Record<string, unknown>).hero_tech_stack as string[] | undefined || HERO_TECH_STACK;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-5xl">

          {/* Name */}
          <div>
            <h1 className="font-display font-semibold text-[5rem] sm:text-[7rem] lg:text-[8rem] leading-[0.85] tracking-wide text-cream-light">
              Igor
              <br />
              Szuniewicz
            </h1>
          </div>

          {/* Role */}
          <p className="text-xl sm:text-2xl md:text-3xl text-dim font-light mt-6 mb-12 max-w-2xl">
            {t('hero.role', 'Game Audio Designer • Composer • Developer')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-cream text-primary font-medium rounded-sm transition-colors duration-200 hover:bg-cream-light focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {t('hero.view_work', 'Projects')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="/cv/Igor_Szuniewicz_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-4 border border-border text-cream font-medium rounded-sm transition-colors duration-200 hover:border-border-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <Download size={18} />
              {t('hero.cv_button', 'Download CV')}
            </a>

            <Link
              to="/music"
              className="group inline-flex items-center justify-center w-14 h-14 border border-border text-cream rounded-sm transition-colors duration-200 hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              title={t('hero.listen_music', 'Listen to Music')}
            >
              <Play size={20} className="ml-0.5 fill-accent text-accent" />
            </Link>
          </div>

          {/* Tech stack */}
          <div className="mt-20 flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 text-sm font-mono text-dim border border-border rounded-sm hover:border-border-hover hover:text-cream transition-colors duration-200 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
