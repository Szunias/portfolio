import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Activity, Cpu, Layers, Zap } from 'lucide-react';

import SEO from '../components/layout/SEO';

/** Transientica project page: voice-controlled rhythm game using real-time ML audio classification. */
const Transientica = () => {
    const { t } = useTranslation('transientica');
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    const techVideoRef = useRef<HTMLVideoElement>(null);

    const handleVideoClick = (videoId: string) => {
        setActiveVideo(videoId);
        const videoRef = videoId === 'main-video' ? mainVideoRef : techVideoRef;

        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.controls = true;
            videoRef.current.loop = false;
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.error("Play failed", e));
        }
    };

    return (
        <div className="min-h-screen bg-primary text-cream font-sans selection:bg-accent/30">
            <SEO
                title={t('transientica.seo_title', 'Transientica | AudioLab')}
                description={t('transientica.seo_description', 'Voice-controlled rhythm game using real-time ML audio classification. Beatbox sounds trigger gameplay actions with under 60ms latency.')}
            />

            <div className="relative z-10 pt-8 px-6">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-dim hover:text-cream-light transition-colors px-4 py-2 rounded-sm bg-secondary border border-border"
                >
                    <ArrowLeft size={16} />
                    {t('transientica.cta.back', 'Back to Projects')}
                </Link>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
                {/* Hero */}
                <section className="py-20 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-sm bg-secondary border border-border text-accent text-sm font-mono uppercase tracking-wider mb-8">
                        {t('transientica.hero.badge', 'Machine Learning Audio')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-cream-light mb-6 leading-tight">
                        {t('transientica.hero.title_main', 'Transientica')}<br />
                        <span className="text-accent">
                            {t('transientica.hero.title_sub', 'Real-time Classification')}
                        </span>
                    </h1>

                    <p className="text-xl text-dim max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('transientica.hero.description', 'A system that listens to your microphone and classifies sounds in real-time using a custom neural network trained on thousands of samples.')}
                    </p>

                    {/* Audio Visualizer Animation — CSS-driven */}
                    <div className="flex justify-center items-end gap-1 h-16 mb-12">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={`vis-${i}`}
                                className="w-2 bg-accent rounded-full opacity-60 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s`, height: '40px' }}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            t('transientica.tags.ml', 'Machine Learning'),
                            t('transientica.tags.audio', 'Audio Processing'),
                            t('transientica.tags.unity', 'Unity'),
                            t('transientica.tags.python', 'Python')
                        ].map((tag) => (
                            <span key={tag} className="px-4 py-2 bg-secondary border border-border rounded-sm text-sm text-cream">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Video Showcase */}
                <section className="mb-32">
                    <div
                        className={`relative aspect-video rounded-sm overflow-hidden border border-border bg-black group cursor-pointer transition-all duration-500`}
                        onClick={() => handleVideoClick('main-video')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVideoClick('main-video'); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={t('transientica.video.watch_demo', 'Watch Demo')}
                    >
                        <video
                            ref={mainVideoRef}
                            id="main-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/assets/images/projects/maxresdefault.jpg"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                            <source src="/assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4" type="video/mp4" />
                        </video>

                        {activeVideo !== 'main-video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                <div className="w-20 h-20 bg-secondary rounded-sm flex items-center justify-center border border-border">
                                    <Play size={32} className="text-cream-light ml-1 fill-cream-light" />
                                </div>
                                <span className="absolute bottom-8 text-cream-light font-mono text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    {t('transientica.video.watch_demo', 'Watch Demo')}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32">
                    {[
                        { val: t('transientica.stats.latency_value', '< 50ms'), label: t('transientica.stats.latency_label', 'Latency') },
                        { val: t('transientica.stats.accuracy_value', '94%'), label: t('transientica.stats.accuracy_label', 'Accuracy') },
                        { val: t('transientica.stats.classes_value', '12'), label: t('transientica.stats.classes_label', 'Sound Classes') },
                        { val: t('transientica.stats.year_value', '2024'), label: t('transientica.stats.year_label', 'Year') }
                    ].map((stat) => (
                        <div key={stat.label} className="p-6 bg-secondary border border-border rounded-sm text-center hover:bg-tertiary transition-colors">
                            <div className="text-3xl font-display font-bold text-accent mb-2">
                                {stat.val}
                            </div>
                            <p className="text-dim text-sm uppercase tracking-wider font-mono">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Features */}
                <section className="mb-32">
                    <h2 className="text-4xl font-display font-bold text-cream-light text-center mb-16">
                        {t('transientica.features.title', 'Key Features')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Activity size={32} />}
                            title={t('transientica.features.realtime.title', 'Real-time Analysis')}
                            desc={t('transientica.features.realtime.desc', 'Processes audio input instantly with minimal latency, suitable for interactive applications.')}
                        />
                        <FeatureCard
                            icon={<Cpu size={32} />}
                            title={t('transientica.features.ml.title', 'Machine Learning')}
                            desc={t('transientica.features.ml.desc', 'Custom trained CNN model optimized for audio spectral analysis.')}
                        />
                        <FeatureCard
                            icon={<Layers size={32} />}
                            title={t('transientica.features.architecture.title', 'Modular Architecture')}
                            desc={t('transientica.features.architecture.desc', 'Decoupled inference engine that can be integrated into Unity or Unreal.')}
                        />
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section className="bg-secondary border border-border rounded-sm p-8 md:p-12">
                    <h2 className="text-3xl font-display font-bold text-cream-light mb-8">
                        {t('transientica.technical.title', 'Technical Deep Dive')}
                    </h2>
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-display font-bold text-accent mb-3 flex items-center gap-2">
                                    <Zap size={20} />
                                    {t('transientica.technical.spectral.title', 'Spectral Analysis')}
                                </h3>
                                <p className="text-dim leading-relaxed">
                                    {t('transientica.technical.spectral.desc', 'The system converts raw audio waveforms into Mel-spectrograms, which are then fed into the neural network as image data. This allows the model to recognize patterns in frequency and time simultaneously.')}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-accent-light mb-3 flex items-center gap-2">
                                    <Cpu size={20} />
                                    {t('transientica.technical.optimization.title', 'Optimization')}
                                </h3>
                                <p className="text-dim leading-relaxed">
                                    {t('transientica.technical.optimization.desc', 'Inference is optimized using ONNX Runtime, allowing the Python-trained PyTorch model to run efficiently within the C# environment of Unity without heavy dependencies.')}
                                </p>
                            </div>
                        </div>

                        <div
                            className={`relative h-[300px] rounded-sm overflow-hidden border border-border bg-black group cursor-pointer ${activeVideo === 'tech-video' ? 'ring-2 ring-accent' : ''}`}
                            onClick={() => handleVideoClick('tech-video')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVideoClick('tech-video'); } }}
                            role="button"
                            tabIndex={0}
                            aria-label={t('transientica.technical.title', 'Technical Deep Dive') + ' — ' + t('transientica.video.watch_demo', 'Watch Demo')}
                        >
                            <video
                                ref={techVideoRef}
                                id="tech-video"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            >
                                <source src="/assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4" type="video/mp4" />
                            </video>
                            {activeVideo !== 'tech-video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10">
                                    <div className="w-16 h-16 bg-secondary rounded-sm flex items-center justify-center border border-border">
                                        <Play size={24} className="text-cream-light ml-1 fill-cream-light" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <div className="mt-32 text-center">
                    <Link
                        to="/projects"
                        className="inline-flex items-center px-8 py-4 bg-accent text-primary font-bold rounded-sm transition-colors hover:bg-accent-light"
                    >
                        {t('transientica.cta.view_all', 'View All Projects')}
                    </Link>
                    <p className="mt-8 text-dim text-sm">
                        &copy; {new Date().getFullYear()} Igor Szuniewicz
                    </p>
                </div>

            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 bg-secondary border border-border rounded-sm hover:bg-tertiary transition-colors duration-300 group">
        <div className="w-12 h-12 bg-tertiary rounded-sm flex items-center justify-center text-cream-light mb-6 group-hover:text-accent transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-display font-bold text-cream-light mb-3">{title}</h3>
        <p className="text-dim leading-relaxed">
            {desc}
        </p>
    </div>
);

export default Transientica;
