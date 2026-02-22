import { useTranslation } from 'react-i18next';

import ProjectFilters from '../components/features/projects/ProjectFilters';
import ProjectGrid from '../components/features/projects/ProjectGrid';
import SEO from '../components/layout/SEO';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useProjectFilter } from '../hooks/useProjectFilter';

/** All projects page with category filters and a bento grid layout. */
const Projects = () => {
  const { featured_projects, additional_projects } = usePortfolioData();
  const { t } = useTranslation('projects');

  const allProjects = [...featured_projects, ...additional_projects];
  const { filter, setFilter, categories, filteredProjects, getCategoryLabel } = useProjectFilter(allProjects);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <SEO
        title={t('nav.projects', 'Projects')}
        description={t('projects.description', 'A collection of my work in game audio, implementation, and tool development.')}
      />

      <div className="max-w-[1600px] mx-auto relative z-10">

        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-8 lg:mb-16 gap-4 lg:gap-8 border-b border-border pb-6 lg:pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-display text-cream-light mb-4 tracking-wide">
              {t('projects.title', 'Selected Works')}
            </h1>
            <p className="text-dim max-w-lg text-lg font-light">
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
