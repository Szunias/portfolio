const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-2xl text-cream-light animate-pulse tracking-wide">
          Loading
        </span>
        <span className="text-xs font-label text-dim uppercase tracking-wider">
          ...
        </span>
      </div>
    </div>
  );
};

export default PageLoader;
