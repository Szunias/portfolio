import { useAudio } from '../../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import { formatTime } from '../../utils';
import { useState, useEffect } from 'react';

const AudioPlayer = () => {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, 
    progress, duration, currentTime, seek, volume, setVolume, isPlayerVisible, closePlayer
  } = useAudio();
  
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(5));
  
  // Mock Visualizer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
        interval = setInterval(() => {
            const newData = new Array(20).fill(0).map(() => Math.random() * 40 + 5);
            setVisualizerData(newData);
        }, 100);
    } else {
        setVisualizerData(new Array(20).fill(5));
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentTrack || !isPlayerVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-xl border-t border-white/10 z-50 h-20 flex items-center px-4 sm:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Progress Bar (Top Line) */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group"
        onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
        }}
      >
        <div 
            className="h-full bg-accent relative group-hover:bg-white transition-colors"
            style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-4">
        
        {/* Left: Info & Visualizer */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded bg-slate-800 overflow-hidden border border-white/10 flex-shrink-0 group">
                <img 
                    src={`/${currentTrack.cover}`} 
                    alt={currentTrack.title} 
                    className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin-slow]' : ''}`} 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={16} className="text-white" />
                </div>
            </div>
            <div className="min-w-0">
                <h4 className="text-white font-bold text-sm truncate">{currentTrack.title}</h4>
                <div className="flex items-center gap-2">
                    {/* Mini Visualizer */}
                    <div className="flex items-end gap-[1px] h-3">
                        {(visualizerData || []).slice(0, 8).map((h, i) => (
                            <div key={i} className="w-1 bg-accent/50 rounded-t-sm transition-all duration-100" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={prevTrack} className="text-slate-400 hover:text-white transition-colors">
                <SkipBack size={20} />
            </button>
            
            <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>

            <button onClick={nextTrack} className="text-slate-400 hover:text-white transition-colors">
                <SkipForward size={20} />
            </button>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center justify-end gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 group">
                <button 
                    onClick={() => {
                        if (isMuted) {
                            setVolume(prevVolume);
                            setIsMuted(false);
                        } else {
                            setPrevVolume(volume);
                            setVolume(0);
                            setIsMuted(true);
                        }
                    }}
                    className="text-slate-400 group-hover:text-white transition-colors"
                >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer group/vol"
                     onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        setVolume(vol);
                        setIsMuted(vol === 0);
                     }}
                >
                    <div 
                        className="h-full bg-slate-500 group-hover/vol:bg-accent transition-colors" 
                        style={{ width: `${volume * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Close Button */}
            <button 
                onClick={closePlayer}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all ml-4"
                title="Close Player"
            >
                <X size={20} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;