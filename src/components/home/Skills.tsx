import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Enhanced tech data with 3D effects
const keyTech = [
  {
    name: 'Wwise',
    logo: '/assets/icons/tech/wwiselogo.png',
    category: 'Middleware',
    invert: true,
    color: 'from-purple-500/20 to-blue-500/20'
  },
  {
    name: 'FMOD',
    logo: '/assets/icons/tech/fmodlogo.png',
    category: 'Middleware',
    invert: true,
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    name: 'Unreal Engine',
    logo: '/assets/icons/tech/Unreal_Engine-Logo.wine.png',
    category: 'Engine',
    invert: true,
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    name: 'Unity',
    logo: '/assets/icons/tech/Unitylogo.png',
    category: 'Engine',
    invert: true,
    color: 'from-gray-500/20 to-slate-500/20'
  },
  {
    name: 'C++',
    logo: '/assets/icons/tech/cpplogo.png',
    category: 'Code',
    invert: false,
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    name: 'Python',
    logo: '/assets/icons/tech/pythonlogo.png',
    category: 'Code',
    invert: false,
    color: 'from-yellow-500/20 to-green-500/20'
  },
];

const Skills = () => {
  const { t } = useTranslation('home');

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 mb-6 text-xs font-mono text-accent uppercase tracking-widest bg-accent/5 border border-accent/20 rounded-full"
          >
            {t('skills.badge', 'Technologies')}
          </motion.span>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              {t('skills.title', 'Tech Stack')}
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('skills.subtitle', 'Core tools I use for game audio implementation and development')}
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {keyTech.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
              }}
              whileHover={{ scale: 1.02 }}
              className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all"
            >
              {/* Category label */}
              <span className="absolute top-6 right-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
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
              <h3 className="text-2xl font-bold text-white/90 group-hover:text-white transition-colors text-center">
                {tech.name}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Secondary Skills */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-white/10 pt-16"
        >
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-sm font-mono text-slate-500 uppercase tracking-widest mb-12"
          >
            {t('skills.also', 'Also experienced with')}
          </motion.h3>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              'MetaSounds', 'Blueprints', 'C#', 'Reaper', 'Pro Tools',
              'Sound Design', 'Mixing', '3D Audio', 'JUCE', 'DSP', 'Wwise API',
              'FMOD Studio', 'Blueprint Visual Scripting'
            ].map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-slate-400 hover:text-white hover:border-accent/40 hover:bg-white/10 transition-all cursor-default"
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
