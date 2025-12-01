import { useState } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Zap, BookOpen, Cpu, Globe, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';
import SEO from '../components/layout/SEO';
import TechConstellation from '../components/home/TechConstellation';
import { TechCategory } from '../types';

const About = () => {
  const { personal_info, professional_summary, technical_skills_matrix } = usePortfolioData();
  const { t, i18n } = useTranslation();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const getTechDescription = (name: string): string => {
    if (!name || !technical_skills_matrix) return "";
    
    const searchName = name.toLowerCase();
    const currentLang = (i18n.language || 'en').split('-')[0];

    for (const category of Object.values(technical_skills_matrix) as TechCategory[]) {
        if (!category.tools) continue;
        
        for (const [key, value] of Object.entries(category.tools)) {
            if (searchName.includes(key.toLowerCase()) || key.toLowerCase().includes(searchName)) {
                const transKey = `tech_${key.toLowerCase().replace(/\s+/g, '')}_desc`;
                const translated = t(transKey, { defaultValue: '' });
                if (translated) return translated;
                if (value.rich_descriptions?.[currentLang]) return value.rich_descriptions[currentLang];
                return value.description || value.desc || "";
            }
        }
    }
    return t('tech_desc_default', 'Professional proficiency and production experience.');
  };

  const timelineItems = [
    { title: t('timeline_dae_title', 'Howest DAE'), role: t('timeline.role_game_dev', 'Game Development'), date: t('timeline.present', 'Present'), color: 'text-accent' },
    { title: t('timeline_hs_title', 'High School'), role: t('timeline.role_math_phys', 'Maths & Physics'), date: t('timeline.graduated', 'Graduated'), color: 'text-slate-500' },
    { title: t('timeline_piano_title', 'Music School'), role: t('timeline.role_piano', 'Classical Piano'), date: t('timeline.graduated', 'Graduated'), color: 'text-slate-500' }
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      <SEO 
        title={t('nav.about', 'About')} 
        description={t('about_page_description', professional_summary.short_bio)} 
      />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-accent/5 blur-[120px] rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-purple-900/5 blur-[100px] rounded-full opacity-20"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
            
            {/* LEFT: Image Column */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-5"
            >
                <div className="relative w-full aspect-[3/4] max-w-md mx-auto lg:mx-0">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-accent/50"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-accent/50"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-accent/50"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent/50"></div>

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
                            <div>ID: IGOR_SZUNIEWICZ</div>
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
                    <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-none mb-4 tracking-tight">
                        IGOR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">SZUNIEWICZ</span>
                    </h1>
                    <div className="flex items-center gap-3 text-accent font-mono text-sm tracking-widest uppercase">
                        <span className="w-8 h-px bg-accent"></span>
                        {t('about_role', 'Audio Designer & Developer')}
                    </div>
                </div>

                {/* System Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 border-y border-white/5 py-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Location</span>
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                            <MapPin size={14} className="text-accent" />
                            {personal_info.location.city}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Status</span>
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                            <Zap size={14} className="text-green-500" />
                            {personal_info.availability.status.includes('internship') 
                                ? t('status_looking_internship', 'Looking for Internship') 
                                : personal_info.availability.status}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Mobility</span>
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                            <Globe size={14} className="text-blue-400" />
                            {t('about_open_relocation', 'Open to Relocation')}
                        </div>
                    </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Dossier</span>
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

        {/* SYSTEM ARCHITECTURE (Tech Constellation) */}
        <div className="mb-32">
            <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                        <Cpu className="text-accent" size={24} />
                        {t('skills.title', 'SYSTEM ARCHITECTURE')}
                    </h2>
                </div>
                <div className="hidden md:block text-xs font-mono text-slate-600 uppercase tracking-widest">
                    // Interactive Graph
                </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:p-8">
                 <TechConstellation onSelect={setSelectedTech} />
            </div>
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
                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-[#020202] ${item.color === 'text-accent' ? 'bg-accent' : 'bg-slate-700'} mt-1.5 group-hover:scale-125 transition-transform`}></div>
                        
                        {/* Right: Content */}
                        <div className="flex-1">
                             <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
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