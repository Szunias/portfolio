import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';

const TECH_PILLS = ['Pro Tools', 'Omnisphere', 'Waves J37', 'Frame Sync'] as const;

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

/** Ray Animation project page: disco-funk score for a graduation film. */
const RayAnimation = () => {
    const { t } = useTranslation('rayAnimation');
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

                    {/* Film clip */}
                    <motion.div
                        className="group overflow-hidden rounded-xl border border-border bg-black md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative h-full min-h-[280px] sm:min-h-[320px] w-full">
                            <video
                                src="/assets/images/projects/RayGIF.mp4"
                                className="h-full w-full object-cover"
                                autoPlay loop muted playsInline
                                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                            />
                        </div>
                    </motion.div>

                    {/* About the project */}
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

                    {/* Film */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.film')}</SectionLabel>
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/NhH4dNcfxZg"
                                title="Ray Animation"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </motion.section>

                    {/* Music approach */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.music')}</SectionLabel>
                        <div className="space-y-4">
                            {(['m1', 'm2', 'm3'] as const).map((key) => (
                                <div key={key} className="border-l-2 border-border pl-4">
                                    <p className="font-display text-body-sm font-medium text-text-primary">
                                        {t(`music.${key}.title`)}
                                    </p>
                                    <p className="mt-0.5 text-caption text-text-tertiary">
                                        {t(`music.${key}.desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Footer */}
                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <a
                                href="https://www.youtube.com/watch?v=NhH4dNcfxZg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-semibold text-text-primary transition-all hover:border-accent hover:bg-surface-overlay active:scale-[0.98]"
                            >
                                <ExternalLink size={16} />
                                {t('watch.cta')}
                            </a>
                            <Link
                                to="/projects/middleware-optimization"
                                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-surface transition-all hover:bg-accent-hover active:scale-[0.98]"
                            >
                                {t('nav.next_project')}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};

export default RayAnimation;
