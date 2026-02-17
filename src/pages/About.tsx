import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { Download, Github, Linkedin, ExternalLink } from 'lucide-react';
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
    const { personal_info, professional_summary } = portfolioData;
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

    return (
        <div className="min-h-screen relative">
            <SEO title={t('nav.about', 'About')} />

            {/* Subtle Background - matching Home page style */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-gradient-to-br from-purple-500/8 via-blue-500/6 to-transparent rounded-full blur-[120px]"
                />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center">
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
                    <div className="max-w-5xl">
                        {/* Name with gradient */}
                        <div>
                            <h1 className="font-display font-black text-[4rem] sm:text-[5.5rem] lg:text-[7rem] leading-[0.9] tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                                    IGOR
                                </span>
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                    SZUNIEWICZ
                                </span>
                            </h1>
                        </div>

                        {/* Role */}
                        <p
                            className="text-xl sm:text-2xl md:text-3xl text-slate-300 font-light mt-6 mb-12 max-w-2xl"
                        >
                            {t('about_role', 'Game Audio Designer • Developer')}
                        </p>

                        {/* CTAs */}
                        <div
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
                                rel="noopener noreferrer me"
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
                        </div>
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
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
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
                        <AboutTimeline timeline={timeline} t={t} />

                        {/* Design Philosophy */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
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
                                ].map((principle) => (
                                    <div
                                        key={principle.title}
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
                    <AboutSkillsSidebar personalInfo={personal_info} skills={skills} t={t} />
                </div>
            </section>
        </div>
    );
};

export default About;
