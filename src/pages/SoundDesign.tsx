import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/sound-design.css';

const SoundDesign = () => {
    const { t } = useTranslation('soundDesign');
    const [isLoaded, setIsLoaded] = useState(false);

    // Refs for elements
    const heroRef = useRef<HTMLElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Simulate body.loaded
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Section reveal animations
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

        document.querySelectorAll('.section').forEach(section => {
            sectionObserver.observe(section);
        });

        return () => {
            sectionObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        let ticking = false;

        const updateScrollAnimations = () => {
            if (!heroRef.current) return;

            const scrolled = window.scrollY;
            const heroSection = heroRef.current;
            const heroHeight = heroSection.offsetHeight;
            const scrollPercent = scrolled / heroHeight;

            const heroTitle = document.getElementById('heroTitle');
            if (heroTitle && scrollPercent < 1) {
                const opacity = 1 - (scrollPercent * 1.5);
                heroTitle.style.opacity = Math.max(0, opacity).toString();
            }
        };

        const loop = () => {
            updateScrollAnimations();
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', loop, { passive: true });
        loop();

        return () => window.removeEventListener('scroll', loop);
    }, []);

    // Custom Video Player Logic
    useEffect(() => {
        const players = document.querySelectorAll('.custom-video-player');

        players.forEach(player => {
            const video = player.querySelector('video') as HTMLVideoElement;
            const posterWrapper = player.querySelector('.video-poster-wrapper') as HTMLElement;

            if (!video || !posterWrapper) return;

            const playVideo = () => {
                posterWrapper.classList.add('hidden');
                video.play();
                video.controls = true;
            };

            posterWrapper.addEventListener('click', playVideo);

            video.addEventListener('ended', () => {
                posterWrapper.classList.remove('hidden');
                video.controls = false;
            });
        });
    }, []);

    return (
        <div className={`sound-design-page ${isLoaded ? 'loaded' : ''}`}>
            {/* Hero Section */}
            <section className="hero-section" id="hero" ref={heroRef}>
                <div className="hero-title-container">
                    <span className="hero-badge">{t('hero.badge')}</span>
                    <h1 className="hero-title" id="heroTitle">
                        {t('hero.title')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('hero.subtitle')}
                    </p>

                    {/* Tools Grid */}
                    <div className="tools-container">
                        <img src="/assets/images/tools/reaper.png" alt="Reaper" className="tool-icon" title="Reaper" />
                        <img src="/assets/images/tools/logic.png" alt="Logic Pro" className="tool-icon" title="Logic Pro" />
                        <img src="/assets/images/tools/cubase.png" alt="Cubase" className="tool-icon" title="Cubase" />
                        <img src="/assets/images/tools/studioone.png" alt="Studio One" className="tool-icon" title="Studio One" />
                        <img src="/assets/images/tools/3daudio.png" alt="3D Audio" className="tool-icon" title="3D Audio" />
                    </div>
                </div>

                <div className="scroll-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </section>

            {/* Main Content */}
            <main className="main-content">
                {/* Video Section */}
                <section className="section" ref={sectionRef}>
                    <h2 className="section-title">{t('section1.title')}</h2>

                    <div className="video-grid">
                        {/* Video 1: God of War */}
                        <div className="video-card custom-video-player">
                            <div className="video-wrapper">
                                <div
                                    className="video-poster-wrapper"
                                    style={{ backgroundImage: "url('/assets/images/godofwarkrotos.jpg')" }}
                                >
                                    <div className="custom-play-btn">
                                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                                <video playsInline preload="metadata">
                                    <source src="/assets/videos/krotosvideo.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{t('section1.video1.title')}</h3>
                                <p className="video-description">{t('section1.video1.description')}</p>
                                <span className="video-badge">{t('section1.video1.badge')}</span>
                            </div>
                        </div>

                        {/* Video 2: Baldur's Gate */}
                        <div className="video-card custom-video-player">
                            <div className="video-wrapper">
                                <div
                                    className="video-poster-wrapper"
                                    style={{ backgroundImage: "url('/assets/images/baldurspreview.png')" }}
                                >
                                    <div className="custom-play-btn">
                                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                                <video playsInline preload="metadata">
                                    <source src="/assets/videos/baldursremake.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{t('section1.video2.title')}</h3>
                                <p className="video-description">{t('section1.video2.description')}</p>
                                <span className="video-badge">{t('section1.video2.badge')}</span>
                            </div>
                        </div>

                        {/* Video 3: Weapon Sound Design - SIGNAL OFFLINE */}
                        <div className="video-card">
                            <div className="video-wrapper">
                                <div className="offline-placeholder">
                                    {/* Background Grid Pattern */}
                                    <div className="offline-grid"></div>

                                    {/* Scan Line Element */}
                                    <div className="scan-line"></div>

                                    {/* Content */}
                                    <div className="offline-content">
                                        <div className="offline-icon-ring">
                                            {/* Muted/Locked Audio Waveform */}
                                            <svg className="offline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                                            </svg>
                                        </div>
                                        <h4 className="offline-title">{t('section1.video3.placeholder_title')}</h4>
                                        <p className="offline-subtitle">{t('section1.video3.placeholder_subtitle')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{t('section1.video3.title')}</h3>
                                <p className="video-description">{t('section1.video3.description')}</p>
                                <span className="video-badge">{t('section1.video3.badge')}</span>
                            </div>
                        </div>

                        {/* Video 4: Fracture Horizon */}
                        <div className="video-card custom-video-player">
                            <div className="video-wrapper">
                                <div
                                    className="video-poster-wrapper"
                                    style={{ backgroundImage: "url('/assets/images/frafturedhorizon.png')" }}
                                >
                                    <div className="custom-play-btn">
                                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                                <video playsInline preload="metadata">
                                    <source src="/assets/videos/fracturedhorzion.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{t('section1.video4.title')}</h3>
                                <p className="video-description">{t('section1.video4.description')}</p>
                                <span className="video-badge">{t('section1.video4.badge')}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="project-footer">
                <Link to="/projects" className="back-link">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    {t('footer.back_link')}
                </Link>
                <p className="footer-status">
                    {t('footer.status')}
                </p>
            </footer>
        </div>
    );
};

export default SoundDesign;
