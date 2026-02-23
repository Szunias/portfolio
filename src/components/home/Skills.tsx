import { motion, useReducedMotion } from 'framer-motion';

import { sectionReveal, noMotion } from '@/constants/motion';

const TOOLS = [
  'Wwise', 'FMOD', 'MetaSounds', 'Unreal Engine 5', 'Unity',
  'C++', 'Python', 'C#', 'JUCE', 'Reaper', 'Pro Tools',
  '3D Audio', 'DSP', 'Max/MSP',
];

const Skills = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-16 bg-surface border-t border-border">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
          whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {TOOLS.map((tool, i) => (
            <span key={tool} className="font-mono text-caption text-text-tertiary uppercase tracking-wider">
              {tool}
              {i < TOOLS.length - 1 && (
                <span className="ml-4 text-border" aria-hidden="true">/</span>
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
