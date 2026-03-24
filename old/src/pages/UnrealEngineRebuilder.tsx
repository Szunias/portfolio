import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';

const TECH_PILLS = ['Python', 'Batch Script', 'Unreal Engine', 'Automation'] as const;

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
    <h2 className="mb-6 font-pixel text-[10px] uppercase tracking-[0.16em] text-[#8d8882]">
        {children}
    </h2>
);

/** Unreal Engine Rebuilder dev tool page. */
const UnrealEngineRebuilder = () => {
    const { t } = useTranslation('unrealEngineRebuilder');
    const prefersReducedMotion = useReducedMotion();

    const containerVars = prefersReducedMotion ? noMotionContainerVariants : gridContainerVariants;
    const itemVars = prefersReducedMotion ? noMotionItemVariants : gridItemVariants;

    return (
        <div className="relative min-h-screen bg-surface">
            <SEO title={t('seo_title')} description={t('seo_description')} />

            <div className="relative z-10 mx-auto max-w-content-wide px-6 pb-16 pt-24 sm:pb-24 sm:pt-28 md:px-12 md:pb-32 md:pt-32 lg:px-16">
                <motion.div
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
                    variants={containerVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Header */}
                    <motion.section className="pb-2 md:col-span-3" variants={itemVars}>
                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-sm mb-6"
                        >
                            <ArrowLeft size={14} />
                            {t('nav.back')}
                        </Link>
                        <h1 className="font-display text-h2 sm:text-h1 leading-tight text-text-primary md:text-hero">
                            {t('hero.title')}
                        </h1>
                        <p className="mt-3 font-mono text-body-sm tracking-wide text-text-tertiary">
                            {t('hero.subtitle')}
                        </p>
                    </motion.section>

                    {/* Logo cell */}
                    <motion.div
                        className="group flex items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-raised p-8 md:col-span-1"
                        variants={itemVars}
                    >
                        <img
                            src="/assets/images/projects-unrealrebuilder/UnrealRebuilderlogo.jpeg"
                            alt="Unreal Engine Rebuilder"
                            className="w-48 h-auto rounded-lg opacity-90"
                            loading="lazy"
                        />
                    </motion.div>

                    {/* About */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.about')}</SectionLabel>
                        <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3] max-w-[72ch]">
                            {t('about.text')}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {TECH_PILLS.map((pill) => (
                                <span key={pill} className="px-3 py-1.5 border border-border rounded-md text-xs text-text-secondary font-mono">
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </motion.section>

                    {/* Screenshot */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('screenshot.title')}</SectionLabel>
                        <div className="rounded-lg overflow-hidden bg-black">
                            <img
                                src="/assets/images/projects-unrealrebuilder/appscreenshot.png"
                                alt="Unreal Engine Rebuilder UI"
                                className="w-full h-auto"
                                loading="lazy"
                            />
                        </div>
                    </motion.section>

                    {/* Features */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1 md:p-8 flex flex-col justify-center"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('features.title')}</SectionLabel>
                        <ul className="space-y-4">
                            {(['rebuild', 'backup', 'disk', 'detect', 'logs', 'ui'] as const).map((key) => (
                                <li key={key} className="border-l-2 border-accent/40 pl-4">
                                    <p className="font-display text-sm font-medium text-text-primary">
                                        {t(`features.${key}_title`)}
                                    </p>
                                    <p className="mt-1 text-body-sm leading-relaxed text-text-secondary">
                                        {t(`features.${key}_desc`)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.section>

                    {/* Footer */}
                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <p className="text-body-sm text-text-tertiary">
                                {t('footer.note')}
                            </p>
                            <Link
                                to="/projects"
                                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-surface transition-all hover:bg-accent-hover active:scale-[0.98]"
                            >
                                {t('nav.all_projects')}
                            </Link>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};

export default UnrealEngineRebuilder;
