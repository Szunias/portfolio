import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import ProjectCard from '@/components/features/ProjectCard';
import { containerVariants, itemVariants, noMotion } from '@/constants/motion';
import type { Project } from '@/types';

interface ProjectGridProps {
  projects: readonly Project[];
}

const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const { t } = useTranslation('projects');
  const prefersReducedMotion = useReducedMotion();

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center text-text-secondary">
        {t('projects.no_results', 'No projects found in this category.')}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
      initial={prefersReducedMotion ? noMotion.initial : "hidden"}
      animate={prefersReducedMotion ? noMotion.animate : "visible"}
      variants={prefersReducedMotion ? undefined : containerVariants}
    >
      {projects.map((project, index) => {
        // First project featured full-width, every 4th after that spans 2 cols
        const isWide = index === 0 || (index > 0 && index % 4 === 0);
        return (
          <motion.div
            key={project.id}
            className={isWide ? 'md:col-span-2' : ''}
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            <ProjectCard project={project} index={index} />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ProjectGrid;
