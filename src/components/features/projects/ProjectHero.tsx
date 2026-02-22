import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';

import TechReveal from '@/components/home/TechReveal';
import type { Project } from '@/types';
import { hero, noMotion } from '@/constants/motion';

interface ProjectHeroProps {
    project: Project;
}

const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ProjectHero = ({ project }: ProjectHeroProps) => {
    const { t } = useTranslation(['projectDetail', 'projects']);
    const prefersReducedMotion = useReducedMotion();
    const media = project.media || {};
    const links = project.links || {};

    const titleKey = `project_${project.id}_title`;
    const shortDescKey = `project_${project.id}_short_desc`;

    const videoId = media.video ? getYoutubeId(media.video) : null;
    const legacyVideoId = media.video_legacy || links.video_legacy ? getYoutubeId(media.video_legacy || links.video_legacy || '') : null;
    const isLocalVideo = media.video && !videoId && (media.video.endsWith('.mp4') || media.video.endsWith('.webm'));

    return (
        <div className="relative min-h-[80vh] w-full overflow-hidden flex flex-col">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {media.thumbnail ? (
                    media.thumbnail.endsWith('.mp4') ? (
                        <video
                            src={`/${media.thumbnail}`}
                            className="w-full h-full object-cover opacity-30"
                            autoPlay
                            loop
                            muted
                            playsInline
                            onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                        />
                    ) : (
                        <img src={`/${media.thumbnail}`} alt="" role="presentation" aria-hidden="true" className="w-full h-full object-cover opacity-20" />
                    )
                ) : (
                    <div className="w-full h-full bg-secondary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto pt-32">
                <motion.div
                    initial={prefersReducedMotion ? noMotion.initial : hero.initial}
                    animate={prefersReducedMotion ? noMotion.animate : hero.animate}
                    transition={prefersReducedMotion ? noMotion.transition : hero.transition}
                >
                    <Link to="/projects" className="inline-flex items-center text-dim hover:text-cream transition-colors duration-200 mb-8 group">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        {t('projects.view_all', 'Back to Projects')}
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-accent text-primary text-xs font-label font-medium uppercase tracking-wide rounded-sm">
                            {project.category}
                        </span>
                        {project.year && (
                            <span className="text-dim font-label text-xs border border-border px-3 py-1 rounded-sm hover:border-border-hover transition-colors duration-200">
                                <Calendar size={12} className="inline mr-2" />
                                {project.year}
                            </span>
                        )}
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-cream-light max-w-5xl leading-[0.9] tracking-wide mb-6">
                        <TechReveal text={t(titleKey, project.title)} />
                    </h1>

                    <p className="text-lg md:text-xl text-dim max-w-2xl font-light leading-7 mb-8">
                        {t(shortDescKey, project.short_description || project.description || '')}
                    </p>

                    {videoId && (
                        <div className="w-full max-w-4xl aspect-video rounded-sm overflow-hidden border border-border bg-black transition-colors duration-200">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Legacy trailer for Shadow Frames */}
                    {legacyVideoId && project.id === 'shadow_frames' && (
                        <div className="mt-8">
                            <h3 className="text-lg font-label text-dim uppercase tracking-wide mb-4">
                                {t('projects.legacy_trailer', 'Previous Trailer')} / {t('projects.gameplay_preview', 'Gameplay Preview')}
                            </h3>
                            <div className="w-full max-w-4xl aspect-video rounded-sm overflow-hidden border border-border bg-black transition-colors duration-200">
                                <iframe
                                    src={`https://www.youtube.com/embed/${legacyVideoId}`}
                                    title="Legacy YouTube video player"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    {isLocalVideo && (
                        <div className="w-full max-w-4xl aspect-video rounded-sm overflow-hidden border border-border bg-black transition-colors duration-200">
                            <video
                                src={`/${media.video}`}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                            />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProjectHero;
