import { Trans, useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';

import SEO from '../components/layout/SEO';
import { Button } from '../components/ui/Button';

const BACKGROUND_IMAGE = {
    name: 'Crime fighters looking for trace of criminals',
    image: `${import.meta.env.BASE_URL}assets/images/about-grid/crime-fighters.jpg`,
} as const;

const AFFILIATIONS = [
    {
        name: 'Digital Arts & Entertainment',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/dae-official.svg`,
        widthClass: 'w-[12rem] md:w-[13rem]',
        imageClass: 'max-h-16 md:max-h-20',
    },
    {
        name: 'Howest',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/howest-official.svg`,
        widthClass: 'w-[9.5rem] md:w-[10.5rem]',
        imageClass: 'max-h-16 md:max-h-20',
    },
    {
        name: 'Royal Military Academy',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/rma-official.png`,
        widthClass: 'w-[8rem] md:w-[8.75rem]',
        imageClass: 'max-h-16 md:max-h-20',
    },
    {
        name: 'XR Labs',
        image: `${import.meta.env.BASE_URL}assets/images/affiliations/xralbs.avif`,
        widthClass: 'w-[14rem] md:w-[17rem]',
        imageClass: 'max-h-28 md:max-h-32',
    },
] as const;

const TOOLS = [
    {
        name: 'Wwise',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/wwise.svg`,
        accentClass: 'hover:border-[#f68a36]/40 hover:shadow-[0_0_30px_rgba(246,138,54,0.12)]',
    },
    {
        name: 'FMOD',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/fmod.svg`,
        accentClass: 'hover:border-[#e23a2e]/40 hover:shadow-[0_0_30px_rgba(226,58,46,0.12)]',
    },
    {
        name: 'Pro Tools',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/protools.svg`,
        accentClass: 'hover:border-[#6c5ce7]/40 hover:shadow-[0_0_30px_rgba(108,92,231,0.12)]',
    },
    {
        name: 'Unreal Engine',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/unreal.svg`,
        accentClass: 'hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]',
    },
    {
        name: 'Unity',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/unity.svg`,
        accentClass: 'hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]',
    },
    {
        name: 'Perforce',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/perforce.svg`,
        accentClass: 'hover:border-[#41b883]/35 hover:shadow-[0_0_30px_rgba(65,184,131,0.12)]',
    },
    {
        name: 'JUCE',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/juce.svg`,
        accentClass: 'hover:border-[#8bc34a]/35 hover:shadow-[0_0_30px_rgba(139,195,74,0.12)]',
    },
    {
        name: 'Blender',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/blender.svg`,
        accentClass: 'hover:border-[#f5792a]/40 hover:shadow-[0_0_30px_rgba(245,121,42,0.12)]',
    },
    {
        name: 'GitHub',
        image: `${import.meta.env.BASE_URL}assets/icons/tech/github.png`,
        accentClass: 'hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]',
    },
    {
        name: 'Python',
        image: `${import.meta.env.BASE_URL}assets/icons/tech/pythonlogo.png`,
        accentClass: 'hover:border-[#ffd43b]/35 hover:shadow-[0_0_30px_rgba(255,212,59,0.12)]',
    },
    {
        name: 'C++',
        image: `${import.meta.env.BASE_URL}assets/icons/tech/c++logo.png`,
        accentClass: 'hover:border-[#6295cb]/35 hover:shadow-[0_0_30px_rgba(98,149,203,0.12)]',
    },
    {
        name: 'C#',
        image: `${import.meta.env.BASE_URL}assets/icons/toolkit-svg/dotnet.svg`,
        accentClass: 'hover:border-[#9b4f96]/35 hover:shadow-[0_0_30px_rgba(155,79,150,0.12)]',
    },
];

const PARAGRAPH_KEYS = ['1', '2', '3'] as const;

const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const gridItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] },
    },
};

const noMotionContainerVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0 } },
};

const noMotionItemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-5 font-mono text-overline uppercase tracking-widest text-text-tertiary">
        {children}
    </h2>
);

const RichParagraph = ({ i18nKey }: { i18nKey: string }) => (
    <p className="text-body leading-8 text-[#d1cbc3]">
        <Trans
            ns="about"
            i18nKey={i18nKey}
            components={{
                strong: <strong className="font-medium text-text-primary" />,
            }}
        />
    </p>
);

const About = () => {
    const { t } = useTranslation('about');
    const prefersReducedMotion = useReducedMotion();

    const containerVars = prefersReducedMotion
        ? noMotionContainerVariants
        : gridContainerVariants;
    const itemVars = prefersReducedMotion
        ? noMotionItemVariants
        : gridItemVariants;

    return (
        <div className="relative min-h-screen bg-surface">
            <SEO title={t('about_page_title', 'About')} description={t('about_page_description')} />

            <div className="relative z-10 mx-auto max-w-content-wide px-6 pb-32 pt-32 md:px-12 lg:px-16">
                <motion.div
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
                    variants={containerVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.section className="pb-2 md:col-span-3" variants={itemVars}>
                        <h1 className="font-display text-h1 leading-tight text-text-primary md:text-hero">
                            {t('hook')}
                        </h1>
                        <p className="mt-3 font-mono text-body-sm tracking-wide text-text-tertiary">
                            {t('intro_sub')}
                        </p>
                    </motion.section>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <div className="mb-8 max-w-2xl">
                            <SectionLabel>{t('section_affiliations')}</SectionLabel>
                        </div>

                        <div className="grid grid-cols-2 items-center gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-12 lg:gap-x-16">
                            {AFFILIATIONS.map((affiliation) => (
                                <div key={affiliation.name} className="flex min-h-[64px] items-center justify-center overflow-hidden">
                                    <img
                                        src={affiliation.image}
                                        alt={affiliation.name}
                                        className={`${affiliation.widthClass} ${affiliation.imageClass} object-contain opacity-90 transition duration-300 ease-out hover:scale-110 hover:opacity-100`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    <motion.div
                        className="group overflow-hidden rounded-xl border border-border bg-surface-raised md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative h-full min-h-[420px] w-full">
                            <img
                                src={BACKGROUND_IMAGE.image}
                                alt={BACKGROUND_IMAGE.name}
                                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                                loading="lazy"
                            />
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_background')}</SectionLabel>
                        <div className="max-w-[72ch] space-y-5">
                            {PARAGRAPH_KEYS.map((key) => (
                                <RichParagraph key={key} i18nKey={`background_${key}`} />
                            ))}
                        </div>
                    </motion.section>

                    <motion.div
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_approach')}</SectionLabel>
                        <div className="max-w-[72ch] space-y-5">
                            {PARAGRAPH_KEYS.map((key) => (
                                <RichParagraph key={key} i18nKey={`approach_${key}`} />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_toolkit')}</SectionLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {TOOLS.map((tool) => (
                                <div
                                    key={tool.name}
                                    className={`group relative flex aspect-square items-center justify-center rounded-xl border border-white/8 bg-[#0d1016] p-1.5 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#111621] ${tool.accentClass}`}
                                >
                                    <img
                                        src={tool.image}
                                        alt={tool.name}
                                        className="max-h-36 w-full object-contain opacity-95 brightness-0 invert transition duration-300 ease-out group-hover:scale-[1.16] group-hover:opacity-100"
                                        loading="lazy"
                                    />
                                    <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-3 rounded-md border border-white/10 bg-black/85 px-2.5 py-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/95 opacity-0 transition duration-200 ease-out group-hover:-translate-y-5 group-hover:opacity-100">
                                        {tool.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section_education')}</SectionLabel>
                        <div className="space-y-4">
                            {(['dae', 'hs', 'piano'] as const).map((key) => (
                                <div key={key} className="border-l-2 border-border pl-4">
                                    <p className="font-display text-body-sm font-medium text-text-primary">
                                        {t(`edu_${key}_name`)}
                                    </p>
                                    <p className="mt-0.5 font-mono text-caption text-text-tertiary">
                                        {t(`edu_${key}_desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <h2 className="mb-2 font-display text-h3 text-text-primary">
                            {t('cta_heading')}
                        </h2>
                        <p className="mb-6 text-body-sm text-text-secondary">
                            {t('cta_text')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => {
                                    window.location.href = '/contact';
                                }}
                            >
                                {t('cta_contact')}
                                <ArrowRight size={16} />
                            </Button>
                            <a
                                href={`${import.meta.env.BASE_URL}cv/Igor_Szuniewicz_CV.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="secondary" size="lg" className="gap-2" tabIndex={-1}>
                                    <Download size={16} />
                                    {t('cta_cv')}
                                </Button>
                            </a>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
