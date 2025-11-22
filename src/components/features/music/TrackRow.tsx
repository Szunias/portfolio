import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3 } from 'lucide-react';
import { Track } from '../../../types';

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
    >
        {/* Cover Art */}
        <div className={`
            relative aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-lg transition-all duration-500
            ${isCurrent ? 'ring-2 ring-accent/50 scale-[1.02]' : 'hover:scale-[1.02] hover:border-white/20'}
        `}>
            <img 
                src={`/${track.cover}`} 
                alt={track.title} 
                className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                loading="lazy"
            />
            
            {/* Hover / Active Overlay */}
            <div className={`
                absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300
                ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform">
                    {isActive ? <BarChart3 size={20} className="animate-pulse" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </div>
            </div>
        </div>

        {/* Info */}
        <div>
            <h4 className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-accent' : 'text-white group-hover:text-white'}`}>
                {track.title}
            </h4>
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500 truncate">{track.artist}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>}
            </div>
        </div>
    </motion.div>
  );
});

export default TrackCard;
