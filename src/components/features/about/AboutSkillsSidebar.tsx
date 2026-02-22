import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Mail, Copy, Check } from 'lucide-react';
import type { TFunction } from 'i18next';

import type { PersonalInfo } from '@/types';
import { detailInRight, noMotion } from '@/constants/motion';

interface AboutSkills {
    middleware: string[];
    engines: string[];
    programming: string[];
    production: string[];
    tools: string[];
}

interface AboutSkillsSidebarProps {
    personalInfo: PersonalInfo;
    skills: AboutSkills;
    t: TFunction;
}

const AboutSkillsSidebar = ({ personalInfo, skills, t }: AboutSkillsSidebarProps) => {
    const [emailCopied, setEmailCopied] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(personalInfo.email);
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    };

    const skillSections = [
        { key: 'middleware', title: t('tech_middleware_title', 'Middleware'), items: skills.middleware },
        { key: 'engines', title: t('tech_engines_title', 'Game Engines'), items: skills.engines },
        { key: 'programming', title: t('tech_programming_title', 'Programming'), items: skills.programming },
        { key: 'production', title: t('tech_production_title', 'Production'), items: skills.production },
        { key: 'tools', title: t('tech_specialized_title', 'Tools'), items: skills.tools },
    ];

    return (
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <motion.div
                initial={prefersReducedMotion ? noMotion.initial : detailInRight.initial}
                whileInView={prefersReducedMotion ? noMotion.animate : detailInRight.animate}
                viewport={{ once: true }}
                transition={prefersReducedMotion ? noMotion.transition : detailInRight.transition}
                className="bg-secondary border border-border rounded-sm p-6 space-y-5"
            >
                {/* Quick Info */}
                <h3 className="text-lg font-display text-cream-light">
                    {t('about_quick_info', 'Quick Info')}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-3">
                    <MapPin className="text-accent flex-shrink-0" size={18} aria-hidden="true" />
                    <div>
                        <p className="text-cream font-medium">{personalInfo.location.city}</p>
                        <p className="text-dim text-sm">{personalInfo.location.country}</p>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success/80 rounded-full animate-pulse flex-shrink-0" aria-hidden="true" />
                    <div>
                        <p className="text-cream font-medium">{t('status_looking_internship', 'Available for internship')}</p>
                        <p className="text-dim text-sm">{personalInfo.availability.status}</p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                    <Mail className="text-accent flex-shrink-0" size={18} aria-hidden="true" />
                    <button
                        onClick={handleCopyEmail}
                        aria-label="Copy email to clipboard"
                        className="group flex items-center gap-2 text-dim hover:text-cream transition-colors"
                    >
                        <span className="text-sm truncate max-w-[180px]">{personalInfo.email}</span>
                        {emailCopied ? (
                            <Check size={14} className="text-success" />
                        ) : (
                            <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Skills Sections */}
                {skillSections.map((section) => (
                    <div key={section.key}>
                        <h4 className="text-xs font-label text-dim uppercase tracking-wide mb-2">
                            {section.title}
                        </h4>
                        <ul className="flex flex-wrap gap-1.5">
                            {section.items.map(skill => (
                                <li
                                    key={skill}
                                    className="px-2.5 py-1 text-xs font-label text-accent bg-accent/5 border border-accent/20 rounded-sm"
                                >
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default AboutSkillsSidebar;
