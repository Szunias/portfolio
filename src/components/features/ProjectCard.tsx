import { Project } from '../../types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageWithLoader from '../ui/ImageWithLoader';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const { t } = useTranslation();
  const media = project.media || {};
  
  const titleKey = `project_${project.id}_title`;
  const descKey = `project_${project.id}_short_desc`;

  const cardContent = (
    <>
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {media.thumbnail ? (
            media.thumbnail.endsWith('.mp4') || media.thumbnail.endsWith('.webm') ? (
            <video
                src={`/${media.thumbnail}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                loop
                autoPlay
                playsInline
            />
            ) : (
            <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
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
                <span className="text-white/20 font-mono text-sm">{t('card.no_preview', 'NO PREVIEW')}</span>
            </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:via-black/80 group-hover:to-black/60 group-hover:shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        
        {/* Top: Category & Arrow */}
        <div className="flex justify-between items-start translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                {project.category}
            </span>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                <ArrowUpRight size={16} />
            </div>
        </div>

        {/* Bottom: Title & Desc */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-2xl font-display font-bold text-white mb-2 leading-tight">
                {t(titleKey, project.title)}
            </h3>
            <p className="text-slate-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                {t(descKey, project.short_description)}
            </p>
            
            {/* Tech Stack (Visible on Hover) */}
            <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 max-h-0 group-hover:max-h-32 overflow-hidden">
                {((project.tags && project.tags.length > 0 ? project.tags : project.technologies) || []).slice(0, 6).map((tech: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-md text-[11px] font-medium text-white shadow-sm hover:bg-white/10 transition-colors">
                        {tech}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index < 6 ? index * 0.1 : 0 }}
      className="group relative w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 border border-white/5 hover:border-white/10"
    >
      {project.externalLink ? (
        <a href={project.externalLink} className="block w-full h-full">
            {cardContent}
        </a>
      ) : (
        <Link to={`/projects/${project.id}`} className="block w-full h-full">
            {cardContent}
        </Link>
      )}
    </motion.div>
  );
};

export default ProjectCard;
