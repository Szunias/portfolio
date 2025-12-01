import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TECH_CONNECTIONS } from '../../constants/techConnections';
import { TECH_ICON_MAP } from '../../constants/techData';

interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: 'in' | 'out';
}

interface WireConnection {
    source: string;
    target: string;
    sourceNode: NodePosition;
    targetNode: NodePosition;
}

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

// Columns
const PIPELINE_COLUMNS = [
  { id: 'code', title: 'CORE', color: '#ef4444', items: ['C++', 'C#', 'Python', 'Blueprints', 'JUCE'] },
  { id: 'tools', title: 'TOOLS', color: '#eab308', items: ['Reaper', 'GitHub', 'Perforce', 'iZotope RX'] },
  { id: 'middleware', title: 'AUDIO', color: '#38bdf8', items: ['Wwise', 'FMOD', '3D Audio'] },
  { id: 'engine', title: 'ENGINE', color: '#a855f7', items: ['Unreal Engine 5', 'Unity'] }
];

// Sub-component for the Cable Physics
const HangingCable = ({ start, end, color, isActive }: { start: NodePosition, end: NodePosition, color: string, isActive: boolean }) => {
    // Calculate physics constants based on distance
    const dist = Math.abs(end.x - start.x);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Sag amount: Longer distance = more sag. Active = Less sag (tension).
    const baseSag = dist * 0.3; 
    const activeSag = dist * 0.1; 
    const currentSag = isActive ? activeSag : baseSag;

    // Random offset for sway so they don't all move in perfect sync
    const swayOffset = useMemo(() => Math.random() * 2, []);

    return (
        <motion.path
            initial={false}
            animate={{
                d: [
                    `M ${start.x} ${start.y} Q ${midX} ${midY + currentSag} ${end.x} ${end.y}`,
                    `M ${start.x} ${start.y} Q ${midX} ${midY + currentSag + (isActive ? 2 : 10)} ${end.x} ${end.y}`,
                    `M ${start.x} ${start.y} Q ${midX} ${midY + currentSag} ${end.x} ${end.y}`
                ],
                stroke: isActive ? color : '#333',
                strokeWidth: isActive ? 3 : 1,
                strokeOpacity: isActive ? 1 : 0.3
            }}
            transition={{
                d: {
                    duration: isActive ? 0.5 : 3 + swayOffset, // Active = snap tight, Idle = slow sway
                    repeat: Infinity,
                    ease: "easeInOut"
                },
                stroke: { duration: 0.3 },
                strokeWidth: { duration: 0.3 }
            }}
            fill="none"
            strokeLinecap="round"
        />
    );
};

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const allTechs = PIPELINE_COLUMNS.flatMap(c => c.items);

  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const nodes: NodePosition[] = [];
      const containerRect = containerRef.current.getBoundingClientRect();

      allTechs.forEach(tech => {
        const portIn = document.getElementById(`port-${tech}-in`);
        const portOut = document.getElementById(`port-${tech}-out`);
        
        // If we have specific ports, use them. Otherwise fallback to node edges (shouldn't happen if rendered correctly)
        if (portIn && portOut) {
            const rectIn = portIn.getBoundingClientRect();
            const rectOut = portOut.getBoundingClientRect();

            nodes.push({
                id: `${tech}-in`,
                x: rectIn.left - containerRect.left + rectIn.width / 2,
                y: rectIn.top - containerRect.top + rectIn.height / 2,
                type: 'in'
            });
            nodes.push({
                id: `${tech}-out`,
                x: rectOut.left - containerRect.left + rectOut.width / 2,
                y: rectOut.top - containerRect.top + rectOut.height / 2,
                type: 'out'
            });
        } else {
            // Fallback logic (legacy)
            const el = document.getElementById(`node-${tech}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                nodes.push({
                    id: `${tech}-in`,
                    x: rect.left - containerRect.left,
                    y: rect.top - containerRect.top + rect.height / 2,
                    type: 'in'
                });
                nodes.push({
                    id: `${tech}-out`,
                    x: rect.right - containerRect.left,
                    y: rect.top - containerRect.top + rect.height / 2,
                    type: 'out'
                });
            }
        }
      });
      setNodePositions(nodes);
    };

    // Multiple triggers to catch layout shifts/font loads
    const t1 = setTimeout(updatePositions, 100);
    const t2 = setTimeout(updatePositions, 500);
    const t3 = setTimeout(updatePositions, 1000);
    
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updatePositions);
    };
  }, [allTechs]);

  // Get all connections (active + idle background ones)
  const allWires = useMemo(() => {
      if (nodePositions.length === 0) return [];
      const wires: WireConnection[] = [];
      
      Object.entries(TECH_CONNECTIONS).forEach(([source, targets]) => {
          targets.forEach(target => {
              const sourceNode = nodePositions.find(n => n.id === `${source}-out`);
              const targetNode = nodePositions.find(n => n.id === `${target}-in`);
              
              if (sourceNode && targetNode) {
                  if (targetNode.x > sourceNode.x) {
                      wires.push({ source, target, sourceNode, targetNode });
                  }
              }
          });
      });
      return wires;
  }, [nodePositions]);


  return (
    <div className="relative py-10 min-h-[600px] flex flex-col justify-center select-none overflow-hidden" ref={containerRef}>
      
      {/* Blueprint Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#0f0f0f] rounded-xl border border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Nodes Container */}
      <div className="relative z-20 flex flex-col md:flex-row justify-between items-start gap-16 md:gap-24 px-8 h-full max-w-7xl mx-auto w-full">
        
        {PIPELINE_COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-8 flex-1 min-w-[160px] z-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4 opacity-50">
                    <div className="h-px flex-1 bg-white/20"></div>
                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{col.title}</span>
                    <div className="h-px flex-1 bg-white/20"></div>
                </div>

                {/* Nodes List */}
                <div className="flex flex-col gap-6 justify-center h-full">
                    {col.items.map(tech => {
                         // Check if this tech is part of the active connection chain
                         const isActiveChain = hoveredTech && (
                             tech === hoveredTech || 
                             TECH_CONNECTIONS[hoveredTech]?.includes(tech) || 
                             // Also highlight if this node points TO the hovered node (reverse lookup)
                             Object.entries(TECH_CONNECTIONS).some(([k, v]) => v.includes(hoveredTech) && k === tech)
                         );

                         const iconKey = Object.keys(TECH_ICON_MAP).find(k => tech.includes(k));
                         const iconPath = iconKey ? `/assets/icons/tech/${TECH_ICON_MAP[iconKey]}` : null;

                         return (
                             <motion.div
                                id={`node-${tech}`}
                                key={tech}
                                // layoutId removed to fix coordinate calculation bugs
                                onMouseEnter={() => setHoveredTech(tech)}
                                onMouseLeave={() => setHoveredTech(null)}
                                onClick={() => onSelect(tech)}
                                animate={{
                                    scale: isActiveChain ? 1.15 : 1,
                                    borderColor: isActiveChain ? col.color : 'rgba(255,255,255,0.05)',
                                    boxShadow: isActiveChain ? `0 0 30px ${col.color}40` : 'none',
                                    backgroundColor: isActiveChain ? '#1a1a1a' : '#151515',
                                }}
                                transition={{ duration: 0.3 }}
                                className={`
                                    relative group cursor-pointer rounded-lg overflow-hidden border w-full
                                    ${isActiveChain ? 'z-50' : 'hover:border-white/20 z-10'}
                                    ${hoveredTech && !isActiveChain ? 'opacity-20 blur-[1px]' : 'opacity-100'}
                                `}
                             >
                                 {/* Color Bar */}
                                 <div className="absolute left-0 top-0 bottom-0 w-1 opacity-80" style={{ backgroundColor: col.color }}></div>

                                 {/* Body */}
                                 <div className="p-4 pl-5 flex items-center gap-4">
                                     {iconPath ? (
                                         <img src={iconPath} alt="" className="w-8 h-8 object-contain opacity-70 group-hover:opacity-100 filter grayscale group-hover:grayscale-0 transition-all" />
                                     ) : (
                                         <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] font-mono text-slate-500">?</div>
                                     )}
                                     <span 
                                        className="text-sm font-bold tracking-wide transition-colors"
                                        style={{ color: isActiveChain ? '#fff' : '#94a3b8' }}
                                     >
                                         {tech}
                                     </span>
                                 </div>

                                 {/* Ports - with explicit IDs for coordinate tracking */}
                                 <div 
                                    id={`port-${tech}-in`}
                                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full border border-black transition-colors"
                                    style={{ backgroundColor: isActiveChain ? col.color : '#333' }}
                                 ></div>
                                 <div 
                                    id={`port-${tech}-out`}
                                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full border border-black transition-colors"
                                    style={{ backgroundColor: isActiveChain ? col.color : '#333' }}
                                 ></div>
                             </motion.div>
                         )
                    })}
                </div>
            </div>
        ))}
      </div>

      {/* Cables Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          {allWires.map((wire) => {
              const isActive = hoveredTech && (
                  (wire.source === hoveredTech && TECH_CONNECTIONS[hoveredTech].includes(wire.target)) ||
                  (wire.target === hoveredTech && TECH_CONNECTIONS[wire.source].includes(hoveredTech))
              );
              
              const sourceCol = PIPELINE_COLUMNS.find(c => c.items.includes(wire.source));
              const color = sourceCol ? sourceCol.color : '#fff';

              return (
                  <HangingCable 
                    key={`${wire.source}-${wire.target}`}
                    start={wire.sourceNode}
                    end={wire.targetNode}
                    color={color}
                    isActive={!!isActive}
                  />
              );
          })}
      </svg>

    </div>
  );
};

export default TechConstellation;