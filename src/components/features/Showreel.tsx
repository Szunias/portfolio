import { useState, useRef } from 'react';
import Player from '@vimeo/player';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Showreel = () => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const timestamps = [
    { time: 0, label: t('hero.showreel_start', 'Start'), color: 'bg-slate-700', shadow: 'shadow-slate-700/50' },
    { time: 10, label: t('hero.chapter.shadow_frames', 'Shadow Frames'), color: 'bg-accent', shadow: 'shadow-accent/50' },
    { time: 54, label: t('hero.chapter.amorak', 'Amorak'), color: 'bg-purple-500', shadow: 'shadow-purple-500/50' },
    { time: 91, label: t('hero.chapter.akantilado', 'Akantilado'), color: 'bg-orange-500', shadow: 'shadow-orange-500/50' },
    { time: 112, label: t('hero.chapter.ray', 'Ray'), color: 'bg-pink-500', shadow: 'shadow-pink-500/50' },
    { time: 154, label: t('hero.chapter.not_today', 'Not Today'), color: 'bg-green-500', shadow: 'shadow-green-500/50' },
    { time: 184, label: t('hero.chapter.ellen_wwise', 'Ellen Wwise'), color: 'bg-cyan-600', shadow: 'shadow-cyan-600/50' },
    { time: 198, label: t('hero.chapter.pause_and_deserve', 'Pause & Deserve'), color: 'bg-red-600', shadow: 'shadow-red-600/50' }
  ];

  // Initialize Vimeo Player
  const handleLoad = () => {
    if (iframeRef.current && !player) {
      const vimeoPlayer = new Player(iframeRef.current);
      setPlayer(vimeoPlayer);
      
      vimeoPlayer.on('play', () => setIsPlaying(true));
      vimeoPlayer.on('pause', () => setIsPlaying(false));
      vimeoPlayer.on('timeupdate', (data) => {
        // Find the current chapter based on time
        const current = timestamps.slice().reverse().find(ts => data.seconds >= ts.time);
        if (current) {
             setActiveChapter(prev => prev !== current.time ? current.time : prev);
        }
      });
    }
  };

  const jumpTo = (seconds: number) => {
    setActiveChapter(seconds);
    if (player) {
      player.setCurrentTime(seconds);
      player.play();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-20">
      {/* Video Wrapper - Enhanced */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group border border-white/10 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.2)] transition-all duration-500">
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1143625213?badge=0&autopause=0&player_id=0&app_id=58479&controls=1"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Showreel"
          onLoad={handleLoad}
          className="absolute inset-0 w-full h-full border-0 scale-[1.005]"
          style={{ border: 'none' }}
        ></iframe>
        
        {/* Custom Play Overlay (Hidden when playing) */}
        {!isPlaying && (
          <button 
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer border-none p-0 appearance-none focus:outline-none"
            onClick={() => player?.play()}
            aria-label={t('showreel.play', 'Play Showreel')}
          >
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="w-28 h-28 flex items-center justify-center bg-white/15 backdrop-blur-xl rounded-full border border-accent/50 shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:shadow-[0_0_60px_rgba(56,189,248,0.7)] transition-all duration-300"
            >
               <Play size={44} className="text-accent ml-2 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" fill="currentColor" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Modern Navigation Bar */}
      <div className="mt-8">
        <div className="flex flex-col items-center">
           <div className="bg-secondary/80 backdrop-blur-md border border-white/10 hover:border-accent/30 p-1.5 rounded-2xl overflow-x-auto max-w-full no-scrollbar shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300">
             <div className="flex items-center gap-1 min-w-max px-2">
              {timestamps.map((ts) => {
                const isActive = activeChapter === ts.time;
                
                return (
                  <button
                    key={ts.label}
                    onClick={() => jumpTo(ts.time)}
                    className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 group`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className={`absolute inset-0 rounded-xl ${ts.color} opacity-90 shadow-[0_0_20px_var(--tw-shadow-color)]`}
                        style={{ '--tw-shadow-color': ts.color.includes('accent') ? 'rgba(56,189,248,0.6)' : 'rgba(255,255,255,0.3)' } as React.CSSProperties}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    


                    <div className="relative z-10 flex items-center gap-3">
                       <div className={`flex flex-col items-start`}>
                          <span className={`text-[10px] font-mono uppercase tracking-wider mb-0.5 ${isActive ? 'text-white/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                             {new Date(ts.time * 1000).toISOString().substr(14, 5)}
                          </span>
                          <span className={`font-display font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                             {ts.label}
                          </span>
                       </div>
                       
                       {/* Status Dot - Enhanced */}
                       <span 
                          className={`w-2 h-2 rounded-full transition-all duration-500 ${ts.color} ${isActive ? `opacity-100 ${ts.shadow} shadow-[0_0_15px_var(--tw-shadow-color)] animate-pulse` : 'opacity-0 -translate-x-2'}`} 
                       />
                    </div>
                  </button>
                );
              })}
             </div>
           </div>
           
           {/* Optional: Hint text or decorative line below */}
           <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent mt-8"></div>
        </div>
      </div>
    </div>
  );
};

export default Showreel;