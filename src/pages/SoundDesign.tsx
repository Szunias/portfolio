import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Play, VolumeX, Music } from 'lucide-react';
import SEO from '../components/layout/SEO';

const SoundDesign = () => {
    const { t } = useTranslation('soundDesign');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div ref={containerRef} className="min-h-screen bg-secondary bg-crosshatch text-slate-300 font-sans selection:bg-orange-500/30">
            <SEO title="Sound Design | Igor Szuniewicz" description="Sound Redesigns and Implementation Showcases" />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-secondary to-secondary z-0"></div>
                
                <motion.div 
                    style={{ opacity, scale }}
                    className="relative z-10 max-w-5xl w-full text-center"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-bold uppercase tracking-wider mb-8 border border-orange-500/20"
                    >
                        <Music size={16} />
                        {t('hero.badge', 'Sound Design Portfolio')}
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-tight"
                    >
                        {t('hero.title', 'Sonic Landscapes')}
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
                    >
                        {t('hero.subtitle', 'A collection of linear media redesigns and implementation showcases.')}
                    </motion.p>

                    {/* Tools Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
                    >
                        {[
                            { name: 'Reaper', src: '/assets/images/tools/reaper.png' },
                            { name: 'Logic Pro', src: '/assets/images/tools/logic.png' },
                            { name: 'Cubase', src: '/assets/images/tools/cubase.png' },
                            { name: 'Studio One', src: '/assets/images/tools/studioone.png' },
                            { name: '3D Audio', src: '/assets/images/tools/3daudio.png' }
                        ].map((tool) => (
                            <img 
                                key={tool.name}
                                src={tool.src} 
                                alt={tool.name} 
                                className="h-12 w-auto object-contain hover:scale-110 transition-transform" 
                                title={tool.name} 
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Main Content */}
            <main className="relative z-20 max-w-7xl mx-auto px-6 pb-32">
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-12 border-l-4 border-orange-500 pl-6">
                        {t('section1.title', 'Redesigns & Showcases')}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Video 1: God of War */}
                        <VideoCard 
                            title={t('section1.video1.title', 'God of War - Krotos Redesign')}
                            desc={t('section1.video1.description', 'Sound redesign using Krotos Studio for creature vocalizations and environmental textures.')}
                            badge={t('section1.video1.badge', 'Redesign')}
                            videoSrc="/assets/videos/krotosvideo.mp4"
                            poster="/assets/images/godofwarkrotos.jpg"
                        />

                        {/* Video 2: Baldur's Gate */}
                        <VideoCard 
                            title={t('section1.video2.title', "Baldur's Gate 3 - Magic Combat")}
                            desc={t('section1.video2.description', 'Focus on magical impact sounds and spell casting layers.')}
                            badge={t('section1.video2.badge', 'Redesign')}
                            videoSrc="/assets/videos/baldursremake.mp4"
                            poster="/assets/images/baldurspreview.png"
                        />

                        {/* Video 3: Weapon Sound Design - SIGNAL OFFLINE */}
                        <div className="bg-[#111] rounded-2xl overflow-hidden border border-white/5 group relative h-full min-h-[400px] flex flex-col">
                            <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
                                {/* Glitch Effect Background */}
                                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#ff0000_2px,#ff0000_4px)] animate-pulse"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000_120%)]"></div>
                                
                                <div className="text-center relative z-10 p-8">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                                        <VolumeX size={32} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-red-500 mb-2 tracking-widest uppercase glitch-text">
                                        {t('section1.video3.placeholder_title', 'SIGNAL OFFLINE')}
                                    </h4>
                                    <p className="text-red-500/60 font-mono text-sm">
                                        {t('section1.video3.placeholder_subtitle', 'Content currently unavailable due to NDA or pending release.')}
                                    </p>
                                </div>
                            </div>
                            <div className="p-8 border-t border-white/5 bg-[#151515]">
                                <h3 className="text-xl font-bold text-white mb-2 opacity-50">{t('section1.video3.title', 'Weapon Sound Design')}</h3>
                                <p className="text-slate-500 text-sm mb-4 opacity-50">{t('section1.video3.description', 'Procedural weapon synthesis system.')}</p>
                                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider rounded border border-red-500/20">
                                    {t('section1.video3.badge', 'Confidential')}
                                </span>
                            </div>
                        </div>

                        {/* Video 4: Fracture Horizon */}
                        <VideoCard 
                            title={t('section1.video4.title', 'Fractured Horizon')}
                            desc={t('section1.video4.description', 'Sci-fi ambience and UI sound design for a futuristic interface.')}
                            badge={t('section1.video4.badge', 'Implementation')}
                            videoSrc="/assets/videos/fracturedhorzion.mp4"
                            poster="/assets/images/frafturedhorizon.png"
                        />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-20 text-center border-t border-white/5 bg-primary">
                <Link 
                    to="/projects" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    {t('footer.back_link', 'Back to Projects')}
                </Link>
                <p className="mt-8 text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Igor Szuniewicz
                </p>
            </footer>
        </div>
    );
};

interface VideoCardProps {
    title: string;
    desc: string;
    badge: string;
    videoSrc: string;
    poster: string;
}

const VideoCard = ({ title, desc, badge, videoSrc, poster }: VideoCardProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111] rounded-2xl overflow-hidden border border-white/5 group hover:border-orange-500/30 transition-colors"
        >
            <div className="relative aspect-video bg-black group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-shadow">
                {!isPlaying && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center z-10 cursor-pointer group/poster"
                        style={{ backgroundImage: `url('${poster}')` }}
                        onClick={handlePlay}
                    >
                        <div className="absolute inset-0 bg-black/40 group-hover/poster:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-20 h-20 bg-orange-500/90 rounded-full flex items-center justify-center shadow-lg group-hover/poster:scale-110 transition-transform">
                                <Play size={32} className="text-white ml-1 fill-white" />
                            </div>
                        </div>
                    </div>
                )}
                <video 
                    ref={videoRef}
                    controls={isPlaying}
                    playsInline 
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onEnded={() => setIsPlaying(false)}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            </div>
            <div className="p-8 border-t border-white/5 bg-[#151515]">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">{title}</h3>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider rounded border border-orange-500/20">
                        {badge}
                    </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm">
                    {desc}
                </p>
            </div>
        </motion.div>
    );
};

export default SoundDesign;
