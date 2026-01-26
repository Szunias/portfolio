'use client';

import { notFound, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Project } from '@/types';
import ProjectHero from '@/components/features/projects/ProjectHero';
import ProjectSidebar from '@/components/features/projects/ProjectSidebar';
import ProjectRichDetails from '@/components/features/projects/ProjectRichDetails';
import ContentBlockRenderer from '@/components/features/projects/ContentBlockRenderer';
import ChallengesBlock from '@/components/features/projects/ChallengesBlock';
import ProjectCodeSection from '@/components/features/projects/ProjectCodeSection';
import { motion } from 'framer-motion';

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations('projects');
  const { featured_projects = [], additional_projects = [] } = usePortfolioData();

  // Combine all projects and find the one matching the ID
  const allProjects = [...featured_projects, ...additional_projects];
  const project = allProjects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  const links = project.links || {};

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Hero Section */}
      <ProjectHero project={project} />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Main Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Full Description */}
            {project.full_description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-slate-300 leading-relaxed">
                  {project.full_description}
                </p>
              </div>
            )}

            {/* Content Blocks */}
            <ContentBlockRenderer blocks={project.content_blocks} />

            {/* Rich Details */}
            <ProjectRichDetails project={project} />

            {/* Challenges Solved */}
            {project.challenges_solved && project.challenges_solved.length > 0 && (
              <ChallengesBlock challenges={project.challenges_solved} />
            )}

            {/* Code Snippets */}
            {project.code_snippets && project.code_snippets.length > 0 && (
              <ProjectCodeSection snippets={project.code_snippets} />
            )}

            {/* Media Gallery */}
            {project.media?.images && project.media.images.length > 0 && (
              <div className="my-12">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {t('gallery') || 'Gallery'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.media.images.map((image, idx) => {
                    const imgSrc = typeof image === 'string' ? image : image.src;
                    const imgCaption = typeof image === 'string' ? '' : image.caption;
                    return (
                      <div key={idx} className="rounded-xl overflow-hidden border border-white/10 hover:border-accent/30 transition-all duration-300 group">
                        <img
                          src={`/${imgSrc}`}
                          alt={imgCaption || `Project image ${idx + 1}`}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {imgCaption && (
                          <p className="p-3 text-xs text-slate-500 font-mono text-center bg-black/50">
                            {t(imgCaption) || imgCaption}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <aside>
            <ProjectSidebar project={project} />
          </aside>
        </div>
      </div>
    </div>
  );
}

// Note: generateStaticParams is not available in client components
// This page will be dynamically rendered
