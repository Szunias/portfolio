import { motion } from 'framer-motion';
import { TECH_ICON_MAP, TECH_CATEGORIES } from '../../constants/techData';
import { Cpu, Code2, Music, Wrench } from 'lucide-react';

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

const ICON_MAP: Record<string, any> = {
  code: Code2,
  middleware: Music,
  engine: Cpu,
  tools: Wrench
};

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {TECH_CATEGORIES.map((category, index) => {
        const Icon = ICON_MAP[category.id] || Cpu;
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="p-3 rounded-lg bg-white/5">
                    <Icon size={24} style={{ color: category.accentColor }} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{category.title}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-mono">{category.subtitle}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {category.items.map(tech => {
                    const iconKey = Object.keys(TECH_ICON_MAP).find(k => tech.includes(k));
                    const iconPath = iconKey ? `/assets/icons/tech/${TECH_ICON_MAP[iconKey]}` : null;
                    
                    return (
                        <button
                            key={tech}
                            onClick={() => onSelect(tech)}
                            className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group cursor-pointer"
                        >
                             {iconPath && (
                                <img 
                                    src={iconPath} 
                                    alt="" 
                                    className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" 
                                />
                            )}
                            <span className="text-sm text-slate-300 group-hover:text-white font-medium">{tech}</span>
                        </button>
                    )
                })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TechConstellation;