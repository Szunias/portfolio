import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, HardDrive, Waves, Sparkles } from 'lucide-react';

const steps = [
    { key: 'loading', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { key: 'cache', icon: HardDrive, color: 'from-purple-500 to-pink-500' },
    { key: 'play', icon: Waves, color: 'from-emerald-500 to-green-500' },
    { key: 'refill', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
];

const GradworkSolution = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-20 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-2xl md:text-3xl font-display font-bold text-cream-light mb-8">
                    {t('solution.title')}
                </h2>

                {/* Story prose */}
                <div className="space-y-6 text-dim text-lg leading-relaxed mb-12">
                    <p>{t('solution.story')}</p>
                    <p>{t('solution.insight')}</p>
                </div>

                {/* Before/After Comparison */}
                <h3 className="text-lg font-display font-bold text-cream-light mb-4">
                    {t('solution.before_after_title')}
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-red-500/5 border border-red-500/20 rounded-sm p-8 text-center"
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
                        className="bg-emerald-500/5 border border-emerald-500/20 rounded-sm p-8 text-center"
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
                <h3 className="text-lg font-display font-bold text-cream-light mb-4">
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
                                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 text-xl text-dim">
                                    &rarr;
                                </div>
                            )}

                            <div className="bg-secondary border border-border rounded-sm p-5 h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-8 h-8 rounded-sm bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                                        <step.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xs font-mono text-dim">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-cream-light mb-1">
                                    {t(`solution.steps.${step.key}.label`)}
                                </h4>
                                <p className="text-dim text-xs">
                                    {t(`solution.steps.${step.key}.description`)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Use cases in prose */}
                <p className="text-dim text-base leading-relaxed">
                    {t('solution.usecases')}
                </p>
            </motion.div>
        </section>
    );
};

export default GradworkSolution;
