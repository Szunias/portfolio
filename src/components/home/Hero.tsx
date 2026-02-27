import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

/**
 * Decorative SVG waveform that evokes audio / sound design.
 * Renders a smooth polyline with gentle amplitude oscillation.
 */
const Waveform = () => {
  const points = (() => {
    const pts: string[] = [];
    const steps = 120;
    const width = 1200;
    const midY = 40;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const t = i / steps;
      const envelope = Math.sin(t * Math.PI) * 0.9 + 0.1;
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
    <div
      className="absolute inset-x-0 pointer-events-none select-none"
      style={{ top: '55%', transform: 'translateY(-50%)' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="w-[80%] mx-auto h-16 md:h-20 opacity-10"
        fill="none"
      >
        <polyline
          points={points}
          stroke="currentColor"
          className="text-accent"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polyline
          points={points}
          stroke="currentColor"
          className="text-accent"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.3}
          transform="translate(0, 6)"
        />
      </svg>
    </div>
  );
};

/**
 * A single word in the scroll-driven text reveal.
 * Maps a sub-range of scrollYProgress to opacity 0.15 -> 1.
 */
interface ScrollWordProps {
  word: string;
  scrollYProgress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
}

const ScrollWord = ({ word, scrollYProgress, rangeStart, rangeEnd }: ScrollWordProps) => {
  const opacity = useTransform(scrollYProgress, [rangeStart, rangeEnd], [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
};

const Hero = () => {
  const { t } = useTranslation('home');
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Get the description and split into words
  const description = t(
    'hero.description',
    "I make sound for games. Footsteps, ambience, enemy audio. If it plays during gameplay, I probably made it."
  );
  const words = description.split(/\s+/).filter(Boolean);

  // CTA buttons fade in towards the end of the scroll
  const ctaOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.75, 0.9], [20, 0]);

  return (
    <section ref={heroRef} className="relative h-[250vh] bg-surface">
      {/* Sticky inner container that stays visible while scrolling */}
      <div className="sticky top-0 h-screen min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Decorative waveform */}
        <Waveform />

        <div className="relative z-10 w-full max-w-content-wide mx-auto px-6 lg:px-12">
          <div className="max-w-5xl">
            {/* Name */}
            <h1 className="font-display text-[clamp(3rem,10vw,7rem)] text-text-primary leading-[0.95] tracking-[-0.04em] mb-4 text-left">
              IGOR SZUNIEWICZ
            </h1>

            {/* Role */}
            <p className="font-mono text-h4 md:text-h3 text-text-secondary uppercase tracking-widest mb-12">
              {t('hero.role', 'Game Audio Designer')}
            </p>

            {/* Scroll-driven word-by-word text reveal */}
            <div className="text-body md:text-h5 text-text-secondary max-w-2xl leading-relaxed mb-16">
              {prefersReducedMotion ? (
                <p>{description}</p>
              ) : (
                <p aria-label={description}>
                  {words.map((word, i) => {
                    // Each word gets a portion of the 0.1-0.65 scroll range
                    const rangeStart = 0.1 + (i / words.length) * 0.55;
                    const rangeEnd = 0.1 + ((i + 1) / words.length) * 0.55;
                    return (
                      <ScrollWord
                        key={`${word}-${i}`}
                        word={word}
                        scrollYProgress={scrollYProgress}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                      />
                    );
                  })}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            {prefersReducedMotion ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="#showreel"
                  className="group inline-flex items-center gap-2 px-5 py-3 bg-accent text-surface font-sans font-semibold text-body-sm rounded-md hover:bg-accent-hover hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-150"
                >
                  <Play size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform duration-150" />
                  {t('hero.watch_showreel', 'Watch Showreel')}
                </Link>
                <Link
                  to="/projects"
                  className="group inline-flex items-center gap-2 px-5 py-3 border border-border text-text-primary font-sans font-medium text-body-sm rounded-md hover:border-text-secondary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
                >
                  {t('hero.view_projects', 'View Projects')}
                  <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ) : (
              <motion.div
                style={{ opacity: ctaOpacity, y: ctaY }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  to="#showreel"
                  className="group inline-flex items-center gap-2 px-5 py-3 bg-accent text-surface font-sans font-semibold text-body-sm rounded-md hover:bg-accent-hover hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-150"
                >
                  <Play size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform duration-150" />
                  {t('hero.watch_showreel', 'Watch Showreel')}
                </Link>
                <Link
                  to="/projects"
                  className="group inline-flex items-center gap-2 px-5 py-3 border border-border text-text-primary font-sans font-medium text-body-sm rounded-md hover:border-text-secondary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
                >
                  {t('hero.view_projects', 'View Projects')}
                  <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
