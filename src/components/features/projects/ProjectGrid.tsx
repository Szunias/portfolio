import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Project } from '../../../types';
import ProjectCard from '../ProjectCard';

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
          <ProjectCard key={project.id} project={project} index={index} />
        );
      })}
    </motion.div>
  );
};

export default ProjectGrid;