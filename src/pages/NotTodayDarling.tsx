import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import { fadeUpVariants, viewportOnce, noMotion } from '../constants/motion';

const TECH_PILLS = ['MetaSounds', 'Unreal Engine', 'Sound Cues', 'Reaper'] as const;

/** Not Today, Darling! custom project page: chaotic 4-player racer with procedural MetaSounds audio. */
const NotTodayDarling = () => {
    const { t } = useTranslation('notTodayDarling');
    const prefersReducedMotion = useReducedMotion();

    const mv = prefersReducedMotion
        ? { initial: noMotion.initial, whileInView: noMotion.animate, transition: noMotion.transition }
        : { initial: fadeUpVariants.hidden, whileInView: fadeUpVariants.visible, viewport: viewportOnce };

    return (
        <div className="min-h-screen bg-surface text-text-primary font-sans selection:bg-accent/30">
            <SEO title={t('seo_title')} description={t('seo_description')} />

            {/* ── 1. HERO ── */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video
                        src="/assets/images/projects/NotTodayGIF.mp4"
                        className="w-full h-full object-cover"
                        autoPlay loop muted playsInline
                        onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-3xl">
                    <img
                        src="/assets/images/logos/NotTodayGameLogo.png"
                        alt="Not Today, Darling!"
                        className="h-24 md:h-32 mx-auto mb-8 drop-shadow-lg"
                    />

                    <div className="inline-block px-4 py-1.5 rounded-md bg-surface-raised/80 border border-border text-accent text-sm font-mono uppercase tracking-widest mb-6">
                        {t('hero.badge')}
                    </div>

                    <h1 className="text-h1 md:text-hero font-display font-bold text-text-primary mb-4 leading-tight">
                        {t('hero.title')}
                    </h1>

                    <p className="text-lg md:text-h3 text-accent font-display mb-6">
                        {t('hero.subtitle')}
                    </p>

                    <p className="text-text-secondary text-lg md:text-xl mb-10 leading-relaxed">
                        {t('hero.hook')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {TECH_PILLS.map((pill) => (
                            <span key={pill} className="px-4 py-2 bg-surface-raised/80 border border-border rounded-md text-sm text-text-primary font-mono">
                                {pill}
                            </span>
                        ))}
                    </div>

                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                    >
                        <ArrowLeft size={14} />
                        {t('nav.back')}
                    </Link>
                </div>
            </section>

            <main className="relative z-10 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pb-32">

                {/* ── 2. VIDEOS ── */}
                <motion.section {...mv} className="py-20 md:py-28">
                    <h2 className="text-h2 font-display text-text-primary mb-8">
                        {t('video.title')}
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                        <iframe
                            src="https://www.youtube-nocookie.com/embed/6lFEvyicea0"
                            title={t('hero.title') + ' Trailer'}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>

                    <h3 className="text-h3 font-display text-text-primary mt-12 mb-6">
                        {t('video.sound_title')}
                    </h3>
                    <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                        <video
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src="/assets/images/projects-nottoday/2025-10-12 16-52-48.mp4" type="video/mp4" />
                        </video>
                    </div>
                </motion.section>

                {/* ── 3. WHAT I BUILT ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary text-center mb-16">
                        {t('systems.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {(['metasounds', 'mix', 'surface'] as const).map((key) => (
                            <div key={key} className="p-8 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors duration-300">
                                <h3 className="text-h4 font-display text-text-primary mb-3">
                                    {t(`systems.${key}.title`)}
                                </h3>
                                <p className="text-text-secondary leading-relaxed text-sm">
                                    {t(`systems.${key}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 4. CHALLENGES ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h3 font-display text-text-primary mb-8">
                        {t('challenges.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {([1, 2, 3] as const).map((n) => (
                            <div key={n} className="p-6 bg-surface-raised border border-border rounded-xl">
                                <h4 className="font-display font-bold text-text-primary text-sm mb-4">
                                    {t(`challenges.c${n}_title`)}
                                </h4>
                                <p className="text-text-secondary text-sm mb-3">
                                    <span className="text-text-primary font-mono text-xs">PROBLEM </span>
                                    {t(`challenges.c${n}_problem`)}
                                </p>
                                <p className="text-text-secondary text-sm">
                                    <span className="text-accent font-mono text-xs">SOLUTION </span>
                                    {t(`challenges.c${n}_solution`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 5. FOOTER ── */}
                <motion.section {...mv} className="border-t border-border pt-16">
                    <h3 className="text-h3 font-display text-text-primary mb-4">
                        {t('download.title')}
                    </h3>
                    <a
                        href="https://freyaspes.itch.io/not-today-darling"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 p-4 bg-surface-raised border border-border rounded-lg hover:border-accent/40 transition-colors group"
                    >
                        <Download size={18} className="text-accent" />
                        <span className="text-text-primary group-hover:text-accent transition-colors">
                            {t('download.cta')}
                        </span>
                    </a>

                    <div className="mt-16 text-center">
                        <Link
                            to="/projects/transientica_audiolab"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-surface-raised border border-border rounded-xl hover:border-accent/40 hover:bg-surface-overlay transition-colors group"
                        >
                            <span className="text-text-secondary text-sm">{t('nav.next_project')}</span>
                            <span className="text-text-primary font-display font-bold group-hover:text-accent transition-colors">Transientica</span>
                            <ArrowRight size={18} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </motion.section>
            </main>
        </div>
    );
};

export default NotTodayDarling;
