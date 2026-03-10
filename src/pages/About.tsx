import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    motion,
    useReducedMotion,
    useInView,
} from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';

import { Button } from '../components/ui/Button';
import SEO from '../components/layout/SEO';

const PROFILE_IMAGE = `${import.meta.env.BASE_URL}assets/images/profile.jpg`;

const TOOLS = [
    'Wwise', 'FMOD', 'Reaper',
    'Unreal Engine', 'MetaSounds', 'Unity',
    'Python', 'C++', 'C#',
    'Perforce', 'Git', 'Blueprints',
];

/* ------------------------------------------------------------------ */
/*  Motion variants                                                    */
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
/*  Section label                                                      */
/* ------------------------------------------------------------------ */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-mono text-overline text-text-tertiary uppercase tracking-widest mb-5">
        {children}
    </h2>
);

/* ------------------------------------------------------------------ */
/*  Stat card with value + label + detail line                         */
/* ------------------------------------------------------------------ */

interface StatCardProps {
    value: string;
    label: string;
    detail: string;
    color?: string;
}

const StatCard = ({ value, label, detail, color = 'text-accent' }: StatCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            className="md:col-span-1 bg-surface-raised rounded-xl border border-border p-6"
            variants={gridItemVariants}
            aria-label={`${value} ${label}`}
        >
            <motion.span
                className={`block font-display text-h2 md:text-h1 ${color}`}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {value}
            </motion.span>
            <span className="block font-mono text-caption text-text-secondary uppercase tracking-wider mt-1">
                {label}
            </span>
            <p className="text-caption text-text-tertiary mt-3 leading-relaxed">
                {detail}
            </p>
        </motion.div>
    );
};

/* ------------------------------------------------------------------ */
/*  About page                                                         */
/* ------------------------------------------------------------------ */

const About = () => {
    const { t } = useTranslation('about');
    const prefersReducedMotion = useReducedMotion();

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const containerVars = prefersReducedMotion
        ? noMotionContainerVariants
        : gridContainerVariants;
    const itemVars = prefersReducedMotion
        ? noMotionItemVariants
        : gridItemVariants;

    return (
        <div className="min-h-screen relative bg-surface">
            <SEO title={t('about_page_title', 'About')} description={t('about_page_description')} />

            <div className="relative z-10 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pt-32 pb-32">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
                    variants={containerVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* ============================================ */}
                    {/* Row 1 — Hook headline + subtitle             */}
                    {/* ============================================ */}
                    <motion.section
                        className="md:col-span-3 pb-2"
                        variants={itemVars}
                    >
                        <h1 className="font-display text-h1 md:text-hero text-text-primary leading-tight">
                            {t('hook')}
                        </h1>
                        <p className="font-mono text-body-sm text-text-tertiary mt-3 tracking-wide">
                            {t('intro_sub')}
                        </p>
                    </motion.section>

                    {/* ============================================ */}
                    {/* Row 2 — Story (2 cols) + Photo (1 col)       */}
                    {/* On mobile: story first, photo second         */}
                    {/* ============================================ */}
                    <motion.div
                        className="md:col-span-2 bg-surface-raised rounded-xl border border-border p-6 md:p-8 order-2 md:order-1"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_story')}</SectionLabel>
                        <div className="space-y-5 text-body text-text-secondary leading-relaxed max-w-[65ch]">
                            <p>{t('story_1')}</p>
                            <p>{t('story_2')}</p>
                            <p>{t('story_3')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="md:col-span-1 bg-surface-raised rounded-xl border border-border overflow-hidden order-1 md:order-2"
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
                                <div className="absolute inset-0 bg-surface-overlay" />
                            )}
                        </div>
                    </motion.div>

                    {/* ============================================ */}
                    {/* Row 3 — Stats (3 cards with detail lines)    */}
                    {/* ============================================ */}
                    <StatCard
                        value={t('stat_daw_value')}
                        label={t('stat_daw_label')}
                        detail={t('stat_daw_detail')}
                        color="text-accent"
                    />
                    <StatCard
                        value={t('stat_mix_value')}
                        label={t('stat_mix_label')}
                        detail={t('stat_mix_detail')}
                        color="text-accent-warm"
                    />
                    <StatCard
                        value={t('stat_people_value')}
                        label={t('stat_people_label')}
                        detail={t('stat_people_detail')}
                        color="text-accent"
                    />

                    {/* ============================================ */}
                    {/* Row 4 — How I Work (2 cols) + Toolkit (1 col)*/}
                    {/* ============================================ */}
                    <motion.div
                        className="md:col-span-2 bg-surface-raised rounded-xl border border-border p-6 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_approach')}</SectionLabel>
                        <div className="space-y-5 text-body text-text-secondary leading-relaxed max-w-[65ch]">
                            <p>{t('approach_1')}</p>
                            <p>{t('approach_2')}</p>
                            <p>{t('approach_3')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="md:col-span-1 bg-surface-raised rounded-xl border border-border p-6"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_toolkit')}</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {TOOLS.map((tool) => (
                                <span
                                    key={tool}
                                    className="px-3 py-1.5 bg-surface-overlay rounded-md font-mono text-caption text-text-secondary border border-border hover:border-border-hover hover:text-text-primary transition-colors"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* ============================================ */}
                    {/* Row 5 — Education (1 col) + CTA (2 cols)     */}
                    {/* ============================================ */}
                    <motion.div
                        className="md:col-span-1 bg-surface-raised rounded-xl border border-border p-6"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_education')}</SectionLabel>
                        <div className="space-y-4">
                            {(['dae', 'hs', 'piano'] as const).map((key) => (
                                <div key={key} className="border-l-2 border-border pl-4">
                                    <p className="font-display text-body-sm text-text-primary font-medium">
                                        {t(`edu_${key}_name`)}
                                    </p>
                                    <p className="font-mono text-caption text-text-tertiary mt-0.5">
                                        {t(`edu_${key}_desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.section
                        className="md:col-span-2 bg-surface-raised rounded-xl border border-accent/20 p-6 md:p-8"
                        variants={itemVars}
                    >
                        <h2 className="font-display text-h3 text-text-primary mb-2">
                            {t('cta_heading')}
                        </h2>
                        <p className="text-body-sm text-text-secondary mb-6">
                            {t('cta_text')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => window.location.href = '/contact'}
                            >
                                {t('cta_contact')}
                                <ArrowRight size={16} />
                            </Button>
                            <a
                                href={`${import.meta.env.BASE_URL}cv/Igor_Szuniewicz_CV.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="secondary" size="lg" className="gap-2" tabIndex={-1}>
                                    <Download size={16} />
                                    {t('cta_cv')}
                                </Button>
                            </a>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
