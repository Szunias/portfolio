import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/middleware-optimization.css';

const MiddlewareOptimization = () => {
    const { t } = useTranslation('middlewareOptimization');
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

        document.querySelectorAll('.project-card, .skill-card').forEach(section => {
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

    return (
        <div className={`middleware-optimization-page ${isLoaded ? 'loaded' : ''}`}>
            {/* Hero Section */}
            <section className="hero-section" id="hero" ref={heroRef}>
                <div className="hero-title-container">
                    <span className="hero-badge">{t('hero.tag')}</span>
                    <h1 className="hero-title" id="heroTitle">
                        {t('hero.title')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('hero.lead')}
                    </p>

                    {/* Wwise Logo */}
                    <div className="wwise-logo-container">
                        <img
                            src="/assets/images/projects-pausedeserve/wwise_logo_rgb-77Awrfoo.png"
                            alt="Wwise Logo"
                            className="wwise-logo"
                        />
                    </div>

                    {/* Context Note */}
                    <div className="context-note">
                        <p>{t('hero.context')}</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="quick-stats">
                        <div className="stat-item">
                            <span className="stat-number">{t('hero.stat1_num')}</span>
                            <span className="stat-text">{t('hero.stat1_text')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{t('hero.stat2_num')}</span>
                            <span className="stat-text">{t('hero.stat2_text')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{t('hero.stat3_num')}</span>
                            <span className="stat-text">{t('hero.stat3_text')}</span>
                        </div>
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
                {/* Section Header */}
                <section className="section-header" ref={sectionRef}>
                    <h2 className="section-title">{t('section.title')}</h2>
                    <p className="section-subtitle">{t('section.subtitle')}</p>
                </section>

                {/* Project 1: Boney Boogaloo */}
                <article className="project-card">
                    <div className="project-header">
                        <h3 className="project-title">{t('boney.title')}</h3>
                        <div className="project-meta">
                            <span className="meta-badge">{t('boney.badge1')}</span>
                            <span className="meta-badge">{t('boney.badge2')}</span>
                            <span className="meta-badge time">{t('boney.badge3')}</span>
                        </div>
                    </div>

                    {/* Video Section */}
                    <div className="video-section">
                        <h4 className="video-title">{t('boney.video_title')}</h4>
                        <video
                            controls
                            preload="metadata"
                            poster="/wwiseprojectsinfo/images/BoneyBoogaloo.png"
                        >
                            <source
                                src="/wwiseprojectsinfo/videos/boneyboogaloo/optboo.mp4"
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                        <p className="video-caption">{t('boney.video_caption')}</p>
                    </div>

                    <div className="project-story">
                        <p>{t('boney.p1')}</p>
                        <p>{t('boney.p2')}</p>
                        <p>{t('boney.p3')}</p>
                        <p>{t('boney.p4')}</p>
                    </div>
                </article>

                {/* Project 2: Ellen */}
                <article className="project-card">
                    <div className="project-header">
                        <h3 className="project-title">{t('ellen.title')}</h3>
                        <div className="project-meta">
                            <span className="meta-badge">{t('ellen.badge1')}</span>
                            <span className="meta-badge">{t('ellen.badge2')}</span>
                            <span className="meta-badge time">{t('ellen.badge3')}</span>
                        </div>
                    </div>

                    {/* Video Section */}
                    <div className="video-section">
                        <h4 className="video-title">{t('ellen.video_title')}</h4>
                        <div className="vimeo-wrapper">
                            <iframe
                                src="https://player.vimeo.com/video/1135151616?badge=0&autopause=0&player_id=0&app_id=58479"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                title="Ellen - Wwise Integration"
                            />
                        </div>
                        <p className="video-caption">{t('ellen.video_caption')}</p>
                    </div>

                    <div className="project-story">
                        <p>{t('ellen.p1')}</p>
                        <p>{t('ellen.p2')}</p>
                        <p>{t('ellen.p3')}</p>
                        <p>{t('ellen.p4')}</p>
                    </div>
                </article>

                {/* Project 3: Stomach Aches */}
                <article className="project-card">
                    <div className="project-header">
                        <h3 className="project-title">{t('stomach.title')}</h3>
                        <div className="project-meta">
                            <span className="meta-badge">{t('stomach.badge1')}</span>
                            <span className="meta-badge">{t('stomach.badge2')}</span>
                            <span className="meta-badge time">{t('stomach.badge3')}</span>
                        </div>
                    </div>

                    {/* Video Section */}
                    <div className="video-section">
                        <h4 className="video-title">{t('stomach.video_title')}</h4>
                        <video
                            controls
                            preload="metadata"
                            poster="/wwiseprojectsinfo/images/StomachAches.png"
                        >
                            <source
                                src="/wwiseprojectsinfo/videos/stomachaches/optstomachaches.mp4"
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                        <p className="video-caption">{t('stomach.video_caption')}</p>
                    </div>

                    <div className="project-story">
                        <p>{t('stomach.p1')}</p>
                        <p>{t('stomach.p2')}</p>
                        <p>{t('stomach.p3')}</p>
                        <p>{t('stomach.p4')}</p>
                    </div>
                </article>

                {/* Skills Section */}
                <section className="skills-section">
                    <h2 className="section-title">{t('learned.title')}</h2>
                    <p className="section-subtitle">{t('learned.subtitle')}</p>

                    <div className="skills-grid">
                        <div className="skill-card">
                            <h3 className="skill-name">{t('learned.skill1_name')}</h3>
                            <p className="skill-desc">{t('learned.skill1_desc')}</p>
                        </div>

                        <div className="skill-card">
                            <h3 className="skill-name">{t('learned.skill2_name')}</h3>
                            <p className="skill-desc">{t('learned.skill2_desc')}</p>
                        </div>

                        <div className="skill-card">
                            <h3 className="skill-name">{t('learned.skill3_name')}</h3>
                            <p className="skill-desc">{t('learned.skill3_desc')}</p>
                        </div>

                        <div className="skill-card">
                            <h3 className="skill-name">{t('learned.skill4_name')}</h3>
                            <p className="skill-desc">{t('learned.skill4_desc')}</p>
                        </div>

                        <div className="skill-card">
                            <h3 className="skill-name">{t('learned.skill5_name')}</h3>
                            <p className="skill-desc">{t('learned.skill5_desc')}</p>
                        </div>

                        <div className="skill-card">
                            <h3 className="skill-name">{t('learned.skill6_name')}</h3>
                            <p className="skill-desc">{t('learned.skill6_desc')}</p>
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
                    {t('back')}
                </Link>
                <p className="footer-status">
                    {t('footer')}
                </p>
            </footer>
        </div>
    );
};

export default MiddlewareOptimization;
