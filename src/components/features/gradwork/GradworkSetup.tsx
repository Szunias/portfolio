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

export default GradworkSetup;
