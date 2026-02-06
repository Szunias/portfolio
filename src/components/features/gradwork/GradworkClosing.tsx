import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const GradworkClosing = ({ t }: { t: (key: string) => string }) => {
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

export default GradworkClosing;
