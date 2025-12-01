import { motion } from 'framer-motion';
import { TECH_ICON_MAP } from '../../constants/techData';
import { Cpu, Code2, Music, Wrench } from 'lucide-react';

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

const TECH_CARDS = [
  {
    id: 'code',
    title: 'PROGRAMMING',
    subtitle: 'Core Logic',
    icon: Code2,
    accentColor: '#ef4444',
    items: ['C++', 'C#', 'Python', 'Blueprints', 'JUCE', 'Pure Data'],
    gridClass: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 'middleware',
    title: 'AUDIO TECH',
    subtitle: 'Interactive Systems',
    icon: Music,
    accentColor: '#3b82f6',
    items: ['Wwise', 'FMOD', 'MetaSounds', '3D Audio'],
    gridClass: 'md:col-span-2'
  },
  {
    id: 'engine',
    title: 'GAME ENGINES',
    subtitle: 'Environment',
    icon: Cpu,
    accentColor: '#a855f7',
    items: ['Unreal Engine 5', 'Unity'],
    gridClass: 'md:col-span-2'
  },
  {
    id: 'tools',
    title: 'PRODUCTION',
    subtitle: 'DAW & Pipeline',
    icon: Wrench,
    accentColor: '#eab308',
    items: ['Reaper', 'Logic Pro', 'iZotope RX', 'GitHub', 'Perforce'],
    gridClass: 'md:col-span-2'
  }
];

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {TECH_CARDS.map((card, cardIndex) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: cardIndex * 0.1, duration: 0.5 }}
            className={`${card.gridClass} group`}
          >
            <div
              className="relative h-full min-h-[240px] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
              style={{
                background: `linear-gradient(135deg, ${card.accentColor}08 0%, transparent 60%)`
              }}
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${card.accentColor}15, transparent 70%)`
                }}
              />

              <div className="relative z-10 h-full p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${card.accentColor}25, ${card.accentColor}10)`,
                      }}
                    >
                      <Icon
                        size={24}
                        style={{ color: card.accentColor }}
                        className="transition-all duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-bold text-white tracking-wide">
                        {card.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.15em]">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className="px-2 py-1 rounded-full text-[10px] font-mono"
                    style={{
                      backgroundColor: `${card.accentColor}20`,
                      color: card.accentColor
                    }}
                  >
                    {card.items.length}
                  </span>
                </div>

                {/* Skills Grid */}
                <div className="flex-1 flex flex-wrap content-start gap-2">
                  {card.items.map((tech) => {
                    const iconKey = Object.keys(TECH_ICON_MAP).find(k => tech.includes(k));
                    const iconPath = iconKey ? `/assets/icons/tech/${TECH_ICON_MAP[iconKey]}` : null;

                    return (
                      <button
                        key={tech}
                        onClick={() => onSelect(tech)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${card.accentColor}50`;
                          e.currentTarget.style.boxShadow = `0 4px 20px ${card.accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {iconPath && (
                          <img
                            src={iconPath}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                          {tech}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom accent */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div
                    className="h-1 rounded-full transition-all duration-500 group-hover:w-full"
                    style={{
                      width: '25%',
                      background: `linear-gradient(90deg, ${card.accentColor}, transparent)`,
                      opacity: 0.5
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TechConstellation;
