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
      <div className="py-20 text-center text-dim font-mono">
        {t('projects.no_results', 'No projects found in this category.')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
    >
      {projects.map((project, index) => {
        return (
          <ProjectCard key={project.id} project={project} index={index} />
        );
      })}
    </div>
  );
};

export default ProjectGrid;
