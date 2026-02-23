import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

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
        { key: 'elevenlabs', name: t('results.chart.models.elevenlabs'), min: 1000, max: 12000, color: 'from-red-500 to-orange-500' },
        { key: 'mmaudio', name: t('results.chart.models.mmaudio'), min: 2000, max: 5000, color: 'from-orange-500 to-yellow-500' },
        { key: 'audiogen', name: t('results.chart.models.audiogen'), min: 2500, max: 3500, color: 'from-amber-500 to-yellow-500' },
        { key: 'cached', name: t('results.chart.cached'), min: 21, max: 55, color: 'from-emerald-500 to-green-500' },
    ];

    const maxMs = 12000;
    const logScale = (value: number) => {
        const minLog = Math.log10(10);
        const maxLog = Math.log10(maxMs);
        const valueLog = Math.log10(Math.max(10, value));
        return ((valueLog - minLog) / (maxLog - minLog)) * 100;
    };

    return (
        <div ref={ref} className="bg-surface-raised border border-border rounded-sm p-8 relative">
            {/* Reference Lines */}
            <div className="absolute inset-8 pointer-events-none">
                {referenceLines.map((line) => (
                    <div
                        key={line.value}
                        className="absolute w-full border-t border-dashed"
                        style={{ bottom: `${logScale(line.value)}%`, borderColor: line.color }}
                    >
                        <span
                            className="absolute right-0 -translate-y-1/2 text-xs px-2 py-0.5 rounded-sm"
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
                    const maxHeight = logScale(model.max);
                    const minHeight = logScale(model.min);
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
                                    transition={{ duration: 1, delay: index * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                                    className={`absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t ${model.color} ${isHovered ? 'opacity-100' : 'opacity-80'} transition-opacity`}
                                >
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                        transition={{ delay: 1 + index * 0.15 }}
                                        className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-mono text-text-primary/80 whitespace-nowrap bg-surface/70 px-2 py-1 rounded-sm"
                                    >
                                        {model.min === model.max ? `${model.max}ms` : `${model.min}-${model.max}ms`}
                                    </motion.div>

                                    {model.min !== model.max && (
                                        <div className="absolute w-full h-0.5 bg-cream/30" style={{ bottom: `${(minHeight / maxHeight) * 100}%` }} />
                                    )}
                                </motion.div>

                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-surface border border-border rounded-sm text-sm text-text-secondary z-20"
                                    >
                                        {t(`results.chart.tooltip.${model.key}`)}
                                    </motion.div>
                                )}
                            </div>

                            <div className="mt-4 text-center">
                                <div className="text-sm font-medium text-text-primary">{model.name}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-xs text-text-secondary font-mono">
                <span>12s</span>
                <span>1s</span>
                <span>100ms</span>
                <span>10ms</span>
            </div>
        </div>
    );
};

const GradworkResults = ({ t }: { t: (key: string) => string }) => {
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
                <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-4 text-center">
                    {t('results.title')}
                </h2>
                <p className="text-text-secondary text-lg text-center mb-12 max-w-2xl mx-auto">
                    {t('results.subtitle')}
                </p>

                <LatencyBarChart t={t} />

                {/* Compact model summary table */}
                <div className="mt-8">
                    <h3 className="text-lg font-display font-bold text-text-primary mb-4">
                        {t('results.summary_title')}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {models.map((model, index) => (
                            <motion.div
                                key={model.key}
                                initial={{ opacity: 0, y: 15 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className="bg-surface-raised border border-border rounded-sm p-4"
                            >
                                <div className="font-bold text-text-primary mb-2">{model.name}</div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-secondary">Latency</span>
                                    <span className="font-mono text-error">
                                        {t(`results.models.${model.key}.latency`)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-text-secondary">Quality</span>
                                    <span className="text-accent">
                                        {t(`results.models.${model.key}.quality`)}
                                    </span>
                                </div>
                                <p className="text-text-secondary text-xs pt-2 border-t border-border">
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

export default GradworkResults;
