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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={prefersReducedMotion ? noMotion.initial : "hidden"}
      animate={prefersReducedMotion ? noMotion.animate : "visible"}
      variants={prefersReducedMotion ? undefined : containerVariants}
    >
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          variants={prefersReducedMotion ? undefined : itemVariants}
          className={index === 0 ? 'md:col-span-2' : undefined}
        >
          <ProjectCard project={project} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectGrid;
