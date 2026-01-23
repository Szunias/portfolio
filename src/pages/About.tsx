import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Download, ExternalLink, Github, Linkedin, GraduationCap, Code2, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import SEO from '../components/layout/SEO';
import { Link } from 'react-router-dom';

const About = () => {
    const { personal_info, professional_summary } = usePortfolioData();
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        container: containerRef,
        offset: ['start start', 'end start']
    });

    const skills = [
        'Wwise', 'FMOD', 'MetaSounds', 'Unreal Engine 5', 'Unity',
        'C++', 'C#', 'Python', 'Blueprints', 'Reaper', 'Pro Tools',
        'Logic Pro', 'JUCE', 'Pure Data', 'iZotope RX', 'Git'
    ];

    const timeline = [
        { year: '2022', title: t('timeline_dae_title', 'Howest DAE'), desc: t('timeline.role_game_dev', 'Game Development') },
        { year: '2018', title: t('timeline_hs_title', 'High School'), desc: t('timeline.role_math_phys', 'Maths & Physics') },
        { year: '2012', title: t('timeline_piano_title', 'Music School'), desc: t('timeline.role_piano', 'Classical Piano') }
    ];

    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    return (
        <div className="min-h-screen relative" ref={containerRef}>
            <SEO title={t('nav.about', 'About')} />

            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Large ambient gradient */}
                <motion.div
                    style={{ y, scale, opacity }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-transparent rounded-full blur-[200px]"
                />

                {/* Secondary moving gradient */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-gradient-to-tl from-accent/10 via-cyan-500/5 to-transparent rounded-full blur-[150px]"
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #80808012 1px, transparent 1px),
                                linear-gradient(to bottom, #80808012 1px, transparent 1px)
                            `,
                            backgroundSize: '80px 80px',
                        }}
                    />
                </div>

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                        className="absolute w-1 h-1 bg-accent/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">

                {/* Hero Section with Dramatic Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-32"
                >
                    {/* Profile Image with Glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
                        className="inline-block mb-8 relative"
                        style={{ perspective: '1000px' }}
                    >
                        <div className="w-36 h-36 mx-auto rounded-3xl overflow-hidden border-3 border-white/20 relative group">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-accent/30 via-purple-500/20 to-transparent"
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                            <img
                                src="/assets/cv-image/cvsmile.jpg"
                                alt="Igor Szuniewicz"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {/* Glow ring */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                }}
                                className="absolute -inset-2 bg-gradient-to-r from-accent/50 via-purple-500/50 to-accent/50 rounded-3xl blur-xl -z-10"
                            />
                        </div>
                    </motion.div>

                    {/* Name with Gradient */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-6xl md:text-7xl font-bold mb-6"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            Igor Szuniewicz
                        </span>
                    </motion.h1>
                </motion.div>

                {/* Bio Section with Dramatic Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="relative mb-16"
                >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />

                    <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl border border-white/20 rounded-3xl p-10 md:p-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-accent/10 rounded-2xl">
                                <Sparkles className="text-accent" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {t('about_bio_title', 'About Me')}
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    {t('about_subtitle', 'Passionate about creating immersive audio experiences')}
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-300 leading-relaxed text-lg">
                            {t('about_bio', professional_summary.extended_bio)}
                        </p>
                    </div>
                </motion.div>

                {/* Info Cards - Enhanced Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        {
                            icon: MapPin,
                            isComponent: true,
                            label: personal_info.location.city,
                            sublabel: personal_info.location.country,
                            color: 'from-purple-500/20 to-purple-500/5',
                            borderColor: 'border-purple-500/30',
                            iconColor: 'text-purple-400',
                        },
                        {
                            customIcon: <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />,
                            isComponent: false,
                            label: t('status_looking_internship', 'Available for internship'),
                            sublabel: personal_info.availability.status,
                            color: 'from-green-500/20 to-green-500/5',
                            borderColor: 'border-green-500/30',
                            iconColor: 'text-green-400',
                        },
                        {
                            icon: Mail,
                            isComponent: true,
                            label: personal_info.email,
                            sublabel: 'Contact me',
                            color: 'from-blue-500/20 to-blue-500/5',
                            borderColor: 'border-blue-500/30',
                            iconColor: 'text-blue-400',
                        },
                    ].map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6, type: 'spring' }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"
                                style={{ background: `linear-gradient(to bottom right, ${card.color})` }}
                            />
                            <div className={`relative bg-gradient-to-br ${card.color} backdrop-blur-sm border ${card.borderColor} rounded-2xl p-6 h-full transition-all group-hover:border-white/30`}>
                                <div className={`${card.iconColor} mb-4`}>
                                    {card.isComponent && card.icon ? (
                                        <card.icon size={24} />
                                    ) : (
                                        card.customIcon
                                    )}
                                </div>
                                <p className="text-white font-medium mb-1">{card.label}</p>
                                <p className="text-slate-500 text-sm">{card.sublabel}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Skills - Creative Display */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-accent/10 rounded-xl">
                            <Code2 className="text-accent" size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {t('skills.title', 'Skills')}
                        </h2>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                        <div className="flex flex-wrap gap-3">
                            {skills.map((skill, index) => (
                                <motion.span
                                    key={skill}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{
                                        scale: 1.1,
                                        rotate: [0, -3, 3, 0],
                                    }}
                                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:border-accent/40 hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all cursor-default"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Timeline - Cinematic Style */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-accent/10 rounded-xl">
                            <GraduationCap className="text-accent" size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {t('about_education_title', 'Education')}
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/50 via-purple-500/30 to-transparent" />

                        <div className="space-y-6">
                            {timeline.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.6 }}
                                    className="relative pl-20 group"
                                >
                                    {/* Timeline dot */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                        }}
                                        className="absolute left-6 top-6 w-5 h-5 bg-accent rounded-full border-4 border-[#050505] z-10"
                                    />

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 group-hover:border-accent/30 transition-all group-hover:bg-white/[0.08]">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-accent font-mono text-lg font-bold">
                                                {item.year}
                                            </span>
                                            <div className="flex-1 h-px bg-white/10" />
                                        </div>
                                        <h3 className="text-white font-semibold text-lg mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* CTA Actions - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <motion.a
                        href="/cv/Igor_Szuniewicz_CV.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Download size={20} />
                            {t('about_download_cv', 'Download CV')}
                        </span>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                        />
                    </motion.a>

                    <motion.a
                        href={personal_info.social_media.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-accent/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all"
                    >
                        <Github size={22} />
                    </motion.a>

                    <motion.a
                        href={personal_info.social_media.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-accent/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all"
                    >
                        <Linkedin size={22} />
                    </motion.a>

                    <Link
                        to="/contact"
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-black font-semibold rounded-xl overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {t('nav.contact', 'Contact')}
                            <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                        />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
