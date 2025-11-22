import { motion } from 'framer-motion';
import { Download, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AudioWave from './AudioWave';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { t } = useTranslation();

  const scrollToContent = () => {
    const showreel = document.getElementById('showreel-section');
    if (showreel) {
        showreel.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12 overflow-hidden pt-20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Radial Spotlights */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <AudioWave />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <Sparkles size={12} className="text-accent" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
              {t('hero.badge', 'Technical Audio Design')}
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display font-bold text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] text-white mb-8">
            {t('hero.headline_1_prefix', 'Designing')} <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">{t('hero.headline_1_suffix', 'Sound.')}</span> <br />
            {t('hero.headline_2_prefix', 'Programming')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-400 to-accent animate-gradient-x">
              {t('hero.headline_2_suffix', 'Experience.')}
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t('hero.description', "Technical Sound Designer bridging the void between artistic vision and game engine logic. Specializing in Wwise, FMOD, and C++ Audio Systems.")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
            <Link 
              to="/projects"
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden flex items-center justify-center min-w-[200px]"
            >
              <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 group-hover:text-white transition-colors flex items-center">
                {t('hero.view_work', 'View Selected Work')}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <a 
              href="/cv/Igor_Szuniewicz_CV.pdf" 
              target="_blank"
              className="group px-8 py-4 text-slate-300 hover:text-white font-medium transition-all flex items-center justify-center border-b border-transparent hover:border-accent"
            >
              <Download size={18} className="mr-2" />
              {t('hero.download_cv', 'Download CV')}
            </a>
          </div>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group z-10"
        onClick={scrollToContent}
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-slate-600 uppercase group-hover:text-accent transition-colors">
            {t('hero.scroll', 'Scroll')}
        </span>
        <ChevronDown size={24} className="text-slate-600 group-hover:text-accent transition-colors animate-bounce" />
      </motion.div>

    </section>
  );
};

export default Hero;