import { useTranslation } from 'react-i18next';

import ProjectCard from '@/components/features/ProjectCard';
import type { Project } from '@/types';

interface ProjectGridProps {
  projects: readonly Project[];
}

const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const { t } = useTranslation('projects');

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center text-dim">
        {t('projects.no_results', 'No projects found in this category.')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
      {projects.map((project, index) => {
        // First project featured full-width, every 4th after that spans 2 cols
        const isWide = index === 0 || (index > 0 && index % 4 === 0);
        return (
          <div
            key={project.id}
            className={isWide ? 'md:col-span-2' : ''}
          >
            <ProjectCard project={project} index={index} />
          </div>
        );
      })}
    </div>
  );
};

export default ProjectGrid;
