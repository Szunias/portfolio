import { Project } from '../../types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageWithLoader from '../ui/ImageWithLoader';
import { ArrowRight, Tag } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const { t } = useTranslation();
  const media = project.media || {};
  
  const titleKey = `project_${project.id}_title`;
  const descKey = `project_${project.id}_short_desc`;
  const isShadowFrames = project.id === 'shadow_frames';

  // Prioritize key tech tags
  const keyTech = ['C++', 'Unreal', 'Wwise', 'MetaSounds', 'Blueprints', 'Unity', 'C#'];
  const allTags = [...(project.technologies || []), ...(project.tags || [])];
  // Deduplicate and prioritize
  const uniqueTags = Array.from(new Set(allTags));
  const displayTags = uniqueTags.sort((a, b) => {
      const aIsKey = keyTech.some(k => a.includes(k)) ? 1 : 0;
      const bIsKey = keyTech.some(k => b.includes(k)) ? 1 : 0;
      return bIsKey - aIsKey;
  }).slice(0, 3);

  const cardContent = (
    <div className="flex flex-col h-full relative z-10">
      {/* Image Section - Technical Viewport */}
      <div className={`relative w-full aspect-video overflow-hidden border-b transition-colors bg-neutral-900 
        ${isShadowFrames ? 'border-neutral-800 group-hover:border-white/40' : 'border-white/5 group-hover:border-white/40'}`}>
        
        <div className="absolute inset-0 z-10 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
        
        {media.thumbnail ? (
            media.thumbnail.endsWith('.mp4') || media.thumbnail.endsWith('.webm') ? (
            <video
                src={`/${media.thumbnail}`}
                className={`w-full h-full object-cover transition-all duration-700 ease-out opacity-90 brightness-90 group-hover:opacity-100 group-hover:brightness-110 group-hover:scale-105`}
                muted
                loop
                autoPlay
                playsInline
            />
            ) : (
            <div className={`w-full h-full transition-all duration-700 ease-out opacity-90 brightness-90 group-hover:opacity-100 group-hover:brightness-110 group-hover:scale-105`}>
                <ImageWithLoader 
                    src={`/${media.thumbnail}`} 
                    alt={t(titleKey, project.title)}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="h-full w-full"
                />
            </div>
            )
        ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <span className="text-white/20 font-mono text-xs tracking-widest">{t('card.no_signal', 'NO_SIGNAL')}</span>
            </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-3 right-3 z-20">
            <span className={`px-2 py-1 backdrop-blur-sm border text-[10px] font-mono uppercase tracking-wider rounded shadow-sm
              ${isShadowFrames 
                ? 'bg-black/80 border-neutral-700 text-neutral-400' 
                : 'bg-black/60 border-white/10 text-white/80'
              }`}>
                {project.year || '202X'}
            </span>
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex-1 p-5 flex flex-col relative ${isShadowFrames ? 'bg-[#050505]' : 'bg-[#0a0a0a]'}`}>
        
        {/* Shadow Frames Special Effects - Black Mist */}
        {isShadowFrames && (
          <>
            {/* Rising Mist Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-neutral-900/80 to-transparent opacity-90 pointer-events-none" />
            {/* Foggy noise overlay */}
            <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/40 via-transparent to-transparent pointer-events-none" />
          </>
        )}

        {/* Subtle Grid Background (Standard) */}
        {!isShadowFrames && (
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        )}

        {/* Header */}
        <div className="mb-4 relative z-10">
            <h3 className={`text-xl font-display font-bold mb-2 truncate transition-colors text-slate-200 group-hover:text-white`}>
                {t(titleKey, project.title)}
            </h3>
            <p className="text-slate-400 text-sm font-light leading-relaxed line-clamp-2 mb-4 h-10">
                {t(descKey, project.short_description)}
            </p>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2">
                {displayTags.map(tag => (
                    <span key={tag} className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors whitespace-nowrap
                      ${isShadowFrames
                        ? 'bg-neutral-900/80 border-neutral-800 text-slate-500 group-hover:border-white/30 group-hover:text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 group-hover:border-white/30 group-hover:text-white'
                      }`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Technical Footer Data */}
        <div className={`mt-4 pt-4 border-t flex items-center justify-between text-[10px] font-mono transition-colors relative z-10
          ${isShadowFrames 
            ? 'border-neutral-800 text-slate-600 group-hover:text-slate-300' 
            : 'border-white/5 text-slate-500 group-hover:text-slate-300'
          }`}>
            <div className="flex items-center gap-1.5">
                <Tag size={12} />
                <span className="uppercase tracking-wider">{project.category || 'Audio'}</span>
            </div>

            <div className="flex items-center gap-2 group/btn">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline text-white">
                  View Project
                </span>
                <div className="group-hover:translate-x-1 transition-transform text-white">
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>

      </div>
    </div>
  );

  return (
    <div
      className={`group relative w-full rounded-xl overflow-hidden transition-all duration-500 animate-fade-in-up
        ${isShadowFrames 
          ? 'bg-[#050505] border border-neutral-800 shadow-[0_0_60px_-10px_rgba(255,255,255,0.1)] hover:border-white/40 hover:shadow-[0_0_100px_-10px_rgba(255,255,255,0.2)]' 
          : 'bg-[#0a0a0a] border border-white/5 hover:border-white/40 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]'
        }
      `}
      style={{ animationDelay: `${index < 6 ? index * 100 : 0}ms` }}
    >
      {/* Animated Mist Layer for Shadow Frames */}
      {isShadowFrames && (
        <div className="absolute -inset-[100%] animate-mist-slow opacity-30 pointer-events-none z-0">
          <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_60deg,transparent_120deg,rgba(255,255,255,0.1)_180deg,transparent_240deg,rgba(255,255,255,0.1)_300deg,transparent_360deg)] blur-3xl" />
        </div>
      )}

      {project.externalLink ? (
        <a href={project.externalLink} className="block h-full relative z-10">
            {cardContent}
        </a>
      ) : (
        <Link to={`/projects/${project.id}`} className="block h-full relative z-10">
            {cardContent}
        </Link>
      )}
    </div>
  );
};

export default ProjectCard;
