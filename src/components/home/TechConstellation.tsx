import { useState } from 'react';
import { motion } from 'framer-motion';
import { TECH_CONNECTIONS } from '../../constants/techConnections';
import { TECH_ICON_MAP } from '../../constants/techData';

interface TechConstellationProps {
  onSelect: (tech: string) => void;
}

// Columns Configuration
const RACK_COLUMNS = [
  { id: 'code', title: 'INPUT / CODE', color: '#ef4444', items: ['C++', 'C#', 'Python', 'Blueprints', 'JUCE'] },
  { id: 'tools', title: 'PROCESS / TOOLS', color: '#eab308', items: ['Reaper', 'GitHub', 'Perforce', 'iZotope RX'] },
  { id: 'middleware', title: 'MIX / MIDDLEWARE', color: '#38bdf8', items: ['Wwise', 'FMOD', '3D Audio'] },
  { id: 'engine', title: 'OUTPUT / ENGINE', color: '#a855f7', items: ['Unreal Engine 5', 'Unity'] }
];

const TechConstellation = ({ onSelect }: TechConstellationProps) => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  return (
    <div className="relative py-8 select-none w-full">
      
      {/* Main Rack Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
        
        {RACK_COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-0">
                
                {/* Rack Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10 rounded-t-lg">
                    <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest">{col.title}</span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                    </div>
                </div>

                {/* Rack Mount (Background for items) */}
                <div className="bg-[#0a0a0a] border-x border-b border-white/5 rounded-b-lg p-2 flex flex-col gap-1 min-h-[300px]">
                    {col.items.map(tech => {
                         // Logic: Is this node part of the signal chain?
                         const isHovered = hoveredTech === tech;
                         const isConnected = hoveredTech && (
                             TECH_CONNECTIONS[hoveredTech]?.includes(tech) || 
                             Object.entries(TECH_CONNECTIONS).some(([k, v]) => v.includes(hoveredTech) && k === tech)
                         );
                         
                         const isSignalActive = isHovered || isConnected;
                         const isDimmed = hoveredTech && !isSignalActive;

                         const iconKey = Object.keys(TECH_ICON_MAP).find(k => tech.includes(k));
                         const iconPath = iconKey ? `/assets/icons/tech/${TECH_ICON_MAP[iconKey]}` : null;

                         return (
                             <motion.div
                                key={tech}
                                onMouseEnter={() => setHoveredTech(tech)}
                                onMouseLeave={() => setHoveredTech(null)}
                                onClick={() => onSelect(tech)}
                                className={`
                                    relative group cursor-pointer flex items-center justify-between p-3 rounded transition-all duration-200
                                    ${isHovered ? 'bg-[#1a1a1a]' : 'hover:bg-[#111]'}
                                    ${isDimmed ? 'opacity-30' : 'opacity-100'}
                                `}
                             >
                                 {/* Left Side: Icon + Name */}
                                 <div className="flex items-center gap-3">
                                     {/* Status Bar Indicator */}
                                     <div className={`w-1 h-4 rounded-full transition-colors duration-200 ${isSignalActive ? 'bg-[var(--col)] shadow-[0_0_8px_var(--col)]' : 'bg-[#222]'}`} style={{ '--col': col.color } as any}></div>
                                     
                                     {iconPath && (
                                         <img 
                                            src={iconPath} 
                                            alt="" 
                                            className={`w-5 h-5 object-contain transition-all duration-200 ${isSignalActive ? 'grayscale-0 brightness-110' : 'grayscale opacity-60'}`} 
                                         />
                                     )}
                                     
                                     <span className={`text-xs font-bold tracking-wide transition-colors ${isSignalActive ? 'text-white' : 'text-slate-400'}`}>
                                         {tech}
                                     </span>
                                 </div>

                                 {/* Right Side: Signal LED */}
                                 <div className="flex items-center gap-2">
                                     {/* Signal Text (Optional, only on hover) */}
                                     <span className={`text-[9px] font-mono uppercase text-[var(--col)] transition-opacity duration-200 ${isSignalActive ? 'opacity-100' : 'opacity-0'}`} style={{ '--col': col.color } as any}>
                                         SIG
                                     </span>
                                     
                                     {/* The LED */}
                                     <div className={`
                                         w-2 h-2 rounded-full transition-all duration-150 border border-black
                                         ${isSignalActive 
                                            ? 'bg-[var(--col)] shadow-[0_0_6px_var(--col)] scale-110' 
                                            : 'bg-[#111] shadow-inner'}
                                     `} style={{ '--col': col.color } as any}></div>
                                 </div>

                             </motion.div>
                         )
                    })}
                    
                    {/* Empty Rack Space Filler (Visual) */}
                    <div className="flex-1 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]"></div>
                </div>
            </div>
        ))}
      </div>
      
      {/* Legend / System Info */}
      <div className="text-center mt-8 opacity-40">
          <p className="text-[10px] font-mono uppercase tracking-widest">Signal Flow Visualization // Hover to trace connection</p>
      </div>

    </div>
  );
};

export default TechConstellation;