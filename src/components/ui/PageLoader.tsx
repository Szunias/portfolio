const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-1 h-8">
          <div className="w-1.5 bg-accent h-4 animate-[music-bar_0.6s_ease-in-out_infinite] rounded-full"></div>
          <div className="w-1.5 bg-accent h-8 animate-[music-bar_0.8s_ease-in-out_infinite_0.1s] rounded-full"></div>
          <div className="w-1.5 bg-accent h-5 animate-[music-bar_0.5s_ease-in-out_infinite_0.2s] rounded-full"></div>
        </div>
        <span className="text-xs font-mono text-dim uppercase tracking-widest">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default PageLoader;