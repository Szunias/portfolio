import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, ExternalLink } from 'lucide-react';

import ImageWithLoader from '@/components/ui/ImageWithLoader';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const { t } = useTranslation('projects');
  const media = project.media || {};
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const titleKey = `project_${project.id}_title`;
  const descKey = `project_${project.id}_short_desc`;

  // Prioritize key tech tags
  const keyTech = ['C++', 'Unreal', 'Wwise', 'MetaSounds', 'Blueprints', 'Unity', 'C#'];
  const allTags = [...(project.technologies || []), ...(project.tags || [])];
  const uniqueTags = Array.from(new Set(allTags));
  const displayTags = uniqueTags.sort((a, b) => {
      const aIsKey = keyTech.some(k => a.includes(k)) ? 1 : 0;
      const bIsKey = keyTech.some(k => b.includes(k)) ? 1 : 0;
      return bIsKey - aIsKey;
  }).slice(0, 3);

  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Image Section */}
      <div className="relative w-full aspect-video overflow-hidden">
        {media.thumbnail ? (
            media.thumbnail.endsWith('.mp4') || media.thumbnail.endsWith('.webm') ? (
            <video
                ref={videoRef}
                src={`/${media.thumbnail}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                muted
                loop
                playsInline
                preload="none"
            />
            ) : (
            <div className="w-full h-full transition-opacity duration-300">
                <ImageWithLoader
                    src={`/${media.thumbnail}`}
                    alt={t(titleKey, project.title)}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                />
            </div>
            )
        ) : (
            <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
                <span className="text-text-tertiary font-mono text-caption uppercase tracking-widest">{t('card.no_signal', 'NO_SIGNAL')}</span>
            </div>
        )}

        {/* Year Badge */}
        <div className="absolute top-3 right-3 z-20">
            <span className="px-2 py-1 bg-surface-raised/90 border border-border text-label font-mono text-text-secondary uppercase rounded">
                {project.year || '202X'}
            </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Header */}
        <div className="mb-4">
            <h3 className="text-h3 font-display text-text-primary mb-2 truncate group-hover:text-accent transition-colors duration-200">
                {t(titleKey, project.title)}
            </h3>
            <p className="text-text-secondary text-body-sm leading-relaxed line-clamp-2 mb-4 h-10">
                {t(descKey, project.short_description || project.description || '')}
            </p>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2">
                {displayTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded font-mono text-label uppercase bg-accent/10 text-accent border border-accent/15 group-hover:bg-accent/18 group-hover:border-accent/30 transition-colors whitespace-nowrap">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-label font-mono text-text-secondary group-hover:text-text-primary transition-colors duration-200">
            <div className="flex items-center gap-1.5">
                <Tag size={12} />
                <span className="uppercase">{project.category || 'Audio'}</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:inline">
                  {t('card.view_project', 'View Project')}
                </span>
                <div className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="group relative w-full rounded-lg overflow-hidden bg-surface-raised border border-border hover:border-border-hover hover:-translate-y-0.5 hover:shadow-hover transition-all duration-300 cursor-pointer"
    >
      {project.externalLink ? (
        <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-lg">
            <div className="absolute top-3 left-3 z-30">
              <ExternalLink size={14} className="text-text-secondary" />
            </div>
            {cardContent}
        </a>
      ) : (
        <Link to={`/projects/${project.id}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-lg">
            {cardContent}
        </Link>
      )}
    </div>
  );
};

export default ProjectCard;
