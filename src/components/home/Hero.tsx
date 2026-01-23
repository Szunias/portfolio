'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download, Play } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const Hero = () => {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-gradient-to-br from-purple-500/10 via-blue-500/8 to-cyan-400/8 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-5xl">

          {/* Name with gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display font-black text-[5rem] sm:text-[7rem] lg:text-[8rem] leading-[0.85] tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                IGOR
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                SZUNIEWICZ
              </span>
            </h1>
          </motion.div>

          {/* Role */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl text-slate-300 font-light mt-6 mb-12 max-w-2xl"
          >
            {t('role') || 'Game Audio Designer • Composer • Developer'}
          </motion.p>

          {/* CTAs with magnetic hover effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={`/${locale}/projects`}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('view_work') || 'Projects'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>

            <a
              href="/cv/Igor_Szuniewicz_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-xl backdrop-blur-sm bg-white/5 overflow-hidden transition-all hover:scale-105 hover:border-white/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              {t('cv_button') || 'Download CV'}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </a>

            <Link
              href={`/${locale}/music`}
              className="group relative inline-flex items-center justify-center w-14 h-14 border border-white/30 text-white rounded-xl backdrop-blur-sm bg-white/5 overflow-hidden transition-all hover:scale-110 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]"
              title={t('listen_music') || 'Listen to Music'}
            >
              <Play size={20} className="ml-0.5 fill-accent group-hover:fill-white transition-colors" />
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
            </Link>
          </motion.div>

          {/* Tech stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 flex flex-wrap gap-4"
          >
            {['Wwise', 'FMOD', 'Unreal Engine 5', 'C++', 'Reaper', 'Unity'].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-4 py-2 text-sm font-mono text-slate-400 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm hover:border-accent/40 hover:text-white hover:bg-white/10 transition-all cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
