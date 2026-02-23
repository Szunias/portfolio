import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import { containerVariants, itemVariants, sectionReveal, noMotion } from '@/constants/motion';

// Workflow-based skill groupings that show COMPETENCE, not just tool names
const skillGroups = [
  {
    key: 'middleware',
    titleKey: 'skills.group_middleware',
    defaultTitle: 'Audio Middleware',
    tools: ['Wwise', 'FMOD', 'MetaSounds'],
    accentWarm: false,
  },
  {
    key: 'engines',
    titleKey: 'skills.group_engines',
    defaultTitle: 'Game Engines',
    tools: ['Unreal Engine 5', 'Unity', 'Blueprints'],
    accentWarm: false,
  },
  {
    key: 'programming',
    titleKey: 'skills.group_programming',
    defaultTitle: 'Programming',
    tools: ['C++', 'Python', 'C#', 'JUCE'],
    accentWarm: true,
  },
  {
    key: 'production',
    titleKey: 'skills.group_production',
    defaultTitle: 'Sound Design',
    tools: ['Reaper', 'Pro Tools', 'Logic Pro', 'Field Recording', 'Mixing'],
    accentWarm: false,
  },
  {
    key: 'specialized',
    titleKey: 'skills.group_specialized',
    defaultTitle: 'Specialized',
    tools: ['3D Audio', 'DSP', 'iZotope RX', 'Max/MSP', 'Perforce', 'GitHub'],
    accentWarm: true,
  },
];

const Skills = () => {
  const { t } = useTranslation('home');
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="pt-16 pb-32 bg-surface">
      <div className="max-w-content mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
          whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
          viewport={{ once: true, amount: 0.2 }}
          transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-2 mb-6 font-mono text-label uppercase bg-accent/10 text-accent border border-accent/15 rounded px-2.5 py-1"
          >
            {t('skills.badge', 'Technologies')}
          </span>
          <h2 className="font-display text-h2 text-text-primary mb-4">
            {t('skills.title', 'Tech Stack')}
          </h2>
          <p className="text-text-secondary text-body max-w-2xl mx-auto">
            {t('skills.subtitle', 'Core tools I use for game audio implementation and development')}
          </p>
        </motion.div>

        {/* Skill Groups - Workstation Style */}
        <motion.div
          initial={prefersReducedMotion ? noMotion.initial : containerVariants.hidden}
          whileInView={prefersReducedMotion ? noMotion.animate : containerVariants.visible}
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {skillGroups.map((group) => (
            <motion.div
              key={group.key}
              variants={prefersReducedMotion ? {} : itemVariants}
              className="bg-surface-raised border border-border rounded-lg p-6 hover:border-border-hover transition-all duration-200 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-surface"
            >
              {/* Group Title */}
              <h3 className="font-display text-h3 text-text-primary mb-4">
                {t(group.titleKey, group.defaultTitle)}
              </h3>

              {/* Tools as Tags */}
              <div className="flex flex-wrap gap-2">
                {group.tools.map((tool) => (
                  <span
                    key={tool}
                    className={`font-mono text-label uppercase rounded px-2.5 py-1 border ${
                      group.accentWarm
                        ? 'bg-accent-warm/10 text-accent-warm border-accent-warm/15'
                        : 'bg-accent/10 text-accent border-accent/15'
                    }`}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Skills;
