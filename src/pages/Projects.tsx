import { useState } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { useProjectFilter } from '../hooks/useProjectFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Play, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Projects = () => {
  const { featured_projects, additional_projects } = usePortfolioData();
  const { t } = useTranslation();
  
  const allProjects = [...featured_projects, ...additional_projects];
  const { filter, setFilter, categories, filteredProjects, getCategoryLabel } = useProjectFilter(allProjects);
  
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Determine which project to show in preview (hovered or first in list)
  const activeProjectId = hoveredProject || (filteredProjects.length > 0 ? filteredProjects[0].id : null);
  const activeProject = allProjects.find(p => p.id === activeProjectId);

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-6 lg:px-12">
      <SEO 
        title={t('nav.projects', 'Projects')}
        description={t('projects.description', 'A collection of my work in game audio, implementation, and tool development.')}
      />

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">
        
        {/* LEFT COLUMN: List & Filters */}
        <div className="lg:col-span-5 flex flex-col h-full">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
              {t('projects.title', 'Selected Works')}
            </h1>
            <div className="h-1 w-12 bg-accent mb-6"></div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`
                    px-3 py-1 text-[10px] font-mono uppercase tracking-widest border transition-all
                    ${filter === category 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                    }
                  `}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>

          {/* Project List */}
          <div className="flex-1 space-y-2">
            {filteredProjects.map((project) => (
              <Link 
                key={project.id}
                to={project.externalLink || `/projects/${project.id}`}
                onMouseEnter={() => setHoveredProject(project.id)}
                className="group block"
              >
                <div className={`
                  relative p-4 border-l-2 transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.05]
                  ${activeProjectId === project.id ? 'border-accent pl-6' : 'border-white/10 pl-4 hover:pl-6 hover:border-white/30'}
                `}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-xl font-bold transition-colors ${activeProjectId === project.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                      {t(`project_${project.id}_title`, project.title)}
                    </h3>
                    <ArrowUpRight size={14} className={`transition-opacity ${activeProjectId === project.id ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                    <span className="uppercase tracking-wider text-accent/70">{project.category}</span>
                    {project.year && <span>// {project.year}</span>}
                  </div>
                </div>
              </Link>
            ))}

            {filteredProjects.length === 0 && (
              <div className="py-20 text-slate-600 font-mono text-sm">
                {t('projects.no_results', 'No data found.')}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Preview */}
        <div className="hidden lg:block lg:col-span-7 relative h-[80vh] sticky top-28">
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl">
            
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <AnimatePresence mode="wait">
              {activeProject ? (
                <motion.div
                  key={activeProject.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="absolute inset-0 flex flex-col"
                >
                  {/* Media Area */}
                  <div className="relative flex-1 overflow-hidden">
                    {activeProject.media?.thumbnail?.endsWith('.mp4') ? (
                      <video
                        src={`/${activeProject.media.thumbnail}`}
                        className="w-full h-full object-cover opacity-80"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={`/${activeProject.media?.thumbnail}`} 
                        alt={activeProject.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                  </div>

                  {/* Info Overlay (Bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {activeProject.technologies?.slice(0, 3).map(tech => (
                          <span key={tech} className="px-2 py-1 text-[10px] font-mono border border-white/10 rounded text-slate-300 bg-black/50 backdrop-blur-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-300 text-lg leading-relaxed line-clamp-3 max-w-2xl">
                        {t(`project_${activeProject.id}_short_desc`, activeProject.short_description)}
                      </p>
                    </motion.div>
                  </div>

                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-700 font-mono uppercase tracking-widest">
                  Select a project
                </div>
              )}
            </AnimatePresence>

            {/* Decorative Corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20"></div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Projects;