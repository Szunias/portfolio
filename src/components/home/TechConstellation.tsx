import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { TECH_ICON_MAP, TECH_CATEGORIES } from '../../constants/techData';
import { Cpu, Code2, Music, Wrench, LucideIcon } from 'lucide-react';

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  code: Code2,
  middleware: Music,
  engine: Cpu,
  tools: Wrench
};

// Map accent colors to Tailwind classes
const ACCENT_COLOR_CLASSES: Record<string, string> = {
  '#ef4444': 'text-red-500',
  '#3b82f6': 'text-blue-500',
  '#a855f7': 'text-purple-500',
  '#eab308': 'text-yellow-500',
};

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {TECH_CATEGORIES.map((category, index) => {
        const Icon = ICON_MAP[category.id] || Cpu;
        const iconColorClass = ACCENT_COLOR_CLASSES[category.accentColor] || 'text-accent';
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-500 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="p-3 rounded-lg bg-white/5">
                    <Icon size={24} className={iconColorClass} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-accent transition-colors duration-300">
                        {t(category.titleKey)}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-mono">
                        {t(category.subtitleKey)}
                    </p>
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
                            className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)] transition-all group cursor-pointer"
                        >
                             {iconPath && (
                                <img
                                    src={iconPath}
                                    alt=""
                                    role="presentation"
                                    aria-hidden="true"
                                    className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                            <span className="text-sm text-slate-300 group-hover:text-accent font-medium transition-colors duration-300">{tech}</span>
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

export default memo(TechConstellation);
