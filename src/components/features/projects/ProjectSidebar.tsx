import { Github, ExternalLink, PlayCircle, Tag, Layers, Users, Monitor, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Project } from '../../../types';

interface ProjectSidebarProps {
  project: Project;
}

const ProjectSidebar = ({ project }: ProjectSidebarProps) => {
  const { t } = useTranslation();
  const links = project.links || {};

  return (
    <div className="sticky top-32 space-y-8">
        
        {/* Actions Card */}
        <div className="p-6 rounded-2xl bg-tertiary border border-white/10 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.1)] shadow-xl transition-all duration-500">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
                {t('details.access', 'Project Access')}
            </h3>
            
            {/* Project Meta Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
                {project.team_size && (
                    <div className="col-span-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Users size={12} /> Team
                        </div>
                        <div className="text-white font-bold">{project.team_size} Members</div>
                    </div>
                )}
                {project.engine && (
                    <div className="col-span-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Gamepad2 size={12} /> Engine
                        </div>
                        <div className="text-white font-bold">{project.engine}</div>
                    </div>
                )}
                {project.platforms && (
                    <div className="col-span-2">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Monitor size={12} /> Platforms
                        </div>
                        <div className="text-white text-sm">{project.platforms.join(', ')}</div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {links.demo && (
                    <a href={links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-accent text-black font-bold rounded-lg hover:bg-white hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-300 hover:scale-105">
                        <ExternalLink size={18} className="mr-2" /> {t('links.demo', 'Launch Project')}
                    </a>
                )}
                {links.video && (
                    <a href={links.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 hover:border-accent/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] border border-white/10 transition-all duration-300">
                        <PlayCircle size={18} className="mr-2" /> {t('links.video', 'Watch Demo')}
                    </a>
                )}
                {links.repo && (
                    <a href={links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-transparent text-slate-400 font-medium rounded-lg hover:text-accent hover:border-accent/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-white/10 transition-all duration-300">
                        <Github size={18} className="mr-2" /> {t('links.repo', 'Source Code')}
                    </a>
                )}
                {links.documentation && (
                   <a href={links.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-transparent text-slate-300 font-medium border border-slate-700 rounded hover:text-white hover:border-slate-500 transition">
                    <Layers size={18} className="mr-2" /> {t('links.docs', 'Documentation')}
                  </a>
                )}
            </div>
        </div>

        {/* Tech Stack */}
        <div>
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={14} /> {t('details.technologies', 'Technologies')}
            </h3>
            <div className="flex flex-wrap gap-2">
                {project.technologies?.map(tech => (
                    <span key={tech} className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-md hover:bg-accent/10 hover:border-accent/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all duration-300 cursor-default">
                        {tech}
                    </span>
                ))}
            </div>
        </div>

        {/* Tags */}
        {project.tags && (
            <div>
                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag size={14} /> {t('details.classification', 'Classification')}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-xs text-slate-400 hover:text-white transition-colors cursor-default">
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