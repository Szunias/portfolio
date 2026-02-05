import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Clock, HardDrive, Waves, Sparkles } from 'lucide-react';
import SEO from '../components/layout/SEO';
import { useTranslation } from 'react-i18next';

// ============================================================================
// HEADER SECTION (compact, not full-screen)
// ============================================================================

const Header = ({ t }: { t: (key: string) => string }) => {
    return (
        <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/20">
                    {t('header.badge')}
                </span>

                <h1 className="text-[clamp(1.8rem,5vw,3.5rem)] font-black leading-[1.1] tracking-tight mb-6 text-white">
                    {t('header.title')}
                </h1>

                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {t('header.description')}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-slate-400 font-medium rounded-xl transition-all hover:text-white hover:border-white/20"
                    >
                        <ArrowLeft size={18} />
                        {t('closing.back_to_projects')}
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// SETUP SECTION - What I tested and why + Architecture diagram
// ============================================================================

const SetupSection = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-20 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                    {t('setup.title')}
                </h2>

                <div className="space-y-6 text-slate-300 text-lg leading-relaxed mb-12">
                    <p>{t('setup.intro')}</p>
                    <p>{t('setup.approach')}</p>
                </div>

                {/* Architecture Diagram */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-lg font-bold text-white mb-6 text-center">
                        {t('setup.architecture_title')}
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
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// LATENCY BAR CHART - Animated visualization (kept from original)
// ============================================================================

const LatencyBarChart = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    const referenceLines = [
        { value: 200, label: t('results.chart.humanReaction'), color: 'rgba(168, 85, 247, 0.5)' },
        { value: 100, label: t('results.chart.acceptable'), color: 'rgba(34, 197, 94, 0.5)' },
        { value: 16, label: t('results.chart.gameFrame'), color: 'rgba(59, 130, 246, 0.5)' },
    ];

    const models = [
        {
            key: 'elevenlabs',
            name: t('results.chart.models.elevenlabs'),
            min: 1000,
            max: 12000,
            color: 'from-red-500 to-orange-500',
        },
        {
            key: 'mmaudio',
            name: t('results.chart.models.mmaudio'),
            min: 2000,
            max: 5000,
            color: 'from-orange-500 to-yellow-500',
        },
        {
            key: 'audiogen',
            name: t('results.chart.models.audiogen'),
            min: 2500,
            max: 3500,
            color: 'from-amber-500 to-yellow-500',
        },
        {
            key: 'cached',
            name: t('results.chart.cached'),
            min: 21,
            max: 55,
            color: 'from-emerald-500 to-green-500',
        },
    ];

    const maxMs = 12000;
    const logScale = (value: number) => {
        const minLog = Math.log10(10);
        const maxLog = Math.log10(maxMs);
        const valueLog = Math.log10(Math.max(10, value));
        return ((valueLog - minLog) / (maxLog - minLog)) * 100;
    };

    return (
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
                            <div
                                className="w-full relative cursor-pointer"
                                style={{ height: '100%' }}
                                onMouseEnter={() => setHoveredBar(model.key)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
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

                                    {model.min !== model.max && (
                                        <div
                                            className="absolute w-full h-0.5 bg-white/30"
                                            style={{ bottom: `${(minHeight / maxHeight) * 100}%` }}
                                        />
                                    )}
                                </motion.div>

                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 border border-white/20 rounded-lg text-sm text-slate-300 z-20"
                                    >
                                        {t(`results.chart.tooltip.${model.key}`)}
                                    </motion.div>
                                )}
                            </div>

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
    );
};

// ============================================================================
// RESULTS SECTION - Chart + compact model summary
// ============================================================================

const ResultsSection = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const models = [
        { key: 'elevenlabs', name: 'ElevenLabs' },
        { key: 'mmaudio', name: 'MMAudio' },
        { key: 'audiogen', name: 'AudioGen' },
    ];

    return (
        <section ref={ref} className="py-20 px-6 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                    {t('results.title')}
                </h2>
                <p className="text-slate-400 text-lg text-center mb-12 max-w-2xl mx-auto">
                    {t('results.subtitle')}
                </p>

                <LatencyBarChart t={t} />

                {/* Compact model summary table */}
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-4">
                        {t('results.summary_title')}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {models.map((model, index) => (
                            <motion.div
                                key={model.key}
                                initial={{ opacity: 0, y: 15 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4"
                            >
                                <div className="font-bold text-white mb-2">{model.name}</div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Latency</span>
                                    <span className="font-mono text-red-400">
                                        {t(`results.models.${model.key}.latency`)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Quality</span>
                                    <span className="text-accent">
                                        {t(`results.models.${model.key}.quality`)}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-xs pt-2 border-t border-white/10">
                                    {t(`results.models.${model.key}.note`)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

// ============================================================================
// SOLUTION SECTION - Caching story + before/after + flow + use cases
// ============================================================================

const SolutionSection = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const steps = [
        { key: 'loading', icon: Clock, color: 'from-blue-500 to-cyan-500' },
        { key: 'cache', icon: HardDrive, color: 'from-purple-500 to-pink-500' },
        { key: 'play', icon: Waves, color: 'from-emerald-500 to-green-500' },
        { key: 'refill', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <section ref={ref} className="py-20 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                    {t('solution.title')}
                </h2>

                {/* Story prose */}
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed mb-12">
                    <p>{t('solution.story')}</p>
                    <p>{t('solution.insight')}</p>
                </div>

                {/* Before/After Comparison */}
                <h3 className="text-lg font-bold text-white mb-4">
                    {t('solution.before_after_title')}
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
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

                {/* 4-step caching flow */}
                <h3 className="text-lg font-bold text-white mb-4">
                    {t('solution.flow_title')}
                </h3>
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className="relative"
                        >
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 text-xl text-slate-600">
                                    &rarr;
                                </div>
                            )}

                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                                        <step.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xs font-mono text-slate-500">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">
                                    {t(`solution.steps.${step.key}.label`)}
                                </h4>
                                <p className="text-slate-400 text-xs">
                                    {t(`solution.steps.${step.key}.description`)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Use cases in prose */}
                <p className="text-slate-400 text-base leading-relaxed">
                    {t('solution.usecases')}
                </p>
            </motion.div>
        </section>
    );
};

// ============================================================================
// CLOSING SECTION
// ============================================================================

const ClosingSection = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                <div className="space-y-4 text-slate-300 text-lg leading-relaxed mb-12">
                    <p>{t('closing.conclusion')}</p>
                    <p className="text-slate-400">{t('closing.reflection')}</p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-slate-400 font-medium rounded-xl transition-all hover:text-white hover:border-white/20"
                    >
                        <ArrowLeft size={18} />
                        {t('closing.back_to_projects')}
                    </Link>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
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

            <Header t={t} />
            <SetupSection t={t} />
            <ResultsSection t={t} />
            <SolutionSection t={t} />
            <ClosingSection t={t} />
        </div>
    );
};

export default Gradwork;
