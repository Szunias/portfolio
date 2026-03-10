import { useTranslation } from 'react-i18next';
import { Github, ExternalLink, PlayCircle, Tag, Layers, Users, Monitor, Gamepad2 } from 'lucide-react';

import type { Project } from '@/types';

interface ProjectSidebarProps {
  project: Project;
}

const ProjectSidebar = ({ project }: ProjectSidebarProps) => {
  const { t } = useTranslation('projectDetail');
  const links = project.links || {};

  return (
    <div className="sticky top-32 space-y-6">

        {/* Actions Card */}
        <div className="p-6 rounded-xl bg-surface-raised border border-border">
            <h3 className="text-label font-mono text-text-tertiary uppercase mb-6">
                {t('details.access', 'Project Access')}
            </h3>

            {/* Project Meta Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                {project.team_size && (
                    <div className="col-span-1">
                        <div className="text-label font-mono text-text-tertiary uppercase mb-1 flex items-center gap-1">
                            <Users size={12} /> {t('details.team', 'Team')}
                        </div>
                        <div className="text-text-primary text-body-sm font-medium">{project.team_size} {t('details.members', 'Members')}</div>
                    </div>
                )}
                {project.engine && (
                    <div className="col-span-1">
                        <div className="text-label font-mono text-text-tertiary uppercase mb-1 flex items-center gap-1">
                            <Gamepad2 size={12} /> {t('details.engine', 'Engine')}
                        </div>
                        <div className="text-text-primary text-body-sm font-medium">{project.engine}</div>
                    </div>
                )}
                {project.platforms && (
                    <div className="col-span-2">
                        <div className="text-label font-mono text-text-tertiary uppercase mb-1 flex items-center gap-1">
                            <Monitor size={12} /> {t('details.platforms', 'Platforms')}
                        </div>
                        <div className="text-text-primary text-body-sm">{project.platforms.join(', ')}</div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {links.demo && (
                    <a href={links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 px-6 bg-accent text-surface text-body-sm font-semibold rounded-md hover:bg-accent-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised">
                        <ExternalLink size={18} className="mr-2" /> {t('links.demo', 'Launch Project')}
                    </a>
                )}
                {links.video && (
                    <a href={links.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 px-6 text-text-primary text-body-sm font-medium rounded-md border border-border hover:border-border-hover hover:bg-surface-overlay transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised">
                        <PlayCircle size={18} className="mr-2" /> {t('links.video', 'Watch Demo')}
                    </a>
                )}
                {links.repo && (
                    <a href={links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 px-6 text-text-secondary text-body-sm font-medium rounded-md border border-border hover:border-border-hover hover:text-text-primary hover:bg-surface-overlay transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised">
                        <Github size={18} className="mr-2" /> {t('links.repo', 'Source Code')}
                    </a>
                )}
                {links.documentation && (
                   <a href={links.documentation.startsWith('http') ? links.documentation : `/${links.documentation}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 px-6 text-text-secondary text-body-sm font-medium border border-border rounded-md hover:text-text-primary hover:border-border-hover hover:bg-surface-overlay transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised">
                    <Layers size={18} className="mr-2" /> {t('links.docs', 'Documentation')}
                  </a>
                )}
            </div>
        </div>

        {/* Tech Stack */}
        <div>
            <h3 className="text-label font-mono text-text-tertiary uppercase mb-4 flex items-center gap-2">
                <Layers size={14} /> {t('details.technologies', 'Technologies')}
            </h3>
            <div className="flex flex-wrap gap-2">
                {project.technologies?.map(tech => (
                    <span key={tech} className="px-3 py-1 text-label font-mono uppercase text-accent-secondary bg-surface-overlay rounded-md hover:bg-accent/18 hover:border-accent/30 transition-colors duration-200 cursor-default">
                        {tech}
                    </span>
                ))}
            </div>
        </div>

        {/* Tags */}
        {project.tags && (
            <div>
                <h3 className="text-label font-mono text-text-tertiary uppercase mb-4 flex items-center gap-2">
                    <Tag size={14} /> {t('details.classification', 'Classification')}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-caption text-text-secondary hover:text-accent transition-colors cursor-default">
                            #{t(`tags.${tag}`, tag)}
                        </span>
                    ))}
                </div>
            </div>
        )}

    </div>
  );
};

export default ProjectSidebar;
