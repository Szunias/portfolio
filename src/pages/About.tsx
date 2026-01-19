import { useState } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Zap, BookOpen, Cpu, Globe, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';
import SEO from '../components/layout/SEO';
import TechConstellation from '../components/home/TechConstellation';

const About = () => {
    const { personal_info, professional_summary } = usePortfolioData();
    const { t } = useTranslation();
    const [selectedTech, setSelectedTech] = useState<string | null>(null);

    const getTechDescription = (name: string): string => {
        if (!name) return "";

        // Direct mapping of tech names to translation keys
        const techKeyMap: Record<string, string> = {
            'Wwise': 'tech_wwise_desc',
            'FMOD': 'tech_fmod_desc',
            'MetaSounds': 'tech_metasounds_desc',
            '3D Audio': 'tech_3daudio_desc',
            'Unreal Engine 5': 'tech_unreal_desc',
            'Unity': 'tech_unity_desc',
            'C++': 'tech_cpp_desc',
            'C#': 'tech_csharp_desc',
            'Python': 'tech_python_desc',
            'Blueprints': 'tech_blueprints_desc',
            'JUCE': 'tech_juce_desc',
            'Pure Data': 'tech_puredata_desc',
            'Reaper': 'tech_reaper_desc',
            'Logic Pro': 'tech_logic_desc',
            'iZotope RX': 'tech_izotoperx_desc',
            'GitHub': 'tech_github_desc',
            'Perforce': 'tech_perforce_desc',
        };

        const translationKey = techKeyMap[name];
        if (translationKey) {
            const translated = t(translationKey, { defaultValue: '' });
            if (translated && translated !== translationKey) return translated;
        }

        return t('tech_desc_default', 'Production proficiency and production experience.');
    };

    const timelineItems = [
        { title: t('timeline_dae_title', 'Howest DAE'), role: t('timeline.role_game_dev', 'Game Development'), date: t('timeline.present', 'Present'), color: 'text-accent' },
        { title: t('timeline_hs_title', 'High School'), role: t('timeline.role_math_phys', 'Maths & Physics'), date: t('timeline.graduated', 'Graduated'), color: 'text-slate-500' },
        { title: t('timeline_piano_title', 'Music School'), role: t('timeline.role_piano', 'Classical Piano'), date: t('timeline.graduated', 'Graduated'), color: 'text-slate-500' }
    ];

    return (
        <div className="min-h-screen text-white overflow-x-hidden">
            <SEO
                title={t('nav.about', 'About')}
                description={t('about_page_description', professional_summary.short_bio)}
            />

            {/* Background - fades from transparent at top */}
            <div className="fixed inset-0 bg-[#020202]" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)' }} />

            {/* Ambient Background - Enhanced */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-accent/8 blur-[120px] rounded-full opacity-40 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-purple-900/8 blur-[100px] rounded-full opacity-30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vh] bg-cyan-500/5 blur-[80px] rounded-full opacity-25"></div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">

                {/* HERO GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 items-start">

                    {/* LEFT: Image Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-4 flex justify-center"
                    >
                        {/* HARD CONSTRAINT CONTAINER */}
                        <div style={{ width: '160px', height: '210px' }} className="relative flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity sm:w-[180px] sm:h-[240px] lg:w-[220px] lg:h-[290px]">
                            {/* Tech Borders - Enhanced */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-accent/60 shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-500"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-accent/60 shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-accent/60 shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-500"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent/60 shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-500"></div>

                            {/* Image Container */}
                            <div className="absolute inset-4 overflow-hidden bg-neutral-900 group">
                                <img
                                    src="/assets/cv-image/cvsmile.jpg"
                                    alt="Igor Szuniewicz"
                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                                {/* Overlay Data */}
                                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-accent opacity-80">
                                    <div>{t('about_id', 'ID')}: IGOR_SZUNIEWICZ</div>
                                    <div>LOC: {personal_info.location.city.toUpperCase()}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Bio Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:col-span-7 flex flex-col justify-center"
                    >
                        <div className="mb-8">
                            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-none mb-4 tracking-tight drop-shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                                IGOR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent/80 to-slate-500 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">SZUNIEWICZ</span>
                            </h1>
                            <div className="flex items-center gap-3 text-accent font-mono text-sm tracking-widest uppercase">
                                <span className="w-8 h-px bg-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
                                {t('about_role', 'Audio Designer & Developer')}
                            </div>
                        </div>

                        {/* System Properties Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 border-y border-white/5 py-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('about_section_location', 'Location')}</span>
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <MapPin size={14} className="text-accent" />
                                    {personal_info.location.city}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('about_section_status', 'Status')}</span>
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Zap size={14} className="text-green-500" />
                                    {personal_info.availability.status.includes('internship')
                                        ? t('status_looking_internship', 'Looking for Internship')
                                        : personal_info.availability.status}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('about_section_mobility', 'Mobility')}</span>
                                <div className="flex items-center gap-2 text-sm text-slate-200">
                                    <Globe size={14} className="text-blue-400" />
                                    {t('about_open_relocation', 'Open to Relocation')}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('about_section_dossier', 'Dossier')}</span>
                                <a href="/cv/Igor_Szuniewicz_CV.pdf" target="_blank" className="flex items-center gap-2 text-sm text-accent hover:text-white transition-colors cursor-pointer w-fit">
                                    <Download size={14} />
                                    Download CV
                                </a>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-400 text-lg font-light leading-relaxed">
                                {t('about_bio', professional_summary.extended_bio)}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Technical Skills */}
                <div className="mb-32">
                    <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <Cpu className="text-accent" size={24} />
                            {t('skills.title', 'Technical Skills')}
                        </h2>
                    </div>
                    <TechConstellation onSelect={setSelectedTech} />
                </div>

                {/* TIMELINE (Career Log) */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <BookOpen className="text-accent" size={24} />
                            {t('about_education_title', 'EXECUTION LOG')}
                        </h2>
                    </div>

                    <div className="space-y-0">
                        {timelineItems.map((item, i) => (
                            <div key={i} className="group relative flex gap-8 pb-12 last:pb-0">
                                {/* Left: Trace Line */}
                                <div className="absolute left-[7px] top-2 bottom-0 w-px bg-white/10 group-last:hidden"></div>
                                <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-[#020202] ${item.color === 'text-accent' ? 'bg-accent shadow-[0_0_15px_rgba(56,189,248,0.6)]' : 'bg-slate-700'} mt-1.5 group-hover:scale-125 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.8)] transition-all duration-300`}></div>

                                {/* Right: Content */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                                        <h3 className="text-xl font-bold text-white group-hover:text-accent group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] transition-all duration-300">
                                            {item.title}
                                        </h3>
                                        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                            {item.date}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 font-light">{item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Tech Detail Modal */}
            <Modal
                isOpen={!!selectedTech}
                onClose={() => setSelectedTech(null)}
                title={selectedTech || ''}
            >
                <div className="flex items-center gap-2 mb-6 text-xs font-mono text-accent uppercase tracking-widest opacity-70">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    System Data
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line font-light">
                    {selectedTech && getTechDescription(selectedTech)}
                </p>
            </Modal>

        </div>
    );
};

export default About;