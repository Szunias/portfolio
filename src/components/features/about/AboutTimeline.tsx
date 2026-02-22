import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { TFunction } from 'i18next';

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
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="bg-secondary border border-border rounded-sm p-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="text-accent" size={20} aria-hidden="true" />
                <h2 className="text-2xl font-display text-cream-light">
                    {t('about_education_title', 'Education')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeline.map((item, i) => (
                    <motion.article
                        key={item.year}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="bg-tertiary border border-border rounded-sm p-5 hover:border-border-hover transition-colors duration-200"
                    >
                        <span className="inline-block px-3 py-1 text-xs font-mono text-accent border border-accent/20 rounded-sm mb-3">
                            {item.year}
                        </span>
                        <h3 className="text-cream font-medium mb-2">
                            {item.title}
                        </h3>
                        <p className="text-dim text-sm">
                            {item.institution}
                        </p>
                    </motion.article>
                ))}
            </div>
        </motion.div>
    );
};

export default AboutTimeline;
