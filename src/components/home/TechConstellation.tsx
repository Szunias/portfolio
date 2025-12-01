import { motion } from 'framer-motion';
import { TECH_ICON_MAP } from '../../constants/techData';
import { Cpu, Code2, Music, Wrench } from 'lucide-react';

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

// Category Configuration with Icons
const TECH_CARDS = [
  { 
    id: 'code', 
    title: 'PROGRAMMING', 
    subtitle: 'Core Logic & Systems',
    icon: Code2,
    color: 'from-red-500/20 to-red-900/5', 
    accent: 'text-red-500',
    border: 'group-hover:border-red-500/50',
    items: ['C++', 'C#', 'Python', 'Blueprints', 'JUCE', 'React'] 
  },
  { 
    id: 'middleware', 
    title: 'AUDIO TECH', 
    subtitle: 'Middleware & Spatial',
    icon: Music, 
    color: 'from-blue-500/20 to-blue-900/5', 
    accent: 'text-blue-400',
    border: 'group-hover:border-blue-400/50',
    items: ['Wwise', 'FMOD', 'MetaSounds', '3D Audio', 'Spatializer'] 
  },
  { 
    id: 'engine', 
    title: 'GAME ENGINES', 
    subtitle: 'Integration & Environment',
    icon: Cpu, 
    color: 'from-purple-500/20 to-purple-900/5', 
    accent: 'text-purple-500',
    border: 'group-hover:border-purple-500/50',
    items: ['Unreal Engine 5', 'Unity', 'Godot', 'CryEngine'] 
  },
  { 
    id: 'tools', 
    title: 'PRODUCTION', 
    subtitle: 'DAW & Version Control',
    icon: Wrench, 
    color: 'from-yellow-500/20 to-yellow-900/5', 
    accent: 'text-yellow-500',
    border: 'group-hover:border-yellow-500/50',
    items: ['Reaper', 'GitHub', 'Perforce', 'iZotope RX', 'Logic Pro'] 
  }
];

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  return (
    <div className="w-full py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {TECH_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`
                group relative h-[420px] rounded-2xl border border-white/5 bg-[#0a0a0a] overflow-hidden cursor-default
                transition-all duration-500 hover:shadow-2xl hover:-translate-y-2
                ${card.border}
            `}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Default State: Big Icon & Title */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:opacity-10 group-hover:scale-110 group-hover:blur-sm">
                <div className={`p-6 rounded-full bg-white/5 mb-6 ${card.accent}`}>
                    <card.icon size={64} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white text-center tracking-wide">{card.title}</h3>
                <p className="text-sm text-slate-500 font-mono uppercase tracking-widest mt-2">{card.subtitle}</p>
            </div>

            {/* Hover State: List of Skills */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <h4 className={`text-xl font-bold mb-6 ${card.accent}`}>{card.title}</h4>
                <div className="flex flex-wrap gap-3">
                    {card.items.map(tech => {
                        // Find specific icon if exists
                        const iconKey = Object.keys(TECH_ICON_MAP).find(k => tech.includes(k));
                        const iconPath = iconKey ? `/assets/icons/tech/${TECH_ICON_MAP[iconKey]}` : null;

                        return (
                            <button
                                key={tech}
                                onClick={(e) => { e.stopPropagation(); onSelect(tech); }}
                                className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all hover:scale-105"
                            >
                                {iconPath && <img src={iconPath} alt="" className="w-4 h-4 object-contain" />}
                                <span className="text-sm font-medium text-slate-200">{tech}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TechConstellation;