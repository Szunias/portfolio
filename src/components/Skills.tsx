import { usePortfolioData } from '../hooks/usePortfolioData';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Skills = () => {
  const { core_skills } = usePortfolioData();
  const { t } = useTranslation();
  
  // Map data keys to translation prefixes
  const skillPrefixes: {[key: string]: string} = {
    'game_audio': 'skill_game',
    'production': 'skill_production',
    'development': 'skill_dev'
  };

  const skillKeys: {[key: string]: string} = {
    'game_audio': 'skill_game_title',
    'production': 'skill_production_title',
    'development': 'skill_dev_title'
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('skills.title', 'Technical Skills')}
          </h2>
          <div className="h-1 w-20 bg-accent mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(core_skills).map(([key, skillGroup], index) => {
             const transKey = skillKeys[key];
             const translatedTitle = transKey ? t(transKey, skillGroup.title) : skillGroup.title;
             const prefix = skillPrefixes[key];

             return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                >
                  <h3 className="text-xl font-semibold text-accent mb-4 border-b border-slate-700 pb-2">
                    {translatedTitle}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.skills.map((skill, idx) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary text-slate-300 text-sm rounded-full border border-slate-700 hover:border-accent/50 transition cursor-default"
                      >
                        {/* Try to get translation like 'skill_game_1', otherwise fallback to English text */}
                        {prefix ? t(`${prefix}_${idx + 1}`, skill) : skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
             );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;