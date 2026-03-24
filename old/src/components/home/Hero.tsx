import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Download } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { motion, useReducedMotion } from 'framer-motion';

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

const BACKGROUND_IMAGE = `${import.meta.env.BASE_URL}assets/images/backgrounds/wdaawed.jpg`;

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
    <section className="relative flex h-full flex-col justify-center overflow-hidden bg-surface">
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-center"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/25"
        aria-hidden="true"
      />

      <Container
        className="relative z-10 mx-auto w-full max-w-content-wide px-6 py-16 md:px-12 lg:px-16"
        {...(!prefersReducedMotion && {
          variants: staggerContainer,
          initial: 'hidden',
          animate: 'visible',
        })}
      >
        <div className="max-w-3xl">
          <Item
            className="mb-5 font-mono text-overline uppercase tracking-widest text-accent"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            {t('hero.role', 'Game Audio Designer')}
          </Item>

          <ItemH1
            className="mb-6 font-display text-[clamp(1.75rem,7vw,5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-text-primary"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            IGOR SZUNIEWICZ
          </ItemH1>

          <ItemP
            className="mb-10 max-w-xl text-lg leading-relaxed text-text-secondary"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            {description}
          </ItemP>

          <Item
            className="flex flex-wrap items-center gap-4"
            {...(!prefersReducedMotion && { variants: fadeUp })}
          >
            <button
              type="button"
              onClick={onOpenShowreel}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-body-sm font-semibold text-surface transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Play
                size={14}
                fill="currentColor"
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:scale-110"
              />
              {t('hero.watch_showreel', 'Watch Showreel')}
            </button>

            <Link
              to={ROUTES.PROJECTS}
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-black/15 px-6 py-3 text-body-sm font-semibold text-text-primary transition-all duration-200 hover:border-accent hover:bg-surface-raised active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {t('hero.view_projects', 'View Projects')}
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="opacity-60 transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Link>

            <a
              href={`${import.meta.env.BASE_URL}cv/Igor_Szuniewicz_CV.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('hero.cv_button', 'CV')} (PDF)`}
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-black/15 px-6 py-3 text-body-sm font-semibold text-text-primary transition-all duration-200 hover:border-accent hover:bg-surface-raised active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Download size={14} aria-hidden="true" className="opacity-60" />
              {t('hero.cv_button', 'CV')}
            </a>
          </Item>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
