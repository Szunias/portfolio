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
    <div className="sticky top-32 space-y-8">

        {/* Actions Card */}
        <div className="p-6 rounded-sm bg-secondary border border-border">
            <h3 className="text-xs font-mono text-dim uppercase tracking-widest mb-6">
                {t('details.access', 'Project Access')}
            </h3>

            {/* Project Meta Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                {project.team_size && (
                    <div className="col-span-1">
                        <div className="text-[10px] text-dim uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Users size={12} /> Team
                        </div>
                        <div className="text-cream font-medium">{project.team_size} Members</div>
                    </div>
                )}
                {project.engine && (
                    <div className="col-span-1">
                        <div className="text-[10px] text-dim uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Gamepad2 size={12} /> Engine
                        </div>
                        <div className="text-cream font-medium">{project.engine}</div>
                    </div>
                )}
                {project.platforms && (
                    <div className="col-span-2">
                        <div className="text-[10px] text-dim uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Monitor size={12} /> Platforms
                        </div>
                        <div className="text-cream text-sm">{project.platforms.join(', ')}</div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {links.demo && (
                    <a href={links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-accent text-primary font-medium rounded-sm hover:bg-accent-light transition-colors duration-200">
                        <ExternalLink size={18} className="mr-2" /> {t('links.demo', 'Launch Project')}
                    </a>
                )}
                {links.video && (
                    <a href={links.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 text-cream font-medium rounded-sm border border-border hover:border-border-hover transition-colors duration-200">
                        <PlayCircle size={18} className="mr-2" /> {t('links.video', 'Watch Demo')}
                    </a>
                )}
                {links.repo && (
                    <a href={links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 text-dim font-medium rounded-sm border border-border hover:border-border-hover hover:text-cream transition-colors duration-200">
                        <Github size={18} className="mr-2" /> {t('links.repo', 'Source Code')}
                    </a>
                )}
                {links.documentation && (
                   <a href={links.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 text-dim font-medium border border-border rounded-sm hover:text-cream hover:border-border-hover transition-colors duration-200">
                    <Layers size={18} className="mr-2" /> {t('links.docs', 'Documentation')}
                  </a>
                )}
            </div>
        </div>

        {/* Tech Stack */}
        <div>
            <h3 className="text-xs font-mono text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={14} /> {t('details.technologies', 'Technologies')}
            </h3>
            <div className="flex flex-wrap gap-2">
                {project.technologies?.map(tech => (
                    <span key={tech} className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-sm hover:bg-accent/10 hover:border-accent/30 transition-colors duration-200 cursor-default">
                        {tech}
                    </span>
                ))}
            </div>
        </div>

        {/* Tags */}
        {project.tags && (
            <div>
                <h3 className="text-xs font-mono text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag size={14} /> {t('details.classification', 'Classification')}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-xs text-dim hover:text-cream transition-colors cursor-default">
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
