import { useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ChevronDown, Cpu, Zap, Layers, Code, Database, Music } from 'lucide-react';

const MiddlewareOptimization = () => {
    const { t } = useTranslation('middlewareOptimization');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-white bg-stripes-diagonal text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-20">
                <motion.div 
                    style={{ opacity, scale }}
                    className="relative z-10 max-w-5xl w-full text-center"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-bold uppercase tracking-wider mb-8 border border-purple-100"
                    >
                        <Zap size={16} />
                        {t('hero.tag')}
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-tight"
                    >
                        {t('hero.title')}
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
                    >
                        {t('hero.lead')}
                    </motion.p>

                    {/* Wwise Logo */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white p-8 rounded-3xl shadow-2xl shadow-purple-100/50 inline-block mb-12 hover:shadow-purple-200/50 transition-shadow duration-300"
                    >
                        <img
                            src="/assets/images/projects-pausedeserve/wwise_logo_rgb-77Awrfoo.png"
                            alt="Wwise Logo"
                            className="w-48 md:w-64 h-auto"
                            loading="lazy"
                        />
                    </motion.div>

                    {/* Context Note */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="max-w-2xl mx-auto bg-sky-50 border-l-4 border-sky-400 p-6 rounded-r-xl text-left mb-12"
                    >
                        <p className="text-sky-900 text-sm md:text-base leading-relaxed">
                            {t('hero.context')}
                        </p>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap justify-center gap-6 md:gap-10"
                    >
                        {[
                            { num: t('hero.stat1_num'), text: t('hero.stat1_text') },
                            { num: t('hero.stat2_num'), text: t('hero.stat2_text') },
                            { num: t('hero.stat3_num'), text: t('hero.stat3_text') }
                        ].map((stat, index) => (
                            <motion.div 
                                key={index}
                                variants={fadeInUp}
                                className="flex items-baseline gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:-translate-y-1 transition-transform duration-300"
                            >
                                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-500">
                                    {stat.num}
                                </span>
                                <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">
                                    {stat.text}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-300"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>

            {/* Main Content */}
            <main className="relative z-20 bg-white">
                {/* Section Header */}
                <section className="max-w-4xl mx-auto px-6 py-24 text-center">
                    <motion.h2 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                    >
                        {t('section.title')}
                    </motion.h2>
                    <motion.p 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-xl text-slate-500 leading-relaxed"
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
                <section className="bg-slate-50 py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('learned.title')}</h2>
                            <p className="text-slate-500 text-lg">{t('learned.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <SkillCard 
                                icon={<Cpu className="text-purple-500" />}
                                title={t('learned.skill1_name')}
                                desc={t('learned.skill1_desc')}
                            />
                            <SkillCard 
                                icon={<Layers className="text-sky-500" />}
                                title={t('learned.skill2_name')}
                                desc={t('learned.skill2_desc')}
                            />
                            <SkillCard 
                                icon={<Code className="text-pink-500" />}
                                title={t('learned.skill3_name')}
                                desc={t('learned.skill3_desc')}
                            />
                            <SkillCard 
                                icon={<Database className="text-amber-500" />}
                                title={t('learned.skill4_name')}
                                desc={t('learned.skill4_desc')}
                            />
                            <SkillCard 
                                icon={<Music className="text-indigo-500" />}
                                title={t('learned.skill5_name')}
                                desc={t('learned.skill5_desc')}
                            />
                            <SkillCard 
                                icon={<Zap className="text-emerald-500" />}
                                title={t('learned.skill6_name')}
                                desc={t('learned.skill6_desc')}
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white py-20 text-center border-t border-slate-100">
                <Link 
                    to="/projects" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-full border border-slate-200 shadow-lg shadow-slate-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {t('back')}
                </Link>
                <p className="mt-8 text-slate-400 text-sm">
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
    return (
        <motion.article 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-slate-50 rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h3>
                <div className="flex flex-wrap gap-3">
                    {badges.map((badge: string, i: number) => (
                        <span key={i} className="px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-semibold rounded-lg border border-sky-200">
                            {badge}
                        </span>
                    ))}
                    <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-lg border border-orange-200">
                        {time}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 mb-10 border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-purple-500"
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
                <p className="p-6 text-slate-500 text-sm bg-slate-50/50">
                    {caption}
                </p>
            </div>

            <div className="space-y-6">
                {paragraphs.map((p: string, i: number) => (
                    <p key={i} className="text-lg text-slate-600 leading-relaxed pl-6 border-l-4 border-purple-200">
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
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300"
        >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">
                {desc}
            </p>
        </motion.div>
    );
};

export default MiddlewareOptimization;
