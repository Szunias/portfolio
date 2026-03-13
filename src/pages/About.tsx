import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    motion,
    useInView,
    useReducedMotion,
} from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';

import SEO from '../components/layout/SEO';
import { Button } from '../components/ui/Button';

const PROFILE_IMAGE = `${import.meta.env.BASE_URL}assets/images/profile.jpg`;

const AFFILIATIONS = [
    {
        name: 'Digital Arts & Entertainment',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/dae-official.svg`,
        widthClass: 'w-[12rem] md:w-[13rem]',
        imageClass: 'max-h-16 md:max-h-20',
    },
    {
        name: 'Howest',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/howest-official.svg`,
        widthClass: 'w-[9.5rem] md:w-[10.5rem]',
        imageClass: 'max-h-16 md:max-h-20',
    },
    {
        name: 'Royal Military Academy',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/rma-official.png`,
        widthClass: 'w-[8rem] md:w-[8.75rem]',
        imageClass: 'max-h-16 md:max-h-20',
    },
    {
        name: 'XR Labs',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/xralbs.avif`,
        widthClass: 'w-[14rem] md:w-[17rem]',
        imageClass: 'max-h-28 md:max-h-32',
    },
] as const;

const TOOLS = [
    'Wwise', 'FMOD', 'Reaper',
    'Unreal Engine', 'MetaSounds', 'Unity',
    'Python', 'C++', 'C#',
    'Perforce', 'Git', 'Blueprints',
];

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

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-5 font-mono text-overline uppercase tracking-widest text-text-tertiary">
        {children}
    </h2>
);

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
            className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1"
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
            <span className="mt-1 block font-mono text-caption uppercase tracking-wider text-text-secondary">
                {label}
            </span>
            <p className="mt-3 text-caption leading-relaxed text-text-tertiary">
                {detail}
            </p>
        </motion.div>
    );
};

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
        <div className="relative min-h-screen bg-surface">
            <SEO title={t('about_page_title', 'About')} description={t('about_page_description')} />

            <div className="relative z-10 mx-auto max-w-content-wide px-6 pb-32 pt-32 md:px-12 lg:px-16">
                <motion.div
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
                    variants={containerVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.section
                        className="pb-2 md:col-span-3"
                        variants={itemVars}
                    >
                        <h1 className="font-display text-h1 leading-tight text-text-primary md:text-hero">
                            {t('hook')}
                        </h1>
                        <p className="mt-3 font-mono text-body-sm tracking-wide text-text-tertiary">
                            {t('intro_sub')}
                        </p>
                    </motion.section>

                    <motion.div
                        className="order-2 rounded-xl border border-border bg-surface-raised p-6 md:order-1 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_story')}</SectionLabel>
                        <div className="max-w-[65ch] space-y-5 text-body leading-relaxed text-text-secondary">
                            <p>{t('story_1')}</p>
                            <p>{t('story_2')}</p>
                            <p>{t('story_3')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="order-1 overflow-hidden rounded-xl border border-border bg-surface-raised md:order-2 md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative aspect-[3/4] w-full">
                            {!imageError && (
                                <img
                                    src={PROFILE_IMAGE}
                                    alt={t('profile_photo_alt', 'Igor Szuniewicz')}
                                    className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-surface-overlay" />
                            )}
                        </div>
                    </motion.div>

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

                    <motion.div
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_approach')}</SectionLabel>
                        <div className="max-w-[65ch] space-y-5 text-body leading-relaxed text-text-secondary">
                            <p>{t('approach_1')}</p>
                            <p>{t('approach_2')}</p>
                            <p>{t('approach_3')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_toolkit')}</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {TOOLS.map((tool) => (
                                <span
                                    key={tool}
                                    className="rounded-md border border-border bg-surface-overlay px-3 py-1.5 font-mono text-caption text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <div className="mb-8 max-w-2xl">
                            <SectionLabel>{t('section_affiliations')}</SectionLabel>
                        </div>

                        <div className="grid grid-cols-2 items-center gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-12 lg:gap-x-16">
                            {AFFILIATIONS.map((affiliation) => (
                                <div
                                    key={affiliation.name}
                                    className="flex min-h-[64px] items-center justify-center"
                                >
                                    <img
                                        src={affiliation.image}
                                        alt={affiliation.name}
                                        className={`${affiliation.widthClass} ${affiliation.imageClass} object-contain opacity-90 transition duration-300 hover:opacity-100`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    <motion.div
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_education')}</SectionLabel>
                        <div className="space-y-4">
                            {(['dae', 'hs', 'piano'] as const).map((key) => (
                                <div key={key} className="border-l-2 border-border pl-4">
                                    <p className="font-display text-body-sm font-medium text-text-primary">
                                        {t(`edu_${key}_name`)}
                                    </p>
                                    <p className="mt-0.5 font-mono text-caption text-text-tertiary">
                                        {t(`edu_${key}_desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <h2 className="mb-2 font-display text-h3 text-text-primary">
                            {t('cta_heading')}
                        </h2>
                        <p className="mb-6 text-body-sm text-text-secondary">
                            {t('cta_text')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => {
                                    window.location.href = '/contact';
                                }}
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
