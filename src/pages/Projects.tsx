import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { useProjectFilter } from '../hooks/useProjectFilter';
import SEO from '../components/layout/SEO';
import ProjectGrid from '../components/features/projects/ProjectGrid';
import ProjectFilters from '../components/features/projects/ProjectFilters';

const Projects = () => {
  const { featured_projects, additional_projects } = usePortfolioData();
  const { t } = useTranslation();
  
  const allProjects = [...featured_projects, ...additional_projects];
  const { filter, setFilter, categories, filteredProjects, getCategoryLabel } = useProjectFilter(allProjects);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 lg:px-12">
      <SEO 
        title={t('nav.projects', 'Projects')}
        description={t('projects.description', 'A collection of my work in game audio, implementation, and tool development.')}
      />

      <div className="max-w-[1600px] mx-auto">
        
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
              {t('projects.title', 'Selected Works')}
            </h1>
            <p className="text-slate-400 max-w-lg text-lg font-light">
              {t('projects.description', 'Exploring the intersection of sound, code, and interactive experiences.')}
            </p>
          </div>

          <ProjectFilters 
            categories={categories} 
            activeFilter={filter} 
            onFilterChange={setFilter} 
            getLabel={getCategoryLabel} 
          />
        </div>

        {/* BENTO GRID */}
        <ProjectGrid projects={filteredProjects} />

      </div>
    </div>
  );
};

export default Projects;