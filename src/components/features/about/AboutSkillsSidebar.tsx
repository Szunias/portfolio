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
        { key: 'middleware', title: t('tech_middleware_title', 'Middleware'), items: skills.middleware, delay: 0.1 },
        { key: 'engines', title: t('tech_engines_title', 'Game Engines'), items: skills.engines, delay: 0.15 },
        { key: 'programming', title: t('tech_programming_title', 'Programming'), items: skills.programming, delay: 0.2 },
        { key: 'production', title: t('tech_production_title', 'Production'), items: skills.production, delay: 0.25 },
        { key: 'tools', title: t('tech_specialized_title', 'Tools'), items: skills.tools, delay: 0.3 },
    ];

    return (
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 lg:self-start">
            {/* Quick Info Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
            >
                <h3 className="text-lg font-bold text-white mb-4">
                    {t('about_quick_info', 'Quick Info')}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <MapPin className="text-accent" size={18} />
                    </div>
                    <div>
                        <p className="text-white font-medium">{personalInfo.location.city}</p>
                        <p className="text-slate-500 text-sm">{personalInfo.location.country}</p>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <div>
                        <p className="text-white font-medium">{t('status_looking_internship', 'Available for internship')}</p>
                        <p className="text-slate-500 text-sm">{personalInfo.availability.status}</p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <Mail className="text-accent" size={18} />
                    </div>
                    <button
                        onClick={handleCopyEmail}
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
            </motion.div>

            {/* Skills Cards */}
            {skillSections.map((section) => (
                <motion.div
                    key={section.key}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: section.delay }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-4">{section.title}</h3>
                    <div className="flex flex-wrap gap-2">
                        {section.items.map(skill => (
                            <span
                                key={skill}
                                className="px-3 py-1.5 text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default AboutSkillsSidebar;
