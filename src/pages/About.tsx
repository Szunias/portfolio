import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { Download, Gamepad2, GraduationCap, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';
import { Link } from 'react-router-dom';
import AboutTimeline from '../components/features/about/AboutTimeline';
import AboutSkillsSidebar from '../components/features/about/AboutSkillsSidebar';

const toolNameMap: Record<string, string> = {
    Unreal_Engine: 'Unreal Engine 5',
    C_Sharp: 'C#',
    C_Plus_Plus: 'C++',
    Pro_Tools: 'Pro Tools',
    Logic_Pro: 'Logic Pro',
    Max_MSP: 'Max/MSP',
    iZotope_RX: 'iZotope RX',
};

const About = () => {
    const portfolioData = usePortfolioData();
    const { personal_info } = portfolioData;
    const { t } = useTranslation('about');

    const getToolNames = (categoryKey: string) => {
        const cat = (portfolioData as unknown as Record<string, unknown>).technical_skills_matrix as Record<string, { tools?: Record<string, unknown> }> | undefined;
        const tools = cat?.[categoryKey]?.tools;
        if (!tools) return [];
        return Object.keys(tools).map(k => toolNameMap[k] || k);
    };

    const skills = {
        middleware: getToolNames('audio_middleware'),
        engines: getToolNames('game_engines'),
        programming: getToolNames('programming_scripting'),
        production: getToolNames('daws_production'),
        tools: getToolNames('dsp_specialized'),
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

    const achievements = [
        {
            icon: Gamepad2,
            title: t('achievement_games_title', 'Student Game Projects'),
            desc: t('achievement_games_desc'),
        },
        {
            icon: GraduationCap,
            title: t('achievement_thesis_title', 'Bachelor Thesis'),
            desc: t('achievement_thesis_desc'),
        },
        {
            icon: Wrench,
            title: t('achievement_tools_title', 'Production Tools'),
            desc: t('achievement_tools_desc'),
        },
    ];

    return (
        <div className="min-h-screen relative">
            <SEO title={t('about_page_title', 'About Me')} description={t('about_page_description')} />

            {/* Subtle Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-gradient-to-br from-purple-500/8 via-blue-500/6 to-transparent rounded-full blur-[120px]"
                />
            </div>

            {/* A: Page Header */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-8">
                <p className="text-accent font-mono text-sm tracking-wider uppercase mb-3">
                    {t('about_page_label', 'About')}
                </p>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">
                    {t('about_page_title', 'About Me')}
                </h1>
                <p className="text-xl text-slate-400 font-light max-w-2xl">
                    {t('about_role', 'Audio Designer & Developer')}
                </p>
            </section>

            {/* B: Two-Column Layout */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content - 8 columns */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* B1: Journey */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {t('about_journey_title', 'Journey')}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-lg mb-4">
                                {t('about_journey_p1')}
                            </p>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {t('about_journey_p2')}
                            </p>
                        </motion.div>

                        {/* B2: What Drives Me */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {t('about_drives_title', 'What Drives Me')}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-lg mb-4">
                                {t('about_drives_p1')}
                            </p>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {t('about_drives_p2')}
                            </p>
                        </motion.div>

                        {/* B3: Philosophy Quote */}
                        <motion.blockquote
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
                            className="border-l-2 border-accent pl-6 py-2"
                        >
                            <p className="text-slate-300 text-lg italic leading-relaxed">
                                {t('philosophy_quote')}
                            </p>
                        </motion.blockquote>

                        {/* B4: Education Timeline */}
                        <AboutTimeline timeline={timeline} t={t} />

                        {/* B5: Notable Work */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {t('achievements_title', 'Notable Work')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {achievements.map((item) => (
                                    <div
                                        key={item.title}
                                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-accent/20 transition-all"
                                    >
                                        <item.icon className="text-accent mb-3" size={24} />
                                        <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar - 4 columns */}
                    <AboutSkillsSidebar personalInfo={personal_info} skills={skills} t={t} />
                </div>
            </section>

            {/* C: CTA Banner */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35 }}
                    className="bg-accent/5 border border-accent/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {t('cta_title', 'Available for Internship')}
                        </h2>
                        <p className="text-slate-300 max-w-xl">
                            {t('cta_desc')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
                        >
                            {t('cta_contact', 'Get in Touch')}
                        </Link>
                        <a
                            href="/cv/Igor_Szuniewicz_CV.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-xl backdrop-blur-sm bg-white/5 transition-all hover:scale-105 hover:border-white/40 hover:bg-white/10"
                        >
                            <Download size={16} />
                            {t('cta_cv', 'View CV')}
                        </a>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default About;
