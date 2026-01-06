import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3 } from 'lucide-react';
import { Track } from '../../../types';
import { cn } from '../../../utils';

interface TrackCardProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
}

const TrackCard = memo(({ track, index, isCurrent, isPlaying, onPlay }: TrackCardProps) => {
  const isActive = isCurrent && isPlaying;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onPlay(track)}
        className="group relative flex flex-col gap-3 cursor-pointer"
        role="button"
        aria-label={`Play ${track.title} by ${track.artist}`}
    >
        {/* Cover Art - Enhanced */}
        <div className={cn(
            "relative aspect-square rounded-2xl overflow-hidden border shadow-lg transition-all duration-500",
            isCurrent 
                ? 'ring-2 ring-accent/60 scale-[1.02] border-accent/30 shadow-[0_0_30px_rgba(56,189,248,0.3)]' 
                : 'border-white/5 hover:scale-[1.05] hover:border-accent/40 hover:shadow-[0_0_40px_rgba(56,189,248,0.2)]'
        )}>
            <img 
                src={`/${track.cover}`} 
                alt={track.title} 
                className={cn(
                    "w-full h-full object-cover transition-transform duration-700",
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                )}
                loading="lazy"
            />
            
            {/* Hover / Active Overlay - Enhanced */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20 flex items-center justify-center transition-opacity duration-300",
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
                <div className={cn(
                    "w-14 h-14 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_0_30px_rgba(56,189,248,0.4)] transform transition-all duration-300",
                    isActive 
                        ? 'scale-110 ring-2 ring-accent/50 shadow-[0_0_40px_rgba(56,189,248,0.6)]' 
                        : "group-hover:scale-110 group-hover:border-accent/50 group-hover:shadow-[0_0_35px_rgba(56,189,248,0.5)]"
                )}>
                    {isActive ? <BarChart3 size={22} className="animate-pulse text-accent" /> : <Play size={22} fill="currentColor" className="ml-1 text-accent" />}
                </div>
            </div>
        </div>

        {/* Info */}
        <div>
            <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                    "font-bold text-sm truncate transition-all duration-300",
                    isCurrent 
                        ? 'text-accent drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]' 
                        : 'text-white group-hover:text-accent group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                )}>
                    {track.title}
                </h4>
            </div>
            
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500 truncate">{track.artist}</span>
                <div className="flex items-center gap-2">
                    {track.year && (
                        <span className="text-[10px] font-mono text-slate-600 border border-white/10 px-1.5 py-px rounded bg-white/5 group-hover:border-white/20 group-hover:text-slate-400 transition-colors">
                            {track.year}
                        </span>
                    )}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]"></span>}
                </div>
            </div>
        </div>
    </motion.div>
  );
});

export default TrackCard;