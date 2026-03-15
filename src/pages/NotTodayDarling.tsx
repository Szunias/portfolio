import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gauge, Layers, AudioWaveform, AlertTriangle, ArrowRight, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import { fadeUpVariants, viewportOnce, noMotion } from '../constants/motion';

const TECH_PILLS = ['MetaSounds', 'Unreal Engine', 'Sound Cues', 'Reaper'] as const;

const GALLERY_IMAGES = [
    { src: '/assets/images/projects-nottoday/MS_Pickup.png', captionKey: 'gallery.caption_pickup' },
    { src: '/assets/images/projects-nottoday/MS_Powerups.png', captionKey: 'gallery.caption_powerups' },
    { src: '/assets/images/projects-nottoday/SoundClasses.png', captionKey: 'gallery.caption_classes' },
    { src: '/assets/images/projects-nottoday/SoundStructures.png', captionKey: 'gallery.caption_structures' },
] as const;

const SCREENSHOTS = [
    { src: '/assets/images/projects/NotTodayPic1.png', captionKey: 'screenshots.pic1' },
    { src: '/assets/images/projects/NotTodayPic2.png', captionKey: 'screenshots.pic2' },
    { src: '/assets/images/projects/NotTodayPic3.png', captionKey: 'screenshots.pic3' },
    { src: '/assets/images/projects/NotTodayPic4.png', captionKey: 'screenshots.pic4' },
] as const;

