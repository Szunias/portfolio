import { useAudio } from '../../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import { formatTime } from '../../utils';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

const AudioPlayer = () => {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, 
    progress, duration, currentTime, seek, volume, setVolume, isPlayerVisible, closePlayer
  } = useAudio();
  
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(5));

  // Simulated audio visualizer (mock)
  // Note: Real audio visualization would require Web Audio API with createMediaElementSource
  // which is blocked by CORS for cross-origin audio. This mock provides visual feedback.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
        interval = setInterval(() => {
            // Generate more realistic-looking frequency data
            const newData = new Array(20).fill(0).map((_, i) => {
                // Create a wave pattern with some randomness
                const wave = Math.sin(Date.now() / 200 + i * 0.5) * 15 + 25;
                const random = Math.random() * 20;
                return Math.max(5, Math.min(100, wave + random));
            });
            setVisualizerData(newData);
        }, 100);
    } else {
        const timeout = setTimeout(() => setVisualizerData(new Array(20).fill(5)), 0);
        return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentTrack || !isPlayerVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-2xl border-t border-white/10 z-50 h-20 flex items-center px-3 sm:px-6 md:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(56,189,248,0.1)]">
      {/* Progress Bar (Top Line) */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 hover:h-2.5 bg-white/5 cursor-pointer group transition-all duration-200 ease-out z-50"
        onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
        }}
      >
        <div 
            className="h-full relative bg-gradient-to-r from-sky-700 via-sky-500 to-accent shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all duration-200 rounded-r-full"
            style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 group-hover:w-3 group-hover:h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-200 flex items-center justify-center">
                <div className="w-1 h-1 bg-accent rounded-full"></div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 sm:gap-4">

        {/* Left: Info & Visualizer */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded bg-slate-800 overflow-hidden border border-white/10 flex-shrink-0 group hover:border-accent/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300">
                <img 
                    src={`/${currentTrack.cover}`} 
                    alt={currentTrack.title} 
                    className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin-slow]' : ''} group-hover:scale-110 transition-transform duration-500`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={16} className="text-accent drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                </div>
            </div>
            <div className="min-w-0">
                <h4 className="text-white font-bold text-xs sm:text-sm truncate">{currentTrack.title}</h4>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Mini Visualizer */}
                    <div className="flex items-end gap-[1px] h-2.5 sm:h-3">
                        {(visualizerData || []).slice(0, 6).map((h, i) => (
                            <div key={i} className="w-[2px] sm:w-1 bg-accent/50 rounded-t-sm transition-all duration-100" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-500">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Button onClick={prevTrack} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-transparent p-1 sm:p-2" aria-label="Previous Track">
                <SkipBack size={16} className="sm:w-5 sm:h-5" />
            </Button>

            <Button
                onClick={togglePlay}
                variant="primary"
                size="icon"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all duration-300 p-0 bg-accent hover:bg-white text-primary hover:text-accent border-2 border-accent hover:border-white flex-shrink-0"
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={18} className="sm:w-[22px] sm:h-[22px]" fill="currentColor" /> : <Play size={18} className="sm:w-[22px] sm:h-[22px] ml-0.5" fill="currentColor" />}
            </Button>

            <Button onClick={nextTrack} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-transparent p-1 sm:p-2" aria-label="Next Track">
                <SkipForward size={16} className="sm:w-5 sm:h-5" />
            </Button>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 group">
                <Button
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
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 group-hover:text-white hover:bg-transparent"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
                <div className="w-24 h-1.5 hover:h-3 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer group/vol transition-all duration-300"
                     onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        setVolume(vol);
                        setIsMuted(vol === 0);
                     }}
                >
                    <div
                        className="h-full bg-gradient-to-r from-sky-600 via-sky-500 to-accent shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:bg-accent group-hover:shadow-[0_0_20px_rgba(56,189,248,0.7)] transition-all duration-300"
                        style={{ width: `${volume * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Close Button */}
            <Button
                onClick={closePlayer}
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1 sm:p-2 sm:ml-4 flex-shrink-0"
                title="Close Player"
                aria-label="Close Player"
            >
                <X size={16} className="sm:w-5 sm:h-5" />
            </Button>
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;