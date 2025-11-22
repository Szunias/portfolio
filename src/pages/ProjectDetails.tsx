import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { ArrowLeft, Github, ExternalLink, PlayCircle, Calendar, Tag, Layers, Code, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CodeViewer from '../components/CodeViewer';
import SEO from '../components/SEO';
import { ContentBlock } from '../types';

// --- Components ---

const StatsBar = ({ items }: { items: { label: string; value: string }[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/10">
    {items.map((item, idx) => (
      <div key={idx} className="text-center">
        <div className="text-2xl md:text-3xl font-display font-bold text-white mb-1">{item.value}</div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.label}</div>
      </div>
    ))}
  </div>
);

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { featured_projects, additional_projects } = usePortfolioData();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const project = [...featured_projects, ...additional_projects].find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) return null; // Or 404 redirect

  const media = project.media || {};
  const links = project.links || {};
  
  // Translation keys
  const titleKey = `project_${project.id}_title`;
  const shortDescKey = `project_${project.id}_short_desc`;
  const fullDescKey = `project_${project.id}_full_desc`;
  const description = t(fullDescKey, project.full_description || t(shortDescKey, project.short_description));

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      <SEO 
        title={t(titleKey, project.title)} 
        description={t(shortDescKey, project.short_description)}
        image={media.thumbnail ? `/${media.thumbnail}` : undefined}
        type="article"
      />

      {/* --- CINEMATIC HERO --- */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Background Media */}
        <div className="absolute inset-0">
            {media.thumbnail ? (
                media.thumbnail.endsWith('.mp4') ? (
                    <video src={`/${media.thumbnail}`} className="w-full h-full object-cover opacity-40" autoPlay loop muted playsInline />
                ) : (
                    <img src={`/${media.thumbnail}`} alt="" className="w-full h-full object-cover opacity-30" />
                )
            ) : (
                <div className="w-full h-full bg-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Link to="/projects" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t('projects.viewall', 'Back to Projects')}
                </Link>
                
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-accent text-black text-xs font-bold uppercase tracking-widest rounded-sm">
                        {project.category}
                    </span>
                    {project.year && (
                        <span className="text-slate-400 font-mono text-xs border border-white/10 px-3 py-1 rounded-sm">
                            {project.year}
                        </span>
                    )}
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white max-w-5xl leading-[0.9] tracking-tighter mb-6">
                    {t(titleKey, project.title)}
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
                    {t(shortDescKey, project.short_description)}
                </p>
            </motion.div>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: Content (8 cols) */}
        <div className="lg:col-span-8 space-y-20">
            
            {/* Stats / Context Bar */}
            {/* If there's a specific stats block, render it here prominently */}
            {project.content_blocks?.find(b => b.type === 'stats_grid') && (
                <StatsBar items={project.content_blocks.find(b => b.type === 'stats_grid')?.items || []} />
            )}

            {/* Main Description */}
            <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                <p className="whitespace-pre-line">{description}</p>
            </div>

            {/* Dynamic Content Blocks */}
            {project.content_blocks?.filter(b => b.type !== 'stats_grid').map((block, idx) => (
                <div key={idx} className="border-l-2 border-accent/20 pl-6 md:pl-10 py-2">
                    {block.title && <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><Cpu size={20} className="text-accent" /> {t(block.title, block.title)}</h3>}
                    {block.content && (
                        <div 
                            className="prose prose-invert max-w-none text-slate-300 leading-relaxed mb-8"
                            dangerouslySetInnerHTML={{ __html: t(block.content, block.content) }}
                        />
                    )}
                    {block.media && (
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl mt-6">
                            {block.media.endsWith('.mp4') ? (
                                <video src={`/${block.media}`} className="w-full h-full object-cover" autoPlay loop muted playsInline controls />
                            ) : (
                                <img src={`/${block.media}`} alt={block.title || ''} className="w-full h-full object-cover" />
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Code Snippets */}
            {project.code_snippets && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Code size={24} className="text-accent" />
                        {t('details.tech', 'Technical Implementation')}
                    </h3>
                    <CodeViewer snippets={project.code_snippets} />
                </div>
            )}

            {/* Gallery */}
            {media.images && media.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {media.images.map((img, i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-colors">
                            <img src={`/${img}`} alt="" className="w-full h-auto object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* RIGHT: Sidebar (4 cols) - Sticky */}
        <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
                
                {/* Actions Card */}
                <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/10 shadow-xl">
                    <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
                        {t('details.access', 'Project Access')}
                    </h3>
                    <div className="space-y-3">
                        {links.demo && (
                            <a href={links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-accent text-black font-bold rounded-lg hover:bg-white transition-colors">
                                <ExternalLink size={18} className="mr-2" /> {t('links.demo', 'Launch Project')}
                            </a>
                        )}
                        {links.video && (
                            <a href={links.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 border border-white/10 transition-colors">
                                <PlayCircle size={18} className="mr-2" /> {t('links.video', 'Watch Demo')}
                            </a>
                        )}
                        {links.repo && (
                            <a href={links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-transparent text-slate-400 font-medium rounded-lg hover:text-white hover:border-white/30 border border-white/10 transition-colors">
                                <Github size={18} className="mr-2" /> {t('links.repo', 'Source Code')}
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
                            <span key={tech} className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-md">
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
        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;