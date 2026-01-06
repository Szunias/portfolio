import { motion } from 'framer-motion';

interface ProjectFiltersProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  getLabel: (cat: string) => string;
}

const ProjectFilters = ({ categories, activeFilter, onFilterChange, getLabel }: ProjectFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
      {categories.map((category) => {
        const isActive = activeFilter === category;
        return (
          <button
            key={category}
            onClick={() => onFilterChange(category)}
            className={`
              relative px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded-full
              ${isActive ? 'text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-white rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">
              {getLabel(category)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ProjectFilters;