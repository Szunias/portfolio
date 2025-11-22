import { usePortfolioData } from '../hooks/usePortfolioData';
import ProjectCard from '../components/ProjectCard';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import { useProjectFilter } from '../hooks/useProjectFilter';

const Projects = () => {
  const { featured_projects, additional_projects } = usePortfolioData();
  const { t } = useTranslation();
  
  const allProjects = [...featured_projects, ...additional_projects];
  
  const { 
    filter, 
    setFilter, 
    categories, 
    filteredProjects, 
    getCategoryLabel 
  } = useProjectFilter(allProjects);

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={t('nav.projects', 'Projects')}
        description={t('projects.description', 'A collection of my work in game audio, implementation, and tool development.')}
      />
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold text-white mb-6">{t('projects.title', 'Projects')}</h1>
          <p className="text-dim max-w-2xl mx-auto text-lg font-light">
            {t('projects.description', 'A collection of my work in game audio, implementation, and tool development.')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`
                px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all border
                ${filter === category 
                  ? 'bg-white text-black border-white font-bold' 
                  : 'bg-transparent text-dim border-white/10 hover:border-accent hover:text-accent'
                }
              `}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
             <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">{t('projects.no_results', 'No projects found in this category.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;