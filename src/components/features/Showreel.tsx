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
    { time: 0, label: t('hero.showreel_start', 'Start'), color: 'bg-white' },
    { time: 10, label: 'Shadow Frames', color: 'bg-accent' },
    { time: 35, label: 'Amorak', color: 'bg-purple-500' },
    { time: 58, label: 'Not Today', color: 'bg-green-500' },
    { time: 85, label: 'Transientica', color: 'bg-blue-500' }
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
            // Only update if we want to track playback automatically, 
            // but for now let's just stick to click selection to avoid jitter
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
    <div className="w-full max-w-5xl mx-auto mt-12 mb-20">
      {/* Video Wrapper */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
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
          className="absolute inset-0 w-full h-full"
        ></iframe>
        
        {/* Custom Play Overlay (Hidden when playing) */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/40 transition-colors cursor-pointer"
            onClick={() => player?.play()}
          >
            <div className="w-20 h-20 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 group-hover:scale-110 transition-transform">
               <Play size={32} className="text-white ml-1" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* Timestamps Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 px-4 md:px-0">
        {timestamps.map((ts) => (
          <motion.button
            key={ts.label}
            onClick={() => jumpTo(ts.time)}
            className={`relative group overflow-hidden rounded-lg border ${activeChapter === ts.time ? 'border-accent bg-accent/5' : 'border-white/10 bg-[#0a0a0a] hover:border-white/30 hover:bg-white/5'} p-4 transition-all duration-300`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active Indicator Glow */}
            {activeChapter === ts.time && (
                <div className="absolute inset-0 bg-accent/5 shadow-[inset_0_0_20px_rgba(56,189,248,0.1)]" />
            )}

            <div className="relative z-10 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 w-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${ts.color} ${activeChapter === ts.time ? 'animate-pulse shadow-[0_0_8px_currentColor]' : 'opacity-50'}`} />
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-accent transition-colors">
                        {new Date(ts.time * 1000).toISOString().substr(14, 5)}
                    </span>
                </div>
                <span className={`text-xs font-bold font-display uppercase tracking-wide ${activeChapter === ts.time ? 'text-white' : 'text-slate-400'} group-hover:text-white transition-colors text-left`}>
                    {ts.label}
                </span>
            </div>
            
            {/* Tech Corners */}
            <div className={`absolute top-0 left-0 w-2 h-2 border-l border-t ${activeChapter === ts.time ? 'border-accent' : 'border-white/20'} group-hover:border-accent transition-colors`} />
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-r border-b ${activeChapter === ts.time ? 'border-accent' : 'border-white/20'} group-hover:border-accent transition-colors`} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Showreel;