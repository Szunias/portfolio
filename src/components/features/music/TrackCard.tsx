import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3 } from 'lucide-react';

import type { Track } from '@/types';
import { cn } from '@/utils';

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
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={() => onPlay(track)}
        className="group relative flex flex-col gap-3 cursor-pointer"
        role="button"
        aria-label={`Play ${track.title} by ${track.artist}`}
    >
        {/* Cover Art */}
        <div className={cn(
            "relative aspect-square rounded-sm overflow-hidden border transition-colors duration-200",
            isCurrent
                ? 'border-accent'
                : 'border-border hover:border-border-hover'
        )}>
            <img
                src={`/${track.cover}`}
                alt={track.title}
                width={300}
                height={300}
                className={cn(
                    "w-full h-full object-cover transition-transform duration-300",
                    isActive ? 'scale-105' : 'group-hover:scale-105'
                )}
                loading="lazy"
            />

            {/* Hover / Active Overlay */}
            <div className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200",
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
                <div className="w-14 h-14 rounded-full border border-border-hover flex items-center justify-center text-cream">
                    {isActive ? <BarChart3 size={22} className="animate-pulse text-accent" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                </div>
            </div>
        </div>

        {/* Info */}
        <div>
            <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                    "font-medium text-sm truncate transition-colors duration-200",
                    isCurrent
                        ? 'text-accent'
                        : 'text-cream group-hover:text-accent'
                )}>
                    {track.title}
                </h4>
            </div>

            <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-dim truncate">{track.artist}</span>
                <div className="flex items-center gap-2">
                    {track.year && (
                        <span className="text-[10px] font-mono text-dim border border-border px-1.5 py-px rounded-sm">
                            {track.year}
                        </span>
                    )}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>}
                </div>
            </div>
        </div>
    </motion.div>
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;
