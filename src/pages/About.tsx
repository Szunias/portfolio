import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Download } from 'lucide-react';

import SEO from '../components/layout/SEO';
import { sectionReveal, noMotion } from '../constants/motion';

const PROFILE_IMAGE = `${import.meta.env.BASE_URL}assets/images/profile.jpg`;

/** Inline SVG waveform icon for the photo placeholder. */
const WaveformIcon = () => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        className="text-text-tertiary"
        aria-hidden="true"
    >
        <rect x="10" y="18" width="4" height="12" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="18" y="12" width="4" height="24" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="26" y="16" width="4" height="16" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="34" y="14" width="4" height="20" rx="2" fill="currentColor" opacity="0.5" />
    </svg>
);

/** Small 3-bar waveform accent for the section divider. */
const DividerWaveform = () => (
    <svg
        width="24"
        height="16"
        viewBox="0 0 24 16"
        fill="none"
        className="text-accent"
        aria-hidden="true"
    >
        <rect x="4" y="4" width="2" height="8" rx="1" fill="currentColor" />
        <rect x="11" y="1" width="2" height="14" rx="1" fill="currentColor" />
        <rect x="18" y="4" width="2" height="8" rx="1" fill="currentColor" />
    </svg>
);

const About = () => {
    const { t } = useTranslation('about');
    const prefersReducedMotion = useReducedMotion();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

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

                {/* --- STORY + PHOTO: Two-column on desktop, stacked on mobile --- */}
                <motion.section
                    initial={fadeFromLeft.initial}
                    whileInView={fadeFromLeft.animate}
                    viewport={{ once: true }}
                    transition={fadeFromLeft.transition}
                    className="mb-20"
                >
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Story text */}
                        <div className="space-y-8 flex-1">
                            <p className="text-body text-text-secondary leading-relaxed">
                                {t('story_1')}
                            </p>
                            <p className="text-body text-text-secondary leading-relaxed">
                                {t('story_2')}
                            </p>
                            <p className="text-body text-text-secondary leading-relaxed">
                                {t('story_3')}
                            </p>
                        </div>

                        {/* Profile photo / placeholder */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <div className="aspect-[3/4] w-full max-w-[280px] rounded-lg overflow-hidden bg-surface-raised border border-border relative">
                                {!imageError && (
                                    <img
                                        src={PROFILE_IMAGE}
                                        alt={t('profile_photo_alt', 'Igor Szuniewicz')}
                                        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={() => setImageError(true)}
                                    />
                                )}
                                {/* Placeholder: visible when image fails or while loading */}
                                {!imageLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <WaveformIcon />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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

                {/* --- VISUAL BREAK: Decorative divider with waveform accent --- */}
                <div className="flex items-center justify-center my-20">
                    <div className="w-[30%] border-t border-border" />
                    <div className="mx-4">
                        <DividerWaveform />
                    </div>
                    <div className="w-[30%] border-t border-border" />
                </div>

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
