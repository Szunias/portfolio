import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Cpu, Zap, Layers, Code, Database, Music } from 'lucide-react';

import SEO from '../components/layout/SEO';
import { sectionReveal, cardIn, detailIn, noMotion } from '../constants/motion';

/** Wwise middleware optimization page showcasing three case studies with video demos. */
const MiddlewareOptimization = () => {
    const { t } = useTranslation('middlewareOptimization');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div ref={containerRef} className="min-h-screen bg-surface text-text-primary font-sans selection:bg-accent/20 selection:text-accent-hover">
            <SEO
                title={t('seo_title', 'Wwise Middleware Optimization')}
                description={t('seo_description', 'Three Wwise middleware projects: voice management, spatial audio, and cross-platform memory optimization.')}
            />
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-surface px-4 py-20">
                <motion.div
                    style={{ opacity, scale }}
                    className="relative z-10 max-w-5xl w-full text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-raised text-accent text-sm font-bold uppercase tracking-wider mb-8 border border-border">
                        <Zap size={16} />
                        {t('hero.tag')}
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-text-primary mb-6 leading-tight">
                        {t('hero.title')}
                    </h1>

                    <p className="text-lg md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        {t('hero.lead')}
                    </p>

                    {/* Wwise Logo */}
                    <div className="bg-surface-raised p-8 rounded-sm inline-block mb-12 border border-border transition-colors duration-300">
                        <img
                            src="/assets/images/projects-pausedeserve/wwise_logo_rgb-77Awrfoo.png"
                            alt="Wwise Logo"
                            className="w-48 md:w-64 h-auto"
                            loading="lazy"
                        />
                    </div>

                    {/* Context Note */}
                    <div className="max-w-2xl mx-auto bg-surface-raised border-l-4 border-accent p-6 rounded-sm text-left mb-12">
                        <p className="text-text-primary text-sm md:text-base leading-relaxed">
                            {t('hero.context')}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                        {[
                            { num: t('hero.stat1_num'), text: t('hero.stat1_text') },
                            { num: t('hero.stat2_num'), text: t('hero.stat2_text') },
                            { num: t('hero.stat3_num'), text: t('hero.stat3_text') }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="flex items-baseline gap-3 px-6 py-4 bg-surface-raised rounded-sm border border-border hover:-translate-y-1 transition-transform duration-300"
                            >
                                <span className="text-3xl font-black text-accent">
                                    {stat.num}
                                </span>
                                <span className="text-text-secondary font-medium text-sm uppercase tracking-wide">
                                    {stat.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-text-secondary">
                    <ChevronDown size={32} />
                </div>
            </section>

            {/* Main Content */}
            <main className="relative z-20 bg-surface">
                {/* Section Header */}
                <section className="max-w-4xl mx-auto px-6 py-24 text-center">
                    <motion.h2
                        initial={sectionReveal.initial}
                        whileInView={sectionReveal.animate}
                        viewport={{ once: true }}
                        transition={sectionReveal.transition}
                        className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-6"
                    >
                        {t('section.title')}
                    </motion.h2>
                    <motion.p
                        initial={sectionReveal.initial}
                        whileInView={sectionReveal.animate}
                        viewport={{ once: true }}
                        transition={{ ...sectionReveal.transition, delay: 0.1 }}
                        className="text-xl text-text-secondary leading-relaxed"
                    >
                        {t('section.subtitle')}
                    </motion.p>
                </section>

                <div className="max-w-6xl mx-auto px-6 pb-32 space-y-32">
                    {/* Project 1: Boney Boogaloo */}
                    <CaseStudyCard
                        title={t('boney.title')}
                        badges={[t('boney.badge1'), t('boney.badge2')]}
                        time={t('boney.badge3')}
                        videoTitle={t('boney.video_title')}
                        videoSrc="/wwiseprojectsinfo/videos/boneyboogaloo/optboo.mp4"
                        poster="/wwiseprojectsinfo/images/BoneyBoogaloo.png"
                        caption={t('boney.video_caption')}
                        paragraphs={[t('boney.p1'), t('boney.p2'), t('boney.p3'), t('boney.p4')]}
                    />

                    {/* Project 2: Ellen */}
                    <CaseStudyCard
                        title={t('ellen.title')}
                        badges={[t('ellen.badge1'), t('ellen.badge2')]}
                        time={t('ellen.badge3')}
                        videoTitle={t('ellen.video_title')}
                        vimeoSrc="https://player.vimeo.com/video/1135151616?badge=0&autopause=0&player_id=0&app_id=58479"
                        caption={t('ellen.video_caption')}
                        paragraphs={[t('ellen.p1'), t('ellen.p2'), t('ellen.p3'), t('ellen.p4')]}
                    />

                    {/* Project 3: Stomach Aches */}
                    <CaseStudyCard
                        title={t('stomach.title')}
                        badges={[t('stomach.badge1'), t('stomach.badge2')]}
                        time={t('stomach.badge3')}
                        videoTitle={t('stomach.video_title')}
                        videoSrc="/wwiseprojectsinfo/videos/stomachaches/optstomachaches.mp4"
                        poster="/wwiseprojectsinfo/images/StomachAches.png"
                        caption={t('stomach.video_caption')}
                        paragraphs={[t('stomach.p1'), t('stomach.p2'), t('stomach.p3'), t('stomach.p4')]}
                    />
                </div>

                {/* Skills Section */}
                <section className="bg-surface-raised py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">{t('learned.title')}</h2>
                            <p className="text-text-secondary text-lg">{t('learned.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <SkillCard
                                icon={<Cpu className="text-accent" />}
                                title={t('learned.skill1_name')}
                                desc={t('learned.skill1_desc')}
                            />
                            <SkillCard
                                icon={<Layers className="text-accent-hover" />}
                                title={t('learned.skill2_name')}
                                desc={t('learned.skill2_desc')}
                            />
                            <SkillCard
                                icon={<Code className="text-accent" />}
                                title={t('learned.skill3_name')}
                                desc={t('learned.skill3_desc')}
                            />
                            <SkillCard
                                icon={<Database className="text-accent-hover" />}
                                title={t('learned.skill4_name')}
                                desc={t('learned.skill4_desc')}
                            />
                            <SkillCard
                                icon={<Music className="text-accent" />}
                                title={t('learned.skill5_name')}
                                desc={t('learned.skill5_desc')}
                            />
                            <SkillCard
                                icon={<Zap className="text-accent-hover" />}
                                title={t('learned.skill6_name')}
                                desc={t('learned.skill6_desc')}
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface py-20 text-center border-t border-border">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-surface-raised text-text-primary font-semibold rounded-sm border border-border hover:-translate-y-1 hover:border-border-hover transition-all duration-300 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {t('back')}
                </Link>
                <p className="mt-8 text-text-secondary text-sm">
                    {t('footer')}
                </p>
            </footer>
        </div>
    );
};

interface CaseStudyCardProps {
    title: string;
    badges: string[];
    time: string;
    videoTitle: string;
    videoSrc?: string;
    vimeoSrc?: string;
    poster?: string;
    caption: string;
    paragraphs: string[];
}

const CaseStudyCard = ({ title, badges, time, videoTitle, videoSrc, vimeoSrc, poster, caption, paragraphs }: CaseStudyCardProps) => {
    const { t: tCommon } = useTranslation('common');
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.article
            initial={prefersReducedMotion ? noMotion.initial : detailIn.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : detailIn.animate}
            viewport={{ once: true, margin: "-100px" }}
            transition={prefersReducedMotion ? noMotion.transition : detailIn.transition}
            className="bg-surface-raised border border-border rounded-sm p-8 md:p-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <h3 className="text-3xl md:text-4xl font-display font-bold text-text-primary">{title}</h3>
                <div className="flex flex-wrap gap-3">
                    {badges.map((badge: string, i: number) => (
                        <span key={i} className="px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-sm border border-accent/20">
                            {badge}
                        </span>
                    ))}
                    <span className="px-4 py-1.5 bg-accent/10 text-accent-hover text-sm font-semibold rounded-sm border border-accent/20">
                        {time}
                    </span>
                </div>
            </div>

            <div className="bg-surface rounded-sm overflow-hidden mb-10 border border-border">
                <div className="p-6 border-b border-border">
                    <h4 className="font-bold text-lg text-text-primary flex items-center gap-2">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-accent"
                        >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        {videoTitle}
                    </h4>
                </div>
                <div className="relative bg-black aspect-video">
                    {vimeoSrc ? (
                        <iframe
                            src={vimeoSrc}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                            title={title}
                        />
                    ) : (
                        <video
                            controls
                            preload="metadata"
                            poster={poster}
                            className="w-full h-full object-cover"
                        >
                            <source src={videoSrc} type="video/mp4" />
                            {tCommon('common.video_unsupported', 'Your browser does not support video playback.')}
                        </video>
                    )}
                </div>
                <p className="p-6 text-text-secondary text-sm bg-surface-raised">
                    {caption}
                </p>
            </div>

            <div className="space-y-6">
                {paragraphs.map((p: string, i: number) => (
                    <p key={i} className="text-lg text-text-primary leading-relaxed pl-6 border-l-4 border-accent/40">
                        {p}
                    </p>
                ))}
            </div>
        </motion.article>
    );
};

interface SkillCardProps {
    icon: ReactNode;
    title: string;
    desc: string;
}

const SkillCard = ({ icon, title, desc }: SkillCardProps) => {
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.div
            initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : cardIn.transition}
            whileHover={prefersReducedMotion ? {} : { y: -4 }}
            className="bg-surface-raised p-8 rounded-sm border border-border hover:border-border-hover transition-all duration-300"
        >
            <div className="w-12 h-12 bg-surface rounded-sm flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-display font-bold text-text-primary mb-3">{title}</h3>
            <p className="text-text-secondary leading-relaxed">
                {desc}
            </p>
        </motion.div>
    );
};

export default MiddlewareOptimization;
