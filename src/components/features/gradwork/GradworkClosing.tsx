import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { sectionReveal, noMotion } from '@/constants/motion';

const GradworkClosing = ({ t }: { t: (key: string) => string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const prefersReducedMotion = useReducedMotion();
    const preset = prefersReducedMotion ? noMotion : sectionReveal;

    return (
        <section ref={ref} className="py-20 md:py-28 px-6 md:px-12 lg:px-16">
            <motion.div
                initial={preset.initial}
                animate={isInView ? preset.animate : {}}
                transition={preset.transition}
                className="max-w-content-wide mx-auto"
            >
                <div className="space-y-4 text-text-secondary text-lg leading-relaxed mb-12">
                    <p>{t('closing.conclusion')}</p>
                    <p className="text-text-secondary">{t('closing.reflection')}</p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary font-medium rounded-lg transition-all hover:text-text-primary hover:border-border-hover"
                    >
                        <ArrowLeft size={18} />
                        {t('closing.back_to_projects')}
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

export default GradworkClosing;
