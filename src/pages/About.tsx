import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Download, ExternalLink, Github, Linkedin, GraduationCap, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

const About = () => {
    const { personal_info, professional_summary } = usePortfolioData();
    const { t } = useTranslation();

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

    return (
        <div className="min-h-screen">
            <SEO title={t('nav.about', 'About')} />

            {/* Gradient Backgrounds */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 right-0 w-72 h-72 bg-cyan-400/8 rounded-full blur-[90px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-32">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="inline-block mb-6">
                        <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-white/10">
                            <img
                                src="/assets/cv-image/cvsmile.jpg"
                                alt="Igor Szuniewicz"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        Igor Szuniewicz
                    </h1>
                    <p className="text-lg text-slate-400">
                        {t('about_role', 'Audio Designer & Developer')}
                    </p>
                </motion.div>

                {/* Bio Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
                >
                    <p className="text-slate-300 leading-relaxed text-lg">
                        {t('about_bio', professional_summary.extended_bio)}
                    </p>
                </motion.div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-5"
                    >
                        <MapPin className="text-purple-400 mb-3" size={20} />
                        <p className="text-white text-sm">{personal_info.location.city}</p>
                        <p className="text-slate-500 text-xs">{personal_info.location.country}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-5"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 mb-3" />
                        <p className="text-white text-sm">
                            {t('status_looking_internship', 'Available for internship')}
                        </p>
                        <p className="text-slate-500 text-xs">{personal_info.availability.status}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-5"
                    >
                        <Mail className="text-blue-400 mb-3" size={20} />
                        <p className="text-white text-sm truncate">{personal_info.email}</p>
                        <p className="text-slate-500 text-xs">Contact me</p>
                    </motion.div>
                </div>

                {/* Skills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Code2 className="text-accent" size={20} />
                        <h2 className="text-xl font-semibold text-white">
                            {t('skills.title', 'Skills')}
                        </h2>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:border-accent/30 hover:text-white transition-all"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <GraduationCap className="text-accent" size={20} />
                        <h2 className="text-xl font-semibold text-white">
                            {t('about_education_title', 'Education')}
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {timeline.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex gap-4 items-start hover:border-white/20 transition-colors"
                            >
                                <span className="text-accent font-mono text-sm shrink-0">{item.year}</span>
                                <div>
                                    <h3 className="text-white font-medium">{item.title}</h3>
                                    <p className="text-slate-500 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <a
                        href="/cv/Igor_Szuniewicz_CV.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <Download size={18} />
                        {t('about_download_cv', 'Download CV')}
                    </a>
                    <a
                        href={personal_info.social_media.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href={personal_info.social_media.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <Linkedin size={20} />
                    </a>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-medium rounded-xl hover:bg-accent/80 transition-colors"
                    >
                        {t('nav.contact', 'Contact')}
                        <ExternalLink size={18} />
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
