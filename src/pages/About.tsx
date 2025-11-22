import { useState } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { MapPin, Zap, BookOpen, Cpu, Briefcase } from 'lucide-react';
import Modal from '../components/ui/Modal';
import SEO from '../components/SEO';
import { TechCategory, TechTool } from '../types';
import TechConstellation from '../components/TechConstellation';

const About = () => {
  const { personal_info, professional_summary, technical_skills_matrix } = usePortfolioData();
  const { t, i18n } = useTranslation();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const getTechDescription = (name: string) => {
    if (!i18n.language) return ""; // Safety check
    
    let desc = "";
    const currentLang = i18n.language.split('-')[0];

    if (!technical_skills_matrix) return ""; // Safety check

    Object.values(technical_skills_matrix).forEach((category: TechCategory) => {
        if (category.tools) {
            Object.entries(category.tools).forEach(([key, value]: [string, TechTool]) => {
                if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
                    desc = value.rich_descriptions?.[currentLang] || value.description || value.desc || "";
                }
            });
        }
    });
    return desc || t('tech_desc_default', 'Professional proficiency and production experience.');
  };

  return (
    <div className="min-h-screen bg-primary">
      <SEO 
        title={t('nav.about', 'About')} 
        description={t('about_page_description', professional_summary.short_bio)} 
      />
      
      {/* HERO: ID Card Style */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            {/* Profile Image with Ring */}
            <div className="relative inline-block mb-8 group">
                <div className="absolute inset-0 bg-accent blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                <div className="relative w-48 h-48 rounded-full p-1 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm">
                    <img 
                        src="/assets/cv-image/cvsmile.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full border-4 border-[#050505]"
                    />
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#050505] rounded-full" title="Available"></div>
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">
                {t('about_title', 'Igor Szuniewicz')}
            </h1>
            <p className="text-xl text-accent font-mono mb-8 tracking-wide uppercase text-sm">
                {t('about_role', 'Audio Designer & Developer')}
            </p>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="px-6 py-3 bg-secondary/50 backdrop-blur border border-white/5 rounded-full flex items-center gap-3 text-sm text-slate-300">
                    <MapPin size={16} className="text-accent" />
                    {personal_info.location.city}
                </div>
                <div className="px-6 py-3 bg-secondary/50 backdrop-blur border border-white/5 rounded-full flex items-center gap-3 text-sm text-slate-300">
                    <Zap size={16} className="text-accent" />
                    {personal_info.availability.status.includes('internship') 
                        ? t('status_looking_internship', 'Looking for Internship') 
                        : personal_info.availability.status}
                </div>
                <div className="px-6 py-3 bg-secondary/50 backdrop-blur border border-white/5 rounded-full flex items-center gap-3 text-sm text-slate-300">
                    <Briefcase size={16} className="text-accent" />
                    {t('about_open_relocation', 'Open to Relocation')}
                </div>
            </div>

            <p className="text-dim text-lg leading-relaxed max-w-2xl mx-auto font-light">
                {t('about_bio', professional_summary.extended_bio)}
            </p>
        </div>
      </div>

      {/* CONSTELLATION: Interactive Tech Hive */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Cpu className="text-accent" size={32} />
                {t('skills.title', 'Technical Arsenal')}
            </h2>
            <p className="text-slate-500">Interactive tech graph. Hover to see connections.</p>
        </div>

        <TechConstellation onSelect={setSelectedTech} />
      </div>

      {/* TIMELINE: Education & History */}
      <div className="max-w-3xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-display font-bold text-white mb-12 flex items-center gap-3">
            <BookOpen className="text-accent" size={32} />
            {t('about_education_title', 'Journey')}
        </h2>
        
        <div className="relative border-l-2 border-white/5 ml-3 space-y-16 pb-4">
            {/* Timeline Items */}
            {[
                { title: t('timeline_dae_title', 'Howest DAE'), role: t('timeline.role_game_dev', 'Game Development'), date: t('timeline.present', 'Present'), color: 'bg-accent' },
                { title: t('timeline_hs_title', 'High School'), role: t('timeline.role_math_phys', 'Maths & Physics'), date: t('timeline.graduated', 'Graduated'), color: 'bg-slate-700' },
                { title: t('timeline_piano_title', 'Music School'), role: t('timeline.role_piano', 'Classical Piano'), date: t('timeline.graduated', 'Graduated'), color: 'bg-slate-700' }
            ].map((item, i) => (
                <div key={i} className="relative pl-12 group">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#050505] ${item.color} shadow-lg group-hover:scale-125 transition-transform`}></div>
                    <span className="text-xs font-mono text-slate-500 mb-1 block uppercase tracking-widest">{item.date}</span>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-accent transition-colors">{item.title}</h3>
                    <p className="text-slate-400 text-lg">{item.role}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Tech Detail Modal */}
      <Modal 
          isOpen={!!selectedTech} 
          onClose={() => setSelectedTech(null)}
          title={selectedTech || ''}
      >
          <div className="w-12 h-1 bg-accent rounded-full mb-6"></div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedTech && getTechDescription(selectedTech)}
          </p>
      </Modal>

    </div>
  );
};

export default About;