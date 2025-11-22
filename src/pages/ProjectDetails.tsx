import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { ArrowLeft, Github, ExternalLink, PlayCircle, Calendar, Tag, Layers, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CodeViewer from '../components/CodeViewer';
import TechReveal from '../components/TechReveal';
import SEO from '../components/SEO';
import { ContentBlock } from '../types';

// --- Content Blocks Components ---

const StatsGridBlock = ({ items }: { items: { label: string; value: string }[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-12">
    {items.map((item, idx) => (
      <div key={idx} className="bg-secondary/40 border border-white/10 p-6 rounded-xl text-center">
        <div className="text-3xl font-display font-bold text-white mb-1">{item.value}</div>
        <div className="text-xs font-mono text-accent uppercase tracking-widest">{item.label}</div>
      </div>
    ))}
  </div>
);

const SplitContentBlock = ({ block }: { block: ContentBlock }) => {
  const isVideo = block.media?.endsWith('.mp4') || block.media?.endsWith('.webm');
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-16 ${block.reverseLayout ? 'lg:grid-flow-dense' : ''}`}>
      <div className={`${block.reverseLayout ? 'lg:col-start-2' : ''}`}>
        {block.title && <h3 className="text-2xl font-bold text-white mb-6">{block.title}</h3>}
        <div 
            className="prose prose-invert max-w-none text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
        />
      </div>
      
      <div className={`${block.reverseLayout ? 'lg:col-start-1' : ''}`}>
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
          {isVideo ? (
            <video 
                src={`/${block.media}`} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline 
                controls 
            />
          ) : (
            <img src={`/${block.media}`} alt={block.title} className="w-full h-full object-cover" />
          )}
        </div>
        {block.mediaCaption && <p className="text-xs text-center text-slate-500 mt-2 font-mono">{block.mediaCaption}</p>}
      </div>
    </div>
  );
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { featured_projects, additional_projects } = usePortfolioData();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Find project in either list
  const project = [...featured_projects, ...additional_projects].find(p => p.id === id);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">{t('errors.project_not_found', 'Project not found')}</h2>
        <button 
          onClick={() => navigate('/projects')}
          className="text-accent hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} /> {t('projects.viewall', 'Back to Projects')}
        </button>
      </div>
    );
  }

  const media = project.media || {};
  const links = project.links || {};
  const technologies = project.technologies || [];
  
  // Translation keys
  const titleKey = `project_${project.id}_title`;
  const shortDescKey = `project_${project.id}_short_desc`;
  const fullDescKey = `project_${project.id}_full_desc`;

  // Use full description translation if available, otherwise fallback to short desc translation, 
  // finally fallback to raw full description or short description
  const description = t(fullDescKey, project.full_description || t(shortDescKey, project.short_description));

  return (
    <div className="min-h-screen pb-20">
      <SEO 
        title={t(titleKey, project.title)} 
        description={t(shortDescKey, project.short_description)}
        image={media.thumbnail ? `/${media.thumbnail}` : undefined}
        type="article"
      />
      {/* Hero Header with Background Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-primary/90 z-10"></div>
        {media.thumbnail && (
          <img 
            src={`/${media.thumbnail}`} 
            alt={t(titleKey, project.title)} 
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent z-20"></div>
        
        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <Link 
            to="/projects" 
            className="inline-flex items-center text-slate-400 hover:text-accent transition-colors mb-6 w-fit"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('projects.viewall', 'Back to Projects')}
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-sm font-bold uppercase tracking-wider">
                {project.category}
              </span>
              {project.year && (
                <span className="flex items-center text-slate-400 text-sm">
                  <Calendar size={16} className="mr-2" /> {project.year}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                <TechReveal text={t(titleKey, project.title)} />
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Main Media (Video or Image) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-video"
            >
              {media.video ? (
                // Check if it's a youtube/vimeo link or a local file
                media.video.includes('http') ? (
                    <iframe 
                        src={media.video.replace('watch?v=', 'embed/')} 
                        title={t(titleKey, project.title)}
                        className="w-full h-full"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video controls className="w-full h-full" poster={`/${media.thumbnail}`}>
                        <source src={`/${media.video}`} type="video/mp4" />
                    </video>
                )
              ) : media.thumbnail ? (
                <img src={`/${media.thumbnail}`} alt={t(titleKey, project.title)} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">{t('project.no_media', 'No Media')}</div>
                          )}            </motion.div>

            {/* --- DYNAMIC CONTENT BLOCKS OR STANDARD LAYOUT --- */}
            {project.content_blocks ? (
                <div className="space-y-12">
                    {project.content_blocks.map((block, idx) => {
                        switch(block.type) {
                            case 'stats_grid':
                                return block.items ? <StatsGridBlock key={idx} items={block.items} /> : null;
                            case 'split_text_media':
                                return <SplitContentBlock key={idx} block={block} />;
                            case 'text':
                                return (
                                    <div key={idx}>
                                        {block.title && <h2 className="text-2xl font-bold text-white mb-4">{block.title}</h2>}
                                        <div 
                                            className="prose prose-invert max-w-none text-slate-300 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: block.content || '' }}
                                        />
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            ) : (
                /* Fallback to standard layout for other projects */
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                    <h2 className="text-2xl font-bold text-white mb-6">
                        <TechReveal text={t('details.about', 'About the Project')} />
                    </h2>
                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                        <p className="whitespace-pre-line">{description}</p>
                    </div>
                    </motion.div>

                    {/* Code Snippets */}
                    {project.code_snippets && project.code_snippets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                        <Code className="mr-3 text-accent" />
                        <TechReveal text={t('details.tech', 'Technical Implementation')} />
                        </h2>
                        <CodeViewer snippets={project.code_snippets} />
                    </motion.div>
                    )}

                    {/* Gallery Grid */}
                    {media.images && media.images.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">
                            <TechReveal text={t('details.gallery', 'Gallery')} />
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {media.images.map((img, idx) => (
                            img.endsWith('.mp4') || img.endsWith('.webm') ? (
                            <video
                                key={idx}
                                src={`/${img}`}
                                className="rounded-lg border border-slate-800 hover:border-accent/50 transition-colors cursor-pointer object-cover h-48 w-full"
                                muted
                                loop
                                autoPlay
                                playsInline
                            />
                            ) : (
                            <img 
                                key={idx}
                                src={`/${img}`}
                                alt={`${t(titleKey, project.title)} ${t('tooltips.screenshot', 'screenshot')} ${idx + 1}`}
                                className="rounded-lg border border-slate-800 hover:border-accent/50 transition-colors cursor-pointer object-cover h-48 w-full"
                            />
                            )
                        ))}
                        </div>
                    </div>
                    )}
                </>
            )}

          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-8">
            
            {/* Links Card */}
            <div className="bg-secondary p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">
                  <TechReveal text={t('details.links', 'Project Links')} />
              </h3>
              <div className="space-y-3">
                {links.demo && (
                  <a href={links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 bg-accent text-primary font-bold rounded hover:bg-sky-400 transition">
                    <ExternalLink size={18} className="mr-2" /> {t('links.demo', 'Live Demo')}
                  </a>
                )}
                {links.video && (
                  <a href={links.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 bg-white text-primary font-bold rounded hover:bg-gray-200 transition">
                    <PlayCircle size={18} className="mr-2" /> {t('links.video', 'Watch Video')}
                  </a>
                )}
                {links.repo && (
                  <a href={links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 bg-slate-800 text-white font-medium border border-slate-700 rounded hover:bg-slate-700 transition">
                    <Github size={18} className="mr-2" /> {t('links.repo', 'Source Code')}
                  </a>
                )}
                {links.documentation && (
                   <a href={links.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-3 bg-transparent text-slate-300 font-medium border border-slate-700 rounded hover:text-white hover:border-slate-500 transition">
                    <Layers size={18} className="mr-2" /> {t('links.docs', 'Documentation')}
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-secondary/50 p-6 rounded-xl border border-slate-800/50">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                 <Layers size={18} className="mr-2 text-accent" /> 
                 <TechReveal text={t('details.technologies', 'Technologies')} />
               </h3>
               <div className="flex flex-wrap gap-2">
                 {technologies.map((tech) => (
                   <span key={tech} className="px-3 py-1 bg-primary text-slate-300 text-sm rounded border border-slate-700">
                     {tech}
                   </span>
                 ))}
               </div>
            </div>

            {/* Tags */}
            <div className="bg-secondary/50 p-6 rounded-xl border border-slate-800/50">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                 <Tag size={18} className="mr-2 text-accent" /> 
                 <TechReveal text={t('details.tags', 'Tags')} />
               </h3>
               <div className="flex flex-wrap gap-2">
                 {project.tags?.map((tag) => (
                   <span key={tag} className="text-sm text-slate-400 hover:text-accent transition-colors cursor-default">
                     #{tag}
                   </span>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;