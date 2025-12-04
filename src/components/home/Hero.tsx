import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AudioVisualizer from '../ui/AudioVisualizer';

const AudioAura = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0">
      {/* Outer soft glow */}
      <div className="absolute inset-0 bg-accent/5 rounded-full blur-[100px]" />
      {/* Core glow */}
      <div className="absolute inset-[30%] bg-accent/8 rounded-full blur-[80px]" />
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Black to transparent gradient - smooth transition to Layout gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-[#020202]/60 to-transparent pointer-events-none" />

      {/* Ambient Background - "Northern Lights" feel */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-accent/10 blur-[150px] rounded-full opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vh] bg-purple-900/10 blur-[120px] rounded-full opacity-20" />
      </div>

      {/* Watermark "TECHNICAL" Text - Strictly Background */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden">
         <h1 className="font-display font-bold text-[20vw] leading-none text-white opacity-[0.03] blur-sm tracking-tighter whitespace-nowrap">
            TECHNICAL
          </h1>
      </div>

      {/* Content - Z-Index 10 to sit above watermark */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center mt-[-5vh]">
        
        {/* Audio Aura - Behind Typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <AudioAura />
        </div>
        
        {/* Dynamic Audio Visualizer - Behind Typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-full max-w-3xl h-64 opacity-60 pointer-events-none mix-blend-screen">
            <AudioVisualizer />
        </div>

        {/* Main Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 relative z-10"
        >
          <h1 className="font-display font-bold text-[5rem] sm:text-[6rem] md:text-[8rem] leading-[0.9] tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            AUDIO <br className="hidden sm:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">
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

      {/* Footer Tech Stack - Minimalist */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute bottom-8 left-0 right-0 text-center z-20"
      >
        <div className="inline-flex items-center gap-4 sm:gap-8 px-6 py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm mx-4">
          {['Wwise', 'Unreal 5', 'C++', 'FMOD', 'Unity', 'Python'].map((tech, i) => (
            <span key={i} className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider hover:text-accent transition-colors cursor-default whitespace-nowrap">
              {tech}
            </span>
          ))}
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;