import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import ProjectCard from '@/components/features/ProjectCard';
import {
  noMotion,
  sectionReveal,
  cardIn,
  stagger,
  viewportOnce,
} from '@/constants/motion';
import type { Project } from '@/types';

interface StickyProjectsProps {
  projects: readonly Project[];
}

const StickyProjects = ({ projects }: StickyProjectsProps) => {
  const { t } = useTranslation(['home', 'projects']);
  const prefersReducedMotion = useReducedMotion();

  const headerMotion = prefersReducedMotion
    ? { initial: noMotion.initial, whileInView: noMotion.animate, transition: noMotion.transition }
    : { initial: sectionReveal.initial, whileInView: sectionReveal.animate, transition: sectionReveal.transition };

  const cardMotion = (index: number) =>
    prefersReducedMotion
      ? { initial: noMotion.initial, whileInView: noMotion.animate, transition: noMotion.transition }
      : {
          initial: cardIn.initial,
          whileInView: cardIn.animate,
          transition: { ...cardIn.transition, delay: index * stagger.cards },
        };

  return (
    <section id="projects" className="bg-surface py-24 md:py-32">
      <div className="max-w-content-wide mx-auto px-6 md:px-12 lg:px-16">
        {/* Section header */}
        <motion.div
          {...headerMotion}
          viewport={viewportOnce}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <span className="text-overline uppercase tracking-widest text-accent font-mono block mb-3">
              {t('home:projects.overline', 'Selected Work')}
            </span>
            <h2 className="font-display text-h1 text-text-primary mb-3">
              {t('home:projects.featured_title', 'Featured Projects')}
            </h2>
            <p className="text-body text-text-secondary max-w-2xl">
              {t('home:projects.subtitle', 'A collection of my game audio and development projects')}
            </p>
          </div>

          {/* Desktop "View All" link */}
          <Link
            to="/projects"
            className="hidden md:inline-flex group items-center gap-2 px-4 py-2 border border-border text-text-primary font-semibold text-sm rounded-lg hover:border-accent hover:bg-surface-overlay active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200 shrink-0"
          >
            {t('home:projects.view_all', 'All Projects')}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              {...cardMotion(index)}
              viewport={viewportOnce}
            >
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Mobile "View All" CTA */}
        <motion.div
          {...headerMotion}
          viewport={viewportOnce}
          className="mt-12 text-center md:hidden"
        >
          <Link
            to="/projects"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-primary font-semibold text-sm rounded-lg hover:border-accent hover:bg-surface-overlay active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
          >
            {t('home:projects.view_all', 'All Projects')}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StickyProjects;
