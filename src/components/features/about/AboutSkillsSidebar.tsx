import { motion } from 'framer-motion';
import { MapPin, Mail, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { TFunction } from 'i18next';

interface PersonalInfo {
    location: { city: string; country: string };
    availability: { status: string };
    email: string;
}

interface Skills {
    middleware: string[];
    engines: string[];
    programming: string[];
    production: string[];
    tools: string[];
}

interface AboutSkillsSidebarProps {
    personalInfo: PersonalInfo;
    skills: Skills;
    t: TFunction;
}

const AboutSkillsSidebar = ({ personalInfo, skills, t }: AboutSkillsSidebarProps) => {
    const [emailCopied, setEmailCopied] = useState(false);

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
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
            >
                {/* Quick Info */}
                <h3 className="text-lg font-bold text-white">
                    {t('about_quick_info', 'Quick Info')}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <MapPin className="text-accent" size={18} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-white font-medium">{personalInfo.location.city}</p>
                        <p className="text-slate-500 text-sm">{personalInfo.location.country}</p>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-white font-medium">{t('status_looking_internship', 'Available for internship')}</p>
                        <p className="text-slate-500 text-sm">{personalInfo.availability.status}</p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <Mail className="text-accent" size={18} aria-hidden="true" />
                    </div>
                    <button
                        onClick={handleCopyEmail}
                        aria-label="Copy email to clipboard"
                        className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <span className="text-sm truncate max-w-[180px]">{personalInfo.email}</span>
                        {emailCopied ? (
                            <Check size={14} className="text-green-400" />
                        ) : (
                            <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Skills Sections */}
                {skillSections.map((section) => (
                    <div key={section.key}>
                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                            {section.title}
                        </h4>
                        <ul className="flex flex-wrap gap-1.5">
                            {section.items.map(skill => (
                                <li
                                    key={skill}
                                    className="px-2.5 py-1 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
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
