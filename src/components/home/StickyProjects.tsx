import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

import ProjectCard from '@/components/features/ProjectCard';
import ImageWithLoader from '@/components/ui/ImageWithLoader';
import { noMotion, sectionReveal, cardIn, stagger } from '@/constants/motion';
import type { Project } from '@/types';

interface StickyProjectsProps {
  projects: readonly Project[];
}

/**
 * Desktop sticky scroll reveal for featured projects.
 * As the user scrolls through the tall outer container,
 * the active project swaps in a sticky two-column layout.
 */
const StickyProjectsDesktop = ({ projects }: StickyProjectsProps) => {
  const { t } = useTranslation(['home', 'projects']);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Derive active index from scroll progress (evenly divided)
  const activeIndex = useTransform(scrollYProgress, (progress) => {
    const idx = Math.floor(progress * projects.length);
    return Math.min(idx, projects.length - 1);
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${projects.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full max-w-content-wide mx-auto px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-8">
            <h2 className="font-display text-h1 text-text-primary mb-2">
              {t('projects.featured_title', 'Selected Work')}
            </h2>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-5 gap-8 items-center">
            {/* Left: text (40%) */}
            <div className="col-span-2 min-h-[320px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {projects.map((project, i) => (
                  <ProjectTextPanel
                    key={project.id}
                    project={project}
                    index={i}
                    activeIndex={activeIndex}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Right: visual (60%) */}
            <div className="col-span-3 min-h-[400px] relative">
              <AnimatePresence mode="wait">
                {projects.map((project, i) => (
                  <ProjectVisualPanel
                    key={project.id}
                    project={project}
                    index={i}
                    activeIndex={activeIndex}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress dots */}
          <div className="mt-8 flex items-center gap-6">
            <div className="flex gap-2">
              {projects.map((_, i) => (
                <ProgressDot key={i} index={i} activeIndex={activeIndex} />
              ))}
            </div>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 px-4 py-3 border border-border text-text-secondary rounded-md hover:border-accent hover:text-text-primary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              {t('projects.view_all', 'All Projects')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Uses motion value to conditionally render.
 * Only the active project's text panel is shown.
 */
interface PanelProps {
  project: Project;
  index: number;
  activeIndex: ReturnType<typeof useTransform<number, number>>;
}

const ProjectTextPanel = ({ project, index, activeIndex }: PanelProps) => {
  const { t } = useTranslation(['home', 'projects']);
  const isActive = useTransformBoolean(activeIndex, index);

  if (!isActive) return null;

  const titleKey = `project_${project.id}_title`;
  const descKey = `project_${project.id}_short_desc`;

  // Prioritize key tech tags
  const keyTech = ['C++', 'Unreal', 'Wwise', 'MetaSounds', 'Blueprints', 'Unity', 'C#'];
  const allTags = [...(project.technologies || []), ...(project.tags || [])];
  const uniqueTags = Array.from(new Set(allTags));
  const displayTags = uniqueTags
    .sort((a, b) => {
      const aIsKey = keyTech.some((k) => a.includes(k)) ? 1 : 0;
      const bIsKey = keyTech.some((k) => b.includes(k)) ? 1 : 0;
      return bIsKey - aIsKey;
    })
    .slice(0, 5);

  const projectLink = project.externalLink || `/projects/${project.id}`;
  const isExternal = Boolean(project.externalLink);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Year */}
      {project.year && (
        <span className="font-mono text-caption text-text-secondary uppercase tracking-wider mb-2 block">
          {project.year}
        </span>
      )}

      {/* Title */}
      <h3 className="font-display text-h2 md:text-h1 text-text-primary mb-3">
        {t(`projects:${titleKey}`, project.title)}
      </h3>

      {/* Description */}
      <p className="text-text-secondary text-body leading-relaxed mb-4 line-clamp-3">
        {t(`projects:${descKey}`, project.short_description || project.description || '')}
      </p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-2.5 py-1 rounded font-mono text-label uppercase bg-surface-overlay text-text-secondary border border-border">
          {project.category || 'Audio'}
        </span>
        {displayTags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded font-mono text-label uppercase bg-accent/10 text-accent border border-accent/15"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* View project link */}
      {isExternal ? (
        <a
          href={projectLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-mono text-body-sm text-accent hover:text-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm"
        >
          {t('projects:card.view_project', 'View Project')}
          <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      ) : (
        <Link
          to={projectLink}
          className="group inline-flex items-center gap-2 font-mono text-body-sm text-accent hover:text-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm"
        >
          {t('projects:card.view_project', 'View Project')}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </motion.div>
  );
};

const ProjectVisualPanel = ({ project, index, activeIndex }: PanelProps) => {
  const { t } = useTranslation('projects');
  const isActive = useTransformBoolean(activeIndex, index);
  const media = project.media || {};
  const titleKey = `project_${project.id}_title`;

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border"
    >
      {media.thumbnail ? (
        media.thumbnail.endsWith('.mp4') || media.thumbnail.endsWith('.webm') ? (
          <video
            src={`/${media.thumbnail}`}
            className="w-full h-full object-cover"
            aria-label={t(titleKey, project.title)}
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <ImageWithLoader
            src={`/${media.thumbnail}`}
            alt={t(titleKey, project.title)}
            loading="eager"
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-secondary font-mono text-caption uppercase tracking-widest">
            {t('card.no_signal', 'NO_SIGNAL')}
          </span>
        </div>
      )}
    </motion.div>
  );
};

/** Progress indicator dot for the sticky scroll section. */
interface ProgressDotProps {
  index: number;
  activeIndex: ReturnType<typeof useTransform<number, number>>;
}

const ProgressDot = ({ index, activeIndex }: ProgressDotProps) => {
  const isActive = useTransformBoolean(activeIndex, index);

  return (
    <div
      className={`w-2 h-2 rounded-full transition-all duration-300 ${
        isActive ? 'bg-accent scale-125' : 'bg-border'
      }`}
    />
  );
};

/**
 * Hook-like helper: subscribes to a MotionValue and returns
 * whether its current rounded value equals the target index.
 * Uses React state driven by motion value onChange.
 */
function useTransformBoolean(
  motionValue: MotionValue<number>,
  targetIndex: number
): boolean {
  const [isActive, setIsActive] = useState(() => {
    const current = motionValue.get();
    return Math.round(current) === targetIndex;
  });

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      const rounded = Math.round(latest);
      setIsActive(rounded === targetIndex);
    });
    return unsubscribe;
  }, [motionValue, targetIndex]);

  return isActive;
}

/**
 * Mobile fallback: stacked project cards (existing layout).
 */
const MobileProjectCards = ({ projects }: StickyProjectsProps) => {
  const { t } = useTranslation(['home', 'projects']);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="max-w-content mx-auto px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
        whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
        className="mb-12"
      >
        <h2 className="font-display text-h1 text-text-primary mb-4">
          {t('projects.featured_title', 'Selected Work')}
        </h2>
        <p className="text-text-secondary text-body max-w-2xl mb-6">
          {t('projects.subtitle', 'A collection of my game audio and development projects')}
        </p>
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 px-4 py-3 border border-border text-text-secondary rounded-md hover:border-accent hover:text-text-primary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
        >
          {t('projects.view_all', 'View All Projects')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
            viewport={{ once: true }}
            transition={
              prefersReducedMotion
                ? noMotion.transition
                : { ...cardIn.transition, delay: index * stagger.cards }
            }
          >
            <ProjectCard project={project} index={index} />
          </motion.div>
        ))}
      </div>

      {/* Mobile view all */}
      <motion.div
        initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
        whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
        className="mt-12 text-center"
      >
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary rounded-md hover:border-border-hover hover:text-text-primary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
        >
          {t('projects.view_all', 'View All Projects')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
};

/**
 * Reduced motion fallback: simple vertical stack of all projects.
 */
const ReducedMotionStack = ({ projects }: StickyProjectsProps) => {
  const { t } = useTranslation(['home', 'projects']);

  return (
    <div className="max-w-content-wide mx-auto px-6 lg:px-8">
      <h2 className="font-display text-h1 text-text-primary mb-8">
        {t('projects.featured_title', 'Selected Work')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
      <div className="mt-8">
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 px-4 py-3 border border-border text-text-secondary rounded-md hover:border-accent hover:text-text-primary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
        >
          {t('projects.view_all', 'All Projects')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

/**
 * Featured projects section with three presentation modes:
 * 1. Desktop (>= md): Sticky scroll reveal with two-column layout
 * 2. Mobile (< md): Stacked project cards
 * 3. Reduced motion: Simple vertical grid
 */
const StickyProjects = ({ projects }: StickyProjectsProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <section id="projects" className="bg-surface py-16">
        <ReducedMotionStack projects={projects} />
      </section>
    );
  }

  return (
    <section id="projects" className="bg-surface py-16">
      {/* Desktop: sticky scroll */}
      <div className="hidden md:block">
        <StickyProjectsDesktop projects={projects} />
      </div>
      {/* Mobile: stacked cards */}
      <div className="md:hidden">
        <MobileProjectCards projects={projects} />
      </div>
    </section>
  );
};

export default StickyProjects;
