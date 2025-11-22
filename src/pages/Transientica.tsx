import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/transientica.css';

const Transientica = () => {
    const { t } = useTranslation();
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    // Refs for intersection observer
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        sectionRefs.current.forEach(section => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    const handleVideoClick = (videoId: string) => {
        setActiveVideo(videoId);
        const videoElement = document.getElementById(videoId) as HTMLVideoElement;
        if (videoElement) {
            videoElement.muted = false;
            videoElement.controls = true;
            videoElement.loop = false;
            videoElement.currentTime = 0;
            videoElement.play();
        }
    };

    const addToRefs = (el: HTMLElement | null) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    return (
        <div className="transientica-page">
            <div className="bg-canvas"></div>
            <div className="grid-lines"></div>

            <div className="back-link-container">
                <Link to="/projects" className="back-link">
                    ← {t('transientica.cta.back')}
                </Link>
            </div>

            <main className="container">
                {/* Hero */}
                <section className="hero visible" ref={addToRefs}>
                    <span className="hero-badge">{t('transientica.hero.badge')}</span>
                    <h1 className="hero-title">{t('transientica.hero.title_main')}<br /><span style={{ color: 'var(--accent)' }}>{t('transientica.hero.title_sub')}</span></h1>
                    <p className="hero-subtitle">
                        {t('transientica.hero.description')}
                    </p>

                    {/* Audio Visualizer Animation */}
                    <div className="visualizer-container">
                        <div className="v-bar" style={{ animationDelay: '0s' }}></div>
                        <div className="v-bar" style={{ animationDelay: '0.2s' }}></div>
                        <div className="v-bar" style={{ animationDelay: '0.4s' }}></div>
                        <div className="v-bar" style={{ animationDelay: '0.1s' }}></div>
                        <div className="v-bar" style={{ animationDelay: '0.5s' }}></div>
                        <div className="v-bar" style={{ animationDelay: '0.3s' }}></div>
                        <div className="v-bar" style={{ animationDelay: '0.1s' }}></div>
                    </div>

                    <div className="tech-container">
                        <div className="tech-pill">{t('transientica.tags.ml')}</div>
                        <div className="tech-pill">{t('transientica.tags.audio')}</div>
                        <div className="tech-pill">{t('transientica.tags.unity')}</div>
                        <div className="tech-pill">{t('transientica.tags.python')}</div>
                    </div>
                </section>

                {/* Video Showcase */}
                <section ref={addToRefs}>
                    <div
                        className={`video-wrapper interactive-video ${activeVideo === 'main-video' ? 'active' : ''}`}
                        onClick={() => handleVideoClick('main-video')}
                    >
                        <video
                            id="main-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/assets/images/projects/maxresdefault.jpg"
                        >
                            <source src="/assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4" type="video/mp4" />
                        </video>
                        <div className="play-overlay">
                            <div className="play-circle">
                                <div className="play-triangle"></div>
                            </div>
                            <span className="play-text">{t('transientica.video.watch_demo')}</span>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section ref={addToRefs}>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h4>{t('transientica.stats.latency_value')}</h4>
                            <p>{t('transientica.stats.latency_label')}</p>
                        </div>
                        <div className="stat-item">
                            <h4>{t('transientica.stats.accuracy_value')}</h4>
                            <p>{t('transientica.stats.accuracy_label')}</p>
                        </div>
                        <div className="stat-item">
                            <h4>{t('transientica.stats.classes_value')}</h4>
                            <p>{t('transientica.stats.classes_label')}</p>
                        </div>
                        <div className="stat-item">
                            <h4>{t('transientica.stats.year_value')}</h4>
                            <p>{t('transientica.stats.year_label')}</p>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section ref={addToRefs}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>{t('transientica.features.title')}</h2>
                    <div className="grid">
                        <div className="card">
                            <div className="card-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                            </div>
                            <h3>{t('transientica.features.realtime.title')}</h3>
                            <p>{t('transientica.features.realtime.desc')}</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            </div>
                            <h3>{t('transientica.features.ml.title')}</h3>
                            <p>{t('transientica.features.ml.desc')}</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <h3>{t('transientica.features.architecture.title')}</h3>
                            <p>{t('transientica.features.architecture.desc')}</p>
                        </div>
                    </div>
                </section>

                {/* Technical Deep Dive */}
                <section ref={addToRefs}>
                    <div className="container" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '3rem', border: '1px solid var(--border)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem', color: '#fff' }}>{t('transientica.technical.title')}</h2>
                        <div className="tech-deep-dive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.2rem' }}>{t('transientica.technical.spectral.title')}</h4>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                                    {t('transientica.technical.spectral.desc')}
                                </p>
                                <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.2rem' }}>{t('transientica.technical.optimization.title')}</h4>
                                <p style={{ color: 'var(--text-dim)' }}>
                                    {t('transientica.technical.optimization.desc')}
                                </p>
                            </div>
                            <div
                                className={`video-wrapper interactive-video ${activeVideo === 'tech-video' ? 'active' : ''}`}
                                style={{ height: '300px' }}
                                onClick={() => handleVideoClick('tech-video')}
                            >
                                <video
                                    id="tech-video"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    style={{ opacity: 0.8 }}
                                >
                                    <source src="/assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4" type="video/mp4" />
                                </video>
                                <div className="play-overlay">
                                    <div className="play-circle" style={{ width: '60px', height: '60px' }}>
                                        <div className="play-triangle" style={{ borderLeftWidth: '14px', borderTopWidth: '8px', borderBottomWidth: '8px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div className="cta-box">
                    <Link to="/projects" className="cta-btn">{t('transientica.cta.view_all')}</Link>
                    <p style={{ marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>&copy; 2025 Igor Szuniewicz</p>
                </div>

            </main>
        </div>
    );
};

export default Transientica;
