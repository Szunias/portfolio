import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ChevronDown, Play } from 'lucide-react';
import SEO from '../components/layout/SEO';
import { useTranslation } from 'react-i18next';

// ============================================================================
// HERO SECTION WITH PARALLAX
// ============================================================================

const HeroSection = ({ t }: { t: (key: string) => string }) => {
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const titleX = useTransform(scrollYProgress, [0, 1], ["0vw", "30vw"]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    const cloud1X = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const cloud2X = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const cloudOpacity = useTransform(scrollYProgress, [0, 0.8], [0.8, 0]);

    return (
        <section
            ref={heroRef}
            className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white"
        >
            {/* Clouds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    style={{ x: cloud1X, opacity: cloudOpacity }}
                    className="absolute top-[20%] -left-[150px] w-[300px] h-[100px] bg-white/90 rounded-[100px] shadow-[0_0_40px_rgba(0,0,0,0.1)]"
                >
                    <div className="absolute w-[100px] h-[100px] bg-white/90 rounded-full -top-[50px] left-[50px]" />
                    <div className="absolute w-[120px] h-[120px] bg-white/90 rounded-full -top-[60px] right-[50px]" />
                </motion.div>
                <motion.div
                    style={{ x: cloud2X, opacity: cloudOpacity }}
                    className="absolute top-[60%] -right-[175px] w-[350px] h-[120px] bg-white/90 rounded-[100px] shadow-[0_0_40px_rgba(0,0,0,0.1)]"
                >
                    <div className="absolute w-[120px] h-[120px] bg-white/90 rounded-full -top-[60px] left-[60px]" />
                    <div className="absolute w-[140px] h-[140px] bg-white/90 rounded-full -top-[70px] right-[60px]" />
                </motion.div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center px-8 max-w-[1200px]">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-amber-100/50 text-amber-700 text-sm font-semibold rounded-full mb-6 uppercase tracking-wide"
                >
                    {t('hero.badge')}
                </motion.span>
                <motion.h1
                    style={{ x: titleX, opacity: titleOpacity }}
                    className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[1.1] tracking-tight text-slate-900"
                >
                    {t('hero.title')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-[clamp(1rem,2vw,1.5rem)] text-slate-500 mt-6"
                >
                    {t('hero.subtitle')}
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <ChevronDown className="w-8 h-8 text-slate-400" />
                </motion.div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// "WELL..." TRANSITION - 150vh like original
// ============================================================================

const WellTransition = ({ t }: { t: (key: string) => string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [opacity, setOpacity] = useState(0);
    const [dotOpacities, setDotOpacities] = useState([0, 0, 0]);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;
            const wellTop = scrollY + rect.top;
            const wellHeight = rect.height;

            // Original formula from old version
            const progress = Math.max(0, Math.min(1,
                (scrollY + windowHeight - wellTop) / (windowHeight + wellHeight * 0.5)
            ));

            setOpacity(progress > 0.2 ? 1 : 0);
            setDotOpacities([
                progress > 0.3 ? 1 : 0,
                progress > 0.5 ? 1 : 0,
                progress > 0.7 ? 1 : 0
            ]);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-[150vh] flex items-start justify-center bg-white">
            <div
                className="sticky top-1/2 -translate-y-1/2 text-[clamp(3rem,10vw,5rem)] font-light text-slate-900 text-center p-8"
                style={{ opacity, transition: 'opacity 0.4s ease' }}
            >
                <span className="italic">{t('transition.well')}</span>
                <span className="inline-block min-w-[2em] italic">
                    <span className="inline-block transition-all duration-300" style={{ opacity: dotOpacities[0], transform: dotOpacities[0] ? 'translateY(0)' : 'translateY(10px)' }}>.</span>
                    <span className="inline-block transition-all duration-300" style={{ opacity: dotOpacities[1], transform: dotOpacities[1] ? 'translateY(0)' : 'translateY(10px)' }}>.</span>
                    <span className="inline-block transition-all duration-300" style={{ opacity: dotOpacities[2], transform: dotOpacities[2] ? 'translateY(0)' : 'translateY(10px)' }}>.</span>
                </span>
            </div>
        </div>
    );
};

// ============================================================================
// ARCHITECTURE FLOW - 600vh with fixed positioning like original
// ============================================================================

const ArchitectureFlow = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;
            const flowTop = scrollY + rect.top;
            const flowHeight = rect.height;

            // Original formula: (scrollY + windowHeight * 0.5 - flowTop) / flowHeight
            const rawProgress = (scrollY + windowHeight * 0.5 - flowTop) / flowHeight;
            const flowProgress = Math.max(0, Math.min(1, rawProgress));

            setProgress(flowProgress);
            setIsVisible(rawProgress > 0 && rawProgress < 1);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Phase thresholds from original: P1_END = 0.2, P2_END = 0.4, P3_END = 0.6
    const P1_END = 0.2;
    const P2_END = 0.4;
    const P3_END = 0.6;
    const P4_END = 0.8;

    // Calculate node states based on progress
    const getNodeState = (index: number) => {
        if (index === 0) {
            if (progress < P1_END) {
                const local = progress / P1_END;
                return {
                    opacity: Math.min(1, local * 2),
                    y: -200 * (1 - Math.min(1, local * 2)),
                    filled: local > 0.5
                };
            }
            return { opacity: 1, y: 0, filled: true };
        }
        if (index === 1) {
            if (progress < P1_END) return { opacity: 0, y: -200, filled: false };
            if (progress < P2_END) {
                const local = (progress - P1_END) / (P2_END - P1_END);
                return {
                    opacity: Math.min(1, local * 2),
                    y: -200 * (1 - Math.min(1, local * 2)),
                    filled: local > 0.5
                };
            }
            return { opacity: 1, y: 0, filled: true };
        }
        if (index === 2) {
            if (progress < P2_END) return { opacity: 0, y: -200, filled: false };
            if (progress < P3_END) {
                const local = (progress - P2_END) / (P3_END - P2_END);
                return {
                    opacity: Math.min(1, local * 2),
                    y: -200 * (1 - Math.min(1, local * 2)),
                    filled: local > 0.5
                };
            }
            return { opacity: 1, y: 0, filled: true };
        }
        return { opacity: 0, y: 0, filled: false };
    };

    const getLineOpacity = (index: number) => {
        if (index === 0) return progress >= P1_END ? 1 : 0;
        if (index === 1) return progress >= P2_END ? 1 : 0;
        return 0;
    };

    const showSuccess = progress >= P4_END;
    const fadeOutNodes = progress >= P3_END && progress < P4_END;
    const nodesFadeOpacity = fadeOutNodes ? 1 - ((progress - P3_END) / (P4_END - P3_END)) : (showSuccess ? 0 : 1);

    const nodes = [
        { title: 'Unity (C#)', subtitle: 'Game Engine' },
        { title: 'Python', subtitle: 'WebSocket Server' },
        { title: 'ElevenLabs', subtitle: 'AI Audio API' }
    ];

    return (
        <div ref={containerRef} className="relative min-h-[600vh] bg-white">
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] px-8 pointer-events-none z-10"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            >
                <div className="flex flex-col items-center relative">
                    {nodes.map((node, index) => {
                        const state = getNodeState(index);
                        return (
                            <div key={index} className="w-full" style={{ opacity: nodesFadeOpacity }}>
                                <div
                                    className={`
                                        w-full bg-white rounded-xl p-6 text-center shadow-lg border-2 relative overflow-hidden transition-all duration-500
                                        ${state.filled ? 'border-emerald-500 shadow-emerald-500/30' : 'border-slate-200'}
                                    `}
                                    style={{
                                        opacity: state.opacity,
                                        transform: `translateY(${state.y}px)`
                                    }}
                                >
                                    <div
                                        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-emerald-100/50 to-emerald-50/30 transition-all duration-800"
                                        style={{ height: state.filled ? '100%' : '0%', zIndex: -1 }}
                                    />
                                    <div className="text-lg font-bold text-slate-900">{node.title}</div>
                                    <div className="text-sm text-slate-500">{node.subtitle}</div>
                                </div>

                                {index < nodes.length - 1 && (
                                    <div className="relative h-[100px] w-1 mx-auto my-2">
                                        <div
                                            className="absolute inset-0 origin-top bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-500"
                                            style={{
                                                opacity: getLineOpacity(index),
                                                transform: `scaleY(${getLineOpacity(index)})`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {showSuccess && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                            <span className="text-5xl md:text-7xl font-black text-emerald-500 tracking-wider">
                                SUCCESS
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// NIGHTMARE SCROLL - 150vh like original
// ============================================================================

const NightmareScroll = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [ms, setMs] = useState(0);
    const [label, setLabel] = useState('TARGET: 16ms');

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionHeight = rect.height;

            // Original formula from old version
            const scrollPastStart = windowHeight - rect.top;
            const rawProgress = (scrollPastStart - (windowHeight * 0.5)) / (sectionHeight - windowHeight);
            const prog = Math.max(0, Math.min(1, rawProgress));

            // Logarithmic/Exponential time scaling from original
            let newMs = 0;
            if (prog < 0.15) {
                newMs = (prog / 0.15) * 16;
            } else if (prog < 0.4) {
                const p = (prog - 0.15) / 0.25;
                newMs = 16 + (p * 84);
            } else {
                const p = (prog - 0.4) / 0.6;
                newMs = 100 + (p * p * p * 11900);
            }

            setMs(Math.floor(newMs));

            if (newMs < 16) {
                setLabel('TARGET: 16ms');
            } else if (newMs < 100) {
                setLabel('WARNING: LAG DETECTED');
            } else if (newMs < 5000) {
                setLabel('UNPLAYABLE');
            } else {
                setLabel('SYSTEM FAILURE');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const auraScale = ms < 100 ? 0 : Math.min(8, ((ms - 100) / 5000) * 8);
    const auraOpacity = ms < 100 ? 0 : Math.min(1, (ms - 100) / 3000);

    return (
        <div ref={containerRef} className="relative min-h-[150vh] bg-white overflow-hidden">
            <div className="sticky top-1/2 -translate-y-1/2 flex items-center justify-center">
                {/* Overheat Aura */}
                <div
                    className="absolute w-[15vmax] h-[15vmax] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(185,28,28,0.2) 50%, transparent 70%)',
                        transform: `scale(${auraScale})`,
                        opacity: auraOpacity,
                        mixBlendMode: 'multiply',
                        transition: 'transform 0.1s, opacity 0.1s'
                    }}
                />

                {/* Vignette at critical levels */}
                {ms > 5000 && (
                    <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(220,38,38,0.4)] z-20" />
                )}

                {/* Content */}
                <div className="text-center z-10 px-4">
                    <div
                        className="font-mono font-black leading-none tabular-nums"
                        style={{
                            fontSize: 'clamp(3rem, 12vw, 8rem)',
                            opacity: 0.2 + (ms / 12000) * 0.8,
                            color: ms < 16 ? '#333' : ms < 100 ? '#991b1b' : '#dc2626',
                            textShadow: ms > 5000 ? '2px 0 #fff, -2px 0 #000' : 'none',
                            transform: ms > 5000 ? `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 5}px)` : 'none'
                        }}
                    >
                        {ms} ms
                    </div>
                    <div
                        className="text-sm font-medium uppercase tracking-wider mt-4"
                        style={{ color: ms < 16 ? '#666' : '#dc2626' }}
                    >
                        {label}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// AUTOSCROLL BUTTON
