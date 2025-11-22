import { ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TechReveal from '../../../components/TechReveal';
import { Project } from '../../../types';

interface ProjectHeroProps {
  project: Project;
}

const ProjectHero = ({ project }: ProjectHeroProps) => {
  const { t } = useTranslation();
  const media = project.media || {};
  
  const titleKey = `project_${project.id}_title`;
  const shortDescKey = `project_${project.id}_short_desc`;

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Background Media */}
        <div className="absolute inset-0">
            {media.thumbnail ? (
                media.thumbnail.endsWith('.mp4') ? (
                    <video src={`/${media.thumbnail}`} className="w-full h-full object-cover opacity-40" autoPlay loop muted playsInline />
                ) : (
                    <img src={`/${media.thumbnail}`} alt="" className="w-full h-full object-cover opacity-30" />
                )
            ) : (
                <div className="w-full h-full bg-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Link to="/projects" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t('projects.viewall', 'Back to Projects')}
                </Link>
                
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-accent text-black text-xs font-bold uppercase tracking-widest rounded-sm">
                        {project.category}
                    </span>
                    {project.year && (
                        <span className="text-slate-400 font-mono text-xs border border-white/10 px-3 py-1 rounded-sm">
                            <Calendar size={12} className="inline mr-2" />
                            {project.year}
                        </span>
                    )}
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white max-w-5xl leading-[0.9] tracking-tighter mb-6">
                    <TechReveal text={t(titleKey, project.title)} />
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
                    {t(shortDescKey, project.short_description)}
                </p>
            </motion.div>
        </div>
    </div>
  );
};

export default ProjectHero;