import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Decorative waveform – subtle background element                   */
/* ------------------------------------------------------------------ */
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
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[70%] h-[60%] opacity-[0.06]"
        fill="none"
      >
        <polyline
          points={points}
          stroke="currentColor"
          className="text-accent"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={points}
          stroke="currentColor"
          className="text-accent"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4}
          transform="translate(0, 6)"
        />
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */
const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
type HeroProps = {
  onOpenShowreel?: () => void;
};

const Hero = ({ onOpenShowreel }: HeroProps) => {
  const { t } = useTranslation('home');
  const prefersReducedMotion = useReducedMotion();

  const description = t(
    'hero.description',
    'I make sound for games. Footsteps, ambience, enemy audio. If it plays during gameplay, I probably made it.',
  );

  const Container = prefersReducedMotion ? 'div' : motion.div;
  const Item = prefersReducedMotion ? 'div' : motion.div;
  const ItemP = prefersReducedMotion ? 'p' : motion.p;
  const ItemH1 = prefersReducedMotion ? 'h1' : motion.h1;

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center bg-surface overflow-hidden">
      {/* Background waveform */}
      <Waveform />

      {/* Content */}
      <Container
        className="relative z-10 w-full max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 py-16"
        {...(!prefersReducedMotion && {
          variants: staggerContainer,
          initial: 'hidden',
          animate: 'visible',
        })}
      >
        <div className="max-w-3xl">
          {/* Overline */}
          <Item
            className="text-overline uppercase tracking-widest text-accent font-mono mb-5"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            {t('hero.role', 'Game Audio Designer')}
          </Item>

          {/* Name */}
          <ItemH1
            className="font-display text-[clamp(2.5rem,7vw,5rem)] text-text-primary font-bold leading-[1.05] tracking-[-0.04em] mb-6"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            IGOR SZUNIEWICZ
          </ItemH1>

          {/* Description */}
          <ItemP
            className="text-lg text-text-secondary max-w-xl leading-relaxed mb-10"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            {description}
          </ItemP>

          {/* CTA Buttons */}
          <Item
            className="flex flex-wrap items-center gap-4"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            <button
              type="button"
              onClick={onOpenShowreel}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-surface font-semibold text-body-sm rounded-lg hover:bg-accent-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              <Play
                size={14}
                fill="currentColor"
                className="group-hover:scale-110 transition-transform duration-150"
              />
              {t('hero.watch_showreel', 'Watch Showreel')}
            </button>
            <Link
              to="/projects"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-primary font-semibold text-body-sm rounded-lg hover:border-accent hover:bg-surface-raised active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              {t('hero.view_projects', 'View Projects')}
              <ArrowRight
                size={14}
                className="opacity-60 group-hover:translate-x-0.5 transition-transform duration-150"
              />
            </Link>
          </Item>
        </div>
      </Container>

      {/* Scroll indicator */}
      {prefersReducedMotion ? (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-tertiary">
          <ChevronDown size={20} />
        </div>
      ) : (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 1.2, ease },
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <ChevronDown size={20} />
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
