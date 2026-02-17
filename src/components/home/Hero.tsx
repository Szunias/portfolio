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
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-gradient-to-br from-purple-500/10 via-blue-500/8 to-cyan-400/8 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-5xl">

          {/* Name with gradient */}
          <div>
            <h1 className="font-display font-black text-[5rem] sm:text-[7rem] lg:text-[8rem] leading-[0.85] tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                IGOR
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                SZUNIEWICZ
              </span>
            </h1>
          </div>

          {/* Role */}
          <p
            className="text-xl sm:text-2xl md:text-3xl text-slate-300 font-light mt-6 mb-12 max-w-2xl"
          >
            {t('hero.role', 'Game Audio Designer • Composer • Developer')}
          </p>

          {/* CTAs with magnetic hover effect */}
          <div
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/projects"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('hero.view_work', 'Projects')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>

            <a
              href="/cv/Igor_Szuniewicz_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-xl backdrop-blur-sm bg-white/5 overflow-hidden transition-all hover:scale-105 hover:border-white/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              {t('hero.cv_button', 'Download CV')}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </a>

            <Link
              to="/music"
              className="group relative inline-flex items-center justify-center w-14 h-14 border border-white/30 text-white rounded-xl backdrop-blur-sm bg-white/5 overflow-hidden transition-all hover:scale-110 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              title={t('hero.listen_music', 'Listen to Music')}
            >
              <Play size={20} className="ml-0.5 fill-accent group-hover:fill-white transition-colors" />
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
            </Link>
          </div>

          {/* Tech stack */}
          <div
            className="mt-20 flex flex-wrap gap-4"
          >
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 text-sm font-mono text-slate-400 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm hover:border-accent/40 hover:text-white hover:bg-white/10 transition-all cursor-default"
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
