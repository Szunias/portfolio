import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    motion,
    useReducedMotion,
    useInView,
    useSpring,
    useMotionValue,
    AnimatePresence,
} from 'framer-motion';
import { Download } from 'lucide-react';

import SEO from '../components/layout/SEO';

const PROFILE_IMAGE = `${import.meta.env.BASE_URL}assets/images/profile.jpg`;

/** Inline SVG waveform icon for the photo placeholder. */
const WaveformIcon = () => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        className="text-text-tertiary"
        aria-hidden="true"
    >
        <rect x="10" y="18" width="4" height="12" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="18" y="12" width="4" height="24" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="26" y="16" width="4" height="16" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="34" y="14" width="4" height="20" rx="2" fill="currentColor" opacity="0.5" />
    </svg>
);

/* ------------------------------------------------------------------ */
/*  Animated counter component for stat cards                          */
/* ------------------------------------------------------------------ */

interface AnimatedNumberProps {
    target: number;
    isInView: boolean;
    reducedMotion: boolean | null;
}

const AnimatedNumber = ({ target, isInView, reducedMotion }: AnimatedNumberProps) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.5,
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (reducedMotion) {
            setDisplayValue(target);
            return;
        }
        if (isInView) {
            motionValue.set(target);
        }
    }, [isInView, target, motionValue, reducedMotion]);

    useEffect(() => {
        if (reducedMotion) return;
        const unsubscribe = springValue.on('change', (latest) => {
            setDisplayValue(Math.round(latest));
        });
        return unsubscribe;
    }, [springValue, reducedMotion]);

    return <>{displayValue}</>;
};

/* ------------------------------------------------------------------ */
/*  Variant definitions                                                */
/* ------------------------------------------------------------------ */

const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const gridItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] },
    },
};

const noMotionContainerVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0 } },
};

const noMotionItemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/* ------------------------------------------------------------------ */
/*  About page component                                               */
/* ------------------------------------------------------------------ */

