import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TECH_CONNECTIONS } from '../../constants/techConnections';
import { TECH_CATEGORIES, TECH_ICON_MAP } from '../../constants/techData';
import { useTranslation } from 'react-i18next';

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  const { t } = useTranslation();
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten items for easier mapping
  const allTechs = TECH_CATEGORIES.flatMap(cat => cat.items);

  // Update positions on resize
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const nodes: NodePosition[] = [];
      
      // Find all tech elements and record their center positions relative to container
      allTechs.forEach(tech => {
        const el = document.getElementById(`tech-node-${tech}`);
        if (el && containerRef.current) {
          const rect = el.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          nodes.push({
            id: tech,
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
          });
        }
      });
      setNodePositions(nodes);
    };

    // Initial timeout to allow layout to settle
    const timeout = setTimeout(updatePositions, 500);
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePositions);
    };
  }, [allTechs]);

  // Get connections for currently hovered tech
  const activeConnections = hoveredTech ? TECH_CONNECTIONS[hoveredTech] || [] : [];

  return (
    <div className="relative py-10" ref={containerRef}>
      
      {/* Grid of Tech Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {TECH_CATEGORIES.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl relative z-20">
            <h3 className="text-xs font-mono text-accent uppercase tracking-[0.2em] mb-6 pb-2 border-b border-white/5 text-center">
              {t(`tech_cat.${cat.title}`, cat.title)}
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {cat.items.map((tech) => {
                const isHovered = hoveredTech === tech;
                const isConnected = hoveredTech && (activeConnections.includes(tech));
                const isDimmed = hoveredTech && !isHovered && !isConnected;
                const iconKey = Object.keys(TECH_ICON_MAP).find(k => tech.includes(k));
                const iconPath = iconKey ? `/assets/icons/tech/${TECH_ICON_MAP[iconKey]}` : null;

                return (
                  <motion.div
                    id={`tech-node-${tech}`}
                    key={tech}
                    whileHover={{ scale: 1.05 }}
                    className={`
                      w-28 h-28 flex flex-col items-center justify-center 
                      rounded-2xl border transition-all duration-500 cursor-pointer relative group overflow-hidden
                      ${(isHovered || isConnected)
                        ? 'bg-secondary border-accent shadow-[0_0_30px_rgba(56,189,248,0.3)] z-30 scale-105' 
                        : 'bg-gradient-to-br from-white/5 to-transparent border-white/5 hover:border-white/20 z-20'
                      }
                      ${isDimmed ? 'opacity-20 blur-[2px]' : 'opacity-100'}
                    `}
                    onMouseEnter={() => setHoveredTech(tech)}
                    onMouseLeave={() => setHoveredTech(null)}
                    onClick={() => onSelect(tech)}
                  >
                    {/* Active State Glow Background */}
                    {(isHovered || isConnected) && (
                        <div className="absolute inset-0 bg-accent/5 blur-xl"></div>
                    )}

                    {iconPath ? (
                      <img 
                        src={iconPath} 
                        alt={tech} 
                        className={`w-12 h-12 object-contain mb-3 transition-all duration-500 relative z-10 filter-none drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]
                            ${(isHovered || isConnected) ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}
                        `}
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-white/10 mb-3 flex items-center justify-center transition-all duration-500
                          ${(isHovered || isConnected) ? 'bg-accent text-black' : 'text-slate-500'}
                      `}>
                          <span className="text-sm font-bold">?</span>
                      </div>
                    )}
                    
                    <span className={`text-xs font-bold uppercase tracking-wider transition-colors relative z-10 px-2 text-center
                        ${(isHovered || isConnected) ? 'text-accent' : 'text-slate-300'}
                    `}>
                      {tech}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* SVG Layer for Lines (Placed AFTER grid to be on top) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible mix-blend-screen">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <filter id="glow-line">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <AnimatePresence>
          {hoveredTech && nodePositions.length > 0 && activeConnections.map(targetId => {
            const start = nodePositions.find(n => n.id === hoveredTech);
            const end = nodePositions.find(n => n.id === targetId);
            
            if (!start || !end) return null;

            return (
              <motion.line
                key={`${hoveredTech}-${targetId}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1, strokeDashoffset: -20 }}
                exit={{ opacity: 0 }}
                transition={{ 
                    pathLength: { duration: 0.3, ease: "easeOut" },
                    strokeDashoffset: { duration: 0.5, repeat: Infinity, ease: "linear" }
                }}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="url(#line-gradient)"
                strokeWidth="3"
                strokeDasharray="4 6"
                strokeLinecap="round"
                filter="url(#glow-line)"
              />
            );
          })}
        </AnimatePresence>
      </svg>

    </div>
  );
};

export default TechConstellation;