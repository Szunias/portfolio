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
        interface SkillsMatrix { [key: string]: { tools?: Record<string, unknown> } }
        const cat = (portfolioData as unknown as { technical_skills_matrix?: SkillsMatrix }).technical_skills_matrix;
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
            institution: 'Howest University of Applied Sciences'
        },
        {
            year: '2018 - 2022',
            title: t('timeline_hs_title', 'High School — Mathematics & Physics'),
            institution: 'Nicolaus Copernicus High School'
        },
        {
            year: '2012 - 2018',
            title: t('timeline_piano_title', 'Classical Piano & Music Theory'),
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

            {/* A: Page Header */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-8">
                <p className="text-accent font-mono text-sm tracking-wider uppercase mb-3">
                    {t('about_page_label', 'About')}
                </p>
                <h1 className="text-4xl sm:text-5xl font-display text-cream-light mb-3">
                    {t('about_page_title', 'About Me')}
                </h1>
                <p className="text-xl text-dim font-light max-w-2xl">
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
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-display text-cream-light mb-4">
                                {t('about_journey_title', 'Journey')}
                            </h2>
                            <p className="text-dim leading-relaxed text-lg mb-4">
                                {t('about_journey_p1')}
                            </p>
                            <p className="text-dim leading-relaxed text-lg">
                                {t('about_journey_p2')}
                            </p>
                        </motion.div>

                        {/* B2: What Drives Me */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-display text-cream-light mb-4">
                                {t('about_drives_title', 'What Drives Me')}
                            </h2>
                            <p className="text-dim leading-relaxed text-lg mb-4">
                                {t('about_drives_p1')}
                            </p>
                            <p className="text-dim leading-relaxed text-lg">
                                {t('about_drives_p2')}
                            </p>
                        </motion.div>

                        {/* B3: Philosophy Quote */}
                        <motion.blockquote
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                            className="border-l-2 border-accent pl-6 py-2"
                        >
                            <p className="text-dim text-lg italic leading-relaxed">
                                {t('philosophy_quote')}
                            </p>
                        </motion.blockquote>

                        {/* B4: Education Timeline */}
                        <AboutTimeline timeline={timeline} t={t} />

                        {/* B5: Notable Work */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-display text-cream-light mb-6">
                                {t('achievements_title', 'Notable Work')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {achievements.map((item) => (
                                    <div
                                        key={item.title}
                                        className="bg-secondary border border-border rounded-sm p-5 hover:border-border-hover transition-colors duration-200"
                                    >
                                        <item.icon className="text-accent mb-3" size={24} />
                                        <h3 className="text-cream font-medium mb-2">{item.title}</h3>
                                        <p className="text-dim text-sm leading-relaxed">{item.desc}</p>
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
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="border border-border rounded-sm p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                    <div>
                        <h2 className="text-2xl font-display text-cream-light mb-2">
                            {t('cta_title', 'Available for Internship')}
                        </h2>
                        <p className="text-dim max-w-xl">
                            {t('cta_desc')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-medium rounded-sm transition-colors duration-200 hover:bg-accent-light"
                        >
                            {t('cta_contact', 'Get in Touch')}
                        </Link>
                        <a
                            href="/cv/Igor_Szuniewicz_CV.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-cream font-medium rounded-sm transition-colors duration-200 hover:border-border-hover"
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
