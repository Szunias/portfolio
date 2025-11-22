import { motion } from 'framer-motion';
import { TECH_ICON_MAP } from '../../constants/techData';

interface TechIconProps {
  name: string;
  onClick: () => void;
}

const TechIcon = ({ name, onClick }: TechIconProps) => {
  const key = Object.keys(TECH_ICON_MAP).find(k => name.includes(k));
  const iconPath = key ? `/assets/icons/tech/${TECH_ICON_MAP[key]}` : null;

  if (!iconPath) return null;

  return (
    <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-accent/50 hover:bg-white/5 transition-all cursor-pointer group relative"
    >
      <img src={iconPath} alt={name} className="w-12 h-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
      <span className="text-xs font-mono text-slate-400 text-center group-hover:text-white mt-2">{name}</span>
      
      {/* Hint visual */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default TechIcon;