// ============================================================================

const AutoScrollButton = () => {
    const [visible, setVisible] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isScrolling) return;
            setVisible(window.scrollY < window.innerHeight * 0.5);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isScrolling]);

    const handleAutoScroll = useCallback(() => {
        setIsScrolling(true);
        setVisible(false);

        const targetY = document.body.scrollHeight * 0.3;
        const startY = window.scrollY;
        const distance = targetY - startY;
        const duration = 8000;
        const startTime = performance.now();

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            window.scrollTo(0, startY + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setIsScrolling(false);
            }
        };

        requestAnimationFrame(step);
    }, []);

    useEffect(() => {
        const stop = () => { if (isScrolling) setIsScrolling(false); };
        window.addEventListener('wheel', stop, { passive: true });
        window.addEventListener('touchstart', stop, { passive: true });
        return () => {
            window.removeEventListener('wheel', stop);
            window.removeEventListener('touchstart', stop);
        };
    }, [isScrolling]);

    if (!visible) return null;

    return (
        <button
            onClick={handleAutoScroll}
            className="fixed right-8 bottom-8 z-50 flex items-center gap-2 px-5 py-3 bg-white border-2 border-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-all"
        >
            <Play className="w-4 h-4" />
            Auto Play
        </button>
    );
};

// ============================================================================
// SECTION COMPONENT
// ============================================================================

