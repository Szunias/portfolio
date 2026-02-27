import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Clock, HardDrive, Waves, Sparkles } from 'lucide-react';

import { sectionReveal, detailIn, detailInRight, cardIn, noMotion } from '@/constants/motion';

const steps = [
    { key: 'loading', icon: Clock, color: 'from-accent to-accent-hover' },
    { key: 'cache', icon: HardDrive, color: 'from-accent-warm to-warning' },
    { key: 'play', icon: Waves, color: 'from-success to-accent' },
    { key: 'refill', icon: Sparkles, color: 'from-warning to-accent-warm' },
];

const GradworkSolution = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useReducedMotion();
    const preset = prefersReducedMotion ? noMotion : sectionReveal;

    return (
        <section ref={ref} className="py-20 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={preset.initial}
                animate={isInView ? preset.animate : {}}
                transition={preset.transition}
            >
                <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-8">
                    {t('solution.title')}
                </h2>

                {/* Story prose */}
                <div className="space-y-6 text-text-secondary text-lg leading-relaxed mb-12">
                    <p>{t('solution.story')}</p>
                    <p>{t('solution.insight')}</p>
                </div>

                {/* Before/After Comparison */}
                <h3 className="text-lg font-display font-bold text-text-primary mb-4">
                    {t('solution.before_after_title')}
                </h3>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <motion.div
                        initial={prefersReducedMotion ? noMotion.initial : detailIn.initial}
                        animate={isInView ? (prefersReducedMotion ? noMotion.animate : detailIn.animate) : {}}
                        transition={prefersReducedMotion ? noMotion.transition : { ...detailIn.transition, delay: 0.2 }}
                        className="bg-error/5 border border-error/20 rounded-sm p-8 text-center"
                    >
                        <div className="text-error text-sm font-medium uppercase tracking-wider mb-4">
                            {t('solution.without_cache')}
                        </div>
                        <div className="text-4xl md:text-5xl font-mono font-bold text-error mb-2">
                            1,200 - 12,000
                            <span className="text-xl ml-1">ms</span>
                        </div>
                        <div className="text-error/60 text-sm">{t('solution.unacceptable')}</div>
                    </motion.div>

                    <motion.div
                        initial={prefersReducedMotion ? noMotion.initial : detailInRight.initial}
                        animate={isInView ? (prefersReducedMotion ? noMotion.animate : detailInRight.animate) : {}}
                        transition={prefersReducedMotion ? noMotion.transition : { ...detailInRight.transition, delay: 0.3 }}
                        className="bg-success/5 border border-success/20 rounded-sm p-8 text-center"
                    >
                        <div className="text-success text-sm font-medium uppercase tracking-wider mb-4">
                            {t('solution.with_cache')}
                        </div>
                        <div className="text-4xl md:text-5xl font-mono font-bold text-success mb-2">
                            21 - 55
                            <span className="text-xl ml-1">ms</span>
                        </div>
                        <div className="text-success/60 text-sm">{t('solution.acceptable')}</div>
                    </motion.div>
                </div>

                {/* 4-step caching flow */}
                <h3 className="text-lg font-display font-bold text-text-primary mb-4">
                    {t('solution.flow_title')}
                </h3>
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.key}
                            initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
                            animate={isInView ? (prefersReducedMotion ? noMotion.animate : cardIn.animate) : {}}
                            transition={prefersReducedMotion ? noMotion.transition : { ...cardIn.transition, delay: 0.4 + index * 0.1 }}
                            className="relative"
                        >
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 text-xl text-text-secondary">
                                    &rarr;
                                </div>
                            )}

                            <div className="bg-surface-raised border border-border rounded-sm p-5 h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-8 h-8 rounded-sm bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                                        <step.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xs font-mono text-text-secondary">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-text-primary mb-1">
                                    {t(`solution.steps.${step.key}.label`)}
                                </h4>
                                <p className="text-text-secondary text-xs">
                                    {t(`solution.steps.${step.key}.description`)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Use cases in prose */}
                <p className="text-text-secondary text-base leading-relaxed">
                    {t('solution.usecases')}
                </p>
            </motion.div>
        </section>
    );
};

export default GradworkSolution;
