import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const GradworkSetup = ({ t }: { t: (key: string) => string }) => {
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
                    {t('setup.title')}
                </h2>

                <div className="space-y-6 text-dim text-lg leading-relaxed mb-12">
                    <p>{t('setup.intro')}</p>
                    <p>{t('setup.approach')}</p>
                </div>

                {/* Architecture Diagram */}
                <div className="bg-secondary border border-border rounded-sm p-8">
                    <h3 className="text-lg font-display font-bold text-cream-light mb-6 text-center">
                        {t('setup.architecture_title')}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                        <div className="px-6 py-4 bg-accent/10 border border-accent/30 rounded-sm">
                            <div className="font-bold text-cream-light">Unity</div>
                            <div className="text-sm text-dim">Game Engine</div>
                        </div>
                        <div className="text-2xl text-dim">&rarr;</div>
                        <div className="px-6 py-4 bg-secondary border border-border rounded-sm">
                            <div className="font-bold text-cream-light">Python Server</div>
                            <div className="text-sm text-dim">WebSocket</div>
                        </div>
                        <div className="text-2xl text-dim">&rarr;</div>
                        <div className="px-6 py-4 bg-secondary border border-border rounded-sm">
                            <div className="font-bold text-cream-light">AI Model</div>
                            <div className="text-sm text-dim">Generation</div>
                        </div>
                        <div className="text-2xl text-dim">&rarr;</div>
                        <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm">
                            <div className="font-bold text-cream-light">Cache</div>
                            <div className="text-sm text-dim">Storage</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default GradworkSetup;