const About = () => {
    const { t } = useTranslation('about');
    const prefersReducedMotion = useReducedMotion();

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [storyExpanded, setStoryExpanded] = useState(false);

    const containerVars = prefersReducedMotion
        ? noMotionContainerVariants
        : gridContainerVariants;
    const itemVars = prefersReducedMotion
        ? noMotionItemVariants
        : gridItemVariants;

    // Refs for stat count-up
    const statGamesRef = useRef<HTMLDivElement>(null);
    const statPianoRef = useRef<HTMLDivElement>(null);
    const statLatencyRef = useRef<HTMLDivElement>(null);

    const gamesInView = useInView(statGamesRef, { once: true, amount: 0.5 });
    const pianoInView = useInView(statPianoRef, { once: true, amount: 0.5 });
    const latencyInView = useInView(statLatencyRef, { once: true, amount: 0.5 });

    const toggleStory = useCallback(() => {
        setStoryExpanded((prev) => !prev);
    }, []);

    return (
        <div className="min-h-screen relative bg-surface">
            <SEO title={t('about_page_title', 'About')} description={t('about_page_description')} />

            <div className="relative z-10 max-w-content-wide mx-auto px-6 lg:px-8 pt-32 pb-32">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
                    variants={containerVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* ============================================ */}
                    {/* Row 1: INTRO (span 3)                        */}
                    {/* ============================================ */}
                    <motion.section
                        className="md:col-span-3"
                        variants={itemVars}
                    >
                        <h1 className="font-display text-h1 text-text-primary leading-tight">
                            {t('intro')}
                        </h1>
                    </motion.section>

                    {/* ============================================ */}
                    {/* Row 2: PHOTO (1 col) + STORY (2 cols)        */}
                    {/* ============================================ */}
                    <motion.div
                        className="md:col-span-1 bg-surface-raised rounded-lg border border-border overflow-hidden"
                        variants={itemVars}
                    >
                        <div className="aspect-[3/4] w-full relative">
                            {!imageError && (
                                <img
                                    src={PROFILE_IMAGE}
                                    alt={t('profile_photo_alt', 'Igor Szuniewicz')}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <WaveformIcon />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        className="md:col-span-2 bg-surface-raised rounded-lg border border-border p-6 md:p-8"
                        variants={itemVars}
                    >
                        <p className="text-body text-text-secondary leading-relaxed">
                            {t('story_1')}
                        </p>

                        <AnimatePresence initial={false}>
                            {storyExpanded && (
                                <motion.div
                                    key="story-expanded"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-6 pt-6">
                                        <p className="text-body text-text-secondary leading-relaxed">
                                            {t('story_2')}
                                        </p>
                                        <p className="text-body text-text-secondary leading-relaxed">
                                            {t('story_3')}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={toggleStory}
                            aria-expanded={storyExpanded}
                            className="text-accent hover:text-accent-hover text-body-sm font-medium mt-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm"
                        >
                            {storyExpanded
                                ? t('story_collapse', 'Show less')
                                : t('story_expand', 'Read more')}
                        </button>
                    </motion.div>

                    {/* ============================================ */}
                    {/* Row 3: QUOTE (span 3, accent band)           */}
                    {/* ============================================ */}
                    <motion.div
                        className="md:col-span-3 -mx-4 md:-mx-5 bg-accent/5 py-12 md:py-16 px-6 md:px-10"
                        variants={itemVars}
                    >
                        <blockquote className="max-w-content mx-auto">
                            <p className="font-display text-h2 md:text-h1 text-text-primary leading-snug">
                                {t('pull_quote')}
                            </p>
                        </blockquote>
                    </motion.div>

                    {/* ============================================ */}
                    {/* Row 4: STATS (3 equal cards)                  */}
                    {/* ============================================ */}
                    <motion.div
                        ref={statGamesRef}
                        className="md:col-span-1 bg-surface-raised rounded-lg border border-border p-6 text-center"
                        variants={itemVars}
                        aria-label={`${t('stat_games_value', '4')} ${t('stat_games_label', 'Games Shipped')}`}
                    >
                        <span className="block font-display text-h1 md:text-hero text-accent">
                            <AnimatedNumber
                                target={4}
                                isInView={gamesInView}
                                reducedMotion={prefersReducedMotion}
                            />
                        </span>
                        <span className="block font-mono text-caption text-text-secondary uppercase tracking-wider mt-2">
                            {t('stat_games_label', 'Games Shipped')}
                        </span>
                    </motion.div>

                    <motion.div
                        ref={statPianoRef}
                        className="md:col-span-1 bg-surface-raised rounded-lg border border-border p-6 text-center"
                        variants={itemVars}
                        aria-label={`${t('stat_piano_value', '12')} ${t('stat_piano_label', 'Years Piano')}`}
                    >
                        <span className="block font-display text-h1 md:text-hero text-accent">
                            <AnimatedNumber
                                target={12}
                                isInView={pianoInView}
                                reducedMotion={prefersReducedMotion}
                            />
                        </span>
                        <span className="block font-mono text-caption text-text-secondary uppercase tracking-wider mt-2">
                            {t('stat_piano_label', 'Years Piano')}
                        </span>
                    </motion.div>

                    <motion.div
                        ref={statLatencyRef}
                        className="md:col-span-1 bg-surface-raised rounded-lg border border-border p-6 text-center"
                        variants={itemVars}
                        aria-label={`${t('stat_latency_value', '<55ms')} ${t('stat_latency_label', 'Best Latency')}`}
                    >
                        <motion.span
                            className="block font-display text-h1 md:text-hero text-accent"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={latencyInView ? { opacity: 1 } : undefined}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            {t('stat_latency_value', '<55ms')}
                        </motion.span>
                        <span className="block font-mono text-caption text-text-secondary uppercase tracking-wider mt-2">
                            {t('stat_latency_label', 'Best Latency')}
                        </span>
                    </motion.div>

                    {/* ============================================ */}
                    {/* Row 5: APPROACH (2 cols) + EDUCATION (1 col)  */}
                    {/* ============================================ */}
                    <motion.div
                        className="md:col-span-2 bg-surface-raised rounded-lg border border-border p-6 md:p-8"
                        variants={itemVars}
                    >
                        <div className="text-body text-text-secondary space-y-6">
                            <p className="leading-relaxed">{t('approach_1')}</p>
                            <p className="leading-relaxed">{t('approach_2')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="md:col-span-1 bg-surface-raised rounded-lg border border-border p-6"
                        variants={itemVars}
                    >
                        <div className="space-y-2">
                            <div className="bg-surface-overlay rounded-md px-3 py-2 font-mono text-body-sm text-text-secondary">
                                {t('edu_dae')}
                            </div>
                            <div className="bg-surface-overlay rounded-md px-3 py-2 font-mono text-body-sm text-text-secondary">
                                {t('edu_hs')}
                            </div>
                            <div className="bg-surface-overlay rounded-md px-3 py-2 font-mono text-body-sm text-text-secondary">
                                {t('edu_piano')}
                            </div>
                        </div>
                    </motion.div>

                    {/* ============================================ */}
                    {/* Row 6: CTA (span 3)                          */}
                    {/* ============================================ */}
                    <motion.section
                        className="md:col-span-3 bg-surface-raised rounded-lg border border-border p-6 md:p-8"
                        variants={itemVars}
                    >
                        <p className="font-display text-h3 text-text-primary mb-6">
                            {t('cta_text')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-surface font-semibold rounded-md transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            >
                                {t('cta_contact', 'Say hi')}
                            </Link>
                            <a
                                href={`${import.meta.env.BASE_URL}cv/Igor_Szuniewicz_CV.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-primary font-medium rounded-md transition-all duration-200 hover:border-text-secondary hover:bg-surface-overlay active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            >
                                <Download size={16} />
                                {t('cta_cv', 'My CV')}
                            </a>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
