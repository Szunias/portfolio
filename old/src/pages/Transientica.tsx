import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Activity, Cpu, Layers, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import { fadeUpVariants, viewportOnce, noMotion } from '../constants/motion';

const TECH_PILLS = ['Python', 'scikit-learn', 'Unity', 'LibROSA'] as const;

/** Transientica project page: voice-controlled rhythm game using real-time ML audio classification. */
const Transientica = () => {
    const { t } = useTranslation('transientica');
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    const techVideoRef = useRef<HTMLVideoElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const mv = prefersReducedMotion
        ? { initial: noMotion.initial, whileInView: noMotion.animate, transition: noMotion.transition }
        : { initial: fadeUpVariants.hidden, whileInView: fadeUpVariants.visible, viewport: viewportOnce };

    const handleVideoClick = (videoId: string) => {
        setActiveVideo(videoId);
        const videoRef = videoId === 'main-video' ? mainVideoRef : techVideoRef;

        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.controls = true;
            videoRef.current.loop = false;
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.error("Play failed", e));
        }
    };

    return (
        <div className="min-h-screen bg-surface text-text-primary font-sans selection:bg-accent/30">
            <SEO title={t('seo_title')} description={t('seo_description')} />

            {/* ── 1. HERO ── */}
            <section className="relative pt-32 pb-20 md:pb-28 text-center px-6 md:px-12 lg:px-16 max-w-content-wide mx-auto">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm mb-16"
                >
                    <ArrowLeft size={14} />
                    {t('nav.back', 'Back to Projects')}
                </Link>

                <div className="inline-block px-4 py-1.5 rounded-md bg-surface-raised border border-border text-accent text-sm font-mono uppercase tracking-widest mb-8">
                    {t('hero.badge', 'Research Project')}
                </div>

                <h1 className="text-h1 md:text-hero font-display font-bold text-text-primary mb-6 leading-tight">
                    {t('hero.title', 'Transientica')}<br />
                    <span className="text-accent">
                        {t('hero.subtitle', 'AudioLab')}
                    </span>
                </h1>

                <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-7">
                    {t('hero.desc', 'Beatbox into your mic, play a rhythm game. Real-time ML recognition with under 60ms latency.')}
                </p>

                {/* Audio Visualizer Animation — CSS-driven */}
                <div className="flex justify-center items-end gap-1 h-16 mb-12" aria-hidden="true">
                    {['animate-waveform-1','animate-waveform-2','animate-waveform-3','animate-waveform-4','animate-waveform-5','animate-waveform-3','animate-waveform-1'].map((anim, i) => (
                        <div
                            key={`vis-${i}`}
                            className={`w-2 bg-accent rounded-full opacity-60 origin-bottom ${anim}`}
                            style={{ height: '40px' }}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    {TECH_PILLS.map((pill) => (
                        <span key={pill} className="px-4 py-2 bg-surface-raised border border-border rounded-md text-sm text-text-primary font-mono">
                            {pill}
                        </span>
                    ))}
                </div>
            </section>

            <main className="relative z-10 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pb-32">

                {/* ── 2. VIDEO SHOWCASE ── */}
                <section className="mb-20 md:mb-28">
                    <div
                        className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black group cursor-pointer transition-all duration-500"
                        onClick={() => handleVideoClick('main-video')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVideoClick('main-video'); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={t('video.watch_demo', 'Watch Demo')}
                    >
                        <video
                            ref={mainVideoRef}
                            id="main-video"
                            autoPlay loop muted playsInline
                            poster="/assets/images/projects/maxresdefault.jpg"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                            <source src="/assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4" type="video/mp4" />
                        </video>

                        {activeVideo !== 'main-video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                <div className="w-20 h-20 bg-surface-raised rounded-xl flex items-center justify-center border border-border">
                                    <Play size={32} className="text-text-primary ml-1 fill-text-primary" />
                                </div>
                                <span className="absolute bottom-8 text-text-primary font-mono text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    {t('video.watch_demo', 'Watch Demo')}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── 3. STATS ── */}
                <motion.section {...mv} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 md:mb-28">
                    {[
                        { val: t('stats.latency_value', '< 45ms'), label: t('stats.latency_label', 'Latency') },
                        { val: t('stats.accuracy_value', '92%'), label: t('stats.accuracy_label', 'Accuracy') },
                        { val: t('stats.classes_value', '3'), label: t('stats.classes_label', 'Sound Classes') },
                        { val: t('stats.dataset_value', '2000+'), label: t('stats.dataset_label', 'Samples') },
                    ].map((stat) => (
                        <div key={stat.label} className="p-6 bg-surface-raised border border-border rounded-xl text-center hover:bg-surface-overlay transition-colors">
                            <div className="text-3xl font-display font-bold mb-2 text-accent">
                                {stat.val}
                            </div>
                            <p className="text-text-secondary text-sm uppercase tracking-wide font-mono">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.section>

                {/* ── 4. HOW IT WORKS ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary text-center mb-16">
                        {t('features.title', 'How It Works')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Activity size={28} />}
                            title={t('features.realtime.title', 'Low Latency')}
                            desc={t('features.realtime.desc', 'Under 60ms latency — you need that for a rhythm game. Small FFT buffers (512 samples), a lean ML pipeline, and UDP for OSC communication.')}
                        />
                        <FeatureCard
                            icon={<Cpu size={28} />}
                            title={t('features.ml.title', 'Learns Your Voice')}
                            desc={t('features.ml.desc', 'Everyone beatboxes differently. The system trains on your voice and microphone for better accuracy. 30 examples per sound class, then play.')}
                        />
                        <FeatureCard
                            icon={<Layers size={28} />}
                            title={t('features.architecture.title', 'Split Pipeline')}
                            desc={t('features.architecture.desc', 'Python handles audio analysis and ML inference. Unity handles gameplay. They talk over UDP/OSC. Each side can be debugged and updated independently.')}
                        />
                    </div>
                </motion.section>

                {/* ── 5. TECHNICAL DEEP DIVE ── */}
                <motion.section {...mv} className="bg-surface-raised border border-border rounded-xl p-8 md:p-12 mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-8">
                        {t('technical.title', 'Technical Deep Dive')}
                    </h2>
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-display font-bold text-accent mb-3 flex items-center gap-2">
                                    <Zap size={20} />
                                    {t('technical.spectral.title', 'Spectral Analysis')}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {t('technical.spectral.desc', 'Kicks have lots of low end. Snares are noise. The classifier picks up on these differences. Spectral centroid, zero-crossing rate, and envelope shape separate the three classes.')}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-accent-hover mb-3 flex items-center gap-2">
                                    <Cpu size={20} />
                                    {t('technical.optimization.title', 'Optimization')}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {t('technical.optimization.desc', 'Small FFT window (512 samples, 11ms), circular buffer to kill I/O blocking, lightweight SVM classifier (2ms inference vs 15ms for a neural net), and UDP transport for minimal overhead.')}
                                </p>
                            </div>
                        </div>

                        <div
                            className={`relative h-[300px] rounded-xl overflow-hidden border border-border bg-black group cursor-pointer ${activeVideo === 'tech-video' ? 'ring-2 ring-accent' : ''}`}
                            onClick={() => handleVideoClick('tech-video')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVideoClick('tech-video'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label={t('video.tech_demo', 'Technical Demo')}
                        >
                            <video
                                ref={techVideoRef}
                                id="tech-video"
                                autoPlay loop muted playsInline
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            >
                                <source src="/assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4" type="video/mp4" />
                            </video>
                            {activeVideo !== 'tech-video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10">
                                    <div className="w-16 h-16 bg-surface-raised rounded-xl flex items-center justify-center border border-border">
                                        <Play size={24} className="text-text-primary ml-1 fill-text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* ── 6. CHALLENGES ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-8">
                        {t('challenges.title', 'Challenges & Solutions')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: t('challenges.c1_title', 'Getting Latency Under 50ms'),
                                problem: t('challenges.c1_problem', 'First version had 180ms lag — way too slow for a rhythm game.'),
                                solution: t('challenges.c1_solution', 'Shrunk the FFT window, added a circular buffer, swapped to a lightweight SVM, switched to UDP for OSC. Got it down to 45ms at 92% accuracy.'),
                            },
                            {
                                title: t('challenges.c2_title', 'Kick vs Snare Confusion'),
                                problem: t('challenges.c2_problem', 'Both have sharp transients and broadband noise — the classifier kept guessing wrong.'),
                                solution: t('challenges.c2_solution', 'Added spectral centroid, zero-crossing rate, and envelope shape as features. Built separate models for solo hits vs patterns. Accuracy went from 78% to 92%.'),
                            },
                            {
                                title: t('challenges.c3_title', 'No Audio Dropouts'),
                                problem: t('challenges.c3_problem', 'Heavy ML processing caused buffer underruns on slower machines.'),
                                solution: t('challenges.c3_solution', 'Separated threads with a lock-free ringbuffer. Audio never blocks, ML runs on its own worker thread.'),
                            },
                        ].map((c) => (
                            <div key={c.title} className="p-6 bg-surface-raised border border-border rounded-xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle size={16} className="text-accent" />
                                    <h4 className="font-display font-bold text-text-primary text-sm">{c.title}</h4>
                                </div>
                                <p className="text-text-secondary text-sm mb-3">
                                    <span className="text-text-primary font-mono text-xs">{t('challenges.problem_label')} </span>
                                    {c.problem}
                                </p>
                                <p className="text-text-secondary text-sm">
                                    <span className="text-accent font-mono text-xs">{t('challenges.solution_label')} </span>
                                    {c.solution}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 7. FOOTER ── */}
                <motion.section {...mv} className="border-t border-border pt-16">
                    <div className="mt-0 text-center">
                        <Link
                            to="/projects/audioq"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-surface-raised border border-border rounded-xl hover:border-accent/40 hover:bg-surface-overlay transition-colors group"
                        >
                            <span className="text-text-secondary text-sm">{t('nav.next_project', 'Next Project')}</span>
                            <span className="text-text-primary font-display font-bold group-hover:text-accent transition-colors">AudioQ</span>
                            <ArrowRight size={18} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </motion.section>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="p-8 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors duration-300 group">
        <div className="w-12 h-12 bg-surface-overlay rounded-lg flex items-center justify-center text-text-primary mb-6 group-hover:text-accent transition-colors">
            {icon}
        </div>
        <h3 className="text-h4 font-display text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed text-sm">{desc}</p>
    </div>
);

export default Transientica;
