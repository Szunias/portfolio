import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { usePortfolioData } from '@/hooks/usePortfolioData';
import { stagger, noMotion } from '@/constants/motion';

const HERO_TECH_STACK = ['Wwise', 'FMOD', 'Unreal Engine', 'C++'];

const Hero = () => {
  const { t } = useTranslation('home');
  const { personal_info } = usePortfolioData();
  const prefersReducedMotion = useReducedMotion();

  const techStack = personal_info.hero_tech_stack ?? HERO_TECH_STACK;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-surface">
      <div className="relative z-10 w-full max-w-content-wide mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">

          {/* Left: Main Content */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.0, 0.0, 0.2, 1] }}
            className="space-y-8"
          >
            {/* Name as brand mark */}
            <div>
              <h1 className="font-display text-hero text-text-primary leading-[1.1] tracking-[-0.03em]">
                Igor Szuniewicz
              </h1>
              <p className="mt-4 font-sans text-h4 text-text-secondary font-normal">
                {t('hero.role', 'Game Audio Designer & Developer')}
              </p>
            </div>

            {/* Skills Tag Row */}
            <div className="flex flex-wrap gap-2.5">
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={prefersReducedMotion ? noMotion.initial : { opacity: 0, scale: 0.9 }}
                  animate={prefersReducedMotion ? noMotion.animate : { opacity: 1, scale: 1 }}
                  transition={prefersReducedMotion ? noMotion.transition : { delay: 0.6 + index * stagger.tags, duration: 0.3 }}
                  className="font-mono text-label uppercase bg-accent/10 text-accent border border-accent/15 rounded px-2.5 py-1"
                >
                  {tech}
                </motion.span>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={prefersReducedMotion ? noMotion.initial : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? noMotion.animate : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? noMotion.transition : { delay: 0.9, duration: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="#showreel"
                className="group inline-flex items-center gap-3 px-6 py-3 bg-accent text-surface font-sans font-semibold text-sm rounded-md hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
              >
                <Play size={16} fill="currentColor" />
                {t('hero.watch_showreel', 'Watch Showreel')}
              </Link>

              <Link
                to="/projects"
                className="group inline-flex items-center gap-3 px-6 py-3 border border-border text-text-primary font-sans font-medium text-sm rounded-md hover:border-text-secondary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
              >
                {t('hero.view_projects', 'View Projects')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Animated Waveform Visual */}
          <motion.div
            initial={prefersReducedMotion ? noMotion.initial : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? noMotion.animate : { opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? noMotion.transition : { delay: 0.5, duration: 0.6 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="flex items-end gap-2 h-48">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 bg-accent rounded-sm origin-bottom ${!prefersReducedMotion ? `animate-waveform-${i}` : ''}`}
                  style={{ height: '30%' }}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
