import { useParams, Navigate } from 'react-router-dom';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from 'lucide-react';
import SEO from '../components/layout/SEO';
import ProjectHero from '../components/features/projects/ProjectHero';
import ProjectSidebar from '../components/features/projects/ProjectSidebar';
import ContentBlockRenderer from '../components/features/projects/ContentBlockRenderer';
import CodeViewer from '../components/features/CodeViewer';
import ChallengesBlock from '../components/features/projects/ChallengesBlock';
import ProjectRichDetails from '../components/features/projects/ProjectRichDetails';
import ImageLightbox from '../components/features/ImageLightbox';
import ProductionTimeline from '../components/features/ProductionTimeline';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { featured_projects, additional_projects } = usePortfolioData();
  const { t } = useTranslation();

  const project = [...featured_projects, ...additional_projects].find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) return <Navigate to="/404" replace />;

  const media = project.media || {};
  
  // Translation keys
  const titleKey = `project_${project.id}_title`;
  const shortDescKey = `project_${project.id}_short_desc`;
  const fullDescKey = `project_${project.id}_full_desc`;
  const description = t(fullDescKey, project.full_description || t(shortDescKey, project.short_description));

  return (
    <div className="min-h-screen bg-primary pb-32">
      <SEO 
        title={t(titleKey, project.title)} 
        description={t(shortDescKey, project.short_description)}
        image={media.thumbnail ? `/${media.thumbnail}` : undefined}
        type="article"
      />

      {/* --- CINEMATIC HERO --- */}
      <ProjectHero project={project} />

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: Content (8 cols) */}
        <div className="lg:col-span-8 space-y-16">

            {/* Production Timeline - for Shadow Frames */}
            {project.id === 'shadow_frames' && (
                <div className="-mb-8">
                    <ProductionTimeline />
                </div>
            )}

            {/* Main Description */}
            <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                <p className="whitespace-pre-line">{description}</p>
            </div>

            {/* Dynamic Content Blocks */}
            <ContentBlockRenderer blocks={project.content_blocks} />

            {/* Challenges & Solutions */}
            {project.challenges_solved && (
                <ChallengesBlock challenges={project.challenges_solved} />
            )}

            {/* Rich Details (Responsibilities, Metrics, etc.) */}
            <ProjectRichDetails project={project} />

            {/* Code Snippets */}
            {project.code_snippets && (
                <CodeViewer snippets={project.code_snippets} />
            )}

            {/* Gallery */}
            {media.images && media.images.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Images size={24} className="text-accent" />
                        {t('details.gallery', 'Gallery')}
                    </h3>
                    <ImageLightbox images={media.images} />
                </div>
            )}
        </div>

        {/* RIGHT: Sidebar (4 cols) - Sticky */}
        <div className="lg:col-span-4">
            <ProjectSidebar project={project} />
        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;