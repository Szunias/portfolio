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

    const hasVideo = videoId || isLocalVideo;
    const hasLegacyVideo = legacyVideoId && project.id === 'shadow_frames';

    return (
        <>
            <div className="relative min-h-[60vh] w-full overflow-hidden flex flex-col">
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
                            <img src={`/${media.thumbnail}`} alt="" role="presentation" aria-hidden="true" className="w-full h-full object-cover opacity-[0.30]" fetchPriority="high" />
                        )
                    ) : (
                        <div className="w-full h-full bg-surface-raised" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/40" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-end pb-16 lg:pb-20 px-6 md:px-12 lg:px-16 max-w-content-wide mx-auto pt-32">
                    <motion.div
                        initial={prefersReducedMotion ? noMotion.initial : hero.initial}
                        animate={prefersReducedMotion ? noMotion.animate : hero.animate}
                        transition={prefersReducedMotion ? noMotion.transition : hero.transition}
                    >
                        <Link to="/projects" className="inline-flex items-center text-text-secondary hover:text-accent transition-colors duration-200 mb-8 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-body-sm">{t('projects.view_all', 'Back to Projects')}</span>
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-2.5 py-1 bg-accent text-surface text-label font-mono uppercase rounded">
                                {project.category}
                            </span>
                            {project.year && (
                                <span className="text-text-secondary font-mono text-label border border-border px-2.5 py-1 rounded hover:border-border-hover transition-colors duration-200">
                                    <Calendar size={12} className="inline mr-2" />
                                    {project.year}
                                </span>
                            )}
                        </div>

                        <h1 className="text-h1 md:text-hero font-display text-text-primary max-w-5xl mb-6">
                            <TechReveal text={t(titleKey, project.title)} />
                        </h1>

                        <p className="text-body md:text-h4 text-text-secondary max-w-2xl leading-relaxed">
                            {t(shortDescKey, project.short_description || project.description || '')}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Video section — below the hero for better visual flow */}
            {(hasVideo || hasLegacyVideo) && (
                <div className="max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 -mt-8 relative z-10 space-y-8 mb-12">
                    {videoId && (
                        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden border border-border bg-black hover:border-border-hover transition-colors duration-300">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={`${t(`projects:project_${project.id}_title`, project.title)} - Video`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    )}

                    {isLocalVideo && (
                        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden border border-border bg-black hover:border-border-hover transition-colors duration-300">
                            <video
                                src={`/${media.video}`}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                            />
                        </div>
                    )}

                    {hasLegacyVideo && (
                        <div>
                            <h3 className="text-h5 font-mono text-text-secondary uppercase mb-4">
                                {t('projects.legacy_trailer', 'Previous Trailer')} / {t('projects.gameplay_preview', 'Gameplay Preview')}
                            </h3>
                            <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden border border-border bg-black hover:border-border-hover transition-colors duration-300">
                                <iframe
                                    src={`https://www.youtube.com/embed/${legacyVideoId}`}
                                    title={`${t(`projects:project_${project.id}_title`, project.title)} - ${t('projects.legacy_trailer', 'Previous Trailer')}`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ProjectHero;
