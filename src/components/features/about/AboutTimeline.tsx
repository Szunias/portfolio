import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { TFunction } from 'i18next';

import { sectionReveal, cardIn, stagger, noMotion } from '@/constants/motion';

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
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.div
            initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
            className="bg-surface-raised border border-border rounded-lg p-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="text-accent" size={20} aria-hidden="true" />
                <h2 className="font-display text-h3 text-text-primary">
                    {t('about_education_title', 'Education')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeline.map((item, i) => (
                    <motion.article
                        key={item.year}
                        initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
                        whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
                        viewport={{ once: true }}
                        transition={prefersReducedMotion ? noMotion.transition : {
                            ...cardIn.transition,
                            delay: i * stagger.timeline,
                        }}
                        className="bg-surface-overlay border border-border rounded-lg p-5 hover:border-border-hover transition-colors duration-200"
                    >
                        <span className="inline-block font-mono text-label uppercase bg-accent/10 text-accent border border-accent/15 rounded px-2.5 py-1 mb-3">
                            {item.year}
                        </span>
                        <h3 className="text-text-primary font-medium mb-2">
                            {item.title}
                        </h3>
                        <p className="text-text-secondary text-body-sm">
                            {item.institution}
                        </p>
                    </motion.article>
                ))}
            </div>
        </motion.div>
    );
};

export default AboutTimeline;