interface SectionProps {
    num: string;
    title: string;
    children: React.ReactNode;
}

const Section = ({ num, title, children }: SectionProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="py-32 px-8 max-w-[900px] mx-auto"
        >
            <div className="text-[clamp(8rem,20vw,15rem)] font-black leading-none mb-[-4rem] select-none text-slate-100">
                {num}
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold mb-8 leading-tight text-slate-900">
                {title}
            </h2>
            <div className="text-lg leading-relaxed text-slate-600">
                {children}
            </div>
        </motion.section>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Gradwork = () => {
    const { t } = useTranslation('gradwork');

    return (
        <div className="min-h-screen bg-white text-slate-900 -mt-16">
            <SEO
                title="AI Audio Research | Igor Szuniewicz"
                description="Graduate Research: Real-time AI Audio in Games"
            />

            <HeroSection t={t} />
            <WellTransition t={t} />

            <main className="relative bg-white">
                <Section num="1" title={t('section1.title')}>
                    <p className="mb-6">{t('section1.intro')}</p>
                    <p className="mb-6">{t('section1.testing')}</p>
                    <blockquote className="border-l-4 border-slate-900 pl-6 py-2 my-8 text-slate-900 text-xl font-semibold">
                        {t('section1.question')}
                    </blockquote>
                    <p className="font-semibold text-slate-900 mb-2">{t('section1.current_findings')}</p>
                    <p>{t('section1.findings')}</p>
                </Section>

                <ArchitectureFlow />

                <Section num="2" title={t('section2.title')}>
                    <p className="mb-6">{t('section2.intro')}</p>
                    <div className="bg-slate-100 border-l-4 border-slate-900 p-6 font-mono text-sm mb-6">
                        {t('section2.architecture_flow')}
                    </div>
                    <p className="mb-4">{t('section2.results_intro')}</p>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b-2 border-slate-200">
                                <tr>
                                    <th className="py-3 pr-4 font-semibold">{t('section2.table_sound')}</th>
                                    <th className="py-3 pr-4 font-semibold">{t('section2.table_latency')}</th>
                                    <th className="py-3 font-semibold">{t('section2.table_verdict')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 pr-4">{t('section2.footstep')}</td>
                                    <td className="py-3 pr-4 font-mono">55 ms</td>
                                    <td className="py-3 text-emerald-600 font-medium">{t('section2.excellent')}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 pr-4">{t('section2.gunshot')}</td>
                                    <td className="py-3 pr-4 font-mono">21 ms</td>
                                    <td className="py-3 text-emerald-600 font-medium">{t('section2.excellent')}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 pr-4">{t('section2.impact')}</td>
                                    <td className="py-3 pr-4 font-mono">28 ms</td>
                                    <td className="py-3 text-emerald-600 font-medium">{t('section2.excellent')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-slate-500 text-sm">{t('section2.results_note')}</p>
                </Section>

                <NightmareScroll />

                <Section num="3" title={t('section3.title')}>
                    <p className="mb-8" dangerouslySetInnerHTML={{ __html: t('section3.intro') }} />
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-8 text-center mb-8">
                        <div className="text-6xl md:text-7xl font-bold text-red-600 font-mono mb-2">
                            {t('section3.failure_stat')}
                        </div>
                        <div className="text-red-500 text-sm">{t('section3.failure_context')}</div>
                    </div>
                    <p dangerouslySetInnerHTML={{ __html: t('section3.narrative') }} />
                </Section>

                <Section num="4" title={t('section4.title')}>
                    <p className="mb-6">{t('section4.intro')}</p>
                    <div className="bg-slate-900 text-slate-300 rounded-lg p-6 font-mono text-sm mb-6 space-y-1">
                        <div className="text-slate-500">[LOG] Gen_Request_01: 4102ms</div>
                        <div className="text-slate-500">[LOG] Gen_Request_02: 4098ms</div>
                        <div className="text-emerald-400">[LOG] Gen_Request_01: 0.03ms  &lt;-- ???</div>
                    </div>
                    <p className="mb-6">{t('section4.epiphany')}</p>
                    <blockquote className="border-l-4 border-slate-900 pl-6 py-2 text-slate-900 text-xl font-semibold">
                        "{t('section4.question')}"
                    </blockquote>
                </Section>

                <Section num="5" title={t('section5.title')}>
                    <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('section5.intro') }} />
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-8 text-center mb-8">
                        <div className="text-4xl font-bold text-emerald-600 mb-2">{t('section5.solution_stat')}</div>
                        <div className="text-emerald-500 text-sm uppercase tracking-wider">{t('section5.solution_label')}</div>
                    </div>
                    <p dangerouslySetInnerHTML={{ __html: t('section5.explanation') }} />
                </Section>

                <Section num="6" title={t('section6.title')}>
                    <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('section6.intro') }} />
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-6">
                        <p dangerouslySetInnerHTML={{ __html: t('section6.problem') }} />
                    </div>
                    <p dangerouslySetInnerHTML={{ __html: t('section6.current_work') }} />
                </Section>

                <Section num="7" title={t('section7.title')}>
                    <p className="mb-8">{t('section7.intro')}</p>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:-translate-y-1 transition-transform">
                            <h4 className="font-bold text-slate-900 mb-2">{t('section7.exp1_title')}</h4>
                            <p className="text-sm text-slate-500">{t('section7.exp1_desc')}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:-translate-y-1 transition-transform">
                            <h4 className="font-bold text-slate-900 mb-2">{t('section7.exp2_title')}</h4>
                            <p className="text-sm text-slate-500">{t('section7.exp2_desc')}</p>
                        </div>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            <span className="text-amber-700 font-semibold text-sm uppercase tracking-wider">
                                {t('section7.status_title')}
                            </span>
                        </div>
                        <p className="text-slate-600">{t('section7.status_desc')}</p>
                    </div>
                </Section>
            </main>

            {/* Footer */}
            <footer className="py-16 text-center bg-slate-50 border-t border-slate-200">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                    <ArrowLeft size={18} />
                    {t('back')}
                </Link>
                <p className="mt-6 text-slate-400 text-sm">{t('footer.status')}</p>
            </footer>

            <AutoScrollButton />
        </div>
    );
};

export default Gradwork;
