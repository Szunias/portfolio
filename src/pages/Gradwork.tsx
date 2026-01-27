import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, FileText, Github, ArrowLeft, Mail, Sparkles, HardDrive, Waves, Clock, Lightbulb, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import SEO from '../components/layout/SEO';
import { useTranslation } from 'react-i18next';

// ============================================================================
// HERO SECTION
// ============================================================================

const GradworkHero = ({ t }: { t: (key: string) => string }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl">
                {/* Badge */}
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-8 border border-accent/20"
                >
                    {t('hero.badge')}
                </motion.span>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-[clamp(2rem,6vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-6"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                        {t('hero.title')}
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto"
                >
                    {t('hero.subtitle')}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <a
                        href="#"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        <FileText size={18} />
                        {t('hero.read_paper')}
                    </a>
                    <a
                        href="#"
                        className="group inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-medium rounded-xl backdrop-blur-sm bg-white/5 transition-all hover:scale-105 hover:border-white/40 hover:bg-white/10"
                    >
                        <Github size={18} />
                        {t('hero.view_code')}
                    </a>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center gap-2 text-slate-500"
                >
                    <span className="text-sm">{t('hero.scroll')}</span>
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// WHY THIS MATTERS SECTION
// ============================================================================

const WhyThisMatters = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const reasons = [
        {
            icon: Sparkles,
            key: 'variation',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: HardDrive,
            key: 'fileSize',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Waves,
            key: 'adaptive',
            color: 'from-emerald-500 to-teal-500',
        },
    ];

    return (
        <section ref={ref} className="py-32 px-6 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('whyThisMatters.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-16 max-w-3xl mx-auto">
                    {t('whyThisMatters.description')}
                </p>

                {/* Reason Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={reason.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all overflow-hidden"
                        >
                            {/* Gradient accent */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${reason.color}`} />

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reason.color} flex items-center justify-center mb-4`}>
                                <reason.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                {t(`whyThisMatters.reasons.${reason.key}.title`)}
                            </h3>
                            <p className="text-slate-400">
                                {t(`whyThisMatters.reasons.${reason.key}.description`)}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Hook */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-2xl md:text-3xl text-center text-white font-medium"
                >
                    {t('whyThisMatters.hook')}
                </motion.p>
            </motion.div>
        </section>
    );
};

// ============================================================================
// LATENCY PROBLEM SECTION - with scroll counter
// ============================================================================

const LatencyProblem = ({ t }: { t: (key: string) => string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [ms, setMs] = useState(0);
    const [label, setLabel] = useState('');
    const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionHeight = rect.height;

            const scrollPastStart = windowHeight - rect.top;
            const rawProgress = (scrollPastStart - (windowHeight * 0.3)) / (sectionHeight - windowHeight * 0.5);
            const prog = Math.max(0, Math.min(1, rawProgress));

            // Logarithmic time scaling
            let newMs = 0;
            if (prog < 0.1) {
                newMs = (prog / 0.1) * 16;
            } else if (prog < 0.25) {
                const p = (prog - 0.1) / 0.15;
                newMs = 16 + (p * 84); // 16 -> 100
            } else if (prog < 0.5) {
                const p = (prog - 0.25) / 0.25;
                newMs = 100 + (p * 900); // 100 -> 1000
            } else {
                const p = (prog - 0.5) / 0.5;
                newMs = 1000 + (p * p * 11000); // 1000 -> 12000
            }

            setMs(Math.floor(newMs));

            if (newMs < 16) {
                setLabel(t('latency.label_target'));
            } else if (newMs < 100) {
                setLabel(t('latency.label_acceptable'));
            } else if (newMs < 1000) {
                setLabel(t('latency.label_noticeable'));
            } else if (newMs < 5000) {
                setLabel(t('latency.label_unplayable'));
            } else {
                setLabel(t('latency.label_failure'));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [t]);

    // Shake effect for critical failure
    useEffect(() => {
        if (ms > 5000) {
            const interval = setInterval(() => {
                setShakeOffset({
                    x: (Math.random() - 0.5) * 8,
                    y: (Math.random() - 0.5) * 4
                });
            }, 50);
            return () => clearInterval(interval);
        } else {
            setShakeOffset({ x: 0, y: 0 });
        }
    }, [ms]);

    const getColor = () => {
        if (ms < 16) return 'text-emerald-400';
        if (ms < 100) return 'text-amber-400';
        if (ms < 1000) return 'text-orange-500';
        return 'text-red-500';
    };

    const auraOpacity = ms < 100 ? 0 : Math.min(0.6, (ms - 100) / 5000);

    return (
        <section ref={containerRef} className="relative min-h-[200vh]">
            {/* Sticky Content */}
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6">
                {/* Problem Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 max-w-3xl"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t('latency.title')}
                    </h2>
                    <p className="text-slate-400 text-lg">
                        {t('latency.description')}
                    </p>
                </motion.div>

                {/* Threshold Badge */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-slate-400">{t('latency.threshold')}</span>
                        <span className="text-2xl font-mono font-bold text-accent">100ms</span>
                    </div>
                </div>

                {/* Latency Counter */}
                <div className="relative">
                    {/* Overheat Aura */}
                    <div
                        className="absolute inset-0 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full pointer-events-none"
                        style={{
                            background: `radial-gradient(circle, rgba(239,68,68,${auraOpacity}) 0%, transparent 70%)`,
                            filter: 'blur(40px)',
                        }}
                    />

                    {/* Counter */}
                    <div
                        className={`font-mono font-black leading-none tabular-nums ${getColor()}`}
                        style={{
                            fontSize: 'clamp(4rem, 15vw, 10rem)',
                            transform: ms > 5000 ? `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` : 'none',
                            textShadow: ms > 5000 ? '2px 0 #fff, -2px 0 #000' : 'none',
                        }}
                    >
                        {ms.toLocaleString()}
                        <span className="text-[0.4em] ml-2 opacity-60">ms</span>
                    </div>

                    {/* Label */}
                    <div className={`text-center mt-4 text-sm font-medium uppercase tracking-wider ${getColor()}`}>
                        {label}
                    </div>
                </div>

                {/* Vignette at critical levels */}
                {ms > 5000 && (
                    <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(220,38,38,0.4)] z-20" />
                )}
            </div>
        </section>
    );
};

// ============================================================================
// LATENCY BAR CHART - Animated SVG/CSS chart
// ============================================================================

const LatencyBarChart = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    const referenceLines = [
        { value: 200, label: t('chart.humanReaction'), color: 'rgba(168, 85, 247, 0.5)' },
        { value: 100, label: t('chart.acceptable'), color: 'rgba(34, 197, 94, 0.5)' },
        { value: 16, label: t('chart.gameFrame'), color: 'rgba(59, 130, 246, 0.5)' },
    ];

    const models = [
        {
            key: 'elevenlabs',
            name: t('chart.models.elevenlabs'),
            min: 1000,
            max: 12000,
            color: 'from-red-500 to-orange-500',
            bgColor: 'bg-red-500/20',
        },
        {
            key: 'mmaudio',
            name: t('chart.models.mmaudio'),
            min: 2000,
            max: 5000,
            color: 'from-orange-500 to-yellow-500',
            bgColor: 'bg-orange-500/20',
        },
        {
            key: 'audiogen',
            name: t('chart.models.audiogen'),
            min: 2500,
            max: 3500,
            color: 'from-amber-500 to-yellow-500',
            bgColor: 'bg-amber-500/20',
        },
        {
            key: 'cached',
            name: t('chart.cached'),
            min: 21,
            max: 55,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-500/20',
        },
    ];

    // Log scale for visualization (max 12000ms)
    const maxMs = 12000;
    const logScale = (value: number) => {
        const minLog = Math.log10(10);
        const maxLog = Math.log10(maxMs);
        const valueLog = Math.log10(Math.max(10, value));
        return ((valueLog - minLog) / (maxLog - minLog)) * 100;
    };

    return (
        <section ref={ref} className="py-32 px-6 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('chart.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-12 max-w-2xl mx-auto">
                    {t('chart.subtitle')}
                </p>

                {/* Chart Container */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative">
                    {/* Reference Lines */}
                    <div className="absolute inset-8 pointer-events-none">
                        {referenceLines.map((line) => (
                            <div
                                key={line.value}
                                className="absolute w-full border-t border-dashed"
                                style={{
                                    bottom: `${logScale(line.value)}%`,
                                    borderColor: line.color,
                                }}
                            >
                                <span
                                    className="absolute right-0 -translate-y-1/2 text-xs px-2 py-0.5 rounded"
                                    style={{ color: line.color, backgroundColor: 'rgba(0,0,0,0.5)' }}
                                >
                                    {line.label} ({line.value}ms)
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="flex items-end justify-around gap-4 h-[400px] relative z-10">
                        {models.map((model, index) => {
                            const minHeight = logScale(model.min);
                            const maxHeight = logScale(model.max);
                            const isHovered = hoveredBar === model.key;

                            return (
                                <div key={model.key} className="flex flex-col items-center flex-1 max-w-[120px]">
                                    {/* Bar */}
                                    <div
                                        className="w-full relative cursor-pointer"
                                        style={{ height: '100%' }}
                                        onMouseEnter={() => setHoveredBar(model.key)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    >
                                        {/* Bar fill */}
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={isInView ? { height: `${maxHeight}%` } : { height: 0 }}
                                            transition={{
                                                duration: 1,
                                                delay: index * 0.15,
                                                ease: [0.34, 1.56, 0.64, 1]
                                            }}
                                            className={`absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t ${model.color} ${isHovered ? 'opacity-100' : 'opacity-80'} transition-opacity`}
                                        >
                                            {/* Range indicator */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                                transition={{ delay: 1 + index * 0.15 }}
                                                className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-mono text-white/80 whitespace-nowrap bg-black/50 px-2 py-1 rounded"
                                            >
                                                {model.min === model.max
                                                    ? `${model.max}ms`
                                                    : `${model.min}-${model.max}ms`
                                                }
                                            </motion.div>

                                            {/* Min range marker */}
                                            {model.min !== model.max && (
                                                <div
                                                    className="absolute w-full h-0.5 bg-white/30"
                                                    style={{ bottom: `${(minHeight / maxHeight) * 100}%` }}
                                                />
                                            )}
                                        </motion.div>

                                        {/* Tooltip */}
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 border border-white/20 rounded-lg text-sm text-slate-300 z-20"
                                            >
                                                {t(`chart.tooltip.${model.key}`)}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="mt-4 text-center">
                                        <div className="text-sm font-medium text-white">{model.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Y-axis labels */}
                    <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-xs text-slate-500 font-mono">
                        <span>12s</span>
                        <span>1s</span>
                        <span>100ms</span>
                        <span>10ms</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// MODELS GRID SECTION
// ============================================================================

const ModelsGrid = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const models = [
        {
            name: 'ElevenLabs',
            latency: '1-12s',
            quality: t('models.quality_high'),
            note: t('models.elevenlabs_note'),
        },
        {
            name: 'MMAudio',
            latency: '2-5s',
            quality: t('models.quality_good'),
            note: t('models.mmaudio_note'),
        },
        {
            name: 'AudioGen',
            latency: '~3s',
            quality: t('models.quality_medium'),
            note: t('models.audiogen_note'),
        },
    ];

    return (
        <section ref={ref} className="py-32 px-6 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('models.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-12 max-w-2xl mx-auto">
                    {t('models.subtitle')}
                </p>

                {/* Model Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {models.map((model, index) => (
                        <motion.div
                            key={model.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-all"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">{model.name}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">{t('models.latency')}</span>
                                    <span className="font-mono text-red-400">{model.latency}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">{t('models.quality')}</span>
                                    <span className="text-accent">{model.quality}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm mt-4 pt-4 border-t border-white/10">
                                {model.note}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Architecture Diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                    <h3 className="text-xl font-bold text-white mb-6 text-center">
                        {t('models.architecture_title')}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                        <div className="px-6 py-4 bg-accent/10 border border-accent/30 rounded-xl">
                            <div className="font-bold text-white">Unity</div>
                            <div className="text-sm text-slate-500">Game Engine</div>
                        </div>
                        <div className="text-2xl text-slate-600">&rarr;</div>
                        <div className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl">
                            <div className="font-bold text-white">Python Server</div>
                            <div className="text-sm text-slate-500">WebSocket</div>
                        </div>
                        <div className="text-2xl text-slate-600">&rarr;</div>
                        <div className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl">
                            <div className="font-bold text-white">AI Model</div>
                            <div className="text-sm text-slate-500">Generation</div>
                        </div>
                        <div className="text-2xl text-slate-600">&rarr;</div>
                        <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                            <div className="font-bold text-white">Cache</div>
                            <div className="text-sm text-slate-500">Storage</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// RESEARCH TIMELINE SECTION
// ============================================================================

const ResearchTimeline = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const events = [
        { key: 'start', icon: '🔌' },
        { key: 'models', icon: '🧪' },
        { key: 'frustration', icon: '🧱' },
        { key: 'eureka', icon: '💡' },
    ];

    return (
        <section ref={ref} className="py-32 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('timeline.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-16 max-w-2xl mx-auto">
                    {t('timeline.subtitle')}
                </p>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-purple-500 to-emerald-500" />

                    {/* Events */}
                    <div className="space-y-12">
                        {events.map((event, index) => (
                            <motion.div
                                key={event.key}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className={`relative flex items-start gap-8 ${
                                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                }`}
                            >
                                {/* Dot */}
                                <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-white border-4 border-slate-900 z-10" />

                                {/* Content */}
                                <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}">
                                            <span className="text-2xl">{event.icon}</span>
                                            <span className="text-sm text-accent font-medium">
                                                {t(`timeline.events.${event.key}.date`)}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {t(`timeline.events.${event.key}.title`)}
                                        </h3>
                                        <p className="text-slate-400">
                                            {t(`timeline.events.${event.key}.description`)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// BREAKTHROUGH SECTION - The 0.03ms discovery
// ============================================================================

const BreakthroughSection = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-32 px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto relative z-10"
            >
                <div className="text-center mb-12">
                    <Lightbulb className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t('breakthrough.title')}
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        {t('breakthrough.subtitle')}
                    </p>
                </div>

                {/* The big number */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-3xl px-12 py-8">
                        <div className="font-mono font-black text-emerald-400 leading-none" style={{ fontSize: 'clamp(4rem, 15vw, 8rem)' }}>
                            {t('breakthrough.metric.value')}
                            <span className="text-[0.3em] ml-2 opacity-60">{t('breakthrough.metric.unit')}</span>
                        </div>
                        <div className="text-emerald-400/60 mt-2 text-lg">
                            {t('breakthrough.metric.label')}
                        </div>
                    </div>
                </motion.div>

                {/* Story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
                >
                    <p className="text-xl text-slate-300 leading-relaxed mb-6">
                        {t('breakthrough.story')}
                    </p>
                    <p className="text-2xl text-white font-medium">
                        {t('breakthrough.realization')}
                    </p>
                </motion.div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// CACHING DIAGRAM - Animated flow
// ============================================================================

const CachingDiagram = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const steps = [
        { key: 'loading', icon: Clock, color: 'from-blue-500 to-cyan-500' },
        { key: 'cache', icon: HardDrive, color: 'from-purple-500 to-pink-500' },
        { key: 'play', icon: Waves, color: 'from-emerald-500 to-green-500' },
        { key: 'refill', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <section ref={ref} className="py-32 px-6 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('cachingDiagram.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-16 max-w-2xl mx-auto">
                    {t('cachingDiagram.subtitle')}
                </p>

                {/* Flow diagram */}
                <div className="grid md:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Arrow between cards */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.4, delay: 0.5 + index * 0.15 }}
                                        className="text-2xl text-slate-600"
                                    >
                                        &rarr;
                                    </motion.div>
                                </div>
                            )}

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:border-white/20 transition-all">
                                {/* Step number */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                                        <step.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-mono text-slate-500">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">
                                    {t(`cachingDiagram.steps.${step.key}.label`)}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    {t(`cachingDiagram.steps.${step.key}.description`)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// CACHING SOLUTION SECTION - Before/After
// ============================================================================

const CachingSolution = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-32 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('solution.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-12 max-w-2xl mx-auto">
                    {t('solution.subtitle')}
                </p>

                {/* Before/After Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Without Cache */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center"
                    >
                        <div className="text-red-400 text-sm font-medium uppercase tracking-wider mb-4">
                            {t('solution.without_cache')}
                        </div>
                        <div className="text-4xl md:text-5xl font-mono font-bold text-red-500 mb-2">
                            1,200 - 12,000
                            <span className="text-xl ml-1">ms</span>
                        </div>
                        <div className="text-red-400/60 text-sm">{t('solution.unacceptable')}</div>
                    </motion.div>

                    {/* With Cache */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 text-center"
                    >
                        <div className="text-emerald-400 text-sm font-medium uppercase tracking-wider mb-4">
                            {t('solution.with_cache')}
                        </div>
                        <div className="text-4xl md:text-5xl font-mono font-bold text-emerald-400 mb-2">
                            21 - 55
                            <span className="text-xl ml-1">ms</span>
                        </div>
                        <div className="text-emerald-400/60 text-sm">{t('solution.acceptable')}</div>
                    </motion.div>
                </div>

                {/* Key Insight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold text-accent mb-4">
                        95-98%
                    </div>
                    <div className="text-slate-300 text-lg">
                        {t('solution.reduction')}
                    </div>
                </motion.div>

                {/* Quote */}
                <motion.blockquote
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xl md:text-2xl text-slate-300 italic">
                        "{t('solution.quote')}"
                    </p>
                </motion.blockquote>
            </motion.div>
        </section>
    );
};

// ============================================================================
// USE CASE TABLE SECTION
// ============================================================================

const UseCaseTable = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const cases = ['footsteps', 'ambient', 'gunshots', 'cutscenes', 'procedural'];

    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case 'yes':
                return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            case 'no':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'maybe':
                return <HelpCircle className="w-5 h-5 text-amber-400" />;
            default:
                return null;
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'yes':
                return 'text-emerald-400';
            case 'no':
                return 'text-red-400';
            case 'maybe':
                return 'text-amber-400';
            default:
                return 'text-slate-400';
        }
    };

    return (
        <section ref={ref} className="py-32 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                    {t('useCases.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-12 max-w-2xl mx-auto">
                    {t('useCases.subtitle')}
                </p>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 border-b border-white/10 text-sm font-medium text-slate-400 uppercase tracking-wider">
                        <div>{t('useCases.headers.useCase')}</div>
                        <div className="text-center">{t('useCases.headers.frequency')}</div>
                        <div className="text-center">{t('useCases.headers.verdict')}</div>
                    </div>

                    {/* Rows */}
                    {cases.map((caseKey, index) => {
                        const verdict = t(`useCases.cases.${caseKey}.verdict`);
                        return (
                            <motion.div
                                key={caseKey}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-white">
                                        {t(`useCases.cases.${caseKey}.name`)}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        {t(`useCases.cases.${caseKey}.note`)}
                                    </div>
                                </div>
                                <div className="text-center text-slate-400 self-center font-mono text-sm">
                                    {t(`useCases.cases.${caseKey}.frequency`)}
                                </div>
                                <div className="flex flex-col items-center justify-center gap-1">
                                    {getVerdictIcon(verdict)}
                                    <span className={`text-sm font-medium ${getVerdictColor(verdict)}`}>
                                        {t(`useCases.verdicts.${verdict}`)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// CONCLUSION SECTION
// ============================================================================

const Conclusion = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-32 px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto text-center"
            >
                {/* Conclusion Text */}
                <div className="mb-16">
                    <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-6">
                        {t('conclusion.main')}
                    </p>
                    <p className="text-xl text-slate-400 mb-6">
                        {t('conclusion.secondary')}
                    </p>
                    <p className="text-lg text-slate-500 italic">
                        {t('conclusion.final_thought')}
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    <a
                        href="#"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        <FileText size={18} />
                        {t('conclusion.download_paper')}
                    </a>
                    <a
                        href="#"
                        className="group inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-medium rounded-xl backdrop-blur-sm bg-white/5 transition-all hover:scale-105 hover:border-white/40 hover:bg-white/10"
                    >
                        <Github size={18} />
                        {t('conclusion.github')}
                    </a>
                    <Link
                        to="/contact"
                        className="group inline-flex items-center gap-2 px-8 py-4 border border-accent/30 text-accent font-medium rounded-xl backdrop-blur-sm bg-accent/5 transition-all hover:scale-105 hover:border-accent/50 hover:bg-accent/10"
                    >
                        <Mail size={18} />
                        {t('conclusion.contact')}
                    </Link>
                </div>

                {/* Back to Projects */}
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('back')}
                </Link>
            </motion.div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/10 text-center">
                <p className="text-slate-600 text-sm">{t('footer.status')}</p>
            </div>
        </section>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Gradwork = () => {
    const { t } = useTranslation('gradwork');

    return (
        <div className="min-h-screen -mt-16">
            <SEO
                title="AI Audio Research | Igor Szuniewicz"
                description="Bachelor Thesis: Can AI generate sound effects in real-time for video games?"
            />

            <GradworkHero t={t} />
            <WhyThisMatters t={t} />
            <LatencyProblem t={t} />
            <LatencyBarChart t={t} />
            <ModelsGrid t={t} />
            <ResearchTimeline t={t} />
            <BreakthroughSection t={t} />
            <CachingDiagram t={t} />
            <CachingSolution t={t} />
            <UseCaseTable t={t} />
            <Conclusion t={t} />
        </div>
    );
};

export default Gradwork;
