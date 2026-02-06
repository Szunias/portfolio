import { motion } from 'framer-motion';

interface ProjectFiltersProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  getLabel: (cat: string) => string;
}

const ProjectFilters = ({ categories, activeFilter, onFilterChange, getLabel }: ProjectFiltersProps) => {
  return (
    <div className="flex gap-1.5 justify-start lg:justify-end overflow-x-auto pb-1 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 no-scrollbar snap-x">
      {categories.map((category) => {
        const isActive = activeFilter === category;
        return (
          <button
            key={category}
            onClick={() => onFilterChange(category)}
            aria-pressed={isActive}
            className={`
              relative px-3 py-1.5 text-[10px] sm:text-xs sm:px-4 sm:py-2 font-mono uppercase tracking-wider transition-all rounded-full whitespace-nowrap snap-start focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
              ${isActive ? 'text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-slate-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'}
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