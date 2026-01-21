import { motion } from 'framer-motion';
import { ArrowRight, Download, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0f]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-4xl">

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="font-display font-black text-[4rem] sm:text-[6rem] lg:text-[7rem] leading-[0.9] tracking-tight text-white">
              IGOR SZUNIEWICZ
            </h1>
          </motion.div>

          {/* Role */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl text-slate-300 font-light mt-4 mb-12"
          >
            {t('hero.role', 'Game Audio Designer • Composer • Developer')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-accent transition-colors"
            >
              {t('hero.view_work', 'Projects')}
              <ArrowRight size={16} />
            </Link>

            <a
              href="/cv/Igor_Szuniewicz_CV.pdf"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:border-white/40 transition-colors"
            >
              <Download size={16} />
              {t('hero_cv_button', 'CV')}
            </a>

            <Link
              to="/music"
              className="inline-flex items-center justify-center w-12 h-12 border border-white/20 text-white rounded-lg hover:border-white/40 transition-colors"
              title={t('hero.listen_music', 'Music')}
            >
              <Play size={18} className="ml-0.5" fill="currentColor" />
            </Link>
          </motion.div>

          {/* Tech */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 flex flex-wrap gap-3"
          >
            {['Wwise', 'FMOD', 'Unreal Engine 5', 'C++', 'Reaper'].map((tech) => (
              <span key={tech} className="text-sm font-mono text-slate-500">
                {tech}
              </span>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-slate-600 flex items-start justify-center p-1.5"
        >
          <div className="w-0.5 h-1.5 rounded-full bg-slate-500" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
