import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, BarChart3 } from 'lucide-react';

import type { Track } from '@/types';
import { cn } from '@/utils';
import { cardIn, stagger, noMotion } from '@/constants/motion';

interface TrackCardProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
}

const TrackCard = memo(({ track, index, isCurrent, isPlaying, onPlay }: TrackCardProps) => {
  const isActive = isCurrent && isPlaying;
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
        initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
        whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
        viewport={{ once: true }}
        transition={prefersReducedMotion ? noMotion.transition : {
            ...cardIn.transition,
            delay: index * stagger.cards,
        }}
        onClick={() => onPlay(track)}
        className="group relative flex flex-col gap-3 cursor-pointer"
        role="button"
        aria-label={`Play ${track.title} by ${track.artist}`}
    >
        {/* Cover Art */}
        <div className={cn(
            "relative aspect-square rounded-lg overflow-hidden border transition-all duration-200",
            isCurrent
                ? 'border-accent shadow-glow-accent'
                : 'border-border hover:border-border-hover hover:shadow-elevated'
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
                "absolute inset-0 bg-surface-overlay/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200",
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
                <div className={cn(
                    "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    isActive ? 'border-accent bg-accent/10' : 'border-border-hover bg-surface-overlay/20 hover:border-accent hover:bg-accent/10'
                )}>
                    {isActive ? <BarChart3 size={22} className="animate-pulse text-accent" /> : <Play size={22} fill="currentColor" className="text-accent ml-1" />}
                </div>
            </div>
        </div>

        {/* Info */}
        <div>
            <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                    "font-medium text-h4 truncate transition-colors duration-200",
                    isCurrent
                        ? 'text-accent'
                        : 'text-text-primary group-hover:text-accent'
                )}>
                    {track.title}
                </h4>
            </div>

            <div className="flex items-center justify-between mt-1">
                <span className="text-caption text-text-secondary truncate">{track.artist}</span>
                <div className="flex items-center gap-2">
                    {track.year && (
                        <span className="text-label font-mono text-text-tertiary border border-border px-1.5 py-px rounded">
                            {track.year}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;