/** Not Today, Darling! custom project page: chaotic 4-player racer with procedural MetaSounds audio. */
const NotTodayDarling = () => {
    const { t } = useTranslation('notTodayDarling');
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
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
                        {t('hero.badge', 'Solo Audio Designer')}
                    </div>

                    <h1 className="text-h1 md:text-hero font-display font-bold text-text-primary mb-4 leading-tight">
                        {t('hero.title', 'Not Today, Darling!')}
                    </h1>

                    <p className="text-lg md:text-h3 text-accent font-display mb-6">
                        {t('hero.subtitle', '4-Player Chaos, One Audio Designer')}
                    </p>

                    <p className="text-text-secondary text-lg md:text-xl mb-4 leading-relaxed">
                        {t('hero.hook', 'Side-scrolling racer where grannies race, smash, and scream. I made every sound.')}
                    </p>

                    <p className="text-text-secondary text-sm font-mono mb-10">
                        {t('hero.status', 'Released May 2025')} · 12 weeks · DAE Belgium
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
                        {t('nav.back', 'Back to Projects')}
                    </Link>
                </div>
            </section>

            <main className="relative z-10 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pb-32">

                {/* ── 2. OVERVIEW ── */}
                <motion.section {...mv} className="py-20 md:py-28">
                    <h2 className="text-h2 font-display text-text-primary mb-12 border-l-4 border-accent pl-6">
                        {t('overview.title', 'Project Overview')}
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: t('overview.role', 'Role'), desc: t('overview.role_desc', 'Solo Audio Designer. Recording, sound design, music selection, and implementation. 2 programmers, 3 artists, 12 weeks.') },
                            { label: t('overview.tech', 'Tech'), desc: t('overview.tech_desc', 'MetaSounds for all SFX. Engine pitch, surface changes, and collisions are all driven by real-time gameplay data. No pre-baked loops.') },
                            { label: t('overview.scope', 'Scope'), desc: t('overview.scope_desc', 'Only audio person on the team. We recorded our own character voices. Built the procedural engine audio system from scratch.') },
                            { label: t('overview.result', 'Result'), desc: t('overview.result_desc', 'Released on itch.io in May 2025. We shipped it.') },
                        ].map((item) => (
                            <div key={item.label} className="p-6 bg-surface-raised border border-border rounded-xl">
                                <p className="text-accent text-xs font-mono uppercase tracking-wider mb-3">{item.label}</p>
                                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 3. AUDIO SYSTEMS ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary text-center mb-16">
                        {t('systems.title', 'Audio Systems')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <SystemCard
                            icon={<Gauge size={28} />}
                            title={t('systems.metasounds.title', 'MetaSounds Engine')}
                            desc={t('systems.metasounds.desc', 'No looped MP3s. A MetaSounds graph where go-kart pitch and rattle shift with speed in real-time. You hear the difference when you drive from carpet onto tiles — the sound reacts instantly.')}
                        />
                        <SystemCard
                            icon={<Layers size={28} />}
                            title={t('systems.architecture.title', 'Audio Architecture')}
                            desc={t('systems.architecture.desc', 'With 12 weeks to ship, you need to know where your audio logic lives. One centralized manager for UI, one system for engines. Debugging took minutes, not hours.')}
                        />
                        <SystemCard
                            icon={<AudioWaveform size={28} />}
                            title={t('systems.surface.title', 'Surface Transitions')}
                            desc={t('systems.surface.desc', 'Abruptly switching from carpet to tiles sounded fake and glitchy. A fast crossfade between surfaces — the old sound fades out, the new one fades in. Milliseconds, but it makes driving sound professional.')}
                        />
                    </div>
                </motion.section>

                {/* ── 4. MIX + CHALLENGES ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <div className="bg-surface-raised border border-border rounded-xl p-8 md:p-12 mb-8">
                        <h2 className="text-h3 font-display text-text-primary mb-4">
                            {t('mix.title', '4-Player Chaos Control')}
                        </h2>
                        <p className="text-text-secondary leading-relaxed max-w-3xl">
                            {t('mix.desc', 'With 4 players crashing and screaming, important sounds got buried. I set priorities: picking up an item ducks collisions for a split second. The Wall of Death boxing bell and the 3-2-1 countdown cut through everything. Information always wins over noise.')}
                        </p>
                    </div>

                    <h3 className="text-h3 font-display text-text-primary mb-8">
                        {t('challenges.title', 'Challenges & Solutions')}
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: t('challenges.c1_title', '4-Player Mix Clarity'),
                                problem: t('challenges.c1_problem', 'With 4 players going at once, sounds stacked up and UI feedback disappeared.'),
                                solution: t('challenges.c1_solution', 'Capped collision sounds at 4, gave each player a different EQ range, and ducked the crowd whenever UI plays.'),
                            },
                            {
                                title: t('challenges.c2_title', 'Surface Transition Pops'),
                                problem: t('challenges.c2_problem', 'Switching between asphalt, sand, and metal caused audio pops.'),
                                solution: t('challenges.c2_solution', 'Added 150ms crossfades between surfaces. Problem gone.'),
                            },
                            {
                                title: t('challenges.c3_title', 'Boost Sound Memory'),
                                problem: t('challenges.c3_problem', 'Boost sounds were eating 160MB with 4 players active.'),
                                solution: t('challenges.c3_solution', 'Replaced them with procedural MetaSounds patches. Went from 160MB down to under 2MB per player.'),
                            },
                        ].map((c) => (
                            <div key={c.title} className="p-6 bg-surface-raised border border-border rounded-xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle size={16} className="text-accent" />
                                    <h4 className="font-display font-bold text-text-primary text-sm">{c.title}</h4>
                                </div>
                                <p className="text-text-secondary text-sm mb-3">
                                    <span className="text-text-primary font-mono text-xs">PROBLEM </span>
                                    {c.problem}
                                </p>
                                <p className="text-text-secondary text-sm">
                                    <span className="text-accent font-mono text-xs">SOLUTION </span>
                                    {c.solution}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 5. VIDEO ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-8">
                        {t('video.title', 'Gameplay')}
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                        <iframe
                            src="https://www.youtube-nocookie.com/embed/6lFEvyicea0"
                            title={t('hero.title', 'Not Today, Darling!') + ' — Gameplay'}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </motion.section>

                {/* ── 6. TECHNICAL GALLERY ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-4">
                        {t('gallery.title', 'Audio Implementation')}
                    </h2>
                    <p className="text-text-secondary mb-8 max-w-2xl">
                        {t('gallery.desc', 'MetaSounds graphs, sound class hierarchy, and asset structures from the Unreal project.')}
                    </p>

                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {GALLERY_IMAGES.map((img) => (
                            <button
                                key={img.captionKey}
                                onClick={() => setLightboxSrc(img.src)}
                                className="flex-shrink-0 w-72 md:w-80 snap-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
                            >
                                <div className="rounded-xl overflow-hidden border border-border bg-surface-raised hover:border-accent/40 transition-colors">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={img.src}
                                            alt={t(img.captionKey)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <p className="px-4 py-3 text-text-secondary text-sm">{t(img.captionKey)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* ── 7. SCREENSHOTS ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-8">
                        {t('screenshots.title', 'Screenshots')}
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {SCREENSHOTS.map((img) => (
                            <button
                                key={img.captionKey}
                                onClick={() => setLightboxSrc(img.src)}
                                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
                            >
                                <div className="rounded-xl overflow-hidden border border-border bg-surface-raised hover:border-accent/40 transition-colors">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={img.src}
                                            alt={t(img.captionKey)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <p className="px-4 py-3 text-text-secondary text-sm">{t(img.captionKey)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* ── 8. FOOTER ── */}
                <motion.section {...mv} className="border-t border-border pt-16">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-h3 font-display text-text-primary mb-4">
                                {t('download.title', 'Play the Game')}
                            </h3>
                            <a
                                href="https://freyaspes.itch.io/not-today-darling"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-surface-raised border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <Download size={18} className="text-accent" />
                                <div>
                                    <span className="text-text-primary group-hover:text-accent transition-colors block">
                                        {t('download.cta', 'Not Today, Darling! on itch.io')}
                                    </span>
                                    <span className="text-text-secondary text-xs">
                                        {t('download.size', 'Windows (1.0 GB) · Linux (967 MB)')}
                                    </span>
                                </div>
                            </a>
                        </div>

                        <div className="space-y-4">
                            <a
                                href="https://www.youtube.com/watch?v=6lFEvyicea0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-surface-raised border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <ExternalLink size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors">
                                    {t('links.trailer', 'Watch Trailer on YouTube')}
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Next Project CTA */}
                    <div className="mt-16 text-center">
                        <Link
                            to="/projects/transientica_audiolab"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-surface-raised border border-border rounded-xl hover:border-accent/40 hover:bg-surface-overlay transition-colors group"
                        >
                            <span className="text-text-secondary text-sm">{t('nav.next_project', 'Next Project')}</span>
                            <span className="text-text-primary font-display font-bold group-hover:text-accent transition-colors">Transientica</span>
                            <ArrowRight size={18} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </motion.section>
            </main>

            {/* Lightbox overlay */}
            <AnimatePresence>
                {lightboxSrc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-pointer"
                        onClick={() => setLightboxSrc(null)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setLightboxSrc(null); }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image preview"
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={lightboxSrc}
                            alt=""
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SystemCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="p-8 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors duration-300 group">
        <div className="w-12 h-12 bg-surface-overlay rounded-lg flex items-center justify-center text-text-primary mb-6 group-hover:text-accent transition-colors">
            {icon}
        </div>
        <h3 className="text-h4 font-display text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed text-sm">{desc}</p>
    </div>
);

export default NotTodayDarling;
