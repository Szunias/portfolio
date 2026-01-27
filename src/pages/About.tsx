import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Download, Github, Linkedin, GraduationCap, Copy, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import SEO from '../components/layout/SEO';
import { Link } from 'react-router-dom';

const About = () => {
    const { personal_info, professional_summary } = usePortfolioData();
    const { t } = useTranslation();
    const [emailCopied, setEmailCopied] = useState(false);

    const skills = {
        middleware: ['Wwise', 'FMOD', 'MetaSounds'],
        engines: ['Unreal Engine 5', 'Unity'],
        programming: ['C++', 'C#', 'Python', 'Blueprints'],
        production: ['Reaper', 'Pro Tools', 'Logic Pro', 'JUCE', 'Pure Data'],
        tools: ['iZotope RX', 'Git', 'Perforce']
    };

    const timeline = [
        {
            year: '2022 - 2026',
            title: t('timeline_dae_title', 'DAE: Game Development'),
            desc: t('timeline_dae_desc', 'Audio integration, Wwise/FMOD middleware, and game audio workflows at Howest Belgium.'),
            institution: 'Howest University of Applied Sciences'
        },
        {
            year: '2018 - 2022',
            title: t('timeline_hs_title', 'High School — Mathematics & Physics'),
            desc: t('timeline_hs_desc', 'Mathematics, physics and computer science at Nicolaus Copernicus High School in Kolobrzeg, Poland.'),
            institution: 'Nicolaus Copernicus High School'
        },
        {
            year: '2012 - 2018',
            title: t('timeline_piano_title', 'Classical Piano & Music Theory'),
            desc: t('timeline_piano_desc', 'Classical piano education at First Degree State Music School in Kolobrzeg, Poland.'),
            institution: 'State Music School'
        }
    ];

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(personal_info.email);
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    };

    return (
        <div className="min-h-screen relative">
            <SEO title={t('nav.about', 'About')} />

            {/* Subtle Background - matching Home page style */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-gradient-to-br from-purple-500/8 via-blue-500/6 to-transparent rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center">
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
                    <div className="max-w-5xl">
                        {/* Name with gradient */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="font-display font-black text-[4rem] sm:text-[5.5rem] lg:text-[7rem] leading-[0.9] tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                                    IGOR
                                </span>
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                    SZUNIEWICZ
                                </span>
                            </h1>
                        </motion.div>

                        {/* Role */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl sm:text-2xl md:text-3xl text-slate-300 font-light mt-6 mb-12 max-w-2xl"
                        >
                            {t('about_role', 'Game Audio Designer • Developer')}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap gap-4"
                        >
                            <a
                                href="/cv/Igor_Szuniewicz_CV.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                            >
                                <Download size={18} className="group-hover:animate-bounce" />
                                {t('about_download_cv', 'Download CV')}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </a>

                            <a
                                href={personal_info.social_media.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-medium rounded-xl backdrop-blur-sm bg-white/5 transition-all hover:scale-105 hover:border-white/40 hover:bg-white/10"
                            >
                                <Github size={18} />
                                GitHub
                            </a>

                            <a
                                href={personal_info.social_media.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-medium rounded-xl backdrop-blur-sm bg-white/5 transition-all hover:scale-105 hover:border-white/40 hover:bg-white/10"
                            >
                                <Linkedin size={18} />
                                LinkedIn
                            </a>

                            <Link
                                to="/contact"
                                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-black font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]"
                            >
                                {t('nav.contact', 'Contact')}
                                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Two-Column Layout */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content - 8 columns */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Bio Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {t('about_bio_title', 'About Me')}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {t('about_bio', professional_summary.extended_bio)}
                            </p>
                        </motion.div>

                        {/* Education Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-accent/10 rounded-xl">
                                    <GraduationCap className="text-accent" size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    {t('about_education_title', 'Education')}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {timeline.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-accent/30 transition-all group"
                                    >
                                        <span className="inline-block px-3 py-1 text-xs font-mono text-accent bg-accent/10 rounded-full mb-3">
                                            {item.year}
                                        </span>
                                        <h3 className="text-white font-semibold mb-2 group-hover:text-accent transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm">
                                            {item.institution}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Design Philosophy */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {t('philosophy_title', 'Design Philosophy')}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        title: t('principle_clarity_title', 'Clarity First'),
                                        desc: t('principle_clarity_desc', 'Game audio must be clear. What does the player need to hear right now? Mix hierarchy, frequency separation, ducking.')
                                    },
                                    {
                                        title: t('principle_technical_title', 'Know Your Limits'),
                                        desc: t('principle_technical_desc', 'Know the limits: voice counts, memory, CPU. I build systems that work in prototype and scale to production.')
                                    },
                                    {
                                        title: t('principle_layering_title', 'Layers & Parameters'),
                                        desc: t('principle_layering_desc', 'I design sounds in layers: transient for punch, body for weight, texture for character. Parameters blend them in real-time.')
                                    },
                                    {
                                        title: t('principle_collaboration_title', 'Iterate with Feedback'),
                                        desc: t('principle_collaboration_desc', 'Audio needs input from designers, programmers, and players. I document systems and iterate based on playtests.')
                                    }
                                ].map((principle, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-accent/20 transition-all"
                                    >
                                        <h3 className="text-white font-semibold mb-2">{principle.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{principle.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar - 4 columns */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 lg:self-start">

                        {/* Quick Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {t('about_quick_info', 'Quick Info')}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <MapPin className="text-accent" size={18} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{personal_info.location.city}</p>
                                    <p className="text-slate-500 text-sm">{personal_info.location.country}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{t('status_looking_internship', 'Available for internship')}</p>
                                    <p className="text-slate-500 text-sm">{personal_info.availability.status}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Mail className="text-accent" size={18} />
                                </div>
                                <button
                                    onClick={handleCopyEmail}
                                    className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    <span className="text-sm truncate max-w-[180px]">{personal_info.email}</span>
                                    {emailCopied ? (
                                        <Check size={14} className="text-green-400" />
                                    ) : (
                                        <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        {/* Skills Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {t('tech_middleware_title', 'Middleware')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.middleware.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {t('tech_engines_title', 'Game Engines')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.engines.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {t('tech_programming_title', 'Programming')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.programming.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {t('tech_production_title', 'Production')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.production.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {t('tech_specialized_title', 'Tools')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.tools.map(skill => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
