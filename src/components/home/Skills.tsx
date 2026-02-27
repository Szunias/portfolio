import { motion, useReducedMotion } from 'framer-motion';

import { sectionReveal, noMotion, stagger } from '@/constants/motion';

const SKILL_CATEGORIES = [
  {
    label: 'Middleware',
    tools: ['Wwise', 'FMOD', 'MetaSounds'],
  },
  {
    label: 'Engines',
    tools: ['Unreal Engine 5', 'Unity'],
  },
  {
    label: 'Programming',
    tools: ['C++', 'C#', 'Python', 'Blueprints'],
  },
  {
    label: 'DAWs & Tools',
    tools: ['Reaper', 'Pro Tools', 'JUCE', 'Max/MSP'],
  },
];

const Skills = () => {
  const prefersReducedMotion = useReducedMotion();

  const categoryAnimation = (index: number) =>
    prefersReducedMotion
      ? noMotion
      : {
          initial: { opacity: 0, y: 8 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: {
            duration: 0.4,
            delay: index * stagger.skills,
            ease: 'easeOut',
          },
        };

  return (
    <section className="py-16 bg-surface border-t border-border">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
          whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6"
        >
          {SKILL_CATEGORIES.map((category, i) => (
            <motion.div key={category.label} {...categoryAnimation(i)}>
              <h3 className="font-mono text-label text-accent uppercase mb-3">
                {category.label}
              </h3>
              <ul className="space-y-1.5">
                {category.tools.map((tool) => (
                  <li
                    key={tool}
                    className="font-mono text-body-sm text-text-secondary"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
