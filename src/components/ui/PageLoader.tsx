/** Waveform pulse loader - shows 5 animated bars simulating an audio waveform.
 *  When prefers-reduced-motion is enabled, shows static bars instead. */
const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full bg-surface">
      <div className="flex flex-col items-center gap-6">
        {/* Waveform Pulse - 5 bars with staggered animation.
            Static heights when reduced motion is preferred. */}
        <div className="flex items-end gap-1.5 h-16" role="status" aria-label="Loading">
          <div className="w-1.5 bg-accent rounded-full animate-waveform-1 motion-reduce:animate-none motion-reduce:h-6"></div>
          <div className="w-1.5 bg-accent rounded-full animate-waveform-2 motion-reduce:animate-none motion-reduce:h-10"></div>
          <div className="w-1.5 bg-accent rounded-full animate-waveform-3 motion-reduce:animate-none motion-reduce:h-14"></div>
          <div className="w-1.5 bg-accent rounded-full animate-waveform-4 motion-reduce:animate-none motion-reduce:h-8"></div>
          <div className="w-1.5 bg-accent rounded-full animate-waveform-5 motion-reduce:animate-none motion-reduce:h-5"></div>
        </div>

        <span className="text-label font-mono text-text-secondary uppercase tracking-wider">
          Loading
        </span>
      </div>
    </div>
  );
};

export default PageLoader;
