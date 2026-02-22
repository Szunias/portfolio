import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAudio, useAudioProgress } from '@/context/AudioContext';
import { formatTime } from '@/utils';

const VISUALIZER_BARS = 6;
const barDelays = Array.from({ length: VISUALIZER_BARS }, (_, i) => `${i * 0.12}s`);

/** Fixed bottom audio player bar with playback controls, progress scrubber, and volume slider. */
const AudioPlayer = () => {
  const { t } = useTranslation('common');
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    seek, volume, setVolume, isPlayerVisible, closePlayer
  } = useAudio();
  const { progress, duration, currentTime } = useAudioProgress();

  const [prevVolume, setPrevVolume] = useState(volume);
  const shouldReduceMotion = useReducedMotion();
  // Derive muted state from volume to keep in sync with AudioContext
  const isMuted = volume === 0;

  if (!currentTrack || !isPlayerVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-border z-50 h-20 flex items-center px-3 sm:px-6 md:px-8" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Progress Bar (Top Line) */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 hover:h-2.5 bg-secondary group transition-all duration-200 ease-out z-50 ${duration > 0 ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={(e) => {
            if (duration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
        }}
      >
        <div
            className="h-full bg-accent transition-all duration-200 rounded-r-full"
            style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 group-hover:w-3 group-hover:h-3 bg-cream rounded-full transition-all duration-200"></div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 sm:gap-4">

        {/* Left: Info & Visualizer */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-secondary overflow-hidden border border-border flex-shrink-0">
                <img
                    src={`/${currentTrack.cover}`}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="min-w-0">
                <h4 className="text-cream font-medium text-xs sm:text-sm truncate">{currentTrack.title}</h4>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Mini Visualizer */}
                    <div className="flex items-end gap-[1px] h-2.5 sm:h-3">
                        {barDelays.map((delay, i) => (
                            <div
                                key={`bar-${i}`}
                                className={`w-[2px] sm:w-1 bg-accent/60 rounded-t-sm ${isPlaying && !shouldReduceMotion ? 'animate-[music-bar_0.8s_ease-in-out_infinite]' : ''}`}
                                style={{
                                    height: isPlaying && !shouldReduceMotion ? undefined : '10%',
                                    animationDelay: isPlaying && !shouldReduceMotion ? delay : undefined,
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-dim">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Button onClick={prevTrack} variant="ghost" size="icon" className="text-dim hover:text-cream p-2 sm:p-3" aria-label={t('buttons.previous', 'Previous Track')}>
                <SkipBack size={16} className="sm:w-5 sm:h-5" />
            </Button>

            <Button
                onClick={togglePlay}
                variant="primary"
                size="icon"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 bg-accent hover:bg-accent-light text-primary flex-shrink-0"
                aria-label={isPlaying ? t('buttons.pause', 'Pause') : t('buttons.play', 'Play')}
            >
                {isPlaying ? <Pause size={18} className="sm:w-[22px] sm:h-[22px]" fill="currentColor" /> : <Play size={18} className="sm:w-[22px] sm:h-[22px] ml-0.5" fill="currentColor" />}
            </Button>

            <Button onClick={nextTrack} variant="ghost" size="icon" className="text-dim hover:text-cream p-2 sm:p-3" aria-label={t('buttons.next', 'Next Track')}>
                <SkipForward size={16} className="sm:w-5 sm:h-5" />
            </Button>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 group">
                <Button
                    onClick={() => {
                        if (isMuted) {
                            setVolume(prevVolume || 0.7);
                        } else {
                            setPrevVolume(volume);
                            setVolume(0);
                        }
                    }}
                    variant="ghost"
                    size="icon"
                    className="text-dim group-hover:text-cream"
                    aria-label={isMuted ? t('buttons.unmute', 'Unmute') : t('buttons.mute', 'Mute')}
                >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
                <div className="w-24 h-1.5 hover:h-3 bg-secondary rounded-full overflow-hidden relative cursor-pointer transition-all duration-200"
                     onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        setVolume(vol);
                        if (vol > 0) setPrevVolume(vol);
                     }}
                >
                    <div
                        className="h-full bg-accent transition-all duration-200"
                        style={{ width: `${volume * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Close Button */}
            <Button
                onClick={closePlayer}
                variant="ghost"
                size="icon"
                className="text-dim hover:text-red-500/80 p-1 sm:p-2 sm:ml-4 flex-shrink-0"
                title={t('audio_player.close', 'Close Player')}
                aria-label={t('audio_player.close', 'Close Player')}
            >
                <X size={16} className="sm:w-5 sm:h-5" />
            </Button>
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;
