import { useState } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Download, Calendar, ExternalLink, Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

const About = () => {
    const { personal_info, professional_summary } = usePortfolioData();
    const { t } = useTranslation();

    // Skills categories
    const skillCategories = [
        {
            title: t('skills_category_middleware', 'Audio Middleware'),
            items: ['Wwise', 'FMOD', 'MetaSounds', 'Unity Audio']
        },
        {
            title: t('skills_category_engines', 'Game Engines'),
            items: ['Unreal Engine 5', 'Unity', 'Godot']
        },
        {
            title: t('skills_category_programming', 'Programming'),
            items: ['C++', 'C#', 'Python', 'Blueprints']
        },
        {
            title: t('skills_category_audio', 'Audio Tools'),
            items: ['Reaper', 'Pro Tools', 'Logic Pro', 'iZotope RX']
        },
        {
            title: t('skills_category_other', 'Other'),
            items: ['JUCE', 'Pure Data', 'Git', 'Perforce']
        }
    ];

    const timelineItems = [
        {
            title: t('timeline_dae_title', 'Howest DAE'),
            role: t('timeline.role_game_dev', 'Game Development'),
            period: '2022 - Present',
            description: t('timeline_dae_desc', 'Bachelor in Game Development focusing on game audio and implementation')
        },
        {
            title: t('timeline_hs_title', 'High School'),
            role: t('timeline.role_math_phys', 'Maths & Physics'),
            period: '2018 - 2022',
            description: t('timeline_hs_desc', 'Advanced secondary education with focus on sciences')
        },
        {
            title: t('timeline_piano_title', 'Music School'),
            role: t('timeline.role_piano', 'Classical Piano'),
            period: '2012 - 2020',
            description: t('timeline_piano_desc', '8 years of classical piano education and music theory')
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505]">
            <SEO
                title={t('nav.about', 'About')}
                description={t('about_page_description', professional_summary.short_bio)}
            />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-accent font-mono text-sm mb-4 tracking-widest uppercase">
                            {t('about_header', 'About Me')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Igor Szuniewicz
                            </h1>
                            <img
                                src="/assets/cv-image/cvsmile.jpg"
                                alt="Igor Szuniewicz"
                                className="w-16 h-16 rounded-xl object-cover border-2 border-white/10"
                            />
                        </div>
                        <p className="text-xl text-slate-300 font-medium mb-4">
                            {t('about_role', 'Audio Designer & Developer')}
                        </p>
                        <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
                            {t('about_bio', professional_summary.extended_bio)}
                        </p>

                        {/* Quick info */}
                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400 mb-8">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-accent" />
                                {personal_info.location.city}, {personal_info.location.country}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-accent" />
                                {personal_info.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {personal_info.availability.status.includes('internship')
                                    ? t('status_looking_internship', 'Available for internship')
                                    : personal_info.availability.status}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="/cv/Igor_Szuniewicz_CV.pdf"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
                            >
                                <Download size={16} />
                                {t('about_download_cv', 'Download CV')}
                            </a>
                            <a
                                href={personal_info.social_media.github}
                                target="_blank"
                                className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 transition-all"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href={personal_info.social_media.linkedin}
                                target="_blank"
                                className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 transition-all"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {t('skills.title', 'Skills & Expertise')}
                        </h2>
                        <p className="text-slate-400 max-w-xl">
                            {t('skills.subtitle', 'Tools and technologies I use to create immersive audio experiences')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skillCategories.map((category, idx) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                            >
                                <h3 className="text-white font-semibold mb-4">{category.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {category.items.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 bg-white/5 rounded-lg text-sm text-slate-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {t('about_education_title', 'Education')}
                        </h2>
                        <p className="text-slate-400">
                            {t('about_education_subtitle', 'My academic journey and background')}
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent" />

                        {timelineItems.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative flex flex-col md:flex-row gap-8 mb-16 last:mb-0 ${
                                    idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                                }`}
                            >
                                {/* Dot */}
                                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent shadow-[0_0_20px_rgba(56,189,248,0.5)]" />

                                {/* Content */}
                                <div className="md:w-1/2 md:px-12">
                                    <span className="text-accent font-mono text-sm mb-2 block">
                                        {item.period}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-slate-400 font-medium mb-3">{item.role}</p>
                                    <p className="text-slate-500 text-sm">{item.description}</p>
                                </div>

                                {/* Spacer for alternating layout */}
                                <div className="hidden md:block md:w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            {t('about_cta_title', "Let's work together")}
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            {t('about_cta_subtitle', "I'm always interested in hearing about new projects and opportunities. Feel free to reach out if you'd like to connect.")}
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-black font-semibold rounded-xl hover:bg-accent/80 transition-colors"
                        >
                            {t('nav.contact', 'Get In Touch')}
                            <ExternalLink size={18} />
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
