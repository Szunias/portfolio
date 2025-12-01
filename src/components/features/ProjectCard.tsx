import { Project } from '../../types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageWithLoader from '../ui/ImageWithLoader';
import { ArrowRight, Cpu, User, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const { t } = useTranslation();
  const media = project.media || {};
  
  const titleKey = `project_${project.id}_title`;
  const descKey = `project_${project.id}_short_desc`;

  // Extract "Engine" from tags if possible (naive check)
  const tags = (project.tags || project.technologies || []);
  const engineTag = tags.find(t => t.includes('Unreal') || t.includes('Unity') || t.includes('Wwise') || t.includes('FMOD')) || 'Custom';

  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Image Section - Technical Viewport */}
      <div className="relative w-full aspect-video overflow-hidden border-b border-white/5 group-hover:border-accent/20 transition-colors">
        <div className="absolute inset-0 z-10 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-500 mix-blend-overlay pointer-events-none"></div>
        
        {media.thumbnail ? (
            media.thumbnail.endsWith('.mp4') || media.thumbnail.endsWith('.webm') ? (
            <video
                src={`/${media.thumbnail}`}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                muted
                loop
                autoPlay
                playsInline
            />
            ) : (
            <div className="w-full h-full filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105">
                <ImageWithLoader 
                    src={`/${media.thumbnail}`} 
                    alt={t(titleKey, project.title)}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="h-full w-full"
                />
            </div>
            )
        ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <span className="text-white/20 font-mono text-xs tracking-widest">{t('card.no_signal', 'NO_SIGNAL')}</span>
            </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-3 right-3 z-20">
            <span className="px-2 py-1 bg-black/80 border border-white/10 text-[10px] font-mono text-accent uppercase tracking-wider rounded">
                {project.category || 'DEV'}
            </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col relative">
        
        {/* Header */}
        <div className="mb-4">
            <h3 className="text-xl font-display font-bold text-white group-hover:text-accent transition-colors mb-2">
                {t(titleKey, project.title)}
            </h3>
            <div className="h-px w-8 bg-white/10 group-hover:w-full group-hover:bg-accent/30 transition-all duration-500 mb-3"></div>
            <p className="text-slate-400 text-sm font-light leading-relaxed line-clamp-3">
                {t(descKey, project.short_description)}
            </p>
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Technical Footer Data */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
            <div className="flex items-center gap-1.5">
                <Cpu size={12} />
                <span className="uppercase tracking-wider">{engineTag}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
                <User size={12} />
                <span className="uppercase tracking-wider">{project.role || 'Audio'}</span>
            </div>

            <div className="group-hover:translate-x-1 transition-transform text-accent opacity-0 group-hover:opacity-100">
                <ArrowRight size={14} />
            </div>
        </div>

      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index < 6 ? index * 0.1 : 0 }}
      className="group relative w-full bg-[#0a0a0a] border border-white/5 hover:border-accent/30 rounded-lg overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.15)] transition-all duration-500"
    >
      {project.externalLink ? (
        <a href={project.externalLink} className="block h-full">
            {cardContent}
        </a>
      ) : (
        <Link to={`/projects/${project.id}`} className="block h-full">
            {cardContent}
        </Link>
      )}
    </motion.div>
  );
};

export default ProjectCard;
