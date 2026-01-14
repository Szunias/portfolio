import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-[#020202]/70 to-transparent pointer-events-none" />

      {/* Subtle static ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_85%_65%,rgba(147,51,234,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_94%,rgba(148,163,184,0.06)_100%)] bg-[length:100%_8px] opacity-40" />
      </div>

      {/* Content - Z-Index 10 to sit above watermark */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center mt-[-5vh]">
        
        {/* Main Typography - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 relative z-10"
        >
          <div className="inline-flex items-center gap-3 mb-4 text-xs uppercase tracking-[0.35em] text-slate-500">
            <span className="h-[1px] w-10 bg-slate-600/70" />
            <span>Interactive Audio</span>
            <span className="h-[1px] w-10 bg-slate-600/70" />
          </div>
          <h1 className="font-display font-semibold text-[4.5rem] sm:text-[6rem] md:text-[7.5rem] leading-[0.85] tracking-[0.01em] text-slate-100">
            AUDIO
            <span className="block mt-[-0.04em] hero-outline tracking-[0.18em]">
              DESIGN
            </span>
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg sm:text-xl text-slate-400 max-w-lg font-light leading-relaxed mb-12"
        >
          {t('hero.description_tech', 'Bridging the void between artistic vision and engine logic.')}
        </motion.p>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-10"
        >
          <Link 
            to="/projects" 
            className="group flex items-center gap-3 text-white border-b border-white/20 pb-1 hover:border-accent hover:text-accent transition-all duration-300"
          >
            <span className="uppercase tracking-widest text-sm font-medium">{t('hero.view_work', 'View Selected Works')}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <a 
            href="/cv/Igor_Szuniewicz_CV.pdf" 
            target="_blank"
            className="text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-widest flex items-center gap-2"
          >
            <Download size={14} />
            <span>{t('hero_cv_button', 'CV / Resume')}</span>
          </a>
        </motion.div>

      </div>

        {/* Footer Tech Stack - Enhanced */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="absolute bottom-8 left-0 right-0 text-center z-20"
        >
          <div className="inline-flex items-center gap-4 sm:gap-8 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-4 shadow-[0_0_30px_rgba(56,189,248,0.1)] hover:border-accent/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.2)] transition-all duration-500">
            {['Wwise', 'Unreal 5', 'C++', 'FMOD', 'Unity', 'Python'].map((tech, i) => (
              <span key={i} className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider hover:text-accent transition-colors cursor-default whitespace-nowrap group/tech">
                <span className="group-hover/tech:text-accent transition-colors">{tech}</span>
              </span>
            ))}
          </div>
        </motion.div>

    </section>
  );
};

export default Hero;