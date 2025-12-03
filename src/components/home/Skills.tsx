import { usePortfolioData } from '../../hooks/usePortfolioData';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Server, Database, Disc, Code2, Music2, Workflow, Terminal, 
  Share2, Layers, GitGraph, Box, Mic, Sliders, Zap, Bot, 
  FileAudio, Speaker, Globe, Cpu
} from 'lucide-react';

const Skills = () => {
  const { core_skills } = usePortfolioData();
  const { t } = useTranslation();
  
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

  // Category Icons
  const categoryIcons: {[key: string]: any} = {
    'game_audio': Disc,
    'production': Server,
    'development': Database
  };

  // Fallback Lucide Icons for specific keywords
  // Order matters: check specific keywords before generic ones
  const fallbackIcons: Record<string, any> = {
    'blueprint': Workflow,
    'metasounds': Music2,
    'interactive music': Music2,
    'composition': Music2,
    'sound design': FileAudio,
    'spatial': Globe,
    '3d': Globe,
    'surround': Speaker,
    'field recording': Mic,
    'foley': Mic,
    'mixing': Sliders,
    'mastering': Sliders,
    'dsp': Zap,
    'real-time': Zap,
    'optimization': Box,
    'profiling': Box,
    'debugging': Box,
    'memory': Zap,
    'machine learning': Bot,
    'ml': Bot,
    'ai': Bot,
    'python': Terminal,
    'scripting': Terminal,
    'c++': Code2,
    'c#': Code2,
    'vst': FileAudio,
    'plugin': FileAudio,
    'jenkins': Server,
    'ci/cd': Server,
    'middleware': Share2,
    'integration': Share2,
    'voice management': Sliders,
    'jira': Layers,
    'agile': Layers,
    'scrum': Layers,
    'git': GitGraph,
    'perforce': GitGraph,
    'source': GitGraph
  };

  const getFallbackIcon = (skillName: string) => {
     const lower = skillName.toLowerCase();
     // Find the first key that is contained in the skill name
     const key = Object.keys(fallbackIcons).find(k => lower.includes(k));
     return key ? fallbackIcons[key] : Cpu; // Generic fallback
  };

  // Icon Mapping Logic
  const getIconPath = (skillName: string) => {
    const name = skillName.toLowerCase().replace(/[\s\.]/g, ''); // remove spaces and dots
    
    const map: Record<string, string> = {
      'c++': 'cpplogo.png',
      'cpp': 'cpplogo.png',
      'c#': 'csharplogo.png',
      'csharp': 'csharplogo.png',
      'unreal': 'Unreal_Engine-Logo.wine.png',
      'ue5': 'Unreal_Engine-Logo.wine.png',
      'unity': 'Unitylogo.png',
      'wwise': 'wwiselogo.png',
      'fmod': 'fmodlogo.png',
      'python': 'pythonlogo.png',
      'reaper': 'REAPER_logo.png',
      'perforce': 'Perforcelogo.png',
      'git': 'github.png',
      'sourcecontrol': 'github.png',
      'ableton': 'abletonlogo.png',
      'cubase': 'Cubaselogo.png',
      'logic': 'logicproicon.png',
      'studioone': 'studiooneicon.png',
      'puredata': 'puredatalogo.png',
      'maxmsp': 'puredatalogo.png', 
      'juce': 'JUCE_Logo.png',
      'dsp': 'dsplogo.png',
      'tensorflow': 'tensorflowlogo.png',
      '3daudio': '3DAudio.png',
      'spatialaudio': '3DAudio.png'
    };

    // Check for exact or fuzzy match
    const key = Object.keys(map).find(k => name.includes(k));
    return key ? `/assets/icons/tech/${map[key]}` : null;
  };

  return (
    <section className="py-24 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tight">
            {t('skills.title', 'Technical Arsenal')}
          </h2>
          <div className="h-0.5 w-24 bg-accent/50 mx-auto rounded-full box-shadow-glow"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Object.entries(core_skills).map(([key, skillGroup], index) => {
             const transKey = skillKeys[key];
             const translatedTitle = transKey ? t(transKey, skillGroup.title) : skillGroup.title;
             const prefix = skillPrefixes[key];
             const CatIcon = categoryIcons[key] || Server;

             return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="group relative bg-[#0c0c0c] rounded-xl border border-white/5 overflow-hidden hover:border-accent/30 transition-colors duration-500"
                >
                  {/* "Rack Unit" Header */}
                  <div className="bg-[#111] px-6 py-4 border-b border-white/5 flex items-center justify-between relative">
                    {/* Screw holes */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />

                    <div className="flex items-center gap-3 ml-2">
                        <div className="p-2 rounded bg-white/5 text-accent group-hover:text-white transition-colors">
                            <CatIcon size={18} />
                        </div>
                        <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-300 group-hover:text-accent transition-colors">
                            {translatedTitle}
                        </h3>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {skillGroup.skills.map((skill, idx) => {
                            const iconPath = getIconPath(skill);
                            const skillName = prefix ? t(`${prefix}_${idx + 1}`, skill) : skill;
                            const FallbackIcon = getFallbackIcon(skill);

                            const needsInvert = iconPath && ['unreal', 'unity', 'github', 'perforce', 'wwise', '3daudio', 'reaper', 'fmod'].some(k => iconPath.toLowerCase().includes(k));

                            return (
                                <div 
                                    key={skill} 
                                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300 group/skill h-full"
                                >
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-black/20 rounded p-1">
                                        {iconPath ? (
                                            <img 
                                                src={iconPath} 
                                                alt={skillName} 
                                                className={`w-full h-full object-contain opacity-70 group-hover/skill:opacity-100 transition-all duration-300 filter grayscale group-hover/skill:grayscale-0 ${needsInvert ? 'invert brightness-200' : ''}`}
                                            />
                                        ) : (
                                            <FallbackIcon size={16} className="text-slate-600 group-hover/skill:text-accent transition-colors" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 group-hover/skill:text-white transition-colors leading-tight break-words">
                                        {skillName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                  </div>
                  
                  {/* Decorative bottom glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
             );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;