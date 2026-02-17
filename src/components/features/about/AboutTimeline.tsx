import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { TFunction } from 'i18next';

interface TimelineItem {
    year: string;
    title: string;
    institution: string;
}

interface AboutTimelineProps {
    timeline: TimelineItem[];
    t: TFunction;
}

const AboutTimeline = ({ timeline, t }: AboutTimelineProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                    <GraduationCap className="text-accent" size={20} aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                    {t('about_education_title', 'Education')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeline.map((item, i) => (
                    <motion.article
                        key={item.year}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-accent/30 transition-all group"
                    >
                        <span className="inline-block px-3 py-1 text-xs font-mono text-accent bg-accent/10 rounded-full mb-3">
                            {item.year}
                        </span>
                        <h3 className="text-white font-semibold mb-2 group-hover:text-accent transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            {item.institution}
                        </p>
                    </motion.article>
                ))}
            </div>
        </motion.div>
    );
};

export default AboutTimeline;
