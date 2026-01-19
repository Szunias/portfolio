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
    <div className="min-h-screen bg-primary pt-24 pb-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Top gradient fade - smooth transition from Layout gradient */}
      <div className="absolute top-0 left-0 right-0 h-[250px] pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/70 to-primary" />
      </div>

      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-accent/5 blur-[120px] rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-900/5 blur-[100px] rounded-full opacity-25"></div>
      </div>
      
      <SEO 
        title={t('nav.projects', 'Projects')}
        description={t('projects.description', 'A collection of my work in game audio, implementation, and tool development.')}
      />

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-8 lg:mb-16 gap-4 lg:gap-8 border-b border-white/10 pb-6 lg:pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter drop-shadow-[0_0_30px_rgba(56,189,248,0.2)]">
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