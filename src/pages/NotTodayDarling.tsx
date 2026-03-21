import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import ImageLightbox from '../components/features/ImageLightbox';

const TECH_PILLS = ['MetaSounds', 'Unreal Engine 5', 'Sound Cues', 'Reaper'] as const;

const GALLERY_IMAGES = [
    { src: 'assets/images/projects-nottoday/MSP_MonoArray.png', caption: 'gallery.caption_mono' },
    { src: 'assets/images/projects-nottoday/MS_Pickup.png', caption: 'gallery.caption_pickup' },
    { src: 'assets/images/projects-nottoday/MS_Powerups.png', caption: 'gallery.caption_powerups' },
    { src: 'assets/images/projects-nottoday/SoundClasses.png', caption: 'gallery.caption_classes' },
    { src: 'assets/images/projects-nottoday/SoundClassMixes.png', caption: 'gallery.caption_mixes' },
    { src: 'assets/images/projects-nottoday/AttenuationPresets.png', caption: 'gallery.caption_attenuation' },
] as const;

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

/** Not Today, Darling! project page */
const NotTodayDarling = () => {
    const { t } = useTranslation('notTodayDarling');
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
                    {/* ── Row 1: Header ── */}
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
                        <div className="flex flex-wrap gap-2 mt-4">
                            {TECH_PILLS.map((pill) => (
                                <span key={pill} className="px-3 py-1.5 border border-border rounded-md text-xs text-text-secondary font-mono">
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Row 2: Game video + Concept ── */}
                    <motion.div
                        className="group overflow-hidden rounded-xl border border-border bg-black md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative h-full min-h-[280px] sm:min-h-[320px] w-full">
                            <video
                                src="/assets/images/projects/NotTodayGIF.mp4"
                                className="h-full w-full object-cover"
                                autoPlay loop muted playsInline
                                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <img
                                src="/assets/images/logos/NotTodayGameLogo.png"
                                alt="Not Today, Darling!"
                                className="absolute bottom-6 left-6 h-16 drop-shadow-lg"
                            />
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.concept')}</SectionLabel>
                        <p className="text-accent font-display text-lg mb-4">
                            {t('concept.hook')}
                        </p>
                        <div className="max-w-[72ch] space-y-4">
                            <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3]">
                                {t('concept.p1')}
                            </p>
                            <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3]">
                                {t('concept.p2')}
                            </p>
                            <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3]">
                                {t('concept.p3')}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-6 border-t border-border">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882]">{t('meta.role')}</p>
                                <p className="text-sm text-text-primary font-display font-medium">{t('meta.role_value')}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882]">{t('meta.team')}</p>
                                <p className="text-sm text-text-primary font-display font-medium">{t('meta.team_value')}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882]">{t('meta.duration')}</p>
                                <p className="text-sm text-text-primary font-display font-medium">{t('meta.duration_value')}</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Row 3: Audio Systems + Sound Showcase ── */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.systems')}</SectionLabel>
                        <ul className="space-y-5">
                            {(['engine', 'mix', 'voices'] as const).map((key) => (
                                <li key={key} className="border-l-2 border-accent/40 pl-4">
                                    <p className="font-display text-sm font-medium text-text-primary">
                                        {t(`systems.${key}.title`)}
                                    </p>
                                    <p className="mt-1 text-body-sm leading-relaxed text-text-secondary">
                                        {t(`systems.${key}.desc`)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.section>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.sound')}</SectionLabel>
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <video controls playsInline className="w-full h-full object-cover">
                                <source src="/assets/images/projects-nottoday/2025-10-12 16-52-48.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </motion.section>

                    {/* ── Row 4: MetaSounds Gallery ── */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.gallery')}</SectionLabel>
                        <ImageLightbox images={GALLERY_IMAGES} />
                    </motion.section>

                    {/* ── Row 5: Challenges & Solutions ── */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.challenges')}</SectionLabel>
                        <div className="grid md:grid-cols-2 gap-5">
                            {([1, 2] as const).map((n) => (
                                <div key={n} className="border-l-2 border-accent/40 pl-5 space-y-3">
                                    <p className="font-display text-sm font-medium text-text-primary">
                                        {t(`challenge${n}.title`)}
                                    </p>
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882] mb-1">
                                            {t('challenge_label.hard')}
                                        </p>
                                        <p className="text-body-sm leading-relaxed text-text-secondary">
                                            {t(`challenge${n}.hard`)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882] mb-1">
                                            {t('challenge_label.did')}
                                        </p>
                                        <p className="text-body-sm leading-relaxed text-text-secondary">
                                            {t(`challenge${n}.did`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Row 6: Trailer image + Links & CTA ── */}
                    <motion.div
                        className="group overflow-hidden rounded-xl border border-border bg-surface-raised md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative h-full min-h-[240px] w-full">
                            <img
                                src="/assets/images/projects-nottoday/highqualitythumbnail.jpg"
                                alt="Not Today, Darling! gameplay"
                                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                                loading="lazy"
                            />
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.links')}</SectionLabel>
                        <div className="space-y-3 mb-8">
                            <a
                                href="https://www.youtube.com/watch?v=6lFEvyicea0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <ExternalLink size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors text-sm">
                                    {t('links.trailer')}
                                </span>
                            </a>
                            <a
                                href="https://freyaspes.itch.io/not-today-darling"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <Download size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors text-sm">
                                    {t('links.download')}
                                </span>
                            </a>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                to="/projects/transientica_audiolab"
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

export default NotTodayDarling;
