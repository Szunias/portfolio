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
                <div className="space-y-4 text-dim text-lg leading-relaxed mb-12">
                    <p>{t('closing.conclusion')}</p>
                    <p className="text-dim">{t('closing.reflection')}</p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border text-dim font-medium rounded-sm transition-all hover:text-cream-light hover:border-border-hover"
                    >
                        <ArrowLeft size={18} />
                        {t('closing.back_to_projects')}
                    </Link>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-border text-center">
                <p className="text-dim text-sm">{t('footer.status')}</p>
            </div>
        </section>
    );
};

export default GradworkClosing;
