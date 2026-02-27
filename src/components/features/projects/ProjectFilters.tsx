interface ProjectFiltersProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  getLabel: (cat: string) => string;
}

const ProjectFilters = ({ categories, activeFilter, onFilterChange, getLabel }: ProjectFiltersProps) => {
  return (
    <div className="relative">
      <div className="flex gap-2 justify-start lg:justify-end overflow-x-auto pb-1 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 no-scrollbar snap-x">
        {categories.map((category) => {
          const isActive = activeFilter === category;
          return (
            <button
              key={category}
              onClick={() => onFilterChange(category)}
              aria-pressed={isActive}
              className={`
                relative px-2.5 py-1 font-mono text-label uppercase transition-all duration-200 rounded whitespace-nowrap snap-start focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none
                ${isActive
                  ? 'bg-accent text-surface border border-accent'
                  : 'bg-accent/10 text-accent border border-accent/15 hover:bg-accent/18 hover:border-accent/30'}
              `}
            >
              <span className="relative z-10">
                {getLabel(category)}
              </span>
            </button>
          );
        })}
      </div>
      {/* Gradient fade hint for mobile scroll */}
      <div className="absolute top-0 right-0 bottom-0 w-16 pointer-events-none bg-gradient-to-l from-surface to-transparent lg:hidden" aria-hidden="true" />
    </div>
  );
};

export default ProjectFilters;
