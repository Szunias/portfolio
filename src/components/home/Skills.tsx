import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Key technologies with their logos and categories
const keyTech = [
  { 
    name: 'Wwise', 
    logo: '/assets/icons/tech/wwiselogo.png', 
    category: 'Middleware',
    invert: true 
  },
  { 
    name: 'FMOD', 
    logo: '/assets/icons/tech/fmodlogo.png', 
    category: 'Middleware',
    invert: true 
  },
  { 
    name: 'Unreal Engine', 
    logo: '/assets/icons/tech/Unreal_Engine-Logo.wine.png', 
    category: 'Engine',
    invert: true 
  },
  { 
    name: 'Unity', 
    logo: '/assets/icons/tech/Unitylogo.png', 
    category: 'Engine',
    invert: true 
  },
  { 
    name: 'C++', 
    logo: '/assets/icons/tech/cpplogo.png', 
    category: 'Code',
    invert: false 
  },
  { 
    name: 'Python', 
    logo: '/assets/icons/tech/pythonlogo.png', 
    category: 'Code',
    invert: false 
  },
];

const Skills = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#050508]" />
      {/* Top gradient fade - smooth transition from Layout gradient */}
      <div className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/70 to-[#050508]" />
      </div>
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            {t('skills.title', 'Tech Stack')}
          </h2>
          <p className="text-dim text-lg max-w-xl mx-auto">
            {t('skills.subtitle', 'Core tools I use for game audio implementation and development')}
          </p>
        </motion.div>

        {/* Main tech grid - 6 key technologies */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16">
          {keyTech.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-500"
            >
              {/* Category label */}
              <span className="absolute top-4 right-4 text-[10px] font-mono text-dim uppercase tracking-wider">
                {tech.category}
              </span>
              
              {/* Logo */}
              <div className="flex items-center justify-center h-20 md:h-24 mb-4">
                <img 
                  src={tech.logo} 
                  alt={tech.name}
                  className={`h-16 md:h-20 w-auto object-contain transition-all duration-500 opacity-60 group-hover:opacity-100 ${tech.invert ? 'invert brightness-200' : ''}`}
                />
              </div>
              
              {/* Name */}
              <h3 className="text-center text-lg font-semibold text-white/80 group-hover:text-white transition-colors">
                {tech.name}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Secondary skills - simple list */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-white/10 pt-12"
        >
          <h3 className="text-center text-sm font-mono text-dim uppercase tracking-widest mb-8">
            {t('skills.also', 'Also experienced with')}
          </h3>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'MetaSounds', 'Blueprints', 'C#', 'Reaper', 'Pro Tools', 
              'Sound Design', 'Mixing', '3D Audio', 'JUCE', 'DSP'
            ].map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-dim hover:text-white hover:border-accent/30 transition-all cursor-default"
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
