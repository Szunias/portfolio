import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

import { usePortfolioData } from '@/hooks/usePortfolioData';

const HERO_TECH_STACK = ['Wwise', 'FMOD', 'Unreal Engine 5', 'C++', 'Reaper', 'Unity'];

const Hero = () => {
  const { t } = useTranslation('home');
  const { personal_info } = usePortfolioData();

  const techStack = personal_info.hero_tech_stack ?? HERO_TECH_STACK;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-primary">
      {/* 1. Subtle Timeline Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      />

      {/* 2. Radial Glow Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-accent opacity-[0.04] blur-[120px] mix-blend-screen pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent opacity-[0.03] blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        
        {/* Main Content Area */}
        <div className="max-w-3xl">
          {/* Subtitle / Pre-title */}
          <div className="flex items-center gap-4 mb-6">
             <div className="h-px w-8 bg-accent" />
             <span className="text-accent uppercase tracking-widest text-xs font-mono">
               {t('hero.role', 'Game Audio Designer • Composer')}
             </span>
          </div>

          {/* Name */}
          <div>
            <h1 className="font-display text-[4.5rem] sm:text-[6.5rem] lg:text-[7.5rem] leading-[0.9] tracking-tight text-cream-light font-medium">
              Igor
              <br />
              <span className="italic font-light">Szuniewicz</span>
            </h1>
          </div>

          <p className="text-dim text-lg sm:text-xl font-light mt-8 max-w-lg leading-relaxed">
             {t('hero.tagline', 'Crafting immersive sonic experiences and robust audio systems for interactive media.')}
          </p>

          {/* Buttons: Editorial Style */}
          <div className="flex flex-wrap items-center gap-6 mt-12">
            <Link
              to="/projects"
              className="group flex items-center gap-3 pb-2 border-b border-border hover:border-accent transition-colors duration-300 text-cream uppercase tracking-wider text-sm font-mono"
            >
              {t('hero.view_work', 'View Selected Works')}
              <ArrowRight size={16} className="text-dim group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <a
              href="/cv/Igor_Szuniewicz_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 pb-2 border-b border-border hover:border-accent transition-colors duration-300 text-dim hover:text-cream uppercase tracking-wider text-sm font-mono"
            >
              {t('hero.cv_button', 'Download CV')}
            </a>
            
            {/* Audio Play Button (Pulse) */}
            <Link
              to="/music"
              className="ml-4 md:ml-8 relative flex items-center justify-center w-14 h-14 rounded-full border border-border group hover:border-accent transition-all duration-500 bg-secondary/50"
              title={t('hero.listen_music', 'Listen to Music')}
              aria-label={t('hero.listen_music', 'Listen to Music')}
            >
              <div className="absolute inset-0 rounded-full bg-accent/20 scale-50 opacity-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000 ease-out animate-ping" />
              <Play size={18} className="ml-1 text-cream group-hover:text-accent transition-colors" fill="currentColor" />
            </Link>
          </div>
        </div>

        {/* Tech Stack Sidebar (Audio Meter Vibe) */}
        <div className="md:w-64 hidden sm:flex flex-col border-l border-border pl-8 py-4">
          <span className="text-[10px] text-dim font-mono uppercase tracking-widest mb-6">Technical Arsenal</span>
          <div className="flex flex-col gap-4">
            {techStack.map((tech, index) => (
              <div key={tech} className="flex items-center gap-3 group">
                <span className="text-xs font-mono text-dim/40 w-4">{(index + 1).toString().padStart(2, '0')}</span>
                <span className="text-sm font-sans text-dim group-hover:text-cream transition-colors duration-300">
                  {tech}
                </span>
                <div className="h-px bg-border flex-grow group-hover:bg-border-hover transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
