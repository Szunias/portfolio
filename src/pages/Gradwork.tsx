import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/gradwork.css';

const Gradwork = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [visibleElements, setVisibleElements] = useState({
        hero: false,
        well: false,
        flow: false,
        nightmare: false
    });

    // Refs for elements
    const heroRef = useRef<HTMLElement>(null);
    const wellRef = useRef<HTMLDivElement>(null);
    const flowRef = useRef<HTMLDivElement>(null);
    const nightmareRef = useRef<HTMLDivElement>(null);
    const autoscrollBtnRef = useRef<HTMLButtonElement>(null);

    // State for autoscroll
    const isAutoScrolling = useRef(false);

    useEffect(() => {
        // Simulate body.loaded
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                setVisibleElements(prev => ({ ...prev, [id]: entry.isIntersecting }));
            });
        }, { threshold: 0 });

        if (heroRef.current) observer.observe(heroRef.current);
        if (wellRef.current) observer.observe(wellRef.current);
        if (flowRef.current) observer.observe(flowRef.current);
        if (nightmareRef.current) observer.observe(nightmareRef.current);

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
            observer.disconnect();
            sectionObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        let ticking = false;

        const updateParallax = () => {
            if (!visibleElements.hero) return;
            const scrolled = window.scrollY;
            const heroSection = heroRef.current;

            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                const scrollPercent = scrolled / heroHeight;

                const heroTitle = document.getElementById('heroTitle');
                if (heroTitle && scrollPercent < 1) {
                    const translateX = scrollPercent * 30;
                    const opacity = 1 - (scrollPercent * 1.5);
                    heroTitle.style.transform = `translate3d(${translateX}vw, 0, 0)`;
                    heroTitle.style.opacity = Math.max(0, opacity).toString();
                }

                const cloud1 = document.querySelector('.cloud-1') as HTMLElement;
                const cloud2 = document.querySelector('.cloud-2') as HTMLElement;

                if (cloud1 && scrollPercent < 1) {
                    cloud1.style.transform = `translate3d(${-scrollPercent * 300}px, 0, 0)`;
                    cloud1.style.opacity = (1 - scrollPercent).toString();
                }

                if (cloud2 && scrollPercent < 1) {
                    cloud2.style.transform = `translate3d(${scrollPercent * 300}px, 0, 0)`;
                    cloud2.style.opacity = (1 - scrollPercent).toString();
                }
            }
        };

        const updateScrollAnimations = () => {
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            // 1. Well transition
            if (visibleElements.well && wellRef.current) {
                const wellRect = wellRef.current.getBoundingClientRect();
                const wellTop = scrollY + wellRect.top;
                const wellHeight = wellRect.height;
                const wellProgress = Math.max(0, Math.min(1, (scrollY + windowHeight - wellTop) / (windowHeight + wellHeight * 0.5)));

                const wellContent = wellRef.current.querySelector('.well-transition-content') as HTMLElement;
                if (wellContent) {
                    wellContent.style.opacity = wellProgress > 0.2 ? '1' : '0';
                }

                const dots = wellRef.current.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    const dotThreshold = 0.3 + (index * 0.2);
                    const d = dot as HTMLElement;
                    if (wellProgress > dotThreshold) {
                        d.style.opacity = '1';
                        d.style.transform = 'translateY(0)';
                    } else {
                        d.style.opacity = '0';
                        d.style.transform = 'translateY(10px)';
                    }
                });
            }

            // 2. Architecture Flow
            if (visibleElements.flow && flowRef.current) {
                const flowRect = flowRef.current.getBoundingClientRect();
                const flowTop = scrollY + flowRect.top;
                const flowHeight = flowRect.height;
                const rawProgress = (scrollY + windowHeight * 0.5 - flowTop) / flowHeight;
                const animationEndPoint = 1.0;
                const flowProgress = Math.max(0, Math.min(1, rawProgress / animationEndPoint));

                const flowContent = flowRef.current.querySelector('.architecture-flow-content') as HTMLElement;
                const animationComplete = rawProgress > animationEndPoint;

                if (flowContent) {
                    flowContent.style.opacity = (!animationComplete && flowProgress > 0) ? '1' : '0';
                    flowContent.style.pointerEvents = 'none';
                }

                const nodes = flowRef.current.querySelectorAll('.flow-node');
                const lines = flowRef.current.querySelectorAll('.flow-line');
                const successMessage = flowRef.current.querySelector('#flowSuccessMessage') as HTMLElement;

                const P1_END = 0.2;
                const P2_END = 0.4;
                const P3_END = 0.6;

                const resetElement = (el: Element) => {
                    const e = el as HTMLElement;
                    if (e) { e.style.opacity = '0'; e.classList.remove('filling', 'filled'); }
                };
                const fillElement = (el: Element) => {
                    const e = el as HTMLElement;
                    if (e) { e.style.opacity = '1'; e.classList.add('filled'); e.classList.remove('filling'); }
                };

                // Phase 1: Unity
                if (flowProgress <= P1_END) {
                    const localProgress = flowProgress / P1_END;
                    const n0 = nodes[0] as HTMLElement;
                    if (n0) {
                        if (localProgress <= 0.5) {
                            const slideProgress = localProgress / 0.5;
                            n0.style.opacity = Math.min(1, slideProgress * 2).toString();
                            n0.style.transform = `translateY(${-200 * (1 - slideProgress)}px)`;
                            n0.classList.remove('filling', 'filled');
                        } else {
                            n0.style.opacity = '1';
                            n0.style.transform = 'translateY(0)';
                            n0.classList.add('filling');
                            if (localProgress > 0.95) { n0.classList.remove('filling'); n0.classList.add('filled'); }
                        }
                    }
                    resetElement(nodes[1]); resetElement(nodes[2]);
                    resetElement(lines[0]); resetElement(lines[1]);
                }
                // Phase 2: Python
                else if (flowProgress <= P2_END) {
                    const localProgress = (flowProgress - P1_END) / (P2_END - P1_END);
                    fillElement(nodes[0]);

                    const l0 = lines[0] as HTMLElement;
                    const n1 = nodes[1] as HTMLElement;

                    if (localProgress <= 0.5) {
                        if (l0) { l0.style.opacity = '1'; l0.classList.add('filling'); }
                        if (n1) { n1.style.opacity = '1'; n1.classList.remove('filling', 'filled'); }
                    } else {
                        if (l0) { l0.classList.remove('filling'); l0.classList.add('filled'); }
                        if (n1) {
                            n1.style.opacity = '1';
                            n1.classList.add('filling');
                            if (localProgress > 0.95) { n1.classList.remove('filling'); n1.classList.add('filled'); }
                        }
                    }
                    resetElement(nodes[2]); resetElement(lines[1]);
                }
                // Phase 3: ElevenLabs
                else if (flowProgress <= P3_END) {
                    const localProgress = (flowProgress - P2_END) / (P3_END - P2_END);
                    fillElement(nodes[0]); fillElement(nodes[1]); fillElement(lines[0]);

                    const l1 = lines[1] as HTMLElement;
                    const n2 = nodes[2] as HTMLElement;

                    if (localProgress <= 0.5) {
                        if (l1) { l1.style.opacity = '1'; l1.classList.add('filling'); }
                        if (n2) { n2.style.opacity = '1'; n2.classList.remove('filling', 'filled'); }
                    } else {
                        if (l1) { l1.classList.remove('filling'); l1.classList.add('filled'); }
                        if (n2) {
                            n2.style.opacity = '1';
                            n2.classList.add('filling');
                            if (localProgress > 0.95) { n2.classList.remove('filling'); n2.classList.add('filled'); }
                        }
                    }
                }
                // Phase 4: Success
                else {
                    const localProgress = (flowProgress - P3_END) / (1.0 - P3_END);
                    fillElement(nodes[0]); fillElement(nodes[1]); fillElement(nodes[2]);
                    fillElement(lines[0]); fillElement(lines[1]);

                    if (localProgress < 0.25) {
                        const fadeOpacity = 1 - (localProgress / 0.25);
                        nodes.forEach(n => (n as HTMLElement).style.opacity = fadeOpacity.toString());
                        lines.forEach(l => (l as HTMLElement).style.opacity = fadeOpacity.toString());
                        if (successMessage) successMessage.style.opacity = '0';
                    } else {
                        nodes.forEach(n => (n as HTMLElement).style.opacity = '0');
                        lines.forEach(l => (l as HTMLElement).style.opacity = '0');

                        if (successMessage) {
                            if (localProgress < 0.75) {
                                const fillP = (localProgress - 0.25) / 0.5;
                                successMessage.style.opacity = '1';
                                successMessage.style.backgroundPosition = `${100 - (fillP * 100)}% 0`;
                            } else {
                                successMessage.style.opacity = '1';
                                successMessage.style.backgroundPosition = '0% 0';
                            }
                        }
                    }
                }
            }

            // 3. Nightmare Scroll
            if (visibleElements.nightmare && nightmareRef.current) {
                const container = nightmareRef.current;
                const rect = container.getBoundingClientRect();
                const sectionHeight = rect.height;
                const scrollPastStart = windowHeight - rect.top;
                let rawProgress = (scrollPastStart - (windowHeight * 0.5)) / (sectionHeight - windowHeight);
                const progress = Math.max(0, Math.min(1, rawProgress));

                const timerText = container.querySelector('.nightmare-timer') as HTMLElement;
                const labelText = container.querySelector('.nightmare-label') as HTMLElement;

                let ms = 0;
                if (progress < 0.15) {
                    ms = (progress / 0.15) * 16;
                } else if (progress < 0.4) {
                    const p = (progress - 0.15) / 0.25;
                    ms = 16 + (p * 84);
                } else {
                    const p = (progress - 0.4) / 0.6;
                    ms = 100 + (p * p * p * 11900);
                }

                if (timerText) {
                    timerText.textContent = `${Math.floor(ms)} ms`;
                    timerText.style.opacity = (0.2 + (progress * 0.8)).toString();
                    const scale = 1 + (progress * 0.2);

                    if (ms < 16) {
                        timerText.style.color = '#333333';
                        timerText.style.textShadow = 'none';
                        timerText.style.transform = `scale(${scale})`;
                        container.style.setProperty('--nightmare-scale', '0');
                        container.classList.remove('active-nightmare');
                        if (labelText) {
                            labelText.textContent = "TARGET: 16ms";
                            labelText.style.opacity = '1';
                            labelText.style.color = '#666666';
                        }
                    } else if (ms < 100) {
                        timerText.style.color = '#991b1b';
                        timerText.style.textShadow = 'none';
                        timerText.style.transform = `scale(${scale})`;
                        container.style.setProperty('--nightmare-scale', '0');
                        container.classList.remove('active-nightmare');
                        if (labelText) {
                            labelText.textContent = "WARNING: LAG DETECTED";
                            labelText.style.color = '#991b1b';
                        }
                    } else {
                        timerText.style.color = '#dc2626';
                        const horrorProgress = Math.max(0, (progress - 0.4) / 0.6);
                        const circleScale = horrorProgress * horrorProgress * 8;
                        container.style.setProperty('--nightmare-scale', circleScale.toString());
                        const auraOpacity = Math.min(1, horrorProgress * 2);
                        container.style.setProperty('--aura-opacity', auraOpacity.toString());

                        if (ms > 5000) {
                            const flicker = 0.8 + (Math.random() * 0.2);
                            container.style.setProperty('--aura-opacity', (auraOpacity * flicker).toString());
                            if (labelText) {
                                labelText.textContent = "SYSTEM FAILURE";
                                labelText.style.color = '#dc2626';
                            }
                            const shakeX = (Math.random() - 0.5) * 15 * progress;
                            const shakeY = (Math.random() - 0.5) * 8 * progress;
                            timerText.style.transform = `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`;
                            timerText.style.textShadow = `2px 0 #fff, -2px 0 #000`;
                        } else {
                            if (labelText) {
                                labelText.textContent = "UNPLAYABLE";
                                labelText.style.color = '#dc2626';
                            }
                            timerText.style.transform = `scale(${scale})`;
                            timerText.style.textShadow = 'none';
                        }
                    }
                }
            }

            // Autoscroll button logic
            const autoscrollBtn = autoscrollBtnRef.current;
            if (autoscrollBtn && !isAutoScrolling.current) {
                const target = determineAutoscrollTarget(scrollY, windowHeight);
                if (target) {
                    const textSpan = autoscrollBtn.querySelector('span');
                    if (textSpan) textSpan.textContent = target.label;
                    autoscrollBtn.dataset.targetY = target.target.toString();
                    autoscrollBtn.dataset.duration = target.duration.toString();
                    autoscrollBtn.classList.add('visible');
                } else {
                    autoscrollBtn.classList.remove('visible');
                }
            }
        };

        const determineAutoscrollTarget = (scrollY: number, windowHeight: number) => {
            if (!wellRef.current || !flowRef.current) return null;

            const wellRect = wellRef.current.getBoundingClientRect();
            const wellTop = scrollY + wellRect.top;
            const wellBottom = scrollY + wellRect.bottom;

            const flowRect = flowRef.current.getBoundingClientRect();
            const flowTop = scrollY + flowRect.top;
            const flowBottom = scrollY + flowRect.bottom;

            const beforeWell = scrollY < wellTop - (windowHeight * 0.3);
            const betweenSections = scrollY >= wellBottom && scrollY < flowTop - (windowHeight * 0.3);

            if (beforeWell) {
                return { label: 'Auto Play', target: wellBottom, duration: 5000 };
            } else if (betweenSections) {
                return { label: 'Auto Play', target: flowBottom, duration: 10000 };
            }
            return null;
        };

        const loop = () => {
            updateParallax();
            updateScrollAnimations();
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateParallax();
                    updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', loop, { passive: true });
        loop();

        return () => window.removeEventListener('scroll', loop);
    }, [visibleElements]);

    const smoothScrollTo = (targetY: number, duration: number) => {
        isAutoScrolling.current = true;
        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();
        const originalScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';

        const scrollStep = (currentTime: number) => {
            if (!isAutoScrolling.current) {
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
                return;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            window.scrollTo(0, startY + distance * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(scrollStep);
            } else {
                isAutoScrolling.current = false;
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
            }
        };
        requestAnimationFrame(scrollStep);
    };

    const handleAutoscroll = () => {
        const btn = autoscrollBtnRef.current;
        if (btn) {
            const targetY = parseInt(btn.dataset.targetY || '0');
            const duration = parseInt(btn.dataset.duration || '0');
            if (targetY && duration) {
                smoothScrollTo(targetY, duration);
                btn.classList.remove('visible');
            }
        }
    };

    // Stop autoscroll on interaction
    useEffect(() => {
        const stopAutoscroll = () => { if (isAutoScrolling.current) isAutoScrolling.current = false; };
        window.addEventListener('wheel', stopAutoscroll, { passive: true });
        window.addEventListener('touchstart', stopAutoscroll, { passive: true });
        window.addEventListener('keydown', stopAutoscroll, { passive: true });
        return () => {
            window.removeEventListener('wheel', stopAutoscroll);
            window.removeEventListener('touchstart', stopAutoscroll);
            window.removeEventListener('keydown', stopAutoscroll);
        };
    }, []);

    return (
        <div className={`gradwork-page ${isLoaded ? 'loaded' : ''}`}>
            <section className="hero-section" id="hero" ref={heroRef}>
                <div className="clouds-container">
                    <div className="cloud cloud-1"></div>
                    <div className="cloud cloud-2"></div>
                </div>

                <div className="hero-title-container">
                    <span className="hero-badge">Ongoing Research</span>
                    <h1 className="hero-title" id="heroTitle">
                        Is AI Audio in Real-Time<br />Possible in Games?
                    </h1>
                    <p className="hero-subtitle">
                        A Graduate Research Journey Through AI Audio Generation
                    </p>
                </div>

                <div className="scroll-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </section>

            <div className="well-transition" id="well" ref={wellRef}>
                <div className="well-transition-content">
                    <span className="well-text">well</span>
                    <span className="well-dots">
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                    </span>
                </div>
            </div>

            <main className="main-content">
                <section className="section" data-section="1">
                    <div className="section-number">1</div>
                    <h2 className="section-title">What's This Project About?</h2>
                    <div className="section-content">
                        <p>
                            You might be wondering why anyone would even try to generate sounds with AI in games.
                            Well, it's actually a pretty cool question - what if instead of having hundreds
                            of pre-recorded sound effects, games could create them on the fly? Sounds like
                            science fiction, right?
                        </p>
                        <p>
                            So for the past few weeks, I've been testing exactly that. The main question was:
                        </p>
                        <div className="highlight-box">
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                Is AI fast enough that players wouldn't even notice the delay between an action and its sound?
                            </p>
                        </div>
                        <p>
                            <strong>Current Findings:</strong>
                            <span>
                                The direct answer so far: AI is too slow for instant playback. BUT - I'm exploring a workaround to use AI quality in games. How? Keep reading.
                            </span>
                        </p>
                    </div>
                </section>

                <div className="architecture-flow" id="flow" ref={flowRef}>
                    <div className="architecture-flow-content">
                        <div className="flow-container">
                            <div className="flow-node">
                                <div className="flow-node-title">Unity (C#)</div>
                                <div className="flow-node-subtitle">Game Engine</div>
                            </div>

                            <svg className="flow-line" data-line="1" viewBox="0 0 4 120">
                                <line x1="2" y1="0" x2="2" y2="120" stroke="#4f46e5" strokeWidth="2" />
                            </svg>

                            <div className="flow-node">
                                <div className="flow-node-title">Python</div>
                                <div className="flow-node-subtitle">WebSocket Server</div>
                            </div>

                            <svg className="flow-line" data-line="2" viewBox="0 0 4 120">
                                <line x1="2" y1="0" x2="2" y2="120" stroke="#4f46e5" strokeWidth="2" />
                            </svg>

                            <div className="flow-node">
                                <div className="flow-node-title">ElevenLabs</div>
                                <div className="flow-node-subtitle">AI Audio API</div>
                            </div>

                            <div className="flow-success-message" id="flowSuccessMessage">SUCCESS</div>
                        </div>
                    </div>
                </div>

                <section className="section" data-section="2">
                    <div className="section-number">2</div>
                    <h2 className="section-title">Making Unity and Python Talk</h2>
                    <div className="section-content">
                        <h3>Phase 1: First Attempts</h3>
                        <p>
                            At first, I had to figure out the basics - connecting Unity with Python through WebSocket.
                            Sounds complicated, but in practice Unity just says "hey Python, give me a gunshot sound",
                            and Python generates it and sends it back.
                        </p>

                        <div className="highlight-box">
                            <p><strong>Technical Architecture</strong></p>
                            <p style={{ fontFamily: 'monospace', marginTop: '1rem' }}>
                                Unity (C#) ⟷ WebSocket ⟷ Python Server
                            </p>
                        </div>

                        <h4>Initial Performance Results</h4>
                        <p>First tests with a simple procedural generator looked promising:</p>

                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>Sound Type</th>
                                    <th>Latency</th>
                                    <th>Verdict</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Footstep</td>
                                    <td>55 ms</td>
                                    <td>✓ Excellent</td>
                                </tr>
                                <tr>
                                    <td>Gunshot</td>
                                    <td>21 ms</td>
                                    <td>✓ Excellent</td>
                                </tr>
                                <tr>
                                    <td>Impact</td>
                                    <td>28 ms</td>
                                    <td>✓ Excellent</td>
                                </tr>
                            </tbody>
                        </table>

                        <p>
                            Sounds great! Everything under 60ms is practically unnoticeable to players.
                            The only problem was that these sounds, well... sounded synthetic.
                            Like something from a 90s game. I needed something better.
                        </p>
                    </div>
                </section>

                <div className="nightmare-scroll" id="nightmare" ref={nightmareRef}>
                    <div className="nightmare-content">
                        <div className="nightmare-timer">00 ms</div>
                        <div className="nightmare-label">TARGET: 16ms</div>
                    </div>
                </div>

                <section className="section" data-section="3">
                    <div className="section-number">3</div>
                    <h2 className="section-title">The 12-Second Nightmare</h2>
                    <div className="section-content">
                        <p>
                            I expected latency. I didn't expect <em>this</em>.
                        </p>

                        <div className="highlight-box" style={{ background: '#fff0f0', borderLeftColor: '#dc3545' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545', margin: 0 }}>
                                12.000 ms
                            </p>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                                Time to generate one footstep with AudioLDM.
                            </p>
                        </div>

                        <p>
                            In a game running at 60 FPS, a footstep needs to happen in 16 milliseconds.
                            My first attempt was <strong>750 times too slow</strong>.
                            Even the faster MusicGen model took 4 seconds.
                            In the world of game development, 4 seconds is an eternity. It was a complete failure.
                        </p>
                    </div>
                </section>

                <section className="section" data-section="4">
                    <div className="section-number">4</div>
                    <h2 className="section-title">The 0.03ms Anomaly</h2>
                    <div className="section-content">
                        <p>
                            I was ready to scrap the project. But then, during a frustration-filled debug session, I noticed something weird in the logs.
                        </p>

                        <div className="code-snippet">
                            {`[LOG] Gen_Request_01: 4102ms
[LOG] Gen_Request_02: 4098ms
[LOG] Gen_Request_01: 0.03ms  <-- ???`}
                        </div>

                        <p>
                            The second time I requested the <em>same</em> sound, it didn't generate it. It pulled it from memory.
                            It was instant. Faster than any hard drive reading a WAV file.
                        </p>

                        <div className="highlight-box">
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                "We don't need to be fast. We just need to be early."
                            </p>
                        </div>
                    </div>
                </section>

                <section className="section" data-section="5">
                    <div className="section-number">5</div>
                    <h2 className="section-title">Cheating Time</h2>
                    <div className="section-content">
                        <p>
                            If we can't generate sound in real-time, we have to generate it <em>before</em> it happens.
                            This shifted the entire architecture from "Reaction" to "Prediction".
                        </p>

                        <div className="stats-grid">
                            <div className="stat-card" style={{ border: '2px solid #10b981', background: '#f0fdf4' }}>
                                <span className="stat-value" style={{ color: '#059669' }}>Loading...</span>
                                <span className="stat-label">The Trick</span>
                            </div>
                        </div>

                        <p>
                            I built a system that uses the loading screen—a place where players expect to wait—to "hallucinate" the audio for the level ahead.
                            By the time the player spawns, the AI has already done the heavy lifting.
                            The result? <strong>Zero latency. High-fidelity AI audio.</strong>
                        </p>
                    </div>
                </section>

                <section className="section" data-section="6">
                    <div className="section-number">6</div>
                    <h2 className="section-title">The New Problem: Memory vs. Chaos</h2>
                    <div className="section-content">
                        <p>
                            So we solved the speed limit by "cheating" with the loading screen.
                            But this victory created a new, more dangerous enemy: <strong>RAM Usage</strong>.
                        </p>

                        <div className="highlight-box" style={{ background: '#fff8e1', borderLeftColor: '#f59e0b' }}>
                            <p style={{ fontSize: '1.1rem', margin: 0, color: '#b45309' }}>
                                If we pre-generate <em>every</em> possible sound for an open-world game, we would need terabytes of RAM.
                                We traded CPU time for Memory, and now we're running out of space.
                            </p>
                        </div>

                        <p>
                            This is where my research is <strong>right now</strong>.
                            I am moving away from "Pre-generate Everything" to something smarter:
                            <strong>Predictive Buffering</strong>.
                        </p>
                    </div>
                </section>

                <section className="section" data-section="7">
                    <div className="section-number">7</div>
                    <h2 className="section-title">Active Experiments</h2>
                    <div className="section-content">
                        <p>
                            I am currently running three parallel experiments to solve the memory crisis:
                        </p>

                        <div className="stats-grid">
                            <div className="stat-card" style={{ border: '1px solid #e5e7eb' }}>
                                <span className="stat-value" style={{ fontSize: '1.5rem' }}>Smart Cleanup</span>
                                <span className="stat-label" style={{ marginTop: '0.5rem' }}>Deleting sounds immediately after they are played to free up RAM.</span>
                            </div>
                            <div className="stat-card" style={{ border: '1px solid #e5e7eb' }}>
                                <span className="stat-value" style={{ fontSize: '1.5rem' }}>The 10s Window</span>
                                <span className="stat-label" style={{ marginTop: '0.5rem' }}>AI that guesses what you will do in the next 10 seconds and generates ONLY that.</span>
                            </div>
                        </div>

                        <div className="status-box" style={{ marginTop: '3rem' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>
                                Research Status: ACTIVE
                            </p>
                            <p style={{ margin: 0, color: '#666' }}>
                                The "0.03ms Cache" works, but making it scalable is the new frontier.
                                I am currently coding the prediction algorithm in Python.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="project-footer">
                <Link to="/projects" className="back-link">← Back to Projects</Link>
                <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem' }}>
                    Graduate Research Project • Ongoing • 2025 • Igor Szuniewicz
                </p>
            </footer>

            <button
                id="autoscrollBtn"
                className="autoscroll-btn"
                aria-label="Auto play animation"
                ref={autoscrollBtnRef}
                onClick={handleAutoscroll}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Auto Play</span>
            </button>
        </div>
    );
};

export default Gradwork;
