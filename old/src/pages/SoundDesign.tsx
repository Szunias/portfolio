import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Play, VolumeX, Music } from 'lucide-react';

import SEO from '../components/layout/SEO';
import { cardIn, noMotion } from '../constants/motion';

/** Sound design portfolio page showcasing video redesigns and implementation work. */
const SoundDesign = () => {
    const { t } = useTranslation('soundDesign');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div ref={containerRef} className="min-h-screen bg-surface text-text-primary font-sans selection:bg-accent/30">
            <SEO title={t('seo.title')} description={t('seo.description')} />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden px-6 md:px-12 lg:px-16 pt-32 pb-20">
                <motion.div
                    style={{ opacity, scale }}
                    className="relative z-10 max-w-5xl w-full text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent/10 text-accent text-sm font-bold uppercase tracking-wider mb-8 border border-accent/20">
                        <Music size={16} />
                        {t('hero.badge')}
                    </div>

                    <h1 className="text-h1 md:text-hero font-display text-text-primary mb-6 leading-tight">
                        {t('hero.title')}
                    </h1>

                    <p className="text-lg md:text-h3 text-text-secondary max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        {t('hero.subtitle')}
                    </p>

                    {/* Tools Grid */}
                    <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {[
                            { name: 'Reaper', src: '/assets/images/tools/reaper.png' },
                            { name: 'Logic Pro', src: '/assets/images/tools/logic.png' },
                            { name: 'Cubase', src: '/assets/images/tools/cubase.png' },
                            { name: 'Studio One', src: '/assets/images/tools/studioone.png' },
                            { name: '3D Audio', src: '/assets/images/tools/3daudio.png' }
                        ].map((tool) => (
                            <img
                                key={tool.name}
                                src={tool.src}
                                alt={tool.name}
                                className="h-12 w-auto object-contain transition-transform"
                                title={tool.name}
                            />
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Main Content */}
            <main className="relative z-20 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pb-32">
                <section className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-12 border-l-4 border-accent pl-6">
                        {t('section1.title')}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Video 1: God of War */}
                        <VideoCard
                            title={t('section1.video1.title')}
                            desc={t('section1.video1.description')}
                            badge={t('section1.video1.badge')}
                            videoSrc="/assets/videos/krotosvideo.mp4"
                            poster="/assets/images/godofwarkrotos.jpg"
                        />

                        {/* Video 2: Baldur's Gate */}
                        <VideoCard
                            title={t('section1.video2.title')}
                            desc={t('section1.video2.description')}
                            badge={t('section1.video2.badge')}
                            videoSrc="/assets/videos/baldursremake.mp4"
                            poster="/assets/images/baldurspreview.png"
                        />

                        {/* Video 3: Weapon Sound Design - SIGNAL OFFLINE */}
                        <div className="bg-surface-raised rounded-xl overflow-hidden border border-border group relative h-full min-h-[400px] flex flex-col">
                            <div className="relative flex-grow bg-surface flex items-center justify-center overflow-hidden">
                                <div className="text-center relative z-10 p-8">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-accent/30 flex items-center justify-center text-accent">
                                        <VolumeX size={32} />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-accent mb-2 tracking-widest uppercase">
                                        {t('section1.video3.placeholder_title')}
                                    </h3>
                                    <p className="text-text-secondary font-mono text-sm tracking-wide">
                                        {t('section1.video3.placeholder_subtitle')}
                                    </p>
                                </div>
                            </div>
                            <div className="p-8 border-t border-border bg-surface-overlay">
                                <h3 className="text-xl font-display font-bold text-text-primary mb-2 opacity-50">{t('section1.video3.title')}</h3>
                                <p className="text-text-secondary text-sm mb-4 opacity-50">{t('section1.video3.description')}</p>
                                <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-md border border-accent/20">
                                    {t('section1.video3.badge')}
                                </span>
                            </div>
                        </div>

                        {/* Video 4: Fracture Horizon */}
                        <VideoCard
                            title={t('section1.video4.title')}
                            desc={t('section1.video4.description')}
                            badge={t('section1.video4.badge')}
                            videoSrc="/assets/videos/fracturedhorzion.mp4"
                            poster="/assets/images/frafturedhorizon.png"
                        />
                    </div>
                </section>
            </main>

        </div>
    );
};

interface VideoCardProps {
    title: string;
    desc: string;
    badge: string;
    videoSrc: string;
    poster: string;
}

const VideoCard = ({ title, desc, badge, videoSrc, poster }: VideoCardProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <motion.div
            initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : cardIn.transition}
            className="bg-surface-raised rounded-xl overflow-hidden border border-border group hover:border-accent/30 transition-colors"
        >
            <div className="relative aspect-video bg-surface transition-shadow">
                {!isPlaying && (
                    <div
                        className="absolute inset-0 bg-cover bg-center z-10 cursor-pointer group/poster"
                        style={{ backgroundImage: `url('${poster}')` }}
                        onClick={handlePlay}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlay(); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Play ${title}`}
                    >
                        <div className="absolute inset-0 bg-black/40 group-hover/poster:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-20 h-20 bg-surface-raised rounded-xl flex items-center justify-center border border-border shadow-lg transition-transform">
                                <Play size={32} className="text-text-primary ml-1 fill-text-primary" />
                            </div>
                        </div>
                    </div>
                )}
                <video
                    ref={videoRef}
                    controls={isPlaying}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onEnded={() => setIsPlaying(false)}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            </div>
            <div className="p-8 border-t border-border bg-surface-overlay">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-display font-bold text-text-primary group-hover:text-accent transition-colors">{title}</h3>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-md border border-accent/20">
                        {badge}
                    </span>
                </div>
                <p className="text-text-secondary leading-relaxed text-sm">
                    {desc}
                </p>
            </div>
        </motion.div>
    );
};

export default SoundDesign;
