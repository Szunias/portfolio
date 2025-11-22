import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TECH_CONNECTIONS } from '../constants/techConnections';
import { TECH_CATEGORIES, TECH_ICON_MAP } from '../constants/techData';
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
      
      {/* SVG Layer for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.1)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.8)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.1)" />
          </linearGradient>
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
                animate={{ pathLength: 1, opacity: 0.6 }}
                exit={{ opacity: 0 }}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="url(#line-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]"
              />
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Grid of Tech Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {TECH_CATEGORIES.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
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
                        ? 'bg-[#0a0a0a] border-accent shadow-[0_0_30px_rgba(56,189,248,0.3)] z-20 scale-105' 
                        : 'bg-gradient-to-br from-white/5 to-transparent border-white/5 hover:border-white/20'
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
                        className={`w-10 h-10 object-contain mb-3 transition-all duration-500 relative z-10
                            ${(isHovered || isConnected) ? 'filter-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}
                        `}
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-white/10 mb-3 flex items-center justify-center transition-all duration-500
                          ${(isHovered || isConnected) ? 'bg-accent text-black' : 'text-slate-500'}
                      `}>
                          <span className="text-xs font-bold">?</span>
                      </div>
                    )}
                    
                    <span className={`text-[10px] font-mono text-center uppercase tracking-wider transition-colors relative z-10
                        ${(isHovered || isConnected) ? 'text-accent font-bold' : 'text-slate-400 group-hover:text-slate-200'}
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
    </div>
  );
};

export default TechConstellation;