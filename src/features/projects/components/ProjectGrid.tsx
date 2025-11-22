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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {projects.map((project, index) => {
        return (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            key={project.id}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-accent/50 transition-colors shadow-lg"
          >
            <Link to={project.externalLink || `/projects/${project.id}`} className="block w-full h-full">
              
              {/* Background Image/Video */}
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                {project.media?.thumbnail?.endsWith('.mp4') ? (
                  <video
                    src={`/${project.media.thumbnail}`}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img 
                    src={`/${project.media?.thumbnail}`} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content Overlay (Gradient) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Text Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                
                {/* Top Right Arrow */}
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-white rounded-full border border-white/10">
                    {project.category}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                {/* Bottom Info */}
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {t(`project_${project.id}_title`, project.title)}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2 h-6 overflow-hidden">
                    {project.technologies?.slice(0, 3).map(tech => (
                      <span key={tech} className="text-[10px] font-mono text-accent/90">
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