import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Activity, Cpu, Layers, Zap } from 'lucide-react';
import SEO from '../components/layout/SEO';

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
        <div className="min-h-screen bg-crosshatch bg-primary text-slate-300 font-sans selection:bg-purple-500/30">
            <SEO
                title={t('transientica.seo_title', 'Transientica | AudioLab')}
                description={t('transientica.seo_description', 'Voice-controlled rhythm game using real-time ML audio classification. Beatbox sounds trigger gameplay actions with under 60ms latency.')}
            />

            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(120,50,255,0.15),transparent_50%)]"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 pt-8 px-6">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5"
                >
                    <ArrowLeft size={16} />
                    {t('transientica.cta.back', 'Back to Projects')}
                </Link>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
                {/* Hero */}
                <section className="py-20 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-mono uppercase tracking-wider mb-8">
                        {t('transientica.hero.badge', 'Machine Learning Audio')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                        {t('transientica.hero.title_main', 'Transientica')}<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            {t('transientica.hero.title_sub', 'Real-time Classification')}
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('transientica.hero.description', 'A system that listens to your microphone and classifies sounds in real-time using a custom neural network trained on thousands of samples.')}
                    </p>

                    {/* Audio Visualizer Animation — CSS-driven */}
                    <div className="flex justify-center items-end gap-1 h-16 mb-12">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={`vis-${i}`}
                                className="w-2 bg-gradient-to-t from-purple-600 to-blue-400 rounded-full opacity-60 animate-bounce"
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
                            <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Video Showcase */}
                <section className="mb-32">
                    <div
                        className={`relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black group cursor-pointer transition-all duration-500 ${activeVideo === 'main-video' ? 'scale-100' : 'hover:scale-[1.01]'}`}
                        onClick={() => handleVideoClick('main-video')}
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
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                    <Play size={32} className="text-white ml-1 fill-white" />
                                </div>
                                <span className="absolute bottom-8 text-white font-mono text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
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
                        <div key={stat.label} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center hover:bg-white/10 transition-colors">
                            <h4 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                {stat.val}
                            </h4>
                            <p className="text-slate-500 text-sm uppercase tracking-wider font-mono">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Features */}
                <section className="mb-32">
                    <h2 className="text-4xl font-display font-bold text-white text-center mb-16">
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
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                    <h2 className="text-3xl font-display font-bold text-white mb-8">
                        {t('transientica.technical.title', 'Technical Deep Dive')}
                    </h2>
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                                    <Zap size={20} />
                                    {t('transientica.technical.spectral.title', 'Spectral Analysis')}
                                </h4>
                                <p className="text-slate-400 leading-relaxed">
                                    {t('transientica.technical.spectral.desc', 'The system converts raw audio waveforms into Mel-spectrograms, which are then fed into the neural network as image data. This allows the model to recognize patterns in frequency and time simultaneously.')}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                                    <Cpu size={20} />
                                    {t('transientica.technical.optimization.title', 'Optimization')}
                                </h4>
                                <p className="text-slate-400 leading-relaxed">
                                    {t('transientica.technical.optimization.desc', 'Inference is optimized using ONNX Runtime, allowing the Python-trained PyTorch model to run efficiently within the C# environment of Unity without heavy dependencies.')}
                                </p>
                            </div>
                        </div>

                        <div
                            className={`relative h-[300px] rounded-xl overflow-hidden border border-white/10 bg-black group cursor-pointer ${activeVideo === 'tech-video' ? 'ring-2 ring-purple-500' : ''}`}
                            onClick={() => handleVideoClick('tech-video')}
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
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play size={24} className="text-white ml-1 fill-white" />
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
                        className="inline-flex items-center px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
                    >
                        {t('transientica.cta.view_all', 'View All Projects')}
                    </Link>
                    <p className="mt-8 text-slate-600 text-sm">
                        &copy; {new Date().getFullYear()} Igor Szuniewicz
                    </p>
                </div>

            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 group-hover:text-purple-400 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
            {desc}
        </p>
    </div>
);

export default Transientica;
