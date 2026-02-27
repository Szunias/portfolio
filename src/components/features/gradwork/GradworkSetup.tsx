import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import { sectionReveal, noMotion } from '@/constants/motion';

const GradworkSetup = ({ t }: { t: (key: string) => string }) => {
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
                    {t('setup.title')}
                </h2>

                <div className="space-y-6 text-text-secondary text-lg leading-relaxed mb-12">
                    <p>{t('setup.intro')}</p>
                    <p>{t('setup.approach')}</p>
                </div>

                {/* Architecture Diagram */}
                <div className="bg-surface-raised border border-border rounded-sm p-8">
                    <h3 className="text-lg font-display font-bold text-text-primary mb-6 text-center">
                        {t('setup.architecture_title')}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                        <div className="px-6 py-4 bg-accent/10 border border-accent/30 rounded-sm">
                            <div className="font-bold text-text-primary">Unity</div>
                            <div className="text-sm text-text-secondary">Game Engine</div>
                        </div>
                        <div className="text-2xl text-text-secondary">&rarr;</div>
                        <div className="px-6 py-4 bg-surface-raised border border-border rounded-sm">
                            <div className="font-bold text-text-primary">Python Server</div>
                            <div className="text-sm text-text-secondary">WebSocket</div>
                        </div>
                        <div className="text-2xl text-text-secondary">&rarr;</div>
                        <div className="px-6 py-4 bg-surface-raised border border-border rounded-sm">
                            <div className="font-bold text-text-primary">AI Model</div>
                            <div className="text-sm text-text-secondary">Generation</div>
                        </div>
                        <div className="text-2xl text-text-secondary">&rarr;</div>
                        <div className="px-6 py-4 bg-accent/10 border border-accent/30 rounded-sm">
                            <div className="font-bold text-text-primary">Cache</div>
                            <div className="text-sm text-text-secondary">Storage</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default GradworkSetup;
