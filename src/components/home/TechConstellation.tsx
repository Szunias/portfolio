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
    <div className="relative py-10 min-h-[600px] flex items-center justify-center select-none" ref={containerRef}>
      
      {/* Background Grid & Radar Scan */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent opacity-30 animate-pulse"></div>
      </div>

      {/* Tech Grid Layout - Organic / Circuit Board */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
        {TECH_CATEGORIES.map((cat, catIdx) => (
          <div key={catIdx} className="relative group/cat">
            {/* Category Header - Holographic Badge */}
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50"></div>
                <h3 className="text-xs font-mono text-accent uppercase tracking-[0.3em] font-bold shadow-accent drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]">
                    {t(`tech_cat.${cat.title}`, cat.title)}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50"></div>
            </div>

            {/* Hex/Grid Container */}
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
                    layoutId={tech}
                    className={`
                      w-24 h-24 relative flex flex-col items-center justify-center 
                      cursor-pointer transition-all duration-300
                      ${isDimmed ? 'opacity-10 grayscale blur-[1px]' : 'opacity-100'}
                    `}
                    onMouseEnter={() => setHoveredTech(tech)}
                    onMouseLeave={() => setHoveredTech(null)}
                    onClick={() => onSelect(tech)}
                  >
                    {/* Chip Container */}
                    <div className={`
                        absolute inset-0 rounded-2xl border backdrop-blur-md transition-all duration-500
                        ${(isHovered || isConnected) 
                            ? 'bg-accent/10 border-accent shadow-[0_0_30px_rgba(56,189,248,0.25)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }
                    `}>
                         {/* Corner Accents (Only visible on active) */}
                        {(isHovered || isConnected) && (
                            <>
                                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-accent"></div>
                                <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-accent"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-accent"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-accent"></div>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-3 transform transition-transform duration-300 group-hover:scale-105">
                        {iconPath ? (
                        <img 
                            src={iconPath} 
                            alt={tech} 
                            className={`w-10 h-10 object-contain transition-all duration-300 filter
                                ${(isHovered || isConnected) 
                                    ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] brightness-110' 
                                    : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}
                            `}
                        />
                        ) : (
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors
                             ${(isHovered || isConnected) ? 'bg-accent text-black border-accent' : 'border-white/20 text-slate-400'}
                        `}>
                            <span className="text-xs font-bold">?</span>
                        </div>
                        )}
                        
                        <span className={`text-[11px] font-mono uppercase tracking-wider transition-colors px-2 py-0.5 rounded
                            ${(isHovered || isConnected) ? 'text-white font-bold bg-black/50 shadow-sm' : 'text-slate-300 group-hover:text-white'}
                        `}>
                        {tech}
                        </span>
                    </div>

                    {/* Connecting Status Dot */}
                    {(isHovered || isConnected) && (
                        <div className="absolute -bottom-2 w-1.5 h-1.5 bg-accent shadow-[0_0_10px_#38bdf8] rounded-full"></div>
                    )}

                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* SVG Layer - Holographic Links */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <defs>
            <filter id="glow-strong">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
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
              <g key={`${hoveredTech}-${targetId}`}>
                  {/* Core Line */}
                  <motion.path
                    d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    fill="none"
                    filter="url(#glow-strong)"
                  />
                  {/* Data Packet Animation */}
                  <motion.circle
                    r="2"
                    fill="white"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                      <animateMotion 
                        dur="1s" 
                        repeatCount="indefinite"
                        path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                      />
                  </motion.circle>
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

    </div>
  );
};

export default TechConstellation;