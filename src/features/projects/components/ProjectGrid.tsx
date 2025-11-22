import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Project } from '../../../types';

interface ProjectGridProps {
  projects: Project[];
}

const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const { t } = useTranslation();

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center text-slate-600 font-mono">
        {t('projects.no_results', 'No projects found in this category.')}
      </div>
    );
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[350px] lg:auto-rows-[400px]"
    >
      {projects.map((project, index) => {
        // Bento logic: First 2 projects or every 4th one can be large/wide
        const isLarge = index === 0 || index === 3 || (index > 6 && index % 5 === 0);
        
        return (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            key={project.id}
            className={`group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/5 hover:border-white/20 transition-colors ${isLarge ? 'md:col-span-2' : 'col-span-1'}`}
          >
            <Link to={project.externalLink || `/projects/${project.id}`} className="block w-full h-full">
              
              {/* Background Image/Video */}
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                {project.media?.thumbnail?.endsWith('.mp4') ? (
                  <video
                    src={`/${project.media.thumbnail}`}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img 
                    src={`/${project.media?.thumbnail}`} 
                    alt={project.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                  />
                )}
              </div>

              {/* Content Overlay (Gradient) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Text Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                
                {/* Top Right Arrow */}
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur text-xs font-bold uppercase tracking-wider text-white rounded-full border border-white/5">
                    {project.category}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                {/* Bottom Info */}
                <div>
                  <h3 className="text-3xl font-display font-bold text-white mb-2 leading-tight">
                    {t(`project_${project.id}_title`, project.title)}
                  </h3>
                  <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    {project.technologies?.slice(0, 3).map(tech => (
                      <span key={tech} className="text-[10px] font-mono text-accent">
                        #{t(`tags.${tech}`, tech)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ProjectGrid;