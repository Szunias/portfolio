import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Download } from 'lucide-react';

import SEO from '../components/layout/SEO';
import { sectionReveal, noMotion } from '../constants/motion';

const About = () => {
    const { t } = useTranslation('about');
    const prefersReducedMotion = useReducedMotion();

    const reveal = prefersReducedMotion ? noMotion : sectionReveal;

    // Varied direction reveals to break monotony
    const fadeFromLeft = prefersReducedMotion
        ? noMotion
        : {
            initial: { opacity: 0, x: -16 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, ease: 'easeOut' },
          };

    const fadeFromRight = prefersReducedMotion
        ? noMotion
        : {
            initial: { opacity: 0, x: 16 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, ease: 'easeOut' },
          };

    return (
        <div className="min-h-screen relative bg-surface">
            <SEO title={t('about_page_title', 'About')} description={t('about_page_description')} />

            <div className="relative z-10 max-w-content-narrow mx-auto px-6 lg:px-8 pt-32 pb-32">

                {/* --- INTRO: Short, no photo --- */}
                <motion.section
                    initial={reveal.initial}
                    whileInView={reveal.animate}
                    viewport={{ once: true }}
                    transition={reveal.transition}
                    className="mb-20"
                >
                    <p className="font-display text-h2 text-text-primary leading-tight">
                        {t('intro')}
                    </p>
                </motion.section>

                {/* --- STORY: Short paragraphs, varied rhythm --- */}
                <motion.section
                    initial={fadeFromLeft.initial}
                    whileInView={fadeFromLeft.animate}
                    viewport={{ once: true }}
                    transition={fadeFromLeft.transition}
                    className="space-y-8 mb-20"
                >
                    <p className="text-body text-text-secondary leading-relaxed">
                        {t('story_1')}
                    </p>
                    <p className="text-body text-text-secondary leading-relaxed">
                        {t('story_2')}
                    </p>
                    <p className="text-body text-text-secondary leading-relaxed">
                        {t('story_3')}
                    </p>
                </motion.section>

                {/* --- PULL QUOTE --- */}
                <motion.blockquote
                    initial={reveal.initial}
                    whileInView={reveal.animate}
                    viewport={{ once: true }}
                    transition={reveal.transition}
                    className="border-l-2 border-accent pl-6 py-2 my-20"
                >
                    <p className="font-display text-h3 text-text-primary leading-snug">
                        {t('pull_quote')}
                    </p>
                </motion.blockquote>

                {/* --- HOW I WORK: Short, practical --- */}
                <motion.section
                    initial={fadeFromRight.initial}
                    whileInView={fadeFromRight.animate}
                    viewport={{ once: true }}
                    transition={fadeFromRight.transition}
                    className="space-y-8 mb-24"
                >
                    <p className="text-body text-text-secondary leading-relaxed">
                        {t('approach_1')}
                    </p>
                    <p className="text-body text-text-secondary leading-relaxed">
                        {t('approach_2')}
                    </p>
                </motion.section>

                {/* --- EDUCATION: Inline, compact --- */}
                <motion.section
                    initial={reveal.initial}
                    whileInView={reveal.animate}
                    viewport={{ once: true }}
                    transition={reveal.transition}
                    className="mb-24"
                >
                    <ul className="space-y-2">
                        <li className="font-mono text-body-sm text-text-tertiary">
                            {t('edu_dae')}
                        </li>
                        <li className="font-mono text-body-sm text-text-tertiary">
                            {t('edu_hs')}
                        </li>
                        <li className="font-mono text-body-sm text-text-tertiary">
                            {t('edu_piano')}
                        </li>
                    </ul>
                </motion.section>

                {/* --- CTA: Direct and practical --- */}
                <motion.section
                    initial={reveal.initial}
                    whileInView={reveal.animate}
                    viewport={{ once: true }}
                    transition={reveal.transition}
                >
                    <p className="font-display text-h3 text-text-primary mb-6">
                        {t('cta_text')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-surface font-semibold rounded-md transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                            {t('cta_contact', 'Say hi')}
                        </Link>
                        <a
                            href={`${import.meta.env.BASE_URL}cv/Igor_Szuniewicz_CV.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-primary font-medium rounded-md transition-all duration-200 hover:border-text-secondary hover:bg-surface-overlay active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                            <Download size={16} />
                            {t('cta_cv', 'My CV')}
                        </a>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default About;
