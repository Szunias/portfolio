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
    { time: 10, label: 'Shadow Frames', color: 'bg-accent', shadow: 'shadow-accent/50' },
    { time: 35, label: 'Amorak', color: 'bg-purple-500', shadow: 'shadow-purple-500/50' },
    { time: 58, label: 'Not Today', color: 'bg-green-500', shadow: 'shadow-green-500/50' },
    { time: 85, label: 'Transientica', color: 'bg-blue-500', shadow: 'shadow-blue-500/50' }
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
        if (current && current.time !== activeChapter) {
             // Optional: Auto-update active chapter
             // setActiveChapter(current.time); 
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
      {/* Video Wrapper */}
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-black group ring-1 ring-white/10">
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1131121335?badge=0&autopause=0&player_id=0&app_id=58479&controls=1"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Showreel"
          onLoad={handleLoad}
          className="absolute inset-0 w-full h-full border-0"
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
               <Play size={40} className="text-white ml-2" fill="currentColor" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Modern Navigation Bar */}
      <div className="mt-8">
        <div className="flex flex-col items-center">
           <div className="bg-secondary/80 backdrop-blur-sm border border-white/10 p-1.5 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
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
                        className={`absolute inset-0 rounded-xl ${ts.color} opacity-90`}
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
                       
                       {/* Status Dot */}
                       <span 
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${ts.color} ${isActive ? `opacity-100 ${ts.shadow} shadow-[0_0_12px_var(--tw-shadow-color)]` : 'opacity-0 -translate-x-2'}`} 
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