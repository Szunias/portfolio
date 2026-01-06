import { ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TechReveal from '../../home/TechReveal';
import { Project } from '../../../types';

interface ProjectHeroProps {
    project: Project;
}

const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ProjectHero = ({ project }: ProjectHeroProps) => {
    const { t } = useTranslation();
    const media = project.media || {};

    const titleKey = `project_${project.id}_title`;
    const shortDescKey = `project_${project.id}_short_desc`;

    const videoId = media.video ? getYoutubeId(media.video) : null;
    const isLocalVideo = media.video && !videoId && (media.video.endsWith('.mp4') || media.video.endsWith('.webm'));

    return (
        <div className="relative min-h-[80vh] w-full overflow-hidden flex flex-col">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {media.thumbnail ? (
                    media.thumbnail.endsWith('.mp4') ? (
                        <video src={`/${media.thumbnail}`} className="w-full h-full object-cover opacity-40" autoPlay loop muted playsInline />
                    ) : (
                        <img src={`/${media.thumbnail}`} alt="" className="w-full h-full object-cover opacity-30" />
                    )
                ) : (
                    <div className="w-full h-full bg-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Link to="/projects" className="inline-flex items-center text-slate-400 hover:text-accent transition-all duration-300 mb-8 group hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        {t('projects.viewall', 'Back to Projects')}
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-accent text-black text-xs font-bold uppercase tracking-widest rounded-sm shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                            {project.category}
                        </span>
                        {project.year && (
                            <span className="text-slate-400 font-mono text-xs border border-white/10 px-3 py-1 rounded-sm hover:border-accent/50 hover:text-accent transition-all duration-300">
                                <Calendar size={12} className="inline mr-2" />
                                {project.year}
                            </span>
                        )}
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white max-w-5xl leading-[0.9] tracking-tighter mb-6 drop-shadow-[0_0_40px_rgba(56,189,248,0.3)]">
                        <TechReveal text={t(titleKey, project.title)} />
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mb-8">
                        {t(shortDescKey, project.short_description)}
                    </p>

                    {videoId && (
                        <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-accent/30 hover:shadow-[0_0_50px_rgba(56,189,248,0.2)] bg-black/50 backdrop-blur-sm transition-all duration-500">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                    {isLocalVideo && (
                        <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-accent/30 hover:shadow-[0_0_50px_rgba(56,189,248,0.2)] bg-black/50 backdrop-blur-sm transition-all duration-500">
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