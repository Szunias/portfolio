import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { noMotion } from '@/constants/motion';

/**
 * Decorative SVG waveform that evokes audio / sound design.
 * Renders a smooth polyline with gentle amplitude oscillation.
 */
const Waveform = ({ reduced }: { reduced: boolean | null }) => {
  // Generate a hand-crafted waveform path (audio-style sine with varying amplitude)
  const points = (() => {
    const pts: string[] = [];
    const steps = 120;
    const width = 1200;
    const midY = 40;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const t = i / steps;
      // Envelope: fade in, peak in middle, fade out
      const envelope = Math.sin(t * Math.PI) * 0.9 + 0.1;
      // Multi-frequency waveform for organic audio feel
      const wave =
        Math.sin(t * Math.PI * 8) * 12 +
        Math.sin(t * Math.PI * 14 + 0.5) * 6 +
        Math.sin(t * Math.PI * 22 + 1.2) * 3;
      const y = midY + wave * envelope;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  return (
    <motion.div
      className="absolute inset-x-0 pointer-events-none select-none"
      style={{ top: '55%', transform: 'translateY(-50%)' }}
      aria-hidden="true"
      initial={reduced ? { opacity: 0.15 } : { opacity: 0 }}
      animate={reduced ? { opacity: 0.15 } : { opacity: 0.15 }}
      transition={reduced ? { duration: 0 } : { duration: 1.2, delay: 0.3 }}
    >
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="w-[80%] mx-auto h-16 md:h-20"
        fill="none"
      >
        {/* Main waveform line */}
        <motion.polyline
          points={points}
          stroke="currentColor"
          className="text-accent"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={reduced ? {} : { pathLength: 0 }}
          animate={reduced ? {} : { pathLength: 1 }}
          transition={reduced ? {} : { duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Ghost / echo line offset slightly for depth */}
        <motion.polyline
          points={points}
          stroke="currentColor"
          className="text-accent"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.3}
          transform="translate(0, 6)"
          initial={reduced ? {} : { pathLength: 0 }}
          animate={reduced ? {} : { pathLength: 1 }}
          transition={reduced ? {} : { duration: 2.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </motion.div>
  );
};

const Hero = () => {
  const { t } = useTranslation('home');
  const prefersReducedMotion = useReducedMotion();

  const fade = (delay: number) =>
    prefersReducedMotion
      ? noMotion
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
        };

  // Asymmetric fade with varied direction for organic rhythm
  const slideFromRight = (delay: number) =>
    prefersReducedMotion
      ? noMotion
      : {
          initial: { opacity: 0, x: 16 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
        };

  return (
    <section className="relative min-h-[70vh] flex items-start pt-32 md:pt-40 pb-20 overflow-hidden bg-surface">
      {/* Decorative audio waveform */}
      <Waveform reduced={prefersReducedMotion} />

      <div className="relative z-10 w-full max-w-content-wide mx-auto px-6 lg:px-12">
        <div className="max-w-5xl">
          {/* Availability badge - top left - fast attack */}
          <motion.div {...fade(0)} className="mb-6">
            <span className="inline-flex items-center gap-2 font-mono text-caption uppercase tracking-wider text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              {t('hero.availability', 'Available February 2026')}
            </span>
          </motion.div>

          {/* Name - HUGE, fills most of the width - immediate */}
          <motion.h1
            {...fade(0)}
            className="font-display text-[clamp(3rem,12vw,8rem)] text-text-primary leading-[0.95] tracking-[-0.04em] mb-4"
          >
            IGOR SZUNIEWICZ
          </motion.h1>

          {/* Role line - different style, offset right - slides from right */}
          <motion.div
            {...slideFromRight(0.15)}
            className="flex justify-start md:justify-end mb-8"
          >
            <p className="font-mono text-h4 md:text-h3 text-text-secondary uppercase tracking-widest">
              {t('hero.role', 'Audio Designer')}
            </p>
          </motion.div>

          {/* Description - humble and specific, max-w for readability - bigger gap */}
          <motion.p
            {...fade(0.4)}
            className="text-body md:text-h5 text-text-secondary max-w-2xl leading-relaxed mb-3"
          >
            {t(
              'hero.description',
              'I build audio systems that respond to gameplay — footsteps that match the surface, enemies you hear before you see, tension that builds when something\'s wrong.'
            )}
          </motion.p>

          {/* Tech line - mono caption style */}
          <motion.p
            {...fade(0.55)}
            className="font-mono text-caption text-text-tertiary uppercase tracking-wider mb-10"
          >
            {t(
              'hero.description_tech',
              'Wwise & FMOD implementation. C++ audio systems. MetaSounds procedural audio.'
            )}
          </motion.p>

          {/* CTAs - offset left, asymmetric */}
          <motion.div
            {...fade(0.7)}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              to="#showreel"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-surface font-sans font-semibold text-body-sm rounded-md hover:bg-accent-hover hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-150"
            >
              <Play size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform duration-150" />
              {t('hero.watch_showreel', 'Watch Showreel')}
            </Link>

            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-primary font-sans font-medium text-body-sm rounded-md hover:border-text-secondary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              {t('hero.view_projects', 'View Projects')}
              <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
