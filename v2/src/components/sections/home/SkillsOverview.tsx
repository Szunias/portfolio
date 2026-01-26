'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface SkillCategory {
  key: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    key: 'middleware',
    skills: ['Wwise', 'FMOD', 'MetaSounds'],
  },
  {
    key: 'engines',
    skills: ['Unreal Engine', 'Unity', 'Godot'],
  },
  {
    key: 'daws',
    skills: ['Reaper', 'Pro Tools', 'Logic Pro', 'Ableton'],
  },
  {
    key: 'programming',
    skills: ['C++', 'C#', 'Python', 'JUCE'],
  },
  {
    key: 'dsp',
    skills: ['Max/MSP', 'iZotope RX', 'FabFilter'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export default function SkillsOverview() {
  const t = useTranslations('skills');

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Skills grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {skillCategories.map((category) => (
            <motion.div
              key={category.key}
              variants={itemVariants}
              className="bg-surface rounded-xl border border-border p-6 hover:border-accent/50 transition-colors group"
            >
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                {t(`categories.${category.key}`)}
              </h3>
              <ul className="space-y-2">
                {category.skills.map((skill) => (
                  <motion.li
                    key={skill}
                    whileHover={{ x: 4 }}
                    className="text-text-secondary hover:text-text-primary transition-colors cursor-default flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full group-hover:bg-accent transition-colors" />
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
