import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const GradworkHeader = ({ t }: { t: (key: string) => string }) => {
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

                <h1 className="text-[clamp(1.8rem,5vw,3.5rem)] font-display font-black leading-[1.1] tracking-tight mb-6 text-cream-light">
                    {t('header.title')}
                </h1>

                <p className="text-lg text-dim mb-8 max-w-2xl mx-auto leading-relaxed">
                    {t('header.description')}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border text-dim font-medium rounded-sm transition-all hover:text-cream-light hover:border-border-hover"
                    >
                        <ArrowLeft size={18} />
                        {t('closing.back_to_projects')}
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

export default GradworkHeader;
