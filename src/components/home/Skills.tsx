import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import { sectionReveal, cardIn, stagger, noMotion } from '@/constants/motion';

const keyTech = [
  {
    name: 'Wwise',
    logo: '/assets/icons/tech/wwiselogo.png',
    category: 'Middleware',
    invert: true,
  },
  {
    name: 'FMOD',
    logo: '/assets/icons/tech/fmodlogo.png',
    category: 'Middleware',
    invert: true,
  },
  {
    name: 'Unreal Engine',
    logo: '/assets/icons/tech/Unreal_Engine-Logo.wine.png',
    category: 'Engine',
    invert: true,
  },
  {
    name: 'Unity',
    logo: '/assets/icons/tech/Unitylogo.png',
    category: 'Engine',
    invert: true,
  },
  {
    name: 'C++',
    logo: '/assets/icons/tech/cpplogo.png',
    category: 'Code',
    invert: false,
  },
  {
    name: 'Python',
    logo: '/assets/icons/tech/pythonlogo.png',
    category: 'Code',
    invert: false,
  },
];

const Skills = () => {
  const { t } = useTranslation('home');
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="pt-16 pb-32">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
          whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
          className="text-center mb-12"
        >
          <span
            className="inline-block px-4 py-2 mb-6 text-xs font-label text-accent uppercase tracking-wide border border-accent/20 rounded-sm"
          >
            {t('skills.badge', 'Technologies')}
          </span>
          <h2 className="text-5xl md:text-7xl font-display text-cream-light mb-6 tracking-wide">
            {t('skills.title', 'Tech Stack')}
          </h2>
          <p className="text-dim text-lg max-w-2xl mx-auto">
            {t('skills.subtitle', 'Core tools I use for game audio implementation and development')}
          </p>
        </motion.div>

        {/* Tech Grid — first two cards span wider for visual hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {keyTech.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
              whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? noMotion.transition : {
                ...cardIn.transition,
                delay: index * stagger.cards,
              }}
              className={`relative group bg-secondary border border-border rounded-sm p-8 hover:border-border-hover hover:bg-elevated transition-colors duration-200 ${
                index < 2 ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Category label */}
              <span className="absolute top-6 right-6 text-[10px] font-label text-dim uppercase tracking-wide">
                {tech.category}
              </span>

              {/* Logo */}
              <div className="flex items-center justify-center h-28 mb-6">
                <img
                  src={tech.logo}
                  alt={tech.name}
                  width={96}
                  height={96}
                  className={`h-24 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity ${tech.invert ? 'invert brightness-200' : ''}`}
                />
              </div>

              {/* Name */}
              <h3 className="text-2xl font-display text-cream group-hover:text-cream-light transition-colors text-center">
                {tech.name}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Secondary Skills */}
        <motion.div
          initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
          whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
          className="border-t border-border pt-14"
        >
          <motion.h3
            initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
            className="text-center text-sm font-label text-dim uppercase tracking-wide mb-12"
          >
            {t('skills.also', 'Also experienced with')}
          </motion.h3>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'MetaSounds', 'Blueprints', 'C#', 'Reaper', 'Pro Tools',
              'Sound Design', 'Mixing', '3D Audio', 'JUCE', 'DSP', 'Wwise API',
              'FMOD Studio', 'Blueprint Visual Scripting'
            ].map((skill, index) => (
              <motion.span
                key={skill}
                initial={prefersReducedMotion ? noMotion.initial : { opacity: 0 }}
                whileInView={prefersReducedMotion ? noMotion.animate : { opacity: 1 }}
                viewport={{ once: true }}
                transition={prefersReducedMotion ? noMotion.transition : { delay: index * stagger.tags }}
                className="px-5 py-2.5 border border-border rounded-sm text-sm text-dim hover:text-cream hover:border-border-hover hover:bg-elevated transition-colors duration-200 cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Skills;
