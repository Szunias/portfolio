interface ProjectFiltersProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  getLabel: (cat: string) => string;
}

const ProjectFilters = ({ categories, activeFilter, onFilterChange, getLabel }: ProjectFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          className={`
            px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-all rounded-full
            ${activeFilter === category 
              ? 'bg-white text-black border-white font-bold' 
              : 'bg-transparent text-slate-500 border-slate-800 hover:border-white hover:text-white'
            }
          `}
        >
          {getLabel(category)}
        </button>
      ))}
    </div>
  );
};

export default ProjectFilters;