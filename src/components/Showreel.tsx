import { useState, useRef } from 'react';
import Player from '@vimeo/player';
import { Play } from 'lucide-react';

const timestamps = [
  { time: 0, label: 'Start', color: 'bg-white' },
  { time: 10, label: 'Shadow Frames', color: 'bg-accent' }, // Przykładowe czasy, dostosuj
  { time: 35, label: 'Amorak', color: 'bg-purple-500' },
  { time: 58, label: 'Not Today', color: 'bg-green-500' },
  { time: 85, label: 'Transientica', color: 'bg-blue-500' }
];

const Showreel = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize Vimeo Player
  const handleLoad = () => {
    if (iframeRef.current && !player) {
      const vimeoPlayer = new Player(iframeRef.current);
      setPlayer(vimeoPlayer);
      
      vimeoPlayer.on('play', () => setIsPlaying(true));
      vimeoPlayer.on('pause', () => setIsPlaying(false));
    }
  };

  const jumpTo = (seconds: number) => {
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
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {timestamps.map((ts) => (
          <button
            key={ts.label}
            onClick={() => jumpTo(ts.time)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-white/10 rounded-full hover:border-accent hover:text-white transition-all group"
          >
            <span className={`w-2 h-2 rounded-full ${ts.color} group-hover:animate-pulse`}></span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 group-hover:text-white">
                {ts.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Showreel;