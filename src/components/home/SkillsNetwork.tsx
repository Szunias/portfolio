'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TECH_CONNECTIONS } from '../../constants/techConnections';
import { 
  Code2, Music2, Wrench, Zap
} from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  category: string;
  type: 'category' | 'skill';
  connections: string[];
}

// Moved outside component - no dependencies on component state
const getIconPath = (skillName: string): string | null => {
  const name = skillName.toLowerCase().replace(/[\s.]/g, '');
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
    'github': 'github.png',
    'juce': 'JUCE_Logo.png',
    'puredata': 'puredatalogo.png',
    '3daudio': '3DAudio.png',
    'spatialaudio': '3DAudio.png'
  };
  const key = Object.keys(map).find(k => name.includes(k));
  return key ? `/assets/icons/tech/${map[key]}` : null;
};

// Map skill descriptions to tech names - moved outside component (constant)
const SKILL_TO_TECH_MAP: Record<string, string[]> = {
  'wwise & fmod integration': ['Wwise', 'FMOD'],
  'unity & unreal engine': ['Unity', 'Unreal Engine 5'],
  'metasounds (unreal engine)': ['MetaSounds', 'Unreal Engine 5'],
  'spatial audio / 3d audio': ['3D Audio'],
  'c# scripting (unity)': ['C#', 'Unity'],
  'c++ (juce framework)': ['C++', 'JUCE'],
  'blueprint scripting (unreal)': ['Blueprints', 'Unreal Engine 5'],
  'python audio tools': ['Python'],
  'interactive music systems': ['Wwise', 'FMOD'],
  'adaptive soundscapes': ['Wwise', 'FMOD', '3D Audio'],
  'voice management & optimization': ['Wwise', 'FMOD'],
  'memory budget management': ['Wwise', 'FMOD', 'Unreal Engine 5'],
  'music composition': ['Logic Pro', 'Cubase', 'Studio One'],
  'sound design': ['Reaper', 'Logic Pro'],
  'mixing & mastering': ['Reaper', 'Logic Pro', 'iZotope'],
  'field recording': ['Reaper'],
  'foley work': ['Reaper'],
  '5.1 surround mixing': ['Reaper', 'Logic Pro'],
  'horror sound design': ['Reaper', 'Logic Pro'],
  'real-time dsp': ['C++', 'JUCE', 'Pure Data'],
  'audio plugins (vst)': ['JUCE', 'C++'],
  'machine learning for audio': ['Python']
};

const SkillsNetwork = () => {
  const { core_skills } = usePortfolioData();
  const t = useTranslations('skills');
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const categoryIcons: {[key: string]: React.ElementType} = {
    'game_audio': Music2,
    'production': Wrench,
    'development': Code2
  };

  const categoryColors: {[key: string]: string} = {
    'game_audio': '#3b82f6', // Blue
    'production': '#eab308', // Yellow
    'development': '#ef4444' // Red
  };

  // Calculate node positions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate node positions based on dimensions and skills
  const calculatedNodes = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];

    const newNodes: Node[] = [];
    const categories = Object.entries(core_skills);
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const categoryRadius = Math.min(dimensions.width, dimensions.height) * 0.25;
    const skillRadius = Math.min(dimensions.width, dimensions.height) * 0.15;

    // Create category nodes (central hubs)
    categories.forEach(([key, skillGroup], index) => {
      const angle = (index / categories.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * categoryRadius;
      const y = centerY + Math.sin(angle) * categoryRadius;

      newNodes.push({
        id: key,
        x,
        y,
        category: key,
        type: 'category',
        connections: []
      });

      // Create skill nodes around each category
      skillGroup.skills.forEach((skill, skillIndex) => {
        const skillAngle = angle + (skillIndex / skillGroup.skills.length - 0.5) * Math.PI * 0.6;
        const skillX = x + Math.cos(skillAngle) * skillRadius;
        const skillY = y + Math.sin(skillAngle) * skillRadius;

        newNodes.push({
          id: skill,
          x: skillX,
          y: skillY,
          category: key,
          type: 'skill',
          connections: [] // Will be resolved dynamically
        });
      });
    });

    return newNodes;
  }, [core_skills, dimensions]);

  // Update nodes state when calculated nodes change
  useEffect(() => {
    setNodes(calculatedNodes);
  }, [calculatedNodes]);

  const getConnectionPath = useCallback((from: Node, to: Node): string => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.3, 80);
    
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    const controlX = midX + perpX * curvature;
    const controlY = midY + perpY * curvature;
    
    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  }, []);

  // Extract tech names from skill description
  const extractTechNames = useCallback((skillName: string): string[] => {
    const lower = skillName.toLowerCase().trim();
    
    // Check direct mapping
    if (SKILL_TO_TECH_MAP[lower]) {
      return SKILL_TO_TECH_MAP[lower];
    }

    // Try to find keywords
    const found: string[] = [];
    for (const [key, techs] of Object.entries(SKILL_TO_TECH_MAP)) {
      if (lower.includes(key.split(' ')[0]) || key.split(' ').some(word => lower.includes(word))) {
        found.push(...techs);
      }
    }
    
    // Also check TECH_CONNECTIONS keys directly
    for (const tech of Object.keys(TECH_CONNECTIONS)) {
      const techLower = tech.toLowerCase();
      if (lower.includes(techLower) || techLower.split(' ').some(word => lower.includes(word))) {
        if (!found.includes(tech)) {
          found.push(tech);
        }
      }
    }

    return found.length > 0 ? found : [];
  }, []);

  const getConnectedNodes = useCallback((nodeId: string): Node[] => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    let allConnections: string[] = [];
    
    if (node.type === 'skill') {
      // For skill nodes, extract tech names and get their connections
      const techNames = extractTechNames(nodeId);
      techNames.forEach(tech => {
        const connections = TECH_CONNECTIONS[tech] || [];
        allConnections.push(...connections);
      });
    } else {
      // For category nodes, get connections from all skills in that category
      const categorySkills = nodes.filter(n => n.category === nodeId && n.type === 'skill');
      categorySkills.forEach(skillNode => {
        const techNames = extractTechNames(skillNode.id);
        techNames.forEach(tech => {
          const connections = TECH_CONNECTIONS[tech] || [];
          allConnections.push(...connections);
        });
      });
    }
    
    // Remove duplicates
    allConnections = [...new Set(allConnections)];
    
    // Find all connected nodes
    const connectedNodes = nodes.filter(n => {
      if (n.id === nodeId) return false;
      
      // Check if this node's tech names match any connections
      if (n.type === 'skill') {
        const nTechNames = extractTechNames(n.id);
        
        // Direct match
        if (nTechNames.some(tech => allConnections.includes(tech))) {
          return true;
        }
        
        // Reverse match - check if this node connects to hovered node
        nTechNames.forEach(tech => {
          const reverseConnections = TECH_CONNECTIONS[tech] || [];
          const hoveredTechNames = node.type === 'skill' ? extractTechNames(nodeId) : [];
          if (reverseConnections.some(conn => hoveredTechNames.includes(conn))) {
            return true;
          }
        });
      }
      
      // Category connection (skills in same category)
      if (node.type === 'skill' && n.type === 'skill' && node.category === n.category) {
        return true;
      }
      
      // Skill to its category
      if (node.type === 'skill' && n.type === 'category' && node.category === n.id) {
        return true;
      }
      
      if (node.type === 'category' && n.type === 'skill' && n.category === node.id) {
        return true;
      }
      
      return false;
    });

    return connectedNodes;
  }, [nodes, extractTechNames]);

  const visibleConnections = hoveredNode 
    ? getConnectedNodes(hoveredNode)
    : [];

  return (
    <section className="py-24 relative overflow-hidden min-h-[800px]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50" />
      
      {/* Circuit board grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            {t('title') || 'Technical Arsenal'}
          </h2>
          <div className="h-0.5 w-24 bg-accent rounded-full mx-auto shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full h-[600px] md:h-[700px] lg:h-[800px]"
        >
          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Draw connections */}
            {hoveredNode && nodes.length > 0 && (() => {
              const hovered = nodes.find(n => n.id === hoveredNode);
              if (!hovered) return null;
              
              const connected = getConnectedNodes(hoveredNode);
              
              return connected.map((connectedNode) => {
                const path = getConnectionPath(hovered, connectedNode);
                
                return (
                  <g key={`${hoveredNode}-${connectedNode.id}`}>
                    {/* Background path for glow */}
                    <motion.path
                      d={path}
                      stroke="rgba(56, 189, 248, 0.3)"
                      strokeWidth="4"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    {/* Animated cable */}
                    <motion.path
                      d={path}
                      stroke="url(#cableGradient)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0, opacity: 0, strokeDashoffset: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: 0.9,
                        strokeDashoffset: [0, -15]
                      }}
                      transition={{ 
                        pathLength: { duration: 0.5 },
                        strokeDashoffset: { 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }
                      }}
                      filter="url(#glow)"
                    />
                  </g>
                );
              });
            })()}
          </svg>

          {/* Render nodes */}
          <AnimatePresence>
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const isConnected = hoveredNode && visibleConnections.some(n => n.id === node.id);
              const categoryColor = categoryColors[node.category] || '#38bdf8';
              const CatIcon = categoryIcons[node.category] || Zap;

              if (node.type === 'category') {
                const skillGroup = core_skills[node.category];
                const transKey = `skill_${node.category}_title`;
                const title = t(transKey) || skillGroup.title;

                return (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute"
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div 
                      className="relative w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer"
                      style={{
                        borderColor: isHovered ? categoryColor : 'rgba(255, 255, 255, 0.2)',
                        backgroundColor: isHovered ? `${categoryColor}33` : 'rgba(12, 12, 12, 0.8)',
                        boxShadow: isHovered ? `0 0 40px ${categoryColor}CC` : 'none',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      <div className="p-3 rounded-full bg-white/5 mb-2">
                        <CatIcon size={32} className={isHovered ? 'text-white' : 'text-slate-400'} />
                      </div>
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-center px-2">
                        {title}
                      </span>
                      
                      {/* Pulse effect */}
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 pointer-events-none"
                          style={{ borderColor: categoryColor }}
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              }

              // Skill node
              const iconPath = getIconPath(node.id);
              const needsInvert = iconPath && ['unreal', 'unity', 'github', 'perforce', 'wwise', '3daudio', 'reaper', 'fmod'].some(k => iconPath.toLowerCase().includes(k));

              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isHovered ? 1.2 : isConnected ? 1.1 : 1,
                    opacity: isHovered || isConnected ? 1 : 0.7
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div 
                    className="w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                    style={{
                      borderColor: isHovered 
                        ? categoryColor 
                        : isConnected
                        ? 'rgba(56, 189, 248, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: isHovered 
                        ? `${categoryColor}33` 
                        : isConnected
                        ? 'rgba(56, 189, 248, 0.1)'
                        : 'rgba(12, 12, 12, 0.6)',
                      boxShadow: isHovered 
                        ? `0 0 30px ${categoryColor}CC` 
                        : isConnected
                        ? '0 0 20px rgba(56, 189, 248, 0.3)'
                        : 'none',
                      transform: isHovered ? 'scale(1.2)' : isConnected ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {iconPath ? (
                      <img 
                        src={iconPath} 
                        alt={node.id}
                        className={`w-10 h-10 object-contain transition-all duration-300 ${
                          isHovered ? 'grayscale-0 opacity-100' : 'grayscale opacity-70'
                        } ${needsInvert ? 'invert brightness-200' : ''}`}
                      />
                    ) : (
                      <Zap size={24} className={isHovered ? 'text-white' : 'text-slate-500'} />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className={`
                    absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded
                    text-xs font-mono whitespace-nowrap pointer-events-none
                    transition-all duration-300
                    ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                  `}
                  style={{
                    backgroundColor: `${categoryColor}90`,
                    color: 'white'
                  }}
                  >
                    {node.id}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend/Instructions */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-mono">
            {t('skills.hover_hint') || 'Hover over technologies to see connections'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SkillsNetwork;

